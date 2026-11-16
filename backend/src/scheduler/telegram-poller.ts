import axios from 'axios';
import { globalWorkflowStore } from '../storage/store.js';
import { WorkflowRunner } from '../engine/runner.js';
import { IWorkflow, INode } from '../engine/types.js';

/**
 * TelegramPollingManager
 * ----------------------
 * Keeps every *published* (active) workflow that contains a Telegram bot
 * listening 24/7 via Telegram long-polling (getUpdates). This works on any
 * host (localhost, Render, VPS) without needing a public webhook URL, and
 * restarts automatically whenever the backend boots, because the "active"
 * flag is persisted in workflows.json.
 *
 * Any Telegram user who messages the bot triggers the workflow; the payload
 * exposes chatId / text / sender so the reply goes back to that same user.
 */

interface PollerState {
  token: string;
  workflowIds: string[];
  offset: number;
  running: boolean;
  controller?: AbortController;
}

const TRIGGER_TYPES = new Set(['trigger.chat', 'trigger.appEvent', 'trigger.telegram', 'trigger.webhook']);

function isTelegramTrigger(node: INode, wf: IWorkflow): boolean {
  if (node.disabled || !node.type?.startsWith('trigger.')) return false;
  const type = node.type.toLowerCase();
  const name = (node.name || '').toLowerCase();
  const app = String(node.parameters?.app || '').toLowerCase();
  if (type.includes('telegram') || name.includes('telegram') || app.includes('telegram')) return true;
  // Generic chat/webhook trigger counts if the workflow replies through a Telegram node
  const hasTelegramAction = wf.nodes.some((n) => !n.disabled && n.type?.toLowerCase().includes('telegram') && !n.type.startsWith('trigger.'));
  return TRIGGER_TYPES.has(node.type) && node.type !== 'trigger.webhook' && hasTelegramAction;
}

function resolveBotToken(wf: IWorkflow, trigger: INode): string {
  const fromTrigger = trigger.parameters?.botToken;
  if (fromTrigger && typeof fromTrigger === 'string' && !fromTrigger.includes('{{')) return fromTrigger.trim();
  const tgNode = wf.nodes.find(
    (n) => n.type?.toLowerCase().includes('telegram') && typeof n.parameters?.botToken === 'string' && n.parameters.botToken.trim() && !n.parameters.botToken.includes('{{')
  );
  if (tgNode) return String(tgNode.parameters.botToken).trim();
  const creds = globalWorkflowStore.getCredentials() || {};
  return String(creds.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '').trim();
}

export class TelegramPollingManager {
  private pollers: Map<string, PollerState> = new Map();

  start() {
    this.refresh();
  }

  /** Re-scan active workflows and (re)start/stop pollers as needed. */
  refresh() {
    const wanted = new Map<string, string[]>(); // token -> workflowIds

    for (const wf of globalWorkflowStore.getWorkflows()) {
      if (!wf.active) continue;
      const trigger = wf.nodes.find((n) => isTelegramTrigger(n, wf));
      if (!trigger) continue;
      const token = resolveBotToken(wf, trigger);
      if (!token) {
        console.warn(`[TelegramPoller] Workflow "${wf.name}" is published but has no Bot Token configured.`);
        continue;
      }
      const list = wanted.get(token) || [];
      list.push(wf.id);
      wanted.set(token, list);
    }

    // Stop pollers no longer needed
    for (const [token, state] of this.pollers) {
      if (!wanted.has(token)) {
        state.running = false;
        state.controller?.abort();
        this.pollers.delete(token);
        console.log(`[TelegramPoller] Stopped bot ${token.split(':')[0]}`);
      }
    }

    // Start / update pollers
    for (const [token, workflowIds] of wanted) {
      const existing = this.pollers.get(token);
      if (existing) {
        existing.workflowIds = workflowIds;
        continue;
      }
      const state: PollerState = { token, workflowIds, offset: 0, running: true };
      this.pollers.set(token, state);
      this.loop(state).catch((err) => console.error('[TelegramPoller] loop crashed:', err?.message));
    }
  }

  getStatus() {
    return Array.from(this.pollers.values()).map((p) => ({
      botId: p.token.split(':')[0],
      workflowIds: p.workflowIds,
      running: p.running,
    }));
  }

  stop() {
    for (const state of this.pollers.values()) {
      state.running = false;
      state.controller?.abort();
    }
    this.pollers.clear();
  }

  private async loop(state: PollerState) {
    const base = `https://api.telegram.org/bot${state.token}`;
    // getUpdates does not work while a webhook is set; remove it (keeps pending updates).
    try {
      await axios.post(`${base}/deleteWebhook`, { drop_pending_updates: false }, { timeout: 15000 });
    } catch (err: any) {
      console.warn(`[TelegramPoller] deleteWebhook: ${err.response?.data?.description || err.message}`);
    }
    console.log(`[TelegramPoller] Listening for bot ${state.token.split(':')[0]} (${state.workflowIds.length} workflow)`);

    let backoff = 1000;
    while (state.running) {
      state.controller = new AbortController();
      try {
        const res = await axios.get(`${base}/getUpdates`, {
          params: { offset: state.offset, timeout: 25, allowed_updates: JSON.stringify(['message', 'edited_message', 'channel_post', 'callback_query']) },
          timeout: 35000,
          signal: state.controller.signal,
        });
        backoff = 1000;
        const updates: any[] = res.data?.result || [];
        for (const update of updates) {
          state.offset = update.update_id + 1;
          this.dispatch(state, update).catch((err) => console.error('[TelegramPoller] dispatch error:', err?.message));
        }
      } catch (err: any) {
        if (!state.running) break;
        const status = err.response?.status;
        const desc = err.response?.data?.description || err.message;
        if (status === 401 || status === 404) {
          console.error(`[TelegramPoller] Invalid bot token (${desc}). Stopping poller.`);
          state.running = false;
          this.pollers.delete(state.token);
          break;
        }
        if (status === 409) {
          // Another getUpdates consumer or webhook exists; try to clear and retry
          await axios.post(`${base}/deleteWebhook`).catch(() => undefined);
        }
        console.warn(`[TelegramPoller] getUpdates error: ${desc}. Retry in ${backoff}ms`);
        await new Promise((r) => setTimeout(r, backoff));
        backoff = Math.min(backoff * 2, 30000);
      }
    }
  }

  private async dispatch(state: PollerState, update: any) {
    const msg = update.message || update.edited_message || update.channel_post || update.callback_query?.message;
    if (!msg) return;
    const from = update.callback_query?.from || msg.from || {};
    const text = update.callback_query?.data || msg.text || msg.caption || '';
    if (from.is_bot) return;

    const payload = {
      ...update,
      message: msg,
      chatId: msg.chat?.id,
      text,
      userQuery: text,
      sender: [from.first_name, from.last_name].filter(Boolean).join(' ') || from.username || 'Người dùng',
      username: from.username || '',
      userId: from.id,
      messageId: msg.message_id,
      replyToMessageId: msg.message_id,
    };

    for (const wfId of state.workflowIds) {
      const wf = globalWorkflowStore.getWorkflow(wfId);
      if (!wf || !wf.active) continue;
      const trigger = wf.nodes.find((n) => isTelegramTrigger(n, wf));
      try {
        const summary = await WorkflowRunner.execute(wf, {
          executionMode: 'trigger',
          startNodeId: trigger?.id,
          initialData: [{ json: payload }],
          credentials: globalWorkflowStore.getCredentials(),
        });
        globalWorkflowStore.addExecution(summary);
        console.log(`[TelegramPoller] "${wf.name}" handled message from chat ${payload.chatId}: ${summary.status}`);
      } catch (err: any) {
        console.error(`[TelegramPoller] Workflow "${wf.name}" failed:`, err.message);
      }
    }
  }
}

export const globalTelegramPoller = new TelegramPollingManager();

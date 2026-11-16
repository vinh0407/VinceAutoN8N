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
    (n) =>
      (n.type?.toLowerCase().includes('telegram') ||
        n.name?.toLowerCase().includes('telegram') ||
        String(n.parameters?.app || '').toLowerCase().includes('telegram')) &&
      typeof n.parameters?.botToken === 'string' &&
      n.parameters.botToken.trim() &&
      !n.parameters.botToken.includes('{{')
  );
  if (tgNode) return String(tgNode.parameters.botToken).trim();
  const creds = globalWorkflowStore.getCredentials() || {};
  return String(creds.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '').trim();
}

export class TelegramPollingManager {
  private pollers: Map<string, PollerState> = new Map();
  private recentEvents: string[] = [];
  private processedUpdates: Set<number> = new Set();

  private record(msg: string) {
    const line = `[${new Date().toISOString()}] ${msg}`;
    this.recentEvents.unshift(line);
    if (this.recentEvents.length > 20) this.recentEvents.length = 20;
    console.log(msg);
  }

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

    // Start / update pollers or webhook (webhook on Render HTTPS wakes server even when browser is closed & Render sleeps)
    const publicHttpsUrl = (process.env.RENDER_EXTERNAL_URL || process.env.PUBLIC_URL || '').trim().replace(/\/+$/, '');
    const useWebhook = publicHttpsUrl.startsWith('https://');

    for (const [token, workflowIds] of wanted) {
      if (useWebhook) {
        // Register Telegram webhook so Telegram itself wakes Render up 24/7
        const webhookUrl = `${publicHttpsUrl}/webhook/telegram`;
        axios
          .post(`https://api.telegram.org/bot${token}/setWebhook`, {
            url: webhookUrl,
            allowed_updates: ['message', 'edited_message', 'channel_post', 'callback_query'],
          })
          .then(() => this.record(`[TelegramWebhook] Registered ${webhookUrl} for bot ${token.split(':')[0]} (${workflowIds.length} workflow)`))
          .catch((err) => this.record(`[TelegramWebhook] setWebhook error: ${err.response?.data?.description || err.message}`));
        continue;
      }

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

  /** Handle an incoming Telegram Webhook update (used on Render HTTPS when browser is closed). */
  async handleWebhookUpdate(update: any) {
    const activeTelegramWfs = globalWorkflowStore
      .getWorkflows()
      .filter((wf) => wf.active && wf.nodes.some((n) => isTelegramTrigger(n, wf)));
    if (activeTelegramWfs.length === 0) return;
    await this.dispatch(
      { token: 'webhook', workflowIds: activeTelegramWfs.map((w) => w.id), offset: 0, running: true },
      update
    );
  }

  getStatus() {
    return Array.from(this.pollers.values()).map((p) => ({
      botId: p.token.split(':')[0],
      workflowIds: p.workflowIds,
      running: p.running,
      recentEvents: this.recentEvents.slice(0, 10),
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
    if (typeof update?.update_id === 'number') {
      if (this.processedUpdates.has(update.update_id)) return;
      this.processedUpdates.add(update.update_id);
      if (this.processedUpdates.size > 500) {
        const first = this.processedUpdates.values().next().value;
        if (first !== undefined) this.processedUpdates.delete(first);
      }
    }
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

    if (await this.tryHandleControlCommand(state.token, payload)) {
      return;
    }

    for (const wfId of state.workflowIds) {
      const wf = globalWorkflowStore.getWorkflow(wfId);
      if (!wf || !wf.active) continue;
      const trigger = wf.nodes.find((n) => isTelegramTrigger(n, wf));
      const botToken = trigger ? resolveBotToken(wf, trigger) : '';

      // Show "typing..." in Telegram while AI Agent is thinking on long/hard questions
      let typingTimer: NodeJS.Timeout | undefined;
      if (botToken && payload.chatId) {
        const sendTyping = () =>
          axios
            .post(`https://api.telegram.org/bot${botToken}/sendChatAction`, {
              chat_id: payload.chatId,
              action: 'typing',
            })
            .catch(() => undefined);
        void sendTyping();
        typingTimer = setInterval(() => void sendTyping(), 4500);
      }

      try {
        const summary = await WorkflowRunner.execute(wf, {
          executionMode: 'trigger',
          startNodeId: trigger?.id,
          initialData: [{ json: payload }],
          credentials: globalWorkflowStore.getCredentials(),
        });
        globalWorkflowStore.addExecution(summary);
        this.record(`[TelegramPoller] "${wf.name}" handled message from chat ${payload.chatId}: ${summary.status}${summary.error ? ' (' + summary.error + ')' : ''}`);
        if (summary.status === 'error' && botToken && payload.chatId) {
          const errText = summary.error || 'Lỗi không xác định khi chạy workflow';
          await axios
            .post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              chat_id: payload.chatId,
              text: `⚠️ Bot chưa thể trả lời do lỗi cấu hình/API:\n${errText}\n\n👉 Vui lòng mở VinceAuto kiểm tra lại API Key (nếu dùng Gemini hãy lấy key dạng AIza... hoặc tạo key mới trên Google AI Studio).`,
              reply_to_message_id: payload.messageId,
            })
            .catch(() => undefined);
        }
      } catch (err: any) {
        this.record(`[TelegramPoller] Workflow "${wf.name}" failed: ${err.message}`);
        if (botToken && payload.chatId) {
          await axios
            .post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              chat_id: payload.chatId,
              text: `⚠️ Lỗi hệ thống khi xử lý tin nhắn: ${err.message}`,
              reply_to_message_id: payload.messageId,
            })
            .catch(() => undefined);
        }
      } finally {
        if (typingTimer) clearInterval(typingTimer);
      }
    }
  }

  private async tryHandleControlCommand(botToken: string, payload: Record<string, any>): Promise<boolean> {
    const raw = String(payload.text || '').trim();
    if (!raw.startsWith('/')) return false;

    const match = raw.match(/^\/([a-zA-Z0-9_]+)(?:\s+([\s\S]+))?$/);
    if (!match) return false;
    const cmd = match[1].toLowerCase();
    const arg = (match[2] || '').trim();

    const controlCmds = new Set(['help', 'lenh', 'workflows', 'list', 'danhsach', 'status', 'trangthai', 'run', 'chay', 'on', 'bat', 'off', 'tat']);
    if (!controlCmds.has(cmd)) return false;

    const reply = async (text: string) => {
      if (!botToken || !payload.chatId) return;
      await axios
        .post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          chat_id: payload.chatId,
          text,
          reply_to_message_id: payload.messageId,
        })
        .catch(() => undefined);
    };

    const extraAdmins = (process.env.TELEGRAM_ADMIN_IDS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const isOwner =
      String(payload.userId) === '1869249751' ||
      String(payload.chatId) === '1869249751' ||
      String(payload.username || '').toLowerCase() === 'ungvinh0407' ||
      extraAdmins.includes(String(payload.userId));

    if (!isOwner) {
      await reply('🔒 Chỉ chủ sở hữu (@ungvinh0407) mới có quyền điều khiển workflow.');
      return true;
    }

    const workflows = globalWorkflowStore.getWorkflows();

    if (cmd === 'help' || cmd === 'lenh') {
      await reply(
        [
          '🤖 ĐIỀU KHIỂN VINCEAUTO QUA TELEGRAM:',
          '• /workflows — Xem danh sách tất cả workflow',
          '• /run <số hoặc tên> — Chạy ngay workflow (VD: /run 2)',
          '• /on <số hoặc tên> — Bật (Publish) workflow',
          '• /off <số hoặc tên> — Tạm tắt workflow',
          '• /status — Xem trạng thái hệ thống & lịch sử chạy',
        ].join('\n')
      );
      return true;
    }

    if (cmd === 'workflows' || cmd === 'list' || cmd === 'danhsach') {
      if (workflows.length === 0) {
        await reply('📭 Hiện chưa có workflow nào trong VinceAuto.');
        return true;
      }
      const lines = workflows.map((w, i) => `${i + 1}. ${w.active ? '🟢' : '⚪'} ${w.name} (${w.nodes?.length || 0} nodes)`);
      await reply(`📋 Danh sách Workflow (${workflows.length}):\n\n${lines.join('\n')}\n\n👉 Gửi /run <số> để chạy, /on <số> hoặc /off <số> để bật/tắt.`);
      return true;
    }

    if (cmd === 'status' || cmd === 'trangthai') {
      const activeCount = workflows.filter((w) => w.active).length;
      const recent = globalWorkflowStore.getExecutions(undefined, 3);
      const recentLines =
        recent.length > 0
          ? recent.map((e) => `• ${e.status === 'success' ? '✅' : '❌'} ${e.workflowName} (${e.durationMs}ms)`).join('\n')
          : '• Chưa có lượt chạy nào gần đây.';
      await reply(`📊 Trạng thái VinceAuto:\n• Tổng workflow: ${workflows.length} (🟢 Đang bật: ${activeCount})\n\n🕒 Lượt chạy gần nhất:\n${recentLines}`);
      return true;
    }

    const resolveTarget = (): IWorkflow | undefined => {
      if (!arg) return undefined;
      const num = Number(arg);
      if (Number.isInteger(num) && num >= 1 && num <= workflows.length) {
        return workflows[num - 1];
      }
      const q = arg.toLowerCase();
      return workflows.find((w) => w.id.toLowerCase() === q || w.name.toLowerCase().includes(q));
    };

    const target = resolveTarget();
    if (!target) {
      await reply(`⚠️ Không tìm thấy workflow "${arg}". Gửi /workflows để xem số thứ tự.`);
      return true;
    }

    if (cmd === 'on' || cmd === 'bat' || cmd === 'off' || cmd === 'tat') {
      const nextActive = cmd === 'on' || cmd === 'bat';
      globalWorkflowStore.saveWorkflow({ ...target, active: nextActive, updatedAt: new Date().toISOString() });
      this.sync(globalWorkflowStore.getWorkflows());
      await reply(`${nextActive ? '🟢 Đã BẬT' : '⚪ Đã TẮT'} workflow: "${target.name}".`);
      return true;
    }

    if (cmd === 'run' || cmd === 'chay') {
      await reply(`🚀 Đang chạy workflow: "${target.name}"...`);
      try {
        const summary = await WorkflowRunner.execute(target, {
          executionMode: 'manual',
          initialData: [{ json: { ...payload, triggeredBy: 'telegram_command' } }],
          credentials: globalWorkflowStore.getCredentials(),
        });
        globalWorkflowStore.addExecution(summary);
        if (summary.status === 'success') {
          await reply(`✅ Hoàn tất "${target.name}" trong ${summary.durationMs}ms!`);
        } else {
          await reply(`❌ Workflow "${target.name}" gặp lỗi:\n${summary.error || 'Lỗi không xác định'}`);
        }
      } catch (err: any) {
        await reply(`❌ Lỗi khi chạy "${target.name}": ${err.message}`);
      }
      return true;
    }

    return false;
  }
}

export const globalTelegramPoller = new TelegramPollingManager();

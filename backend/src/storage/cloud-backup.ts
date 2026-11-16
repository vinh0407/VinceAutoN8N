import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { globalWorkflowStore } from './store.js';

/**
 * CloudBackup — keeps data alive on hosts with an ephemeral disk (e.g. Render Free).
 *
 * Backend: a private GitHub Gist (free, no extra service).
 *   - GITHUB_BACKUP_TOKEN : GitHub token with the "gist" scope (required to enable)
 *   - GITHUB_BACKUP_GIST_ID: optional; if omitted the gist is found/created by description
 *
 * Flow:
 *   boot  -> restore(): download all data/*.json from the gist, then store.reload()
 *   run   -> every 20s: if any data file changed, push it to the gist
 *   exit  -> SIGTERM/SIGINT: final push
 */

const FILES = ['workflows.json', 'projects.json', 'credentials.json', 'tasks.json', 'versions.json', 'tables.json'];
const DESCRIPTION = 'vinceauto-data-backup';
const API = 'https://api.github.com';

class CloudBackup {
  private token = (process.env.GITHUB_BACKUP_TOKEN || '').trim();
  private gistId = (process.env.GITHUB_BACKUP_GIST_ID || '').trim();
  private lastPushed: Record<string, string> = {};
  private timer?: NodeJS.Timeout;
  private pushing = false;

  get enabled() {
    return Boolean(this.token);
  }

  /** Configure GitHub token / gistId at runtime (e.g. from UI) and verify with GitHub API. */
  async configure(token: string, gistId?: string): Promise<{ ok: boolean; gistId?: string; username?: string; error?: string }> {
    const clean = token.trim();
    if (!clean) return { ok: false, error: 'Vui lòng nhập GitHub Token (quyền gist).' };
    try {
      const userRes = await axios.get(`${API}/user`, {
        headers: {
          Authorization: `Bearer ${clean}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'vinceauto-backup',
        },
        timeout: 15000,
      });
      this.token = clean;
      if (gistId && gistId.trim()) this.gistId = gistId.trim();
      process.env.GITHUB_BACKUP_TOKEN = clean;
      const ensuredId = await this.ensureGist();
      // Push local state right away if local has workflows, else restore from Gist
      const hasLocalWf = globalWorkflowStore.getWorkflows().length > 0 || globalWorkflowStore.getProjects().length > 0;
      if (hasLocalWf) {
        await this.push();
      } else {
        await this.restore();
      }
      this.startAutoSync();
      return { ok: true, gistId: ensuredId || undefined, username: userRes.data?.login };
    } catch (err: any) {
      return { ok: false, error: err.response?.data?.message || err.message || 'Token GitHub không hợp lệ' };
    }
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'vinceauto-backup',
    };
  }

  private dataPath(file: string) {
    return path.join(globalWorkflowStore.getDataDir(), file);
  }

  private async ensureGist(): Promise<string | null> {
    if (this.gistId) return this.gistId;
    // Find an existing backup gist by description
    for (let page = 1; page <= 5; page++) {
      const res = await axios.get(`${API}/gists`, { headers: this.headers(), params: { per_page: 100, page } });
      const list: any[] = res.data || [];
      const hit = list.find((g) => g.description === DESCRIPTION);
      if (hit) {
        this.gistId = hit.id;
        return this.gistId;
      }
      if (list.length < 100) break;
    }
    // Create a new private gist
    const files: Record<string, { content: string }> = {};
    for (const f of FILES) {
      const p = this.dataPath(f);
      files[f] = { content: fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') || '[]' : f === 'credentials.json' ? '{}' : '[]' };
    }
    const created = await axios.post(`${API}/gists`, { description: DESCRIPTION, public: false, files }, { headers: this.headers() });
    this.gistId = created.data.id;
    console.log(`[CloudBackup] Created private backup gist ${this.gistId}`);
    return this.gistId;
  }

  /** Download backup into the data dir and reload the store. */
  async restore() {
    if (!this.enabled) {
      console.log('[CloudBackup] Disabled (set GITHUB_BACKUP_TOKEN to keep data across restarts on free hosting).');
      return;
    }
    try {
      const id = await this.ensureGist();
      if (!id) return;
      const res = await axios.get(`${API}/gists/${id}`, { headers: this.headers() });
      const files = res.data?.files || {};
      let restored = 0;
      for (const f of FILES) {
        const meta = files[f];
        if (!meta) continue;
        let content: string = meta.content;
        if (meta.truncated && meta.raw_url) {
          const raw = await axios.get(meta.raw_url, { headers: this.headers(), responseType: 'text' });
          content = raw.data;
        }
        if (typeof content !== 'string' || !content.trim()) continue;
        try {
          JSON.parse(content);
        } catch {
          continue; // never overwrite with corrupt data
        }
        fs.writeFileSync(this.dataPath(f), content);
        this.lastPushed[f] = content;
        restored++;
      }
      globalWorkflowStore.reload();
      console.log(`[CloudBackup] Restored ${restored} file(s) from gist ${id}`);
    } catch (err: any) {
      console.error(`[CloudBackup] Restore failed: ${err.response?.data?.message || err.message}`);
    }
  }

  /** Push changed files to the gist. */
  async push() {
    if (!this.enabled || this.pushing) return;
    this.pushing = true;
    try {
      const changed: Record<string, { content: string }> = {};
      for (const f of FILES) {
        const p = this.dataPath(f);
        if (!fs.existsSync(p)) continue;
        const content = fs.readFileSync(p, 'utf-8');
        if (content && content !== this.lastPushed[f]) changed[f] = { content };
      }
      if (Object.keys(changed).length === 0) return;
      const id = await this.ensureGist();
      if (!id) return;
      await axios.patch(`${API}/gists/${id}`, { files: changed }, { headers: this.headers() });
      for (const [f, v] of Object.entries(changed)) this.lastPushed[f] = v.content;
      console.log(`[CloudBackup] Synced ${Object.keys(changed).join(', ')}`);
    } catch (err: any) {
      console.error(`[CloudBackup] Push failed: ${err.response?.data?.message || err.message}`);
    } finally {
      this.pushing = false;
    }
  }

  startAutoSync(intervalMs = 20000) {
    if (!this.enabled || this.timer) return;
    this.timer = setInterval(() => void this.push(), intervalMs);
    const flush = async () => {
      await this.push();
      process.exit(0);
    };
    process.once('SIGTERM', flush);
    process.once('SIGINT', flush);
  }

  status() {
    return { enabled: this.enabled, gistId: this.gistId || null };
  }
}

export const globalCloudBackup = new CloudBackup();

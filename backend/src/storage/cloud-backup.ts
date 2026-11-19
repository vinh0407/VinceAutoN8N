import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
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

const FILES = ['workflows.json', 'projects.json', 'credentials.json', 'tasks.json', 'versions.json', 'tables.json', 'auth.json', 'accounts.json'];
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

  private deriveKey(): Buffer {
    const secret = (process.env.BACKUP_ENCRYPTION_KEY || this.token || 'vinceauto-default-secret').trim();
    return crypto.createHash('sha256').update(secret).digest();
  }

  private encryptContent(plainText: string): string {
    const key = this.deriveKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return JSON.stringify({
      v: 1,
      alg: 'aes-256-gcm',
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      data: encrypted.toString('base64'),
    });
  }

  private decryptContent(raw: string): string {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.v === 1 && parsed.alg === 'aes-256-gcm') {
      const key = this.deriveKey();
      const iv = Buffer.from(parsed.iv, 'base64');
      const tag = Buffer.from(parsed.tag, 'base64');
      const data = Buffer.from(parsed.data, 'base64');
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(tag);
      const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
      return decrypted.toString('utf8');
    }
    return raw;
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
    // Create a new private gist (always encrypted so secrets are never exposed)
    const files: Record<string, { content: string }> = {};
    for (const f of FILES) {
      const p = this.dataPath(f);
      const plain = fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') || '[]' : f === 'credentials.json' ? '{}' : '[]';
      files[f] = { content: this.encryptContent(plain) };
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
        let plainContent: string;
        try {
          plainContent = this.decryptContent(content);
          JSON.parse(plainContent);
        } catch {
          continue; // never overwrite with corrupt data
        }
        fs.writeFileSync(this.dataPath(f), plainContent);
        this.lastPushed[f] = plainContent;
        restored++;
      }
      globalWorkflowStore.reload();
      console.log(`[CloudBackup] Restored ${restored} file(s) from gist ${id}`);
    } catch (err: any) {
      console.error(`[CloudBackup] Restore failed: ${err.response?.data?.message || err.message}`);
    }
  }

  /** Push changed files to the gist (AES-256-GCM encrypted). */
  async push() {
    if (!this.enabled || this.pushing) return;
    this.pushing = true;
    try {
      const changed: Record<string, { content: string }> = {};
      const plainChanged: Record<string, string> = {};
      for (const f of FILES) {
        const p = this.dataPath(f);
        if (!fs.existsSync(p)) continue;
        const content = fs.readFileSync(p, 'utf-8');
        if (content && content !== this.lastPushed[f]) {
          changed[f] = { content: this.encryptContent(content) };
          plainChanged[f] = content;
        }
      }
      if (Object.keys(changed).length === 0) return;
      const id = await this.ensureGist();
      if (!id) return;
      await axios.patch(`${API}/gists/${id}`, { files: changed }, { headers: this.headers() });
      for (const [f, plain] of Object.entries(plainChanged)) this.lastPushed[f] = plain;
      console.log(`[CloudBackup] Synced encrypted backup (${Object.keys(changed).join(', ')})`);
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

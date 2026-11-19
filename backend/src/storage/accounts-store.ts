import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { globalWorkflowStore } from './store.js';

export type AccountPlatform =
  | 'google'
  | 'youtube'
  | 'facebook'
  | 'instagram'
  | 'threads'
  | 'tiktok'
  | 'telegram'
  | 'gemini';

export interface IAccountResource {
  id: string;
  name: string;
  extra?: string;
}

export interface IConnectedAccount {
  id: string;
  platform: AccountPlatform;
  label: string;
  identifier: string;
  token: string;
  resources: IAccountResource[];
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

class AccountsStore {
  private filePath(): string {
    return path.join(globalWorkflowStore.getDataDir(), 'accounts.json');
  }

  private readAll(): IConnectedAccount[] {
    try {
      const p = this.filePath();
      if (!fs.existsSync(p)) return [];
      const raw = fs.readFileSync(p, 'utf-8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private writeAll(list: IConnectedAccount[]): void {
    const p = this.filePath();
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(p, JSON.stringify(list, null, 2));
  }

  private maskToken(tok: string): string {
    if (!tok) return '';
    if (tok.length <= 10) return '••••••';
    return `${tok.slice(0, 6)}...${tok.slice(-4)}`;
  }

  listPublic(platform?: string) {
    const list = this.readAll();
    const filtered = platform ? list.filter((a) => a.platform === platform) : list;
    return filtered.map((a) => ({
      ...a,
      hasToken: Boolean(a.token),
      token: this.maskToken(a.token),
    }));
  }

  getById(id: string): IConnectedAccount | undefined {
    return this.readAll().find((a) => a.id === id);
  }

  upsert(input: {
    id?: string;
    platform: AccountPlatform;
    label: string;
    identifier?: string;
    token?: string;
    resources?: IAccountResource[];
    isDefault?: boolean;
  }): IConnectedAccount {
    const list = this.readAll();
    const now = new Date().toISOString();
    const existingIdx = input.id ? list.findIndex((a) => a.id === input.id) : -1;

    if (existingIdx !== -1) {
      const prev = list[existingIdx];
      const updated: IConnectedAccount = {
        ...prev,
        platform: input.platform || prev.platform,
        label: input.label?.trim() || prev.label,
        identifier: input.identifier !== undefined ? input.identifier.trim() : prev.identifier,
        token: input.token && input.token.trim() ? input.token.trim() : prev.token,
        resources: Array.isArray(input.resources) ? input.resources : prev.resources,
        isDefault: input.isDefault ?? prev.isDefault,
        updatedAt: now,
      };
      if (updated.isDefault) {
        list.forEach((a) => {
          if (a.platform === updated.platform && a.id !== updated.id) a.isDefault = false;
        });
      }
      list[existingIdx] = updated;
      this.writeAll(list);
      return updated;
    }

    const hasSamePlatform = list.some((a) => a.platform === input.platform);
    const created: IConnectedAccount = {
      id: `acc_${uuidv4().slice(0, 8)}`,
      platform: input.platform,
      label: input.label.trim() || `${input.platform.toUpperCase()} Account`,
      identifier: (input.identifier || '').trim(),
      token: (input.token || '').trim(),
      resources: Array.isArray(input.resources) ? input.resources : [],
      isDefault: input.isDefault ?? !hasSamePlatform,
      createdAt: now,
      updatedAt: now,
    };
    if (created.isDefault) {
      list.forEach((a) => {
        if (a.platform === created.platform) a.isDefault = false;
      });
    }
    list.push(created);
    this.writeAll(list);
    return created;
  }

  addResource(accountId: string, resource: IAccountResource): IConnectedAccount | null {
    const list = this.readAll();
    const idx = list.findIndex((a) => a.id === accountId);
    if (idx === -1) return null;
    const acc = list[idx];
    const cleanId = resource.id.trim();
    const nextResources = [
      ...(acc.resources || []).filter((r) => r.id !== cleanId),
      { id: cleanId, name: resource.name.trim() || cleanId, extra: resource.extra },
    ];
    acc.resources = nextResources;
    acc.updatedAt = new Date().toISOString();
    this.writeAll(list);
    return acc;
  }

  remove(id: string): boolean {
    const list = this.readAll();
    const next = list.filter((a) => a.id !== id);
    if (next.length === list.length) return false;
    this.writeAll(next);
    return true;
  }
}

export const globalAccountsStore = new AccountsStore();

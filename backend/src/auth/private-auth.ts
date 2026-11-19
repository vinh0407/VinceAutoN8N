import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { globalWorkflowStore } from '../storage/store.js';

interface IAuthRecord {
  username: string;
  salt: string;
  passwordHash: string;
  secret: string;
  createdAt: string;
}

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function authFilePath(): string {
  return path.join(globalWorkflowStore.getDataDir(), 'auth.json');
}

function readAuthFile(): IAuthRecord | null {
  try {
    const p = authFilePath();
    if (!fs.existsSync(p)) return null;
    const raw = fs.readFileSync(p, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.username === 'string' && typeof parsed.passwordHash === 'string') {
      return parsed as IAuthRecord;
    }
    return null;
  } catch {
    return null;
  }
}

function writeAuthFile(record: IAuthRecord): void {
  const p = authFilePath();
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(p, JSON.stringify(record, null, 2));
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function getSigningSecret(): string {
  const envSecret = (process.env.AUTH_SECRET || process.env.GITHUB_BACKUP_TOKEN || '').trim();
  if (envSecret) return envSecret;
  const fileRec = readAuthFile();
  if (fileRec?.secret) return fileRec.secret;
  const envCred = `${process.env.AUTH_USERNAME || ''}:${process.env.AUTH_PASSWORD || ''}`.trim();
  if (envCred !== ':') {
    return crypto.createHash('sha256').update(envCred).digest('hex');
  }
  return 'vinceauto-ephemeral-session-secret';
}

export function isAuthConfigured(): boolean {
  const envUser = (process.env.AUTH_USERNAME || '').trim();
  const envPass = (process.env.AUTH_PASSWORD || '').trim();
  if (envUser && envPass) return true;
  return Boolean(readAuthFile());
}

export function getAuthStatus(): { configured: boolean; singleAccountOnly: true } {
  return {
    configured: isAuthConfigured(),
    singleAccountOnly: true,
  };
}

export function setupSingleAccount(
  username: string,
  password: string
): { ok: boolean; token?: string; username?: string; error?: string } {
  if (isAuthConfigured()) {
    return { ok: false, error: 'Tài khoản riêng tư đã được thiết lập trước đó.' };
  }
  const cleanUser = username.trim();
  const cleanPass = password;
  if (cleanUser.length < 3 || cleanPass.length < 4) {
    return { ok: false, error: 'Tên tài khoản tối thiểu 3 ký tự và mật khẩu tối thiểu 4 ký tự.' };
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const secret = crypto.randomBytes(32).toString('hex');
  const record: IAuthRecord = {
    username: cleanUser,
    salt,
    passwordHash: hashPassword(cleanPass, salt),
    secret,
    createdAt: new Date().toISOString(),
  };
  writeAuthFile(record);
  const token = signSessionToken(cleanUser);
  return { ok: true, token, username: cleanUser };
}

export function loginSingleAccount(
  username: string,
  password: string
): { ok: boolean; token?: string; username?: string; error?: string } {
  const cleanUser = username.trim();
  const envUser = (process.env.AUTH_USERNAME || '').trim();
  const envPass = (process.env.AUTH_PASSWORD || '').trim();

  if (envUser && envPass) {
    if (safeEqual(cleanUser, envUser) && safeEqual(password, envPass)) {
      return { ok: true, token: signSessionToken(envUser), username: envUser };
    }
    return { ok: false, error: 'Sai tên tài khoản hoặc mật khẩu.' };
  }

  const rec = readAuthFile();
  if (!rec) {
    return { ok: false, error: 'Chưa thiết lập tài khoản riêng tư.' };
  }
  const candidateHash = hashPassword(password, rec.salt);
  if (safeEqual(cleanUser, rec.username) && safeEqual(candidateHash, rec.passwordHash)) {
    return { ok: true, token: signSessionToken(rec.username), username: rec.username };
  }
  return { ok: false, error: 'Sai tên tài khoản hoặc mật khẩu.' };
}

export function signSessionToken(username: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      sub: username,
      exp: Date.now() + TOKEN_TTL_MS,
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', getSigningSecret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string): { valid: boolean; username?: string } {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return { valid: false };
    const [payload, sig] = parts;
    const expectedSig = crypto.createHmac('sha256', getSigningSecret()).update(payload).digest('base64url');
    if (!safeEqual(sig, expectedSig)) return { valid: false };
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!decoded?.sub || typeof decoded.exp !== 'number' || decoded.exp < Date.now()) {
      return { valid: false };
    }
    return { valid: true, username: String(decoded.sub) };
  } catch {
    return { valid: false };
  }
}

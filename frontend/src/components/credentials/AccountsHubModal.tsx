import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Users, Plus, Trash2, Check, Loader2, FolderPlus, Sparkles } from 'lucide-react';

export interface IAccountResource {
  id: string;
  name: string;
  extra?: string;
}

export interface IConnectedAccount {
  id: string;
  platform: 'google' | 'youtube' | 'facebook' | 'instagram' | 'threads' | 'tiktok' | 'telegram' | 'gemini';
  label: string;
  identifier: string;
  token: string;
  hasToken?: boolean;
  resources: IAccountResource[];
  isDefault?: boolean;
}

interface AccountsHubModalProps {
  onClose: () => void;
}

const PLATFORMS: Array<{
  id: IConnectedAccount['platform'];
  name: string;
  idLabel: string;
  idPlaceholder: string;
  tokenLabel: string;
  tokenPlaceholder: string;
  resourceLabel: string;
  resourcePlaceholder: string;
}> = [
  {
    id: 'google',
    name: 'Google (Sheets / Drive / Gmail)',
    idLabel: 'Email Google',
    idPlaceholder: 'vd: email-cua-ban@gmail.com',
    tokenLabel: 'Google OAuth Token (tùy chọn - ya29... để tự quét tất cả Sheet)',
    tokenPlaceholder: 'ya29.... (hoặc để trống nếu thêm Sheet thủ công)',
    resourceLabel: 'Google Sheet / Thư mục Drive',
    resourcePlaceholder: 'Dán link Google Sheet hoặc ID...',
  },
  {
    id: 'facebook',
    name: 'Facebook Page',
    idLabel: 'Facebook Page ID (hoặc Tên Page)',
    idPlaceholder: 'vd: 123456789012345',
    tokenLabel: 'Meta / Facebook Access Token (EAA... tự quét các Page)',
    tokenPlaceholder: 'EAA....',
    resourceLabel: 'Fanpage thuộc tài khoản',
    resourcePlaceholder: 'Page ID...',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    idLabel: 'YouTube Channel ID',
    idPlaceholder: 'UCxxxxxxxx...',
    tokenLabel: 'YouTube API Key / OAuth Token',
    tokenPlaceholder: 'AIza... hoặc ya29...',
    resourceLabel: 'Playlist / Kênh phụ',
    resourcePlaceholder: 'Channel / Playlist ID...',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    idLabel: 'TikTok Open ID / Username',
    idPlaceholder: '@username hoặc Open ID',
    tokenLabel: 'TikTok Access Token',
    tokenPlaceholder: 'act.xxxx...',
    resourceLabel: 'Kênh TikTok',
    resourcePlaceholder: 'Open ID...',
  },
  {
    id: 'instagram',
    name: 'Instagram Business',
    idLabel: 'Instagram Account ID',
    idPlaceholder: '178414...',
    tokenLabel: 'Meta Graph Access Token',
    tokenPlaceholder: 'EAA....',
    resourceLabel: 'Tài khoản IG',
    resourcePlaceholder: 'IG ID...',
  },
  {
    id: 'threads',
    name: 'Meta Threads',
    idLabel: 'Threads User ID',
    idPlaceholder: 'Threads ID...',
    tokenLabel: 'Threads Access Token',
    tokenPlaceholder: 'THAA...',
    resourceLabel: 'Kênh Threads',
    resourcePlaceholder: 'Threads ID...',
  },
  {
    id: 'telegram',
    name: 'Telegram Bot',
    idLabel: 'Bot Username hoặc Chat ID',
    idPlaceholder: '@ten_bot hoặc 1869249751',
    tokenLabel: 'Telegram Bot Token (@BotFather)',
    tokenPlaceholder: '123456789:AAH...',
    resourceLabel: 'Nhóm / Kênh nhận tin',
    resourcePlaceholder: 'Chat ID...',
  },
  {
    id: 'gemini',
    name: 'Google Gemini AI',
    idLabel: 'Ghi chú tài khoản AI',
    idPlaceholder: 'Gemini Key chính',
    tokenLabel: 'Gemini API Key (AIza...)',
    tokenPlaceholder: 'AIzaSy...',
    resourceLabel: 'Model mặc định',
    resourcePlaceholder: 'gemini-3.1-flash-lite-preview',
  },
];

export const AccountsHubModal: React.FC<AccountsHubModalProps> = ({ onClose }) => {
  const [accounts, setAccounts] = useState<IConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePlatform, setActivePlatform] = useState<IConnectedAccount['platform']>('google');

  // Add account form
  const [label, setLabel] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [token, setToken] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Add resource/project to an account
  const [resourceInputs, setResourceInputs] = useState<Record<string, { name: string; id: string }>>({});

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/accounts');
      if (res.data?.success && Array.isArray(res.data.accounts)) {
        setAccounts(res.data.accounts);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAccounts();
  }, []);

  const currentMeta = PLATFORMS.find((p) => p.id === activePlatform) || PLATFORMS[0];
  const filteredAccounts = accounts.filter((a) => a.platform === activePlatform);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() && !identifier.trim()) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await axios.post('/api/accounts', {
        platform: activePlatform,
        label: label.trim() || identifier.trim() || currentMeta.name,
        identifier: identifier.trim(),
        token: token.trim(),
      });
      if (res.data?.success) {
        setLabel('');
        setIdentifier('');
        setToken('');
        const extraMsg =
          res.data.discoveredCount > 0
            ? ` (đã tự động tìm thấy ${res.data.discoveredCount} dự án/trang!)`
            : '';
        setFeedback(`Đã lưu tài khoản ${currentMeta.name}${extraMsg}`);
        await loadAccounts();
      }
    } catch (err: any) {
      setFeedback(err.response?.data?.error || 'Không thể lưu tài khoản.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddResource = async (accId: string) => {
    const inp = resourceInputs[accId];
    if (!inp?.id?.trim()) return;
    try {
      const res = await axios.post(`/api/accounts/${accId}/resources`, {
        id: inp.id.trim(),
        name: inp.name.trim() || inp.id.trim(),
        extra: currentMeta.name,
      });
      if (res.data?.success) {
        setResourceInputs((prev) => ({ ...prev, [accId]: { name: '', id: '' } }));
        await loadAccounts();
      }
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`/api/accounts/${id}`).catch(() => undefined);
    await loadAccounts();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-[960px] max-w-[96vw] h-[84vh] bg-[#16161a] border border-[#2c2c34] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#25252c] bg-[#121216] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Đăng nhập & Quản lý Đa Tài Khoản ({accounts.length} đã kết nối)
              </h2>
              <p className="text-[11px] text-zinc-400">
                Thêm 1 lần cho nhiều tài khoản mỗi nền tảng — khi kéo thả node chỉ cần chọn từ danh sách
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#24242b] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Platform Sidebar */}
          <div className="w-[230px] border-r border-[#25252c] bg-[#131317] p-2.5 space-y-1 overflow-y-auto shrink-0">
            {PLATFORMS.map((p) => {
              const count = accounts.filter((a) => a.platform === p.id).length;
              const active = activePlatform === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setActivePlatform(p.id);
                    setFeedback(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    active
                      ? 'bg-sky-500/20 text-sky-200 border border-sky-500/40 font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-[#1e1e24]'
                  }`}
                >
                  <span className="truncate text-left">{p.name}</span>
                  {count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Add new account for selected platform */}
            <form
              onSubmit={handleAddAccount}
              className="p-4 rounded-xl bg-[#1b1b21] border border-[#2c2c36] space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                  <Plus className="w-4 h-4 text-sky-400" />
                  <span>Thêm tài khoản {currentMeta.name}</span>
                </div>
                <span className="text-[10.5px] text-zinc-400">Hỗ trợ nhiều tài khoản</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Tên gợi nhớ</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder={`VD: ${currentMeta.name} Chính`}
                    className="w-full bg-[#121216] border border-[#2d2d37] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">{currentMeta.idLabel}</label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={currentMeta.idPlaceholder}
                    className="w-full bg-[#121216] border border-[#2d2d37] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-300 mb-1">{currentMeta.tokenLabel}</label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder={currentMeta.tokenPlaceholder}
                  className="w-full bg-[#121216] border border-[#2d2d37] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                {feedback ? (
                  <span className="text-[11px] text-emerald-400 flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{feedback}</span>
                  </span>
                ) : (
                  <span className="text-[10.5px] text-zinc-500">
                    Mã hóa AES-256-GCM khi sao lưu
                  </span>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3.5 py-1.5 rounded-lg bg-[#e6e8ec] hover:bg-white text-zinc-900 font-bold text-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Lưu tài khoản</span>
                </button>
              </div>
            </form>

            {/* Existing accounts + multi-project/sheet resources */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-zinc-300">
                Danh sách tài khoản {currentMeta.name} ({filteredAccounts.length})
              </div>

              {loading ? (
                <div className="text-xs text-zinc-500 flex items-center space-x-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang tải...</span>
                </div>
              ) : filteredAccounts.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#18181d] border border-dashed border-[#2d2d36] text-xs text-zinc-500 text-center">
                  Chưa có tài khoản {currentMeta.name} nào. Hãy thêm ở khung phía trên để chọn nhanh khi kéo thả node.
                </div>
              ) : (
                filteredAccounts.map((acc) => {
                  const rInput = resourceInputs[acc.id] || { name: '', id: '' };
                  return (
                    <div
                      key={acc.id}
                      className="p-4 rounded-xl bg-[#191920] border border-[#2a2a35] space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-white">{acc.label}</span>
                            {acc.isDefault && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                Mặc định
                              </span>
                            )}
                            {acc.hasToken && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 font-mono">
                                Token: {acc.token}
                              </span>
                            )}
                          </div>
                          {acc.identifier && (
                            <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{acc.identifier}</div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleDelete(acc.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-[#25252e] cursor-pointer"
                          title="Xóa tài khoản"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Multi-project / Sheet / Page list under this account */}
                      <div className="pt-2 border-t border-[#262630] space-y-2">
                        <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-sky-300">
                          <Sparkles className="w-3 h-3" />
                          <span>
                            Dự án / {currentMeta.resourceLabel} thuộc tài khoản này ({acc.resources?.length || 0})
                          </span>
                        </div>

                        {acc.resources && acc.resources.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {acc.resources.map((r) => (
                              <span
                                key={r.id}
                                className="px-2 py-1 rounded-lg bg-[#131318] border border-[#2c2c38] text-[11px] text-zinc-200 flex items-center space-x-1.5"
                                title={r.id}
                              >
                                <span className="font-medium">{r.name}</span>
                                <span className="text-[9.5px] text-zinc-500 font-mono">
                                  ({r.id.slice(0, 8)}...)
                                </span>
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={rInput.name}
                            onChange={(e) =>
                              setResourceInputs((prev) => ({
                                ...prev,
                                [acc.id]: { ...rInput, name: e.target.value },
                              }))
                            }
                            placeholder="Tên dự án (VD: Sheet Video TikTok)"
                            className="w-44 bg-[#121216] border border-[#2d2d37] rounded-md px-2 py-1 text-[11px] text-white focus:outline-none focus:border-sky-400"
                          />
                          <input
                            type="text"
                            value={rInput.id}
                            onChange={(e) =>
                              setResourceInputs((prev) => ({
                                ...prev,
                                [acc.id]: { ...rInput, id: e.target.value },
                              }))
                            }
                            placeholder={currentMeta.resourcePlaceholder}
                            className="flex-1 bg-[#121216] border border-[#2d2d37] rounded-md px-2 py-1 text-[11px] font-mono text-white focus:outline-none focus:border-sky-400"
                          />
                          <button
                            type="button"
                            onClick={() => void handleAddResource(acc.id)}
                            className="px-2.5 py-1 rounded-md bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-200 text-[11px] font-semibold flex items-center space-x-1 cursor-pointer shrink-0"
                          >
                            <FolderPlus className="w-3 h-3" />
                            <span>Thêm dự án</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

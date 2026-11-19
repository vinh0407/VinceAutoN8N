import React, { useState, useEffect } from 'react';
import { X, Key, Check, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

interface CredentialsModalProps {
  onClose: () => void;
}

export const CredentialsModal: React.FC<CredentialsModalProps> = ({ onClose }) => {
  const [credentials, setCredentials] = useState<Record<string, string>>({
    OPENCODE2_PROVIDER_NAME: 'Opencode2',
    OPENCODE2_PROVIDER_TYPE: 'openai',
    OPENCODE2_BASE_URL: 'https://opencode.ai/zen/v1',
    OPENCODE2_API_KEY: 'oc_sk_5583787331ee_7BzCEfqfok9jfIpRaoTipbnWONwqUcZh',
    OPENCODE2_MODEL: 'crouton-alpha-free',
    GEMINI_API_KEY: '',
    OPENAI_API_KEY: 'oc_sk_5583787331ee_7BzCEfqfok9jfIpRaoTipbnWONwqUcZh',
    ANTHROPIC_API_KEY: '',
    OLLAMA_BASE_URL: 'http://localhost:11434',
    TELEGRAM_BOT_TOKEN: '',
    VINCEZONE_API_KEY: '',
    OWNER_EMAIL: '',
    GOOGLE_SHEET_ID: '',
    GOOGLE_DRIVE_FOLDER_ID: 'VinceAuto_Videos',
    YOUTUBE_CHANNEL_ID: '',
    YOUTUBE_API_KEY: '',
    META_ACCESS_TOKEN: '',
    FACEBOOK_PAGE_ID: '',
    INSTAGRAM_ACCOUNT_ID: '',
    THREADS_USER_ID: '',
    TIKTOK_OPEN_ID: '',
    TIKTOK_ACCESS_TOKEN: '',
  });

  const [maskedInfo, setMaskedInfo] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [githubGistId, setGithubGistId] = useState('');
  const [backupStatus, setBackupStatus] = useState<{ enabled: boolean; gistId: string | null; listenersCount: number }>({
    enabled: false,
    gistId: null,
    listenersCount: 0,
  });
  const [isLinkingGithub, setIsLinkingGithub] = useState(false);
  const [githubMsg, setGithubMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const standardModels = [
    { value: 'crouton-alpha-free', label: 'crouton-alpha-free (Opencode2 Miễn phí)' },
    { value: 'gpt-4o', label: 'gpt-4o (OpenAI Omni Flagship)' },
    { value: 'gpt-4o-mini', label: 'gpt-4o-mini (OpenAI Fast & Cost-effective)' },
    { value: 'o3-mini', label: 'o3-mini (OpenAI Reasoning)' },
    { value: 'gemini-2.0-flash', label: 'gemini-2.0-flash (Google Gemini Flash)' },
    { value: 'gemini-1.5-pro', label: 'gemini-1.5-pro (Google Gemini Pro)' },
    { value: 'claude-3-5-sonnet', label: 'claude-3-5-sonnet (Anthropic Claude)' },
    { value: 'deepseek-chat', label: 'deepseek-chat (DeepSeek V3)' },
    { value: 'deepseek-reasoner', label: 'deepseek-reasoner (DeepSeek R1)' },
    { value: 'llama3:latest', label: 'llama3:latest (Local Ollama)' },
  ];

  useEffect(() => {
    axios.get('/api/credentials').then((res) => {
      if (res.data?.success && res.data?.credentials) {
        setMaskedInfo(res.data.credentials);
        const c = res.data.credentials;
        if (c.OPENCODE2_MODEL && !standardModels.some((m) => m.value === c.OPENCODE2_MODEL)) {
          setIsCustomModel(true);
        }
        setCredentials((prev) => ({
          ...prev,
          OPENCODE2_BASE_URL: c.OPENCODE2_BASE_URL || prev.OPENCODE2_BASE_URL,
          OPENCODE2_MODEL: c.OPENCODE2_MODEL || prev.OPENCODE2_MODEL,
          OPENCODE2_API_KEY: c.OPENCODE2_API_KEY || prev.OPENCODE2_API_KEY,
          OLLAMA_BASE_URL: c.OLLAMA_BASE_URL || prev.OLLAMA_BASE_URL,
          OWNER_EMAIL: c.OWNER_EMAIL || prev.OWNER_EMAIL,
          GOOGLE_SHEET_ID: c.GOOGLE_SHEET_ID || prev.GOOGLE_SHEET_ID,
          GOOGLE_DRIVE_FOLDER_ID: c.GOOGLE_DRIVE_FOLDER_ID || prev.GOOGLE_DRIVE_FOLDER_ID,
          YOUTUBE_CHANNEL_ID: c.YOUTUBE_CHANNEL_ID || prev.YOUTUBE_CHANNEL_ID,
          FACEBOOK_PAGE_ID: c.FACEBOOK_PAGE_ID || c.FB_PAGE_ID || prev.FACEBOOK_PAGE_ID,
          INSTAGRAM_ACCOUNT_ID: c.INSTAGRAM_ACCOUNT_ID || prev.INSTAGRAM_ACCOUNT_ID,
          THREADS_USER_ID: c.THREADS_USER_ID || prev.THREADS_USER_ID,
          TIKTOK_OPEN_ID: c.TIKTOK_OPEN_ID || prev.TIKTOK_OPEN_ID,
        }));
      }
    });
    axios.get('/api/backup/status').then((res) => {
      if (res.data?.success) {
        setBackupStatus({
          enabled: Boolean(res.data.enabled),
          gistId: res.data.gistId || null,
          listenersCount: Array.isArray(res.data.listeners) ? res.data.listeners.length : 0,
        });
        if (res.data.gistId) setGithubGistId(res.data.gistId);
      }
    }).catch(() => {});
  }, []);

  const handleLinkGithub = async () => {
    if (!githubToken.trim()) {
      setGithubMsg({ ok: false, text: 'Vui lòng nhập GitHub Personal Access Token (quyền gist).' });
      return;
    }
    setIsLinkingGithub(true);
    setGithubMsg(null);
    try {
      const res = await axios.post('/api/backup/github', {
        token: githubToken.trim(),
        gistId: githubGistId.trim() || undefined,
      });
      if (res.data?.success) {
        setBackupStatus({
          enabled: true,
          gistId: res.data.gistId || null,
          listenersCount: Array.isArray(res.data.listeners) ? res.data.listeners.length : 0,
        });
        if (res.data.gistId) setGithubGistId(res.data.gistId);
        setGithubMsg({
          ok: true,
          text: `Đã liên kết GitHub (@${res.data.username || 'user'}) & đồng bộ Gist: ${res.data.gistId}`,
        });
      } else {
        setGithubMsg({ ok: false, text: res.data?.error || 'Không thể liên kết GitHub.' });
      }
    } catch (err: any) {
      setGithubMsg({ ok: false, text: err.response?.data?.error || err.message || 'Lỗi kết nối GitHub.' });
    } finally {
      setIsLinkingGithub(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);

    // Only send non-empty keys
    const payload: Record<string, string> = {};
    for (const [k, v] of Object.entries(credentials)) {
      if (v.trim()) payload[k] = v.trim();
    }

    try {
      const res = await axios.post('/api/credentials', payload);
      if (res.data?.success) {
        setSuccessMessage('Đã lưu cấu hình API Key an toàn vào hệ thống VinceAuto.');
        setTimeout(() => onClose(), 1200);
      }
    } catch {
      //
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-[540px] max-h-[90vh] bg-vince-panel border border-vince-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-vince-border bg-vince-dark/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#242428] border border-[#34343a] text-[#e6e8ec]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Cấu Hình API Keys & Dịch Vụ</h3>
              <p className="text-[11px] text-zinc-400">Quản lý kết nối AI Models và các tích hợp bên ngoài</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#252528] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
          {successMessage && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
              <Check className="w-4 h-4" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Active Primary AI Agent Provider: Opencode2 & LLM APIs */}
          <div className="p-4 rounded-xl bg-[#1d1d21] border border-[#34343c] space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#2a2a30] pb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[#e6e8ec]">
                  Cấu Hình API AI Agent & LLM
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {credentials.OPENCODE2_API_KEY ? 'Đang hoạt động' : 'Chưa nhập API Key'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Tương thích chuẩn OpenAI API</span>
            </div>

            {/* 1. Base URL Input & Quick Presets */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-200">
                  Đường link Base URL (API Endpoint)
                </label>
                <span className="text-[10px] text-zinc-400">Endpoint API gọi mô hình</span>
              </div>
              <input
                type="text"
                value={credentials.OPENCODE2_BASE_URL}
                onChange={(e) =>
                  setCredentials({ ...credentials, OPENCODE2_BASE_URL: e.target.value })
                }
                placeholder="https://opencode.ai/zen/v1 hoặc https://api.openai.com/v1"
                className="w-full bg-[#151518] border border-[#2f2f35] rounded-lg px-3 py-2 text-xs font-mono text-sky-300 focus:outline-none focus:border-[#e6e8ec]"
              />
              <div className="flex items-center flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-zinc-400">Gợi ý nhanh:</span>
                <button
                  type="button"
                  onClick={() => setCredentials({ ...credentials, OPENCODE2_BASE_URL: 'https://opencode.ai/zen/v1' })}
                  className="px-2 py-0.5 rounded text-[10px] bg-[#26262b] hover:bg-[#323238] text-zinc-300 font-mono transition-colors"
                >
                  Opencode2 (Mặc định)
                </button>
                <button
                  type="button"
                  onClick={() => setCredentials({ ...credentials, OPENCODE2_BASE_URL: 'https://api.openai.com/v1' })}
                  className="px-2 py-0.5 rounded text-[10px] bg-[#26262b] hover:bg-[#323238] text-zinc-300 font-mono transition-colors"
                >
                  OpenAI
                </button>
                <button
                  type="button"
                  onClick={() => setCredentials({ ...credentials, OPENCODE2_BASE_URL: 'https://api.deepseek.com/v1' })}
                  className="px-2 py-0.5 rounded text-[10px] bg-[#26262b] hover:bg-[#323238] text-zinc-300 font-mono transition-colors"
                >
                  DeepSeek
                </button>
                <button
                  type="button"
                  onClick={() => setCredentials({ ...credentials, OPENCODE2_BASE_URL: 'http://localhost:11434/v1' })}
                  className="px-2 py-0.5 rounded text-[10px] bg-[#26262b] hover:bg-[#323238] text-zinc-300 font-mono transition-colors"
                >
                  Ollama Local
                </button>
              </div>
            </div>

            {/* 2. Model Selection Dropdown */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-200">
                  Mục Lựa Chọn Model
                </label>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {credentials.OPENCODE2_MODEL}
                </span>
              </div>
              <select
                value={isCustomModel ? 'custom' : credentials.OPENCODE2_MODEL}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomModel(true);
                  } else {
                    setIsCustomModel(false);
                    setCredentials({ ...credentials, OPENCODE2_MODEL: e.target.value });
                  }
                }}
                className="w-full bg-[#151518] border border-[#2f2f35] rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-[#e6e8ec]"
              >
                <optgroup label="Opencode2 (Miễn phí)">
                  <option value="crouton-alpha-free">crouton-alpha-free (Opencode2 - Miễn phí không giới hạn)</option>
                </optgroup>
                <optgroup label="OpenAI">
                  <option value="gpt-4o">gpt-4o (OpenAI Omni Flagship)</option>
                  <option value="gpt-4o-mini">gpt-4o-mini (OpenAI Fast & Cost-effective)</option>
                  <option value="o3-mini">o3-mini (OpenAI Reasoning)</option>
                  <option value="o1-preview">o1-preview (OpenAI Deep Reasoning)</option>
                </optgroup>
                <optgroup label="Google Gemini">
                  <option value="gemini-2.0-flash">gemini-2.0-flash (Google Gemini Flash 2.0)</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro (Google Gemini Pro)</option>
                  <option value="gemini-1.5-flash">gemini-1.5-flash (Google Gemini Flash)</option>
                </optgroup>
                <optgroup label="Anthropic Claude">
                  <option value="claude-3-5-sonnet">claude-3-5-sonnet (Anthropic Sonnet 3.5)</option>
                  <option value="claude-3-5-haiku">claude-3-5-haiku (Anthropic Haiku 3.5)</option>
                </optgroup>
                <optgroup label="DeepSeek">
                  <option value="deepseek-chat">deepseek-chat (DeepSeek V3)</option>
                  <option value="deepseek-reasoner">deepseek-reasoner (DeepSeek R1)</option>
                </optgroup>
                <optgroup label="Ollama / Local">
                  <option value="llama3:latest">llama3:latest (Local Ollama)</option>
                  <option value="llama3.3:70b">llama3.3:70b (Meta LLaMA 3.3)</option>
                  <option value="qwen2.5-coder:32b">qwen2.5-coder:32b (Qwen Coder)</option>
                </optgroup>
                <option value="custom">-- Tự nhập model khác (Custom Model) --</option>
              </select>

              {isCustomModel && (
                <div className="pt-1">
                  <input
                    type="text"
                    value={credentials.OPENCODE2_MODEL}
                    onChange={(e) =>
                      setCredentials({ ...credentials, OPENCODE2_MODEL: e.target.value })
                    }
                    placeholder="Nhập tên model (VD: qwen2.5-coder:32b, mistral-large, gpt-4o-2024-11-20)..."
                    className="w-full bg-[#151518] border border-amber-500/50 rounded-lg px-3 py-1.5 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                    autoFocus
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Nhập chính xác định danh model được hỗ trợ bởi Base URL bạn đã điền ở trên.
                  </p>
                </div>
              )}
            </div>

            {/* 3. API Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-200 block">
                API Key (oc_sk_... hoặc sk-...)
              </label>
              <input
                type="password"
                value={credentials.OPENCODE2_API_KEY}
                onChange={(e) =>
                  setCredentials({ ...credentials, OPENCODE2_API_KEY: e.target.value })
                }
                placeholder="oc_sk_... hoặc sk-..."
                className="w-full bg-[#151518] border border-[#2f2f35] rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-[#e6e8ec]"
              />
            </div>
          </div>

          {/* Gemini API Key */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span>Google Gemini API Key</span>
              {maskedInfo.GEMINI_API_KEY && (
                <span className="text-[10px] text-emerald-400 font-mono">Đã lưu: {maskedInfo.GEMINI_API_KEY}</span>
              )}
            </label>
            <input
              type="password"
              value={credentials.GEMINI_API_KEY}
              onChange={(e) => setCredentials({ ...credentials, GEMINI_API_KEY: e.target.value })}
              placeholder="AIzaSy..."
              className="w-full bg-[#202024] border border-[#303036] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#e6e8ec]"
            />
          </div>

          {/* OpenAI API Key */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span>OpenAI API Key (GPT-4o)</span>
              {maskedInfo.OPENAI_API_KEY && (
                <span className="text-[10px] text-emerald-400 font-mono">Đã lưu: {maskedInfo.OPENAI_API_KEY}</span>
              )}
            </label>
            <input
              type="password"
              value={credentials.OPENAI_API_KEY}
              onChange={(e) => setCredentials({ ...credentials, OPENAI_API_KEY: e.target.value })}
              placeholder="sk-..."
              className="w-full bg-[#202024] border border-[#303036] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#e6e8ec]"
            />
          </div>

          {/* Claude API Key */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span>Anthropic Claude API Key</span>
              {maskedInfo.ANTHROPIC_API_KEY && (
                <span className="text-[10px] text-emerald-400 font-mono">Đã lưu: {maskedInfo.ANTHROPIC_API_KEY}</span>
              )}
            </label>
            <input
              type="password"
              value={credentials.ANTHROPIC_API_KEY}
              onChange={(e) => setCredentials({ ...credentials, ANTHROPIC_API_KEY: e.target.value })}
              placeholder="sk-ant-..."
              className="w-full bg-[#202024] border border-[#303036] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#e6e8ec]"
            />
          </div>

          {/* Ollama Base URL */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Ollama Base URL (Local LLM)</label>
            <input
              type="text"
              value={credentials.OLLAMA_BASE_URL}
              onChange={(e) => setCredentials({ ...credentials, OLLAMA_BASE_URL: e.target.value })}
              placeholder="http://localhost:11434"
              className="w-full bg-[#202024] border border-[#303036] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#e6e8ec]"
            />
          </div>

          {/* Telegram Bot Token */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span>Telegram Bot Token</span>
              {maskedInfo.TELEGRAM_BOT_TOKEN && (
                <span className="text-[10px] text-emerald-400 font-mono">Đã lưu: {maskedInfo.TELEGRAM_BOT_TOKEN}</span>
              )}
            </label>
            <input
              type="password"
              value={credentials.TELEGRAM_BOT_TOKEN}
              onChange={(e) => setCredentials({ ...credentials, TELEGRAM_BOT_TOKEN: e.target.value })}
              placeholder="123456789:AAHdqT..."
              className="w-full bg-[#202024] border border-[#303036] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#e6e8ec]"
            />
          </div>

          {/* VinceZone API Key */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span>VinceZone API Key</span>
              {maskedInfo.VINCEZONE_API_KEY && (
                <span className="text-[10px] text-emerald-400 font-mono">Đã lưu: {maskedInfo.VINCEZONE_API_KEY}</span>
              )}
            </label>
            <input
              type="password"
              value={credentials.VINCEZONE_API_KEY}
              onChange={(e) => setCredentials({ ...credentials, VINCEZONE_API_KEY: e.target.value })}
              placeholder="vz_live_..."
              className="w-full bg-[#202024] border border-[#303036] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#e6e8ec]"
            />
          </div>

          {/* Tài khoản Google & YouTube mặc định */}
          <div className="p-4 rounded-xl bg-[#191c22] border border-[#2c3340] space-y-3">
            <div className="text-xs font-bold text-amber-300 border-b border-[#272e3a] pb-1.5">
              Tài khoản Google Workspace & YouTube mặc định
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-300">Email Google (Gmail / Drive / Sheets)</label>
                <input
                  type="email"
                  value={credentials.OWNER_EMAIL}
                  onChange={(e) => setCredentials({ ...credentials, OWNER_EMAIL: e.target.value })}
                  placeholder="your-gmail@gmail.com"
                  className="w-full bg-[#13151a] border border-[#2d323e] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-300 flex items-center justify-between">
                  <span>Link / ID Google Sheet mặc định</span>
                  <a href="https://docs.google.com/spreadsheets" target="_blank" rel="noreferrer" className="text-[10px] text-sky-300 hover:underline">
                    Mở Sheets ↗
                  </a>
                </label>
                <input
                  type="text"
                  value={credentials.GOOGLE_SHEET_ID}
                  onChange={(e) => {
                    const raw = e.target.value.trim();
                    const match = raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
                    setCredentials({ ...credentials, GOOGLE_SHEET_ID: match ? match[1] : raw });
                  }}
                  placeholder="Dán link Google Sheet hoặc ID..."
                  className="w-full bg-[#13151a] border border-[#2d323e] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-300 flex items-center justify-between">
                  <span>Link / ID Thư mục Google Drive</span>
                  <a href="https://drive.google.com" target="_blank" rel="noreferrer" className="text-[10px] text-sky-300 hover:underline">
                    Mở Drive ↗
                  </a>
                </label>
                <input
                  type="text"
                  value={credentials.GOOGLE_DRIVE_FOLDER_ID}
                  onChange={(e) => {
                    const raw = e.target.value.trim();
                    const match = raw.match(/\/folders\/([a-zA-Z0-9-_]+)/);
                    setCredentials({ ...credentials, GOOGLE_DRIVE_FOLDER_ID: match ? match[1] : raw });
                  }}
                  placeholder="Dán link thư mục Drive hoặc ID..."
                  className="w-full bg-[#13151a] border border-[#2d323e] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-300">YouTube Channel ID</label>
                <input
                  type="text"
                  value={credentials.YOUTUBE_CHANNEL_ID}
                  onChange={(e) => setCredentials({ ...credentials, YOUTUBE_CHANNEL_ID: e.target.value })}
                  placeholder="UCxxxxxxxx..."
                  className="w-full bg-[#13151a] border border-[#2d323e] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-300 flex items-center justify-between">
                <span>YouTube Data API / OAuth Token</span>
                {maskedInfo.YOUTUBE_API_KEY && (
                  <span className="text-[10px] text-emerald-400 font-mono">Đã lưu: {maskedInfo.YOUTUBE_API_KEY}</span>
                )}
              </label>
              <input
                type="password"
                value={credentials.YOUTUBE_API_KEY}
                onChange={(e) => setCredentials({ ...credentials, YOUTUBE_API_KEY: e.target.value })}
                placeholder="Dán YouTube API Key hoặc OAuth Token..."
                className="w-full bg-[#13151a] border border-[#2d323e] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Tài khoản Meta (Facebook, Instagram, Threads) & TikTok */}
          <div className="p-4 rounded-xl bg-[#191922] border border-[#2d2d3d] space-y-3">
            <div className="text-xs font-bold text-indigo-300 border-b border-[#292938] pb-1.5">
              Tài khoản Mạng xã hội (Meta / Facebook / Instagram / Threads / TikTok)
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-300 flex items-center justify-between">
                <span>Meta Graph Access Token (dùng cho Facebook, Instagram & Threads)</span>
                {maskedInfo.META_ACCESS_TOKEN && (
                  <span className="text-[10px] text-emerald-400 font-mono">Đã lưu: {maskedInfo.META_ACCESS_TOKEN}</span>
                )}
              </label>
              <input
                type="password"
                value={credentials.META_ACCESS_TOKEN}
                onChange={(e) => setCredentials({ ...credentials, META_ACCESS_TOKEN: e.target.value })}
                placeholder="EAAG..."
                className="w-full bg-[#13131b] border border-[#2e2e3d] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-300">Facebook Page ID</label>
                <input
                  type="text"
                  value={credentials.FACEBOOK_PAGE_ID}
                  onChange={(e) => setCredentials({ ...credentials, FACEBOOK_PAGE_ID: e.target.value })}
                  placeholder="Page ID..."
                  className="w-full bg-[#13131b] border border-[#2e2e3d] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-300">Instagram Business ID</label>
                <input
                  type="text"
                  value={credentials.INSTAGRAM_ACCOUNT_ID}
                  onChange={(e) => setCredentials({ ...credentials, INSTAGRAM_ACCOUNT_ID: e.target.value })}
                  placeholder="IG Account ID..."
                  className="w-full bg-[#13131b] border border-[#2e2e3d] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-300">Threads User ID</label>
                <input
                  type="text"
                  value={credentials.THREADS_USER_ID}
                  onChange={(e) => setCredentials({ ...credentials, THREADS_USER_ID: e.target.value })}
                  placeholder="Threads ID..."
                  className="w-full bg-[#13131b] border border-[#2e2e3d] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-300">TikTok Open ID</label>
                <input
                  type="text"
                  value={credentials.TIKTOK_OPEN_ID}
                  onChange={(e) => setCredentials({ ...credentials, TIKTOK_OPEN_ID: e.target.value })}
                  placeholder="TikTok Open ID..."
                  className="w-full bg-[#13131b] border border-[#2e2e3d] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-300 flex items-center justify-between">
                  <span>TikTok Access Token</span>
                  {maskedInfo.TIKTOK_ACCESS_TOKEN && (
                    <span className="text-[10px] text-emerald-400 font-mono">Đã lưu</span>
                  )}
                </label>
                <input
                  type="password"
                  value={credentials.TIKTOK_ACCESS_TOKEN}
                  onChange={(e) => setCredentials({ ...credentials, TIKTOK_ACCESS_TOKEN: e.target.value })}
                  placeholder="act.xxxx..."
                  className="w-full bg-[#13131b] border border-[#2e2e3d] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>
          </div>

          {/* GitHub Cloud Sync (24/7 Persistence) */}
          <div className="p-4 rounded-xl bg-[#161c24] border border-[#28384c] space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#253244] pb-2">
              <span className="text-xs font-bold text-sky-300">Liên kết GitHub (Lưu trữ dự án & Published 24/7)</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  backupStatus.enabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                {backupStatus.enabled ? '✓ Đã liên kết GitHub' : 'Chưa liên kết'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Dán GitHub Token (quyền <code className="text-sky-300 font-mono">gist</code>) để đồng bộ tự động mọi bản vẽ, trạng thái <strong>Published</strong> và API Keys lên GitHub Gist riêng tư — không bị mất khi Render reset.
              {backupStatus.listenersCount > 0 && (
                <span className="block text-emerald-400 mt-1">
                  • Đang chạy nền 24/7 cho {backupStatus.listenersCount} bot Telegram.
                </span>
              )}
            </p>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_... (GitHub Token với quyền gist)"
              className="w-full bg-[#12161c] border border-[#2a384a] rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-sky-400"
            />
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={githubGistId}
                onChange={(e) => setGithubGistId(e.target.value)}
                placeholder="Gist ID (tùy chọn - tự tạo nếu để trống)"
                className="flex-1 bg-[#12161c] border border-[#2a384a] rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-sky-400"
              />
              <button
                type="button"
                onClick={handleLinkGithub}
                disabled={isLinkingGithub}
                className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-zinc-900 font-bold text-xs flex items-center space-x-1.5 disabled:opacity-50 shrink-0 cursor-pointer"
              >
                {isLinkingGithub && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isLinkingGithub ? 'Đang đồng bộ...' : 'Liên kết & Đồng bộ'}</span>
              </button>
            </div>
            {githubMsg && (
              <div
                className={`p-2 rounded-lg text-[11px] ${
                  githubMsg.ok
                    ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/70 border border-rose-500/40 text-rose-300'
                }`}
              >
                {githubMsg.text}
              </div>
            )}
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-[#e6e8ec] hover:bg-white disabled:opacity-50 text-zinc-900 font-bold text-xs shadow-lg shadow-[#e6e8ec]/20 transition-all cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Lưu Cấu Hình Bảo Mật</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

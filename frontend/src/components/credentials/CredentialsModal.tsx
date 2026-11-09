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
  });

  const [maskedInfo, setMaskedInfo] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCustomModel, setIsCustomModel] = useState(false);

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
        }));
      }
    });
  }, []);

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

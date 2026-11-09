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

  useEffect(() => {
    axios.get('/api/credentials').then((res) => {
      if (res.data?.success && res.data?.credentials) {
        setMaskedInfo(res.data.credentials);
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

          {/* Active Primary AI Agent Provider: Opencode2 (crouton-alpha-free) */}
          <div className="p-3.5 rounded-xl bg-[#1d1d21] border border-[#34343c] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[#e6e8ec]">
                  AI Agent Mặc Định: Opencode2 (openai)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Kích hoạt
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">2026-11-08T00:12:36.869Z</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Base URL</label>
                <input
                  type="text"
                  value={credentials.OPENCODE2_BASE_URL}
                  onChange={(e) =>
                    setCredentials({ ...credentials, OPENCODE2_BASE_URL: e.target.value })
                  }
                  className="w-full bg-[#151518] border border-[#2f2f35] rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-sky-300 focus:outline-none focus:border-[#e6e8ec]"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Danh Sách Models</label>
                <input
                  type="text"
                  value={credentials.OPENCODE2_MODEL}
                  onChange={(e) =>
                    setCredentials({ ...credentials, OPENCODE2_MODEL: e.target.value })
                  }
                  className="w-full bg-[#151518] border border-[#2f2f35] rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-emerald-300 focus:outline-none focus:border-[#e6e8ec]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">
                Opencode2 API Key (oc_sk_...)
              </label>
              <input
                type="text"
                value={credentials.OPENCODE2_API_KEY}
                onChange={(e) =>
                  setCredentials({ ...credentials, OPENCODE2_API_KEY: e.target.value })
                }
                className="w-full bg-[#151518] border border-[#2f2f35] rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-zinc-200 focus:outline-none focus:border-[#e6e8ec]"
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

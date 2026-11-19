import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Lock, LogIn, ShieldCheck, Loader2, UserCheck } from 'lucide-react';

interface LoginGateProps {
  children: React.ReactNode;
}

const TOKEN_STORAGE_KEY = 'vinceauto:auth_token';

export const LoginGate: React.FC<LoginGateProps> = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [backendOutdated, setBackendOutdated] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const checkSession = async () => {
    setChecking(true);
    setBackendOutdated(false);
    setError(null);
    try {
      const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY) || '';
      if (savedToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      } else {
        delete axios.defaults.headers.common['Authorization'];
      }
      const res = await axios.get('/api/auth/status');
      setConfigured(Boolean(res.data?.configured));
      if (res.data?.authenticated) {
        setAuthenticated(true);
      } else {
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setAuthenticated(false);
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setBackendOutdated(true);
        setError('Backend trên Render chưa cập nhật bản mới (thiếu /api/auth/status). Vào Render Dashboard bấm "Manual Deploy -> Deploy latest commit" rồi bấm Thử lại.');
      }
      setAuthenticated(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    void checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Vui lòng nhập đầy đủ tên tài khoản và mật khẩu.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const endpoint = configured ? '/api/auth/login' : '/api/auth/setup';
      const res = await axios.post(endpoint, {
        username: username.trim(),
        password,
      });
      if (res.data?.success && res.data?.token) {
        const token = String(res.data.token);
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setConfigured(true);
        setAuthenticated(true);
      } else {
        setError(res.data?.error || 'Đăng nhập thất bại.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Sai tài khoản hoặc mật khẩu.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen w-screen bg-[#111114] text-zinc-200 flex items-center justify-center">
        <div className="flex items-center space-x-2.5 text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
          <span>Đang kiểm tra phiên đăng nhập riêng tư...</span>
        </div>
      </div>
    );
  }

  if (authenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-screen bg-[#111114] text-zinc-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#18181c] border border-[#2c2c34] rounded-2xl p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300">
            {configured ? <Lock className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">
              {configured ? 'Đăng nhập VinceAuto' : 'Tạo Tài Khoản Riêng Tư Duy Nhất'}
            </h1>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {configured
                ? 'Không gian làm việc cá nhân bảo mật'
                : 'Thiết lập 1 tài khoản duy nhất cho dự án của bạn'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-zinc-300 mb-1">Tài khoản</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên tài khoản..."
              autoFocus
              className="w-full bg-[#121215] border border-[#2f2f38] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-400"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-zinc-300 mb-1">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              className="w-full bg-[#121215] border border-[#2f2f38] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-400"
            />
          </div>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300">
            {error}
          </div>
        )}

        <button
          type={backendOutdated ? 'button' : 'submit'}
          onClick={backendOutdated ? () => void checkSession() : undefined}
          disabled={submitting}
          className="w-full py-2.5 px-4 rounded-xl bg-[#e6e8ec] hover:bg-white disabled:opacity-60 text-zinc-900 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          <span>{backendOutdated ? 'Thử lại kết nối Backend' : configured ? 'Đăng nhập' : 'Tạo tài khoản & Vào hệ thống'}</span>
        </button>

        <div className="flex items-center justify-center space-x-1.5 text-[10.5px] text-zinc-500 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Chế độ 1 tài khoản riêng tư • Dữ liệu mã hóa</span>
        </div>
      </form>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Calendar, Lock, LogOut } from 'lucide-react';
import { checkAuth, login, logout } from '../utils/cloudApi';
import ScheduleApp from '../ScheduleApp';

export default function LoginGate() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth()
      .then(setAuthed)
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(password);
      setAuthed(true);
      setPassword('');
    } catch (err) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setAuthed(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">
        正在验证登录状态…
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg w-full max-w-sm p-6">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <h1 className="text-lg font-extrabold text-slate-900">排课管理系统</h1>
          </div>
          <p className="text-xs text-slate-500 mb-5">Aaron / Oscar 专用 · 登录后数据云端同步</p>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">访问密码</label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                />
              </div>
            </div>
            {error && (
              <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg cursor-pointer"
            >
              {loading ? '登录中…' : '登录'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-3 right-3 z-40">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 bg-white/90 border border-slate-200 shadow-sm px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          退出登录
        </button>
      </div>
      <ScheduleApp cloudSyncEnabled />
    </>
  );
}

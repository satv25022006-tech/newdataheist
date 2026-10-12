import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, KeyRound, Lock, User, X, CheckCircle, AlertCircle, LogOut } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, isAdmin, login, logout } = useAuth();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await login(adminId, password);

    if (result.success) {
      setSuccessMessage(result.message);
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
        setAdminId('');
        setPassword('');
      }, 600);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleLogout = () => {
    logout();
    setSuccessMessage('Logged out to Field Investigator standing.');
    setTimeout(() => {
      onClose();
      setSuccessMessage(null);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-sky-800/80 bg-[#0c1322] text-slate-100 shadow-2xl p-6 relative font-mono text-xs">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-950 border border-sky-600/50 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.3)]">
              <KeyRound className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              Bureau Clearance Authentication
            </h2>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Enter authorized Admin ID and Password to authenticate Bureau credentials.
          </p>
        </div>

        {/* Current Active User Status */}
        <div className="mb-5 p-3 rounded-xl border border-slate-800 bg-[#070e1c] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Active Standing</span>
            <div className="font-bold text-slate-200">
              {user.displayName} <span className="text-cyan-400 font-normal">({user.badgeNumber})</span>
            </div>
            <div className="text-[10px] text-slate-400 uppercase">
              Role: <strong className={isAdmin ? 'text-amber-400' : 'text-slate-300'}>{user.role}</strong>
            </div>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg border border-rose-800/70 bg-rose-950/40 text-rose-300 hover:bg-rose-900 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>Log out</span>
            </button>
          )}
        </div>

        {/* Direct Login Form: Admin ID and Password */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Admin ID / Bureau ID</span>
            </label>
            <input
              type="text"
              required
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              placeholder="e.g. admin or BD-0001"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Security Password</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 text-xs font-mono"
            />
          </div>

          {/* Credentials Notice Box */}
          <div className="p-2.5 rounded-lg border border-slate-800 bg-[#070e1c] text-[11px] text-slate-400 font-sans flex items-center justify-between">
            <span>Admin ID: <strong className="text-cyan-400 font-mono">admin</strong></span>
            <span>Password: <strong className="text-cyan-400 font-mono">admin123</strong></span>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-lg border border-rose-800 bg-rose-950/40 text-rose-300 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-2.5 rounded-lg border border-emerald-800 bg-emerald-950/40 text-emerald-300 text-[11px] flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl cyber-glow-btn text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>AUTHENTICATE & SIGN IN</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

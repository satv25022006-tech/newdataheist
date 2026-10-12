import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bureauStore } from '../../lib/store';
import { AuthModal } from '../auth/AuthModal';
import { 
  ShieldCheck, 
  Settings, 
  Globe, 
  Lock, 
  FolderLock, 
  Layers, 
  UserCheck 
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [branding, setBranding] = useState(() => bureauStore.getBranding());

  React.useEffect(() => {
    const handleUpdate = () => {
      setBranding(bureauStore.getBranding());
    };
    window.addEventListener('bureau-branding-updated', handleUpdate);
    return () => window.removeEventListener('bureau-branding-updated', handleUpdate);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#070d1d]/90 backdrop-blur-md border-b border-sky-950/80 shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Wordmark & Dynamic Logo: CODE HEIST */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-sm sm:text-base font-extrabold tracking-wider text-sky-400 hover:text-cyan-300 transition-colors uppercase whitespace-nowrap shrink-0 group"
          >
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt="Bureau Logo"
                className="w-8 h-8 rounded-lg object-contain bg-sky-950 border border-sky-500/50 shadow-[0_0_12px_rgba(56,189,248,0.3)] group-hover:border-cyan-400"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-500/50 flex items-center justify-center text-sky-400 group-hover:border-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.3)]">
                <FolderLock className="w-4 h-4" />
              </div>
            )}
            <span className="font-mono text-xs sm:text-sm text-slate-100 font-black tracking-wider group-hover:text-cyan-300">
              {branding.bureauName || 'CODE HEIST'}
            </span>
          </Link>

          {/* Nav Controls matching screenshot */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Cases Link */}
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                isActive('/') 
                  ? 'text-cyan-300 bg-sky-950/80 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Cases</span>
              <span className="text-[10px] bg-sky-900/80 text-cyan-300 px-1.5 py-0.2 rounded font-mono">2</span>
            </Link>


            {/* English (EN) Language Toggle */}
            <div className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950/60 text-slate-400 text-xs font-mono">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>English (EN)</span>
            </div>

            {/* Admin Button */}
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
                isActive('/admin')
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                  : 'bg-sky-900/70 hover:bg-sky-800 text-cyan-300 border border-sky-600/50 hover:border-cyan-400'
              }`}
            >
              {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5" />}
              <span>Admin</span>
              {isAdmin && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

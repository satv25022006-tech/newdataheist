import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-sky-950/80 bg-[#070d1d] mt-16 py-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span className="font-bold text-slate-200">CODE HEIST</span>
          <span>·</span>
          <span className="text-slate-400 font-mono">Division of Cyber Inquiry</span>
        </div>

        <div className="flex items-center gap-6 text-slate-400">
          <Link to="/rules-guide" className="hover:text-cyan-300 transition-colors">
            Bureau Protocols
          </Link>
          <Link to="/submissions" className="hover:text-cyan-300 transition-colors">
            Symposium Records
          </Link>
          <Link to="/admin" className="hover:text-cyan-300 transition-colors">
            Admin Bureau
          </Link>
        </div>

        <div className="text-slate-500 font-mono text-[11px]">
          OFFICIAL TOURNAMENT CASE ENGINE // 2026
        </div>
      </div>
    </footer>
  );
};

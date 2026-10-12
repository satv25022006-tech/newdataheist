import React from 'react';

interface DossierCardProps {
  children: React.ReactNode;
  className?: string;
  isPaper?: boolean;
  active?: boolean;
}

export const DossierCard: React.FC<DossierCardProps> = ({
  children,
  className = '',
  active = false,
}) => {
  return (
    <div
      className={`rounded-xl transition-all ${
        active ? 'cyber-card-active' : 'cyber-card'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CaseStamp: React.FC<{
  label: string;
  variant?: 'neutral' | 'active' | 'success' | 'amber';
}> = ({ label, variant = 'neutral' }) => {
  const variantStyles = {
    neutral: 'border-slate-700 text-slate-400 bg-slate-900/80',
    active: 'border-cyan-500/50 text-cyan-300 bg-cyan-950/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]',
    success: 'border-emerald-500/50 text-emerald-300 bg-emerald-950/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]',
    amber: 'border-amber-500/50 text-amber-300 bg-amber-950/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]',
  };

  return (
    <span
      className={`inline-block font-mono text-xs uppercase tracking-wider px-2 py-0.5 rounded-xs border ${variantStyles[variant]}`}
    >
      {label}
    </span>
  );
};

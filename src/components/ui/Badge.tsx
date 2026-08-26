import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'emerald' | 'blue' | 'amber' | 'rose' | 'purple' | 'cyan' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  icon,
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md gap-1',
    md: 'text-xs px-2.5 py-1 rounded-md gap-1.5',
  };

  const variantStyles = {
    neutral: 'bg-slate-800 text-slate-300 border border-slate-700/60 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700/60 light:bg-slate-100 light:text-slate-700 light:border-slate-200',
    emerald: 'bg-emerald-500/10 text-emerald-400 dark:text-emerald-400 light:text-emerald-700 border border-emerald-500/25',
    blue: 'bg-blue-500/10 text-blue-400 dark:text-blue-400 light:text-blue-700 border border-blue-500/25',
    amber: 'bg-amber-500/10 text-amber-400 dark:text-amber-400 light:text-amber-700 border border-amber-500/25',
    rose: 'bg-rose-500/10 text-rose-400 dark:text-rose-400 light:text-rose-700 border border-rose-500/25',
    purple: 'bg-purple-500/10 text-purple-400 dark:text-purple-400 light:text-purple-700 border border-purple-500/25',
    cyan: 'bg-cyan-500/10 text-cyan-400 dark:text-cyan-400 light:text-cyan-700 border border-cyan-500/25',
    outline: 'bg-transparent text-slate-400 dark:text-slate-400 light:text-slate-600 border border-slate-700 dark:border-slate-700 light:border-slate-300',
  };

  return (
    <span
      className={`inline-flex items-center font-medium select-none whitespace-nowrap ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

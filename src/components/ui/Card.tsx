import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'accent' | 'subtle';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
  };

  const variantStyles = {
    default: 'bg-slate-900/90 dark:bg-slate-900/90 light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 text-slate-100 dark:text-slate-100 light:text-slate-900 shadow-xs',
    elevated: 'bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-sm text-slate-100 dark:text-slate-100 light:text-slate-900',
    interactive: 'bg-slate-900/90 dark:bg-slate-900/90 light:bg-white hover:bg-slate-800/70 dark:hover:bg-slate-800/70 light:hover:bg-slate-50 border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 hover:border-slate-700/80 dark:hover:border-slate-700/80 light:hover:border-slate-300 text-slate-100 dark:text-slate-100 light:text-slate-900 cursor-pointer transition-all duration-150 active:scale-[0.99] shadow-xs',
    accent: 'bg-gradient-to-b from-slate-900 to-slate-950 dark:from-slate-900 dark:to-slate-950 light:from-white light:to-slate-50 border border-emerald-500/30 text-slate-100 dark:text-slate-100 light:text-slate-900 shadow-xs',
    subtle: 'bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border border-slate-800/60 dark:border-slate-800/60 light:border-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-700',
  };

  return (
    <div
      className={`rounded-xl ${paddingStyles[padding]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

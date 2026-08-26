import React from 'react';

export const Kbd: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <kbd
      className={`inline-flex items-center justify-center font-mono text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-800 dark:bg-slate-800 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-700 border border-slate-700 dark:border-slate-700 light:border-slate-300 shadow-2xs ${className}`}
    >
      {children}
    </kbd>
  );
};

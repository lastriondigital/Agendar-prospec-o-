import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'execution';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 whitespace-nowrap cursor-pointer select-none';

  const sizeStyles = {
    xs: 'text-xs px-2.5 py-1 rounded-md gap-1.5 min-h-[28px]',
    sm: 'text-xs sm:text-sm px-3 py-1.5 rounded-lg gap-2 min-h-[36px]',
    md: 'text-sm px-4 py-2 rounded-lg gap-2 min-h-[42px]',
    lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5 min-h-[48px] font-semibold',
  };

  const variantStyles = {
    primary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs shadow-emerald-950/30 border border-emerald-500/40',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/80 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-100 light:bg-slate-100 light:text-slate-800 light:hover:bg-slate-200 light:border-slate-300',
    outline: 'bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800/80 hover:text-white dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/70 light:border-slate-300 light:text-slate-700 light:hover:bg-slate-100',
    ghost: 'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 dark:hover:bg-slate-800/60 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-xs shadow-rose-950/30 border border-rose-500/30',
    success: 'bg-teal-600 hover:bg-teal-500 text-white shadow-xs border border-teal-500/30',
    execution: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm shadow-emerald-900/40 font-semibold tracking-wide border border-emerald-400/40',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};

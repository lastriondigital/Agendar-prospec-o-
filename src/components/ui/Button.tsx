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
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-1 whitespace-nowrap cursor-pointer select-none';

  const sizeStyles = {
    xs: 'text-xs px-2.5 py-1 rounded-lg gap-1.5 min-h-[30px]',
    sm: 'text-xs sm:text-sm px-3 py-1.5 rounded-xl gap-2 min-h-[36px]',
    md: 'text-sm px-4 py-2 rounded-xl gap-2 min-h-[40px]',
    lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5 min-h-[46px] font-semibold',
  };

  const variantStyles = {
    // Primary: Modern reliable blue (#2563EB)
    primary:
      'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs',
    // Secondary: Clean white / dark slate with crisp border
    secondary:
      'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-800 shadow-xs',
    // Outline: Transparent with subtle border
    outline:
      'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-700 border border-slate-200 dark:hover:bg-slate-800/60 dark:text-slate-300 dark:border-slate-800',
    // Ghost: No border
    ghost:
      'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60',
    // Danger: Soft red
    danger:
      'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs',
    // Success: Soft green
    success:
      'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs',
    // Execution: Clean focused action
    execution:
      'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold shadow-xs',
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

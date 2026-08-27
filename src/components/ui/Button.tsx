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
    'inline-flex items-center justify-center font-medium transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-1 whitespace-nowrap cursor-pointer select-none';

  const sizeStyles = {
    xs: 'text-xs px-2.5 py-1 rounded-md gap-1.5 min-h-[30px]',
    sm: 'text-xs sm:text-sm px-3 py-1.5 rounded-lg gap-2 min-h-[36px]',
    md: 'text-sm px-4 py-2 rounded-lg gap-2 min-h-[42px]',
    lg: 'text-base px-5 py-2.5 rounded-lg gap-2.5 min-h-[46px] font-semibold',
  };

  const variantStyles = {
    // Primary: Soft professional blue (#3F6FB5)
    primary:
      'bg-[#3F6FB5] hover:bg-[#345d99] active:bg-[#2b4e82] text-white shadow-xs',
    // Secondary: Light neutral with clean subtle border
    secondary:
      'bg-white hover:bg-neutral-100 active:bg-neutral-200 text-[#202124] border border-[#E6E8EB] dark:bg-[#1E2228] dark:hover:bg-[#252A32] dark:text-[#E8EAED] dark:border-[#2D3139] shadow-xs',
    // Outline: Transparent with clean border
    outline:
      'bg-transparent hover:bg-neutral-100 active:bg-neutral-200 text-[#202124] border border-[#E6E8EB] dark:hover:bg-[#20242A] dark:text-[#E8EAED] dark:border-[#2D3139]',
    // Ghost: No border or background
    ghost:
      'bg-transparent text-[#5F6368] hover:text-[#202124] hover:bg-neutral-100 active:bg-neutral-200 dark:text-[#9AA0A6] dark:hover:text-[#E8EAED] dark:hover:bg-[#20242A]',
    // Danger: Soft red
    danger:
      'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-xs',
    // Success: Soft green
    success:
      'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs',
    // Execution: Solid clear CTA button (no heavy gradients or neon)
    execution:
      'bg-[#3F6FB5] hover:bg-[#345d99] active:bg-[#2b4e82] text-white font-semibold shadow-xs',
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

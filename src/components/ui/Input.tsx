import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs sm:text-sm font-medium text-[#202124] dark:text-[#E8EAED] select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-[#5F6368] dark:text-[#9AA0A6] pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full h-11 bg-white dark:bg-[#181B20] text-[#202124] dark:text-[#E8EAED] placeholder-[#80868B] dark:placeholder-[#5F6368] border rounded-lg px-3.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#3F6FB5]/20 focus:border-[#3F6FB5] disabled:opacity-50 disabled:cursor-not-allowed ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-10' : ''} ${
              error
                ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                : 'border-[#DADDE1] dark:border-[#2D3139] hover:border-neutral-400 dark:hover:border-neutral-600'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-[#5F6368] dark:text-[#9AA0A6] flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <span className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</span>}
        {!error && helperText && (
          <span className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

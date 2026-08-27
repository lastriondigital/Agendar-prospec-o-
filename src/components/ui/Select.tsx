import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs sm:text-sm font-medium text-[#202124] dark:text-[#E8EAED] select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            className={`w-full h-11 appearance-none bg-white dark:bg-[#181B20] text-[#202124] dark:text-[#E8EAED] border rounded-lg pl-3.5 pr-10 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#3F6FB5]/20 focus:border-[#3F6FB5] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
              error
                ? 'border-red-500'
                : 'border-[#DADDE1] dark:border-[#2D3139] hover:border-neutral-400 dark:hover:border-neutral-600'
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="bg-white text-[#202124] dark:bg-[#181B20] dark:text-[#E8EAED] py-1"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 w-4 h-4 text-[#5F6368] dark:text-[#9AA0A6] pointer-events-none" />
        </div>
        {error && <span className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</span>}
        {!error && helperText && (
          <span className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">{helperText}</span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

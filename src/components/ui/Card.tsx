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
    default:
      'bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] text-[#202124] dark:text-[#E8EAED] shadow-xs',
    elevated:
      'bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] text-[#202124] dark:text-[#E8EAED] shadow-xs',
    interactive:
      'bg-white dark:bg-[#181B20] hover:bg-neutral-50 dark:hover:bg-[#20242A] border border-[#E6E8EB] dark:border-[#2D3139] hover:border-neutral-300 dark:hover:border-neutral-700 text-[#202124] dark:text-[#E8EAED] cursor-pointer transition-colors duration-150 shadow-xs',
    accent:
      'bg-white dark:bg-[#181B20] border border-[#3F6FB5]/30 dark:border-[#3F6FB5]/40 text-[#202124] dark:text-[#E8EAED] shadow-xs',
    subtle:
      'bg-[#F7F8FA] dark:bg-[#15171B] border border-[#E6E8EB] dark:border-[#2D3139] text-[#5F6368] dark:text-[#9AA0A6]',
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

import React from 'react';

export interface LeadionLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textClassName?: string;
  className?: string;
  variant?: 'primary' | 'white' | 'dark';
}

export const LeadionLogo: React.FC<LeadionLogoProps> = ({
  size = 'md',
  showText = true,
  textClassName = '',
  className = '',
  variant = 'primary',
}) => {
  const sizeMap = {
    xs: { icon: 'w-5 h-5', text: 'text-xs', mark: 20 },
    sm: { icon: 'w-7 h-7', text: 'text-sm font-bold', mark: 28 },
    md: { icon: 'w-8 h-8', text: 'text-base font-bold', mark: 32 },
    lg: { icon: 'w-10 h-10', text: 'text-xl font-extrabold', mark: 40 },
    xl: { icon: 'w-12 h-12', text: 'text-2xl font-extrabold', mark: 48 },
  };

  const bgStyles = {
    primary: 'bg-[#2563EB] text-white shadow-xs',
    white: 'bg-white text-[#2563EB] shadow-xs',
    dark: 'bg-[#0F172A] text-white shadow-xs',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Leadion Geometric Icon Symbol */}
      <div
        className={`${sizeMap[size].icon} rounded-xl ${bgStyles[variant]} flex items-center justify-center shrink-0 transition-transform`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          {/* Target/Lead Connection Base & Upward Arrow Conversion Path */}
          <path
            d="M4 12C4 7.58172 7.58172 4 12 4C14.15 4 16.105 4.845 17.55 6.22"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M20 12C20 16.4183 16.4183 20 12 20C9.85 20 7.895 19.155 6.45 17.78"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle
            cx="12"
            cy="12"
            r="3"
            fill="currentColor"
          />
          <path
            d="M14 6H19V11"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 12L18.5 5.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Name Typography */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <span
            className={`tracking-tight font-extrabold text-slate-900 dark:text-slate-100 font-sans ${sizeMap[size].text} ${textClassName}`}
          >
            LEADION
          </span>
        </div>
      )}
    </div>
  );
};

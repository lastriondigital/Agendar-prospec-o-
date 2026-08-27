import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

interface ContextualTipProps {
  id: string;
  message: string;
  title?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const ContextualTip: React.FC<ContextualTipProps> = ({
  id,
  message,
  title,
  actionLabel,
  onAction,
  icon,
  className = '',
}) => {
  const storageKey = `prospect_os_tip_${id}`;
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(storageKey) === 'dismissed';
    } catch {
      return false;
    }
  });

  if (isDismissed) return null;

  const handleDismiss = () => {
    try {
      localStorage.setItem(storageKey, 'dismissed');
    } catch {
      // ignore
    }
    setIsDismissed(true);
  };

  return (
    <div
      className={`flex items-start justify-between gap-3 p-3.5 rounded-xl bg-[#F7F8FA] dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] text-xs text-[#5F6368] dark:text-[#9AA0A6] shadow-xs transition-all animate-in fade-in duration-200 ${className}`}
    >
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <div className="p-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-[#3F6FB5] dark:text-blue-300 shrink-0 mt-0.5">
          {icon || <Sparkles className="w-3.5 h-3.5" />}
        </div>
        <div className="min-w-0 flex-1">
          {title && (
            <span className="font-semibold text-[#202124] dark:text-[#E8EAED] block mb-0.5">
              {title}
            </span>
          )}
          <p className="leading-relaxed">{message}</p>
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="mt-1.5 font-semibold text-[#3F6FB5] dark:text-blue-300 hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>

      <button
        onClick={handleDismiss}
        className="p-1 rounded-md text-[#80868B] hover:text-[#202124] dark:hover:text-[#E8EAED] hover:bg-neutral-200/50 dark:hover:bg-[#20242A] transition-colors shrink-0 cursor-pointer"
        title="Dispensar dica"
        aria-label="Dispensar dica"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

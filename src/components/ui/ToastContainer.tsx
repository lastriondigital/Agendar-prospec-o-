import React from 'react';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 sm:bottom-6 right-0 sm:right-6 left-0 sm:left-auto z-50 flex flex-col gap-2 max-w-md mx-auto sm:mx-0 px-4 sm:px-0 pointer-events-none"
    >
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
        };

        const borderStyles = {
          success: 'border-emerald-200 dark:border-emerald-800/40 bg-white dark:bg-[#181B20]',
          error: 'border-red-200 dark:border-red-800/40 bg-white dark:bg-[#181B20]',
          info: 'border-blue-200 dark:border-blue-800/40 bg-white dark:bg-[#181B20]',
          warning: 'border-amber-200 dark:border-amber-800/40 bg-white dark:bg-[#181B20]',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-md transition-all duration-200 animate-in slide-in-from-bottom-2 ${borderStyles[toast.type]}`}
            role="status"
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0 pr-1 text-left">
              <p className="text-xs sm:text-sm font-semibold text-[#202124] dark:text-[#E8EAED] leading-snug">
                {toast.title}
              </p>
              {toast.message && (
                <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] mt-0.5 leading-relaxed break-words">
                  {toast.message}
                </p>
              )}
              {toast.action && (
                <button
                  onClick={() => {
                    toast.action?.onClick();
                    removeToast(toast.id);
                  }}
                  className="mt-1.5 text-xs font-semibold text-[#3F6FB5] hover:underline cursor-pointer"
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 -mr-1 -mt-1 text-[#80868B] hover:text-[#202124] dark:text-[#5F6368] dark:hover:text-[#E8EAED] rounded transition-colors cursor-pointer"
              aria-label="Dispensar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

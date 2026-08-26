import React from 'react';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 sm:bottom-6 right-0 sm:right-6 left-0 sm:left-auto z-50 flex flex-col gap-2.5 max-w-md mx-auto sm:mx-0 px-4 sm:px-0 pointer-events-none"
    >
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
        };

        const borderStyles = {
          success: 'border-emerald-500/30 bg-slate-900/95 dark:bg-slate-900/95 light:bg-white/95 text-slate-100 dark:text-slate-100 light:text-slate-900',
          error: 'border-rose-500/30 bg-slate-900/95 dark:bg-slate-900/95 light:bg-white/95 text-slate-100 dark:text-slate-100 light:text-slate-900',
          info: 'border-sky-500/30 bg-slate-900/95 dark:bg-slate-900/95 light:bg-white/95 text-slate-100 dark:text-slate-100 light:text-slate-900',
          warning: 'border-amber-500/30 bg-slate-900/95 dark:bg-slate-900/95 light:bg-white/95 text-slate-100 dark:text-slate-100 light:text-slate-900',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-200 animate-in slide-in-from-bottom-3 ${borderStyles[toast.type]}`}
            role="status"
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0 pr-1 text-left">
              <p className="text-xs sm:text-sm font-semibold text-slate-100 dark:text-slate-100 light:text-slate-900 leading-snug">
                {toast.title}
              </p>
              {toast.message && (
                <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-0.5 leading-relaxed break-words">
                  {toast.message}
                </p>
              )}
              {toast.action && (
                <button
                  onClick={() => {
                    toast.action?.onClick();
                    removeToast(toast.id);
                  }}
                  className="mt-2 text-xs font-semibold text-emerald-400 dark:text-emerald-400 light:text-emerald-700 hover:text-emerald-300 dark:hover:text-emerald-300 light:hover:text-emerald-600 underline cursor-pointer"
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 -mr-1 -mt-1 text-slate-500 hover:text-slate-300 dark:hover:text-slate-300 light:hover:text-slate-700 rounded transition-colors cursor-pointer"
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

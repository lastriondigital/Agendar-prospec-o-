import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-800 dark:border-slate-800 light:border-slate-300 bg-slate-900/40 dark:bg-slate-900/40 light:bg-slate-50 max-w-lg mx-auto my-6">
      <div className="p-3.5 rounded-2xl bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-200 text-slate-400 dark:text-slate-400 light:text-slate-600 border border-slate-700/50 dark:border-slate-700/50 light:border-slate-300 mb-4 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-100 dark:text-slate-100 light:text-slate-900">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1.5 max-w-sm leading-relaxed">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" size="sm" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
          {actionLabel && onAction && (
            <Button variant="primary" size="sm" onClick={onAction} leftIcon={actionIcon}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

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
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-[#DADDE1] dark:border-[#2D3139] bg-white dark:bg-[#181B20] max-w-lg mx-auto my-6">
      <div className="p-3.5 rounded-full bg-[#F1F3F5] dark:bg-[#20242A] text-[#5F6368] dark:text-[#9AA0A6] mb-4 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-[#202124] dark:text-[#E8EAED]">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#5F6368] dark:text-[#9AA0A6] mt-1.5 max-w-sm leading-relaxed">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6">
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="secondary" size="sm" onClick={onSecondaryAction}>
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

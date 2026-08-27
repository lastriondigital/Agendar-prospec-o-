import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
        className="relative w-full max-h-[85vh] bg-white dark:bg-[#181B20] border-t border-[#E6E8EB] dark:border-[#2D3139] rounded-t-2xl shadow-xl z-10 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto mt-2.5 mb-1 shrink-0" />
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#ECEEF1] dark:border-[#2D3139] shrink-0">
          <h3 className="text-sm sm:text-base font-semibold text-[#202124] dark:text-[#E8EAED]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5F6368] hover:text-[#202124] dark:text-[#9AA0A6] dark:hover:text-[#E8EAED] rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto space-y-3">{children}</div>
      </div>
    </div>
  );
};

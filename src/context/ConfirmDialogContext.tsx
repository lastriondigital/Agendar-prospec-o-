import React, { createContext, useCallback, useContext, useState } from 'react';
import { ConfirmDialogOptions } from '../types';

interface ConfirmDialogContextType {
  confirm: (options: ConfirmDialogOptions) => void;
  isOpen: boolean;
  options: ConfirmDialogOptions | null;
  close: () => void;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export const ConfirmDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    options: ConfirmDialogOptions | null;
  }>({
    isOpen: false,
    options: null,
  });

  const confirm = useCallback((options: ConfirmDialogOptions) => {
    setDialogState({
      isOpen: true,
      options,
    });
  }, []);

  const close = useCallback(() => {
    setDialogState({
      isOpen: false,
      options: null,
    });
  }, []);

  return (
    <ConfirmDialogContext.Provider
      value={{
        confirm,
        isOpen: dialogState.isOpen,
        options: dialogState.options,
        close,
      }}
    >
      {children}
    </ConfirmDialogContext.Provider>
  );
};

export function useConfirm(): (options: ConfirmDialogOptions) => void {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  }
  return context.confirm;
}

export function useConfirmDialogState() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirmDialogState must be used within a ConfirmDialogProvider');
  }
  return context;
}

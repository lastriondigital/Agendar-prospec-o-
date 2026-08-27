import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useConfirmDialogState } from '../../context/ConfirmDialogContext';
import { Button } from './Button';
import { Modal } from './Modal';

export const ConfirmDialog: React.FC = () => {
  const { isOpen, options, close } = useConfirmDialogState();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !options) return null;

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await options.onConfirm();
      close();
    } catch (err) {
      console.error('Erro na ação de confirmação:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={options.title}
      maxWidth="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={close} disabled={isSubmitting}>
            {options.cancelText || 'Cancelar'}
          </Button>
          <Button
            variant={options.isDestructive ? 'danger' : 'primary'}
            size="sm"
            onClick={handleConfirm}
            isLoading={isSubmitting}
          >
            {options.confirmText || 'Confirmar'}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3.5">
        {options.isDestructive && (
          <div className="p-2.5 rounded-lg bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/40 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        )}
        <div className="text-sm text-[#5F6368] dark:text-[#9AA0A6] leading-relaxed pt-0.5">
          {options.message}
        </div>
      </div>
    </Modal>
  );
};

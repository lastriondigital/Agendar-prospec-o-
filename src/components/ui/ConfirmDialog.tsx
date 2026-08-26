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
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        )}
        <div className="text-sm text-slate-300 dark:text-slate-300 light:text-slate-700 leading-relaxed pt-0.5">
          {options.message}
        </div>
      </div>
    </Modal>
  );
};

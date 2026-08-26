import React, { useState } from 'react';
import { Calendar, MessageSquare, Phone, Mail, Zap } from 'lucide-react';
import { ContactChannel } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';

interface ScheduleActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  companyName: string;
  currentTitle?: string;
  currentDate?: string;
  currentChannel?: ContactChannel;
  onSchedule: (title: string, date: string, channel: ContactChannel) => Promise<void>;
}

export const ScheduleActionModal: React.FC<ScheduleActionModalProps> = ({
  isOpen,
  onClose,
  leadId,
  companyName,
  currentTitle = 'Follow-up de qualificação',
  currentDate = new Date().toISOString().slice(0, 10),
  currentChannel = 'whatsapp',
  onSchedule,
}) => {
  const [title, setTitle] = useState(currentTitle);
  const [date, setDate] = useState(currentDate);
  const [channel, setChannel] = useState<ContactChannel>(currentChannel);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      await onSchedule(title.trim(), date, channel);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickActionTemplates = [
    'Primeiro contato via WhatsApp',
    'Follow-up: Perguntar se avaliou a mensagem anterior',
    'Ligar para decisor para alinhamento',
    'Apresentar proposta comercial e tirar dúvidas',
    'Follow-up pós envio de proposta',
    'Agendar reunião de demonstração',
    'Verificar contrato assinado',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Agendar Próxima Ação: ${companyName}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="O que deve ser feito? (Ação objetiva) *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Enviar áudio no WhatsApp tirando dúvidas da proposta"
          required
          autoFocus
          leftIcon={<Zap className="w-4 h-4 text-amber-400" />}
        />

        {/* Sugestões rápidas de ações */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-slate-400">Sugestões rápidas:</span>
          <div className="flex flex-wrap gap-1.5">
            {quickActionTemplates.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setTitle(tpl)}
                className="text-[11px] px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
              >
                {tpl}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Input
            label="Data de Execução *"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
          />

          <Select
            label="Canal de Execução"
            value={channel}
            onChange={(e) => setChannel(e.target.value as ContactChannel)}
            options={[
              { value: 'whatsapp', label: '💬 WhatsApp' },
              { value: 'phone', label: '📞 Ligação Telefônica' },
              { value: 'email', label: '✉️ E-mail' },
              { value: 'linkedin', label: '💼 LinkedIn' },
              { value: 'instagram', label: '📷 Instagram Direct' },
            ]}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Salvar e Adicionar à Fila
          </Button>
        </div>
      </form>
    </Modal>
  );
};

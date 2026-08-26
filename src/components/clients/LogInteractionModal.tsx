import React, { useState } from 'react';
import { MessageSquare, Phone, Send, Calendar, FileText, CheckCircle2, Star, Clock } from 'lucide-react';
import { ContactChannel, HistoryEventType, LeadStage } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { ALL_LEAD_STAGES, STAGES_CONFIG } from '../../utils/constants';

interface LogInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  contactId?: string;
  leadId?: string;
  currentStage?: LeadStage;
  onSave: (params: {
    type: HistoryEventType;
    title: string;
    description: string;
    channel?: ContactChannel;
    newStage?: LeadStage;
    nextActionTitle?: string;
    nextActionDate?: string;
  }) => Promise<void>;
}

export const LogInteractionModal: React.FC<LogInteractionModalProps> = ({
  isOpen,
  onClose,
  companyId,
  companyName,
  contactId,
  leadId,
  currentStage = 'NOVO',
  onSave,
}) => {
  const [eventType, setEventType] = useState<HistoryEventType>('message_sent');
  const [channel, setChannel] = useState<ContactChannel>('whatsapp');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newStage, setNewStage] = useState<LeadStage>(currentStage);
  const [scheduleNext, setScheduleNext] = useState(true);
  const [nextActionTitle, setNextActionTitle] = useState('Follow-up #1');
  const [nextActionDate, setNextActionDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eventPresets = [
    { type: 'message_sent' as const, label: '💬 Mensagem Enviada', defaultTitle: 'Mensagem enviada via WhatsApp' },
    { type: 'contact_made' as const, label: '📞 Ligação Realizada', defaultTitle: 'Contato telefônico realizado com decisor' },
    { type: 'response_received' as const, label: '📥 Resposta Recebida', defaultTitle: 'Prospect respondeu ao contato' },
    { type: 'meeting_held' as const, label: '🤝 Reunião / Call Realizada', defaultTitle: 'Reunião de apresentação realizada' },
    { type: 'proposal_sent' as const, label: '📄 Proposta Enviada', defaultTitle: 'Proposta comercial apresentada' },
    { type: 'note_added' as const, label: '📝 Anotação / Observação', defaultTitle: 'Nota interna sobre o prospect' },
  ];

  const handleSelectPreset = (preset: typeof eventPresets[0]) => {
    setEventType(preset.type);
    setTitle(preset.defaultTitle);
    if (preset.type === 'response_received') {
      setNewStage('RESPONDEU');
    } else if (preset.type === 'meeting_held') {
      setNewStage('REUNIÃO');
    } else if (preset.type === 'proposal_sent') {
      setNewStage('PROPOSTA');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      await onSave({
        type: eventType,
        title: title.trim(),
        description: description.trim(),
        channel,
        newStage,
        nextActionTitle: scheduleNext ? nextActionTitle : undefined,
        nextActionDate: scheduleNext ? nextActionDate : undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Registrar Interação: ${companyName}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Presets Rápidos */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Tipo de Interação
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {eventPresets.map((preset) => (
              <button
                key={preset.type}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-xs px-2.5 py-2 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                  eventType === preset.type
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Título da Interação *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Mensagem enviada via WhatsApp..."
          required
        />

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">
            Detalhes / Resumo do que foi conversado (opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Ex: Conversado com o Dr. Marcos. Pediu envio de apresentação em PDF..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        {/* Estágio Atual & Novo Estágio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <Select
            label="Canal Utilizado"
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

          <Select
            label="Atualizar Estágio do Funil"
            value={newStage}
            onChange={(e) => setNewStage(e.target.value as LeadStage)}
            options={ALL_LEAD_STAGES.map((stg) => ({
              value: stg,
              label: `${STAGES_CONFIG[stg].order}. ${STAGES_CONFIG[stg].label}`,
            }))}
          />
        </div>

        {/* Garantir Próxima Ação */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={scheduleNext}
              onChange={(e) => setScheduleNext(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-950 border-slate-700"
            />
            <span className="text-xs font-semibold text-slate-200">
              Agendar Próxima Ação (Recomendado)
            </span>
          </label>

          {scheduleNext && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <Input
                label="Próxima Ação"
                value={nextActionTitle}
                onChange={(e) => setNextActionTitle(e.target.value)}
                placeholder="Ex: Follow-up de confirmação"
              />
              <Input
                label="Data"
                type="date"
                value={nextActionDate}
                onChange={(e) => setNextActionDate(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Registrar no Histórico
          </Button>
        </div>
      </form>
    </Modal>
  );
};

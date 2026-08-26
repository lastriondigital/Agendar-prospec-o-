import React, { useState } from 'react';
import { ABTestExperiment, ContactChannel, Service } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { CHANNEL_LABELS } from '../../utils/constants';

interface ABTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (test: ABTestExperiment) => void;
  initialTest?: ABTestExperiment | null;
  services: Service[];
  availableNiches: string[];
}

export const ABTestModal: React.FC<ABTestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTest,
  services,
  availableNiches,
}) => {
  const [title, setTitle] = useState(initialTest?.title || '');
  const [description, setDescription] = useState(initialTest?.description || '');
  const [channel, setChannel] = useState<ContactChannel>(initialTest?.channel || 'whatsapp');
  const [serviceId, setServiceId] = useState(initialTest?.serviceId || '');
  const [niche, setNiche] = useState(initialTest?.niche || '');
  const [status, setStatus] = useState<ABTestExperiment['status']>(initialTest?.status || 'active');

  // Variant A
  const [labelA, setLabelA] = useState(initialTest?.variantA.label || 'Mensagem A');
  const [contentA, setContentA] = useState(
    initialTest?.variantA.content ||
      'Olá {nome}, tudo bem? Notei que sua empresa pode melhorar a conversão do site com uma reformulação ágil.'
  );

  // Variant B
  const [labelB, setLabelB] = useState(initialTest?.variantB.label || 'Mensagem B');
  const [contentB, setContentB] = useState(
    initialTest?.variantB.content ||
      'Olá {nome}, vi que vocês atendem no WhatsApp. Já avaliaram quanto tempo os clientes esperam para receber um orçamento?'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const existingA = initialTest?.variantA;
    const existingB = initialTest?.variantB;

    const testPayload: ABTestExperiment = {
      id: initialTest?.id || `ab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      description: description.trim() || undefined,
      channel,
      status,
      serviceId: serviceId || undefined,
      niche: niche || undefined,
      variantA: {
        id: 'A',
        label: labelA.trim() || 'Mensagem A',
        content: contentA.trim(),
        sentCount: existingA?.sentCount || 0,
        replyCount: existingA?.replyCount || 0,
        positiveReplyCount: existingA?.positiveReplyCount || 0,
        conversionCount: existingA?.conversionCount || 0,
        replyRate: existingA?.replyRate || 0,
        positiveReplyRate: existingA?.positiveReplyRate || 0,
        conversionRate: existingA?.conversionRate || 0,
      },
      variantB: {
        id: 'B',
        label: labelB.trim() || 'Mensagem B',
        content: contentB.trim(),
        sentCount: existingB?.sentCount || 0,
        replyCount: existingB?.replyCount || 0,
        positiveReplyCount: existingB?.positiveReplyCount || 0,
        conversionCount: existingB?.conversionCount || 0,
        replyRate: existingB?.replyRate || 0,
        positiveReplyRate: existingB?.positiveReplyRate || 0,
        conversionRate: existingB?.conversionRate || 0,
      },
      winnerVariant: initialTest?.winnerVariant || 'dados_insuficientes',
      winnerMetric: initialTest?.winnerMetric || 'replyRate',
      insightSummary: initialTest?.insightSummary || 'Teste criado. Aguardando registros de envios.',
      createdAt: initialTest?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(testPayload);
    onClose();
  };

  const channelOptions = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'email', label: 'E-mail' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'phone', label: 'Telefone' },
    { value: 'other', label: 'Outro' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTest ? 'Editar Teste A/B de Mensagens' : 'Novo Teste A/B de Abordagem'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Título do Experimento *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Abordagem WhatsApp: Dor de Carregamento vs Orçamento Direto"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Canal de Envio"
            value={channel}
            onChange={(e) => setChannel(e.target.value as ContactChannel)}
            options={channelOptions}
          />

          <Select
            label="Serviço Alvo (Opcional)"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            options={[
              { value: '', label: 'Todos / Geral' },
              ...services.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />

          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ABTestExperiment['status'])}
            options={[
              { value: 'active', label: 'Em Andamento (Ativo)' },
              { value: 'completed', label: 'Concluído' },
              { value: 'draft', label: 'Rascunho' },
            ]}
          />
        </div>

        {/* Variant A Box */}
        <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400">Variante A (Mensagem Base)</span>
            <input
              type="text"
              value={labelA}
              onChange={(e) => setLabelA(e.target.value)}
              placeholder="Rótulo ex: Abordagem Consultiva"
              className="text-xs bg-neutral-950 border border-neutral-800 rounded px-2 py-0.5 text-neutral-200"
            />
          </div>
          <textarea
            rows={3}
            value={contentA}
            onChange={(e) => setContentA(e.target.value)}
            placeholder="Texto completo da Mensagem A..."
            className="w-full text-xs bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-200 focus:outline-none focus:border-indigo-500 font-mono"
            required
          />
        </div>

        {/* Variant B Box */}
        <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400">Variante B (Mensagem Comparativa)</span>
            <input
              type="text"
              value={labelB}
              onChange={(e) => setLabelB(e.target.value)}
              placeholder="Rótulo ex: Apresentação Direta"
              className="text-xs bg-neutral-950 border border-neutral-800 rounded px-2 py-0.5 text-neutral-200"
            />
          </div>
          <textarea
            rows={3}
            value={contentB}
            onChange={(e) => setContentB(e.target.value)}
            placeholder="Texto completo da Mensagem B..."
            className="w-full text-xs bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-200 focus:outline-none focus:border-amber-500 font-mono"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Salvar Teste A/B
          </Button>
        </div>
      </form>
    </Modal>
  );
};

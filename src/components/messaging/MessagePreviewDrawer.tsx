import React, { useState, useEffect } from 'react';
import {
  User,
  Building2,
  Briefcase,
  AlertCircle,
  Copy,
  Check,
  Send,
  Sparkles,
  RefreshCw,
  Edit3,
  Clock,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Company, Contact, Lead, MessageTemplate, Service, VariationLevel, PersonalizedMessageResult } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { MessageAuditCard } from './MessageAuditCard';
import { preparePersonalizedMessage, generateMessageVariation } from '../../utils/messagePersonalizer';
import { generateWhatsAppLink, formatPhoneNumber } from '../../utils/formatting';
import { useToast } from '../../context/ToastContext';

interface MessagePreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  template: MessageTemplate | string;
  company?: Company | null;
  contact?: Contact | null;
  service?: Service | null;
  lead?: Lead | null;
  onScheduleAction?: (customMessage: string) => void;
  onSaveToLead?: (customMessage: string) => void;
}

export const MessagePreviewDrawer: React.FC<MessagePreviewDrawerProps> = ({
  isOpen,
  onClose,
  template,
  company,
  contact,
  service,
  lead,
  onScheduleAction,
  onSaveToLead,
}) => {
  const { success, error } = useToast();

  const [variationLevel, setVariationLevel] = useState<VariationLevel>('none');
  const [editableMessage, setEditableMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<PersonalizedMessageResult | null>(null);

  // Recalcula a personalização sempre que mudar o template, nível ou contexto
  useEffect(() => {
    if (isOpen) {
      const res = preparePersonalizedMessage(
        template,
        { company, contact, service, lead },
        variationLevel
      );
      setResult(res);
      setEditableMessage(res.message);
      setIsEditing(false);
    }
  }, [isOpen, template, company, contact, service, lead, variationLevel]);

  if (!result) return null;

  const { metadata, audit } = result;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editableMessage);
      setCopied(true);
      success('Mensagem copiada para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      error('Não foi possível copiar automaticamente.');
    }
  };

  const handleRegenerate = () => {
    const rawTemplate = typeof template === 'string' ? template : template.content;
    const newVariation = generateMessageVariation(
      rawTemplate,
      { company, contact, service, lead },
      variationLevel === 'none' ? 'minor' : variationLevel
    );
    setEditableMessage(newVariation);
    success('Variação de mensagem regenerada!');
  };

  const handleOpenWhatsApp = () => {
    const phone = contact?.whatsapp || contact?.phone || company?.companyWhatsApp || company?.companyPhone || '';
    if (!phone) {
      error('Nenhum número de WhatsApp encontrado para este contato ou empresa.');
      return;
    }
    const link = generateWhatsAppLink(phone, editableMessage);
    window.open(link, '_blank');
    if (onSaveToLead) {
      onSaveToLead(editableMessage);
    }
    success('WhatsApp aberto com a mensagem personalizada!');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pré-Visualização & Personalização de Mensagem"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Painel Estruturado de Metadados (Ponto 34) */}
        <div className="p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-xl">
          <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center justify-between">
            <span>Metadados do Lead Vinculado</span>
            {metadata.scoreIcp !== undefined && (
              <Badge variant="emerald" size="sm">
                Score ICP: {metadata.scoreIcp}/100
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="p-2 bg-neutral-950/60 rounded-lg border border-neutral-800/80">
              <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Para (Destinatário):</span>
              <div className="font-semibold text-neutral-100 mt-0.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-400" />
                {metadata.recipientName}
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                {metadata.recipientRole} • {metadata.recipientSalutation}
              </div>
            </div>

            <div className="p-2 bg-neutral-950/60 rounded-lg border border-neutral-800/80">
              <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Empresa:</span>
              <div className="font-semibold text-neutral-100 mt-0.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                {metadata.companyName}
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                {company?.niche || 'Geral'} • {metadata.companyCity}
              </div>
            </div>

            <div className="p-2 bg-neutral-950/60 rounded-lg border border-neutral-800/80 sm:col-span-2 md:col-span-1">
              <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Serviço & Dor Diagnosticada:</span>
              <div className="font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {metadata.serviceName}
              </div>
              <div className="text-[11px] text-amber-300/90 mt-0.5 line-clamp-1" title={metadata.diagnosedProblem}>
                Dor: {metadata.diagnosedProblem}
              </div>
            </div>
          </div>
        </div>

        {/* Seletor de Nível de Variação (Ponto 33) */}
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Motor de Variação Automática
            </span>
            <span className="text-[11px] text-neutral-400 font-normal">
              Escolha a profundidade da adaptação
            </span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'none', label: '1. Sem Variação', desc: 'Template exato com tags' },
              { id: 'minor', label: '2. Pequena Variação', desc: 'Sinônimos e aberturas' },
              { id: 'contextual', label: '3. Contextual', desc: 'Adapta à dor e persona' },
              { id: 'ai', label: '4. Personalização IA', desc: 'Hiperpersonalizada' },
            ].map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setVariationLevel(lvl.id as VariationLevel)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  variationLevel === lvl.id
                    ? 'bg-blue-600/20 border-blue-500 text-blue-200 shadow-sm ring-1 ring-blue-500/50'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <div className="text-xs font-bold">{lvl.label}</div>
                <div className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">{lvl.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Caixa de Texto da Mensagem */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
              <span>Mensagem Pronta</span>
              {isEditing && (
                <Badge variant="amber" size="sm">
                  Modo Edição Manual
                </Badge>
              )}
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditing ? 'Concluir Edição' : 'Editar Texto'}
              </button>

              <button
                type="button"
                onClick={handleRegenerate}
                className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerar
              </button>
            </div>
          </div>

          <textarea
            rows={7}
            value={editableMessage}
            onChange={(e) => setEditableMessage(e.target.value)}
            readOnly={!isEditing}
            className={`w-full rounded-xl p-3.5 text-xs sm:text-sm font-sans leading-relaxed border transition-colors ${
              isEditing
                ? 'bg-neutral-900 border-blue-500 text-neutral-100 focus:ring-1 focus:ring-blue-500 focus:outline-none'
                : 'bg-neutral-950/80 border-neutral-800 text-neutral-200 select-text cursor-default'
            }`}
          />
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>{editableMessage.length} caracteres</span>
            <span>Canal recomendado: WhatsApp / Click-to-Chat</span>
          </div>
        </div>

        {/* Card de Auditoria Pré-Envio (Ponto 41) */}
        <MessageAuditCard audit={audit} />

        {/* Botões de Ação Principais (Ponto 34) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-neutral-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fechar
          </Button>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copiado!' : 'Copiar Texto'}
            </Button>

            {onScheduleAction && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onScheduleAction(editableMessage);
                  onClose();
                }}
                leftIcon={<Clock className="w-4 h-4 text-blue-400" />}
              >
                Agendar Ação
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenWhatsApp}
              leftIcon={<Send className="w-4 h-4" />}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Abrir WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

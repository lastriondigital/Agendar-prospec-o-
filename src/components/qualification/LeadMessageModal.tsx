import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Copy,
  ExternalLink,
  Check,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  BookmarkCheck,
  Send,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { MessageTemplate, Lead, Company, Contact, Service, CopilotActionType } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { interpolateMessage, validateMessageContent, generateWhatsAppLink } from '../../utils/formatting';
import { CopilotActionButtons } from '../copilot/CopilotActionButtons';
import { CopilotAssistantModal } from '../copilot/CopilotAssistantModal';

interface LeadMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  company: Company | null;
  initialTemplateId?: string;
}

export const LeadMessageModal: React.FC<LeadMessageModalProps> = ({
  isOpen,
  onClose,
  lead,
  company,
  initialTemplateId,
}) => {
  const { templates, contacts, services, leads, updateLead } = useApp();
  const { success, error } = useToast();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [messageContent, setMessageContent] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Copilot state
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotInitialAction, setCopilotInitialAction] = useState<CopilotActionType>('PERSONALIZAR');

  const primaryContact = contacts.find((c) => c.companyId === company?.id && c.isPrimary) ||
    contacts.find((c) => c.companyId === company?.id);

  const matchedService = services.find((s) => s.id === lead?.serviceId) || services[0];


  // Initialize selected template when modal opens
  useEffect(() => {
    if (isOpen && templates.length > 0) {
      const targetTplId = initialTemplateId || templates[0].id;
      setSelectedTemplateId(targetTplId);

      const tpl = templates.find((t) => t.id === targetTplId) || templates[0];
      if (tpl && lead) {
        // Check if there is already a custom prepared message for this lead & template
        const savedCustomMsg = lead.preparedMessages?.[tpl.id];
        if (savedCustomMsg !== undefined) {
          setMessageContent(savedCustomMsg);
        } else {
          const interpolated = interpolateMessage(tpl.content, null, matchedService, company, primaryContact);
          setMessageContent(interpolated);
        }
      }
    }
  }, [isOpen, initialTemplateId, templates, lead, company, matchedService, primaryContact]);

  // When selected template changes, load saved custom message or interpolate fresh
  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = templates.find((t) => t.id === tplId);
    if (tpl && lead) {
      const savedCustomMsg = lead.preparedMessages?.[tpl.id];
      if (savedCustomMsg !== undefined) {
        setMessageContent(savedCustomMsg);
      } else {
        const interpolated = interpolateMessage(tpl.content, null, matchedService, company, primaryContact);
        setMessageContent(interpolated);
      }
    }
  };

  // Reset to original template interpolation
  const handleResetToTemplate = () => {
    const tpl = templates.find((t) => t.id === selectedTemplateId);
    if (tpl) {
      const interpolated = interpolateMessage(tpl.content, null, matchedService, company, primaryContact);
      setMessageContent(interpolated);
      success('Mensagem reiniciada para o modelo original.');
    }
  };

  // Save custom message to lead.preparedMessages
  const handleSaveCustomMessage = async () => {
    if (!lead) return;
    const updatedPrepared = {
      ...(lead.preparedMessages || {}),
      [selectedTemplateId]: messageContent,
    };
    const updatedLead: Lead = {
      ...lead,
      preparedMessages: updatedPrepared,
      updatedAt: new Date().toISOString(),
    };
    await updateLead(updatedLead);
    setIsSaved(true);
    success('Mensagem personalizada salva para este lead!');
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageContent);
      setCopied(true);
      success('Mensagem copiada para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);

      // Automatically save current state to lead
      if (lead) {
        const updatedPrepared = {
          ...(lead.preparedMessages || {}),
          [selectedTemplateId]: messageContent,
        };
        await updateLead({
          ...lead,
          preparedMessages: updatedPrepared,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch {
      error('Falha ao copiar mensagem.');
    }
  };

  const handleOpenWhatsApp = () => {
    const phone = primaryContact?.whatsapp || primaryContact?.phone;
    if (!phone) {
      error('Este contato não possui número de WhatsApp ou telefone cadastrado.');
      return;
    }
    const link = generateWhatsAppLink(phone, messageContent);
    window.open(link, '_blank');
  };

  const validation = validateMessageContent(messageContent, {
    company,
    service: matchedService,
    contact: primaryContact,
  });

  if (!isOpen || !company || !lead) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Preparar Mensagem — ${company.name}`}
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Lead & Service info header */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
          <div className="space-y-1">
            <span className="text-neutral-500 uppercase tracking-wider text-[10px] font-semibold">Destinatário:</span>
            <p className="font-bold text-neutral-100">
              {primaryContact?.name || 'Contato Principal'} ({primaryContact?.whatsapp || primaryContact?.phone || 'Sem telefone'})
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-neutral-500 uppercase tracking-wider text-[10px] font-semibold">Serviço Alvo:</span>
            <p className="font-bold text-emerald-400">{matchedService?.name || 'Geral'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-neutral-500 uppercase tracking-wider text-[10px] font-semibold">Canal:</span>
            <Badge variant="emerald" size="sm">WhatsApp</Badge>
          </div>
        </div>

        {/* Template Selector & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="w-full sm:w-72">
            <label className="block text-xs font-medium text-neutral-400 mb-1">Selecionar Template Base:</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.category || t.type}] {t.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="xs"
              onClick={handleResetToTemplate}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              title="Restaurar template original"
            >
              Restaurar Original
            </Button>
            <Button
              variant="secondary"
              size="xs"
              onClick={handleSaveCustomMessage}
              leftIcon={isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <BookmarkCheck className="w-3.5 h-3.5" />}
            >
              {isSaved ? 'Salvo!' : 'Salvar no Lead'}
            </Button>
          </div>
        </div>

        {/* Editor & Live Preview Area */}
        <div className="space-y-2">
          {/* Copilot Action Buttons Strip */}
          <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between flex-wrap gap-2">
            <CopilotActionButtons
              size="xs"
              onSelectAction={(action) => {
                setCopilotInitialAction(action);
                setIsCopilotOpen(true);
              }}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Mensagem Personalizada para Este Lead (Edição Livre)
            </label>
            <span className={`text-[11px] font-mono ${messageContent.length > 1000 ? 'text-rose-400 font-bold' : 'text-neutral-500'}`}>
              {messageContent.length} / 1000 caracteres
            </span>
          </div>

          <textarea
            rows={9}
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Digite ou ajuste a mensagem..."
            className="w-full p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 font-sans leading-relaxed focus:outline-none focus:border-emerald-500 shadow-inner"
          />

          {/* Validation Warnings */}
          {validation.warnings.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Avisos de Validação:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-amber-200/90">
                {validation.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal do Copiloto Gemini */}
        <CopilotAssistantModal
          isOpen={isCopilotOpen}
          onClose={() => setIsCopilotOpen(false)}
          company={company}
          contact={primaryContact}
          lead={lead}
          service={matchedService}
          initialMessage={messageContent}
          initialActionType={copilotInitialAction}
          onApplyMessage={(newMsg) => setMessageContent(newMsg)}
        />

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fechar
          </Button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              className="flex-1 sm:flex-initial"
            >
              {copied ? 'Copiado!' : 'Copiar Mensagem'}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenWhatsApp}
              leftIcon={<ExternalLink className="w-4 h-4" />}
              className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Abrir no WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

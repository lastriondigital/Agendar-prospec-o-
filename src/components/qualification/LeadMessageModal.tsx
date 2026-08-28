import React, { useState, useEffect, useMemo } from 'react';
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
  Phone,
  User,
  CheckCircle2,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { MessageTemplate, Lead, Company, Contact, Service, CopilotActionType, VariationLevel } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { generateWhatsAppLink, formatPhoneNumber } from '../../utils/formatting';
import { CopilotActionButtons } from '../copilot/CopilotActionButtons';
import { CopilotAssistantModal } from '../copilot/CopilotAssistantModal';
import { VariableSelectorModal } from '../messaging/VariableSelectorModal';
import { MessageAuditCard } from '../messaging/MessageAuditCard';
import {
  interpolateDynamicTemplate,
  generateMessageVariation,
  auditMessageIntegrity,
} from '../../utils/messagePersonalizer';

interface LeadMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  company: Company | null;
  initialTemplateId?: string;
  initialContactId?: string;
}

export const LeadMessageModal: React.FC<LeadMessageModalProps> = ({
  isOpen,
  onClose,
  lead,
  company,
  initialTemplateId,
  initialContactId,
}) => {
  const { templates, contacts, services, updateLead, addHistoryEvent, logInteractionAndAdvance } = useApp();
  const { success, error } = useToast();

  const [selectedContactId, setSelectedContactId] = useState<string>('primary');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [messageContent, setMessageContent] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [wasWhatsAppOpened, setWasWhatsAppOpened] = useState(false);
  const [isMarkingSent, setIsMarkingSent] = useState(false);
  const [variationLevel, setVariationLevel] = useState<VariationLevel>('none');
  const [isVariableModalOpen, setIsVariableModalOpen] = useState(false);

  // Copilot state
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotInitialAction, setCopilotInitialAction] = useState<CopilotActionType>('PERSONALIZAR');

  const companyContacts = useMemo(() => {
    return contacts.filter((c) => c.companyId === company?.id && c.status !== 'archived');
  }, [contacts, company?.id]);

  const activeContact = useMemo(() => {
    if (selectedContactId === 'company_direct') return null;
    if (selectedContactId !== 'primary') {
      const found = companyContacts.find((c) => c.id === selectedContactId);
      if (found) return found;
    }
    return companyContacts.find((c) => c.isPrimary) || companyContacts[0] || null;
  }, [companyContacts, selectedContactId]);

  const resolvedTargetPhone = useMemo(() => {
    if (selectedContactId === 'company_direct') {
      return company?.companyWhatsApp || company?.companyPhone || '';
    }
    if (activeContact) {
      return activeContact.whatsapp || activeContact.phone || company?.companyWhatsApp || company?.companyPhone || '';
    }
    return company?.companyWhatsApp || company?.companyPhone || '';
  }, [activeContact, company, selectedContactId]);

  const matchedService = services.find((s) => s.id === lead?.serviceId) || services[0];

  const personalizationContext = useMemo(() => {
    return {
      company: company || undefined,
      contact: activeContact || undefined,
      service: matchedService || undefined,
      lead: lead || undefined,
    };
  }, [company, activeContact, matchedService, lead]);

  // Initialize selected template & contact when modal opens
  useEffect(() => {
    if (isOpen) {
      setWasWhatsAppOpened(false);
      if (initialContactId) {
        setSelectedContactId(initialContactId);
      } else {
        setSelectedContactId('primary');
      }

      if (templates.length > 0) {
        const targetTplId = initialTemplateId || templates[0].id;
        setSelectedTemplateId(targetTplId);

        const tpl = templates.find((t) => t.id === targetTplId) || templates[0];
        if (tpl && lead) {
          const savedCustomMsg = lead.preparedMessages?.[tpl.id];
          if (savedCustomMsg !== undefined) {
            setMessageContent(savedCustomMsg);
          } else {
            const interpolated = generateMessageVariation(
              tpl.content,
              personalizationContext,
              variationLevel
            );
            setMessageContent(interpolated);
          }
        }
      }
    }
  }, [isOpen, initialTemplateId, initialContactId, templates, lead, company]);

  // When recipient changes, re-interpolate variables
  const handleContactChange = (newContactId: string) => {
    setSelectedContactId(newContactId);
    let targetContact: Contact | null = null;
    if (newContactId !== 'company_direct') {
      targetContact = companyContacts.find((c) => c.id === newContactId) || companyContacts[0] || null;
    }
    const tpl = templates.find((t) => t.id === selectedTemplateId) || templates[0];
    if (tpl) {
      const interpolated = generateMessageVariation(
        tpl.content,
        { ...personalizationContext, contact: targetContact || undefined },
        variationLevel
      );
      setMessageContent(interpolated);
    }
  };

  // When selected template changes, load saved custom message or interpolate fresh
  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = templates.find((t) => t.id === tplId);
    if (tpl && lead) {
      const savedCustomMsg = lead.preparedMessages?.[tpl.id];
      if (savedCustomMsg !== undefined) {
        setMessageContent(savedCustomMsg);
      } else {
        const interpolated = generateMessageVariation(
          tpl.content,
          personalizationContext,
          variationLevel
        );
        setMessageContent(interpolated);
      }
    }
  };

  // Handle Variation Level Change
  const handleVariationLevelChange = (level: VariationLevel) => {
    setVariationLevel(level);
    const tpl = templates.find((t) => t.id === selectedTemplateId) || templates[0];
    if (tpl) {
      const varied = generateMessageVariation(tpl.content, personalizationContext, level);
      setMessageContent(varied);
    }
  };

  // Reset to original template interpolation
  const handleResetToTemplate = () => {
    const tpl = templates.find((t) => t.id === selectedTemplateId);
    if (tpl) {
      const interpolated = generateMessageVariation(
        tpl.content,
        personalizationContext,
        variationLevel
      );
      setMessageContent(interpolated);
      success('Mensagem reiniciada para o modelo original.');
    }
  };

  // Save custom message to lead.preparedMessages
  const handleSaveCustomMessage = async () => {
    if (!lead || !company) return;
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
    await addHistoryEvent({
      companyId: company.id,
      contactId: activeContact?.id,
      leadId: lead.id,
      type: 'message_prepared',
      title: 'Mensagem preparada e salva',
      description: `Mensagem personalizada salva para envio futuro. (${messageContent.slice(0, 80)}...)`,
    });
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

  const handleCopyPhone = async () => {
    if (!resolvedTargetPhone) {
      error('Nenhum número de telefone disponível para cópia.');
      return;
    }
    try {
      await navigator.clipboard.writeText(resolvedTargetPhone);
      setCopiedPhone(true);
      success(`Número copiado: ${formatPhoneNumber(resolvedTargetPhone)}`);
      setTimeout(() => setCopiedPhone(false), 2000);
    } catch {
      error('Falha ao copiar telefone.');
    }
  };

  const handleOpenWhatsApp = async () => {
    if (!resolvedTargetPhone) {
      error('Este contacto não possui número de WhatsApp ou telefone cadastrado.');
      return;
    }
    if (!company || !lead) return;

    const link = generateWhatsAppLink(resolvedTargetPhone, messageContent);
    window.open(link, '_blank');
    setWasWhatsAppOpened(true);

    await addHistoryEvent({
      companyId: company.id,
      contactId: activeContact?.id,
      leadId: lead.id,
      type: 'whatsapp_opened',
      title: 'WhatsApp aberto com mensagem preparada',
      description: `Link do WhatsApp gerado para ${activeContact?.name || company.name} (${formatPhoneNumber(resolvedTargetPhone)}).`,
    });
  };

  const handleMarkAsSent = async () => {
    if (!company || !lead) return;
    try {
      setIsMarkingSent(true);
      await logInteractionAndAdvance({
        companyId: company.id,
        contactId: activeContact?.id,
        leadId: lead.id,
        channel: 'whatsapp',
        messageSent: messageContent,
        notes: `Mensagem enviada via WhatsApp para ${activeContact?.name || company.name} (${formatPhoneNumber(resolvedTargetPhone)}).`,
      });

      const updatedPrepared = {
        ...(lead.preparedMessages || {}),
        [selectedTemplateId]: messageContent,
      };
      await updateLead({
        ...lead,
        lastContactDate: new Date().toISOString().slice(0, 10),
        preparedMessages: updatedPrepared,
        updatedAt: new Date().toISOString(),
      });

      success('Mensagem confirmada como enviada e registrada no histórico!');
      onClose();
    } catch (err) {
      error('Erro ao registrar envio', (err as Error).message);
    } finally {
      setIsMarkingSent(false);
    }
  };

  const auditResult = useMemo(() => {
    return auditMessageIntegrity(messageContent, personalizationContext);
  }, [messageContent, personalizationContext]);

  if (!isOpen || !company || !lead) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Motor de Personalização — ${company.name}`}
      maxWidth="xl"
    >
      <div className="space-y-4 max-h-[82vh] overflow-y-auto pr-1">
        {/* Contact Selector & Recipient Info Strip */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex-1 min-w-0">
              <label className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold block mb-1">
                Destinatário & Papel do Contato:
              </label>
              <select
                value={selectedContactId}
                onChange={(e) => handleContactChange(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 font-medium focus:outline-none focus:border-emerald-500"
              >
                {companyContacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.role ? `(${c.role})` : ''} {c.isPrimary ? '★ Principal' : ''} — {c.salutation ? `[${c.salutation}]` : ''}
                  </option>
                ))}
                {(company.companyWhatsApp || company.companyPhone) && (
                  <option value="company_direct">
                    🏢 Recepção / WhatsApp Geral da Empresa ({company.companyWhatsApp || company.companyPhone})
                  </option>
                )}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2 sm:pt-4">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleCopyPhone}
                leftIcon={copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Phone className="w-3.5 h-3.5 text-blue-400" />}
                className="text-slate-300 border-slate-700"
                title="Copiar número de telefone"
              >
                {copiedPhone ? 'Copiado' : formatPhoneNumber(resolvedTargetPhone) || 'Sem telefone'}
              </Button>
              <Badge variant="emerald" size="sm">WhatsApp</Badge>
            </div>
          </div>
        </div>

        {/* Template Selector, Variação & Ações */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-6">
            <label className="block text-xs font-medium text-slate-400 mb-1">Selecionar Script / Template:</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.category || t.type}] {t.title}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-slate-400 mb-1">Nível de Variação:</label>
            <select
              value={variationLevel}
              onChange={(e) => handleVariationLevelChange(e.target.value as VariationLevel)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="none">1. Sem Variação</option>
              <option value="minor">2. Pequena Variação</option>
              <option value="contextual">3. Contextual (Papel)</option>
              <option value="ai">4. Por IA (Anti-alucinação)</option>
            </select>
          </div>

          <div className="sm:col-span-3 flex items-center justify-end gap-1.5 pb-0.5">
            <Button
              variant="ghost"
              size="xs"
              onClick={handleResetToTemplate}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              title="Restaurar template original"
            >
              Restaurar
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
          {/* Quick Toolbar com botão + ADICIONAR VARIÁVEL */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="primary"
                size="xs"
                onClick={() => setIsVariableModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
              >
                + ADICIONAR VARIÁVEL
              </Button>

              <CopilotActionButtons
                size="xs"
                onSelectAction={(action) => {
                  setCopilotInitialAction(action);
                  setIsCopilotOpen(true);
                }}
              />
            </div>

            <span className={`text-[11px] font-mono ${messageContent.length > 1000 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
              {messageContent.length} caracteres
            </span>
          </div>

          <textarea
            rows={8}
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Digite ou ajuste a mensagem antes de abrir o WhatsApp..."
            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 font-sans leading-relaxed focus:outline-none focus:border-emerald-500 shadow-inner"
          />

          {/* Cartão de Auditoria e Anti-Invenção em Tempo Real */}
          <MessageAuditCard audit={auditResult} />

          {/* Banner de status quando WhatsApp foi aberto */}
          {wasWhatsAppOpened && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-300 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>WhatsApp foi aberto. A mensagem foi enviada com sucesso ao cliente?</span>
              </div>
              <Button
                variant="primary"
                size="xs"
                onClick={handleMarkAsSent}
                isLoading={isMarkingSent}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shrink-0"
              >
                [MARCAR COMO ENVIADA]
              </Button>
            </div>
          )}
        </div>

        {/* Modal de Variáveis Dinâmicas */}
        <VariableSelectorModal
          isOpen={isVariableModalOpen}
          onClose={() => setIsVariableModalOpen(false)}
          onSelectVariable={(tag) => {
            setMessageContent((prev) => (prev ? `${prev} ${tag}` : tag));
          }}
        />

        {/* Modal do Copiloto Gemini */}
        <CopilotAssistantModal
          isOpen={isCopilotOpen}
          onClose={() => setIsCopilotOpen(false)}
          company={company}
          contact={activeContact}
          lead={lead}
          service={matchedService}
          initialMessage={messageContent}
          initialActionType={copilotInitialAction}
          onApplyMessage={(newMsg) => setMessageContent(newMsg)}
        />

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fechar
          </Button>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
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
              className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
            >
              Abrir no WhatsApp
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAsSent}
              isLoading={isMarkingSent}
              leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              className="flex-1 sm:flex-initial border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
              title="Registra oficialmente o envio no histórico do lead"
            >
              [MARCAR COMO ENVIADA]
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};


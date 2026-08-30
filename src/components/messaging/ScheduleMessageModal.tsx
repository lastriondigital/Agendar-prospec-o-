import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Building2,
  Phone,
  Send,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Layers,
  ChevronDown,
  Info,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import {
  Campaign,
  CampaignType,
  Company,
  Contact,
  ContactChannel,
  Lead,
  MessageTemplate,
  ProspectAction,
} from '../../types';
import {
  CAMPAIGN_TYPE_LABELS,
  CHANNEL_OPTIONS,
  DEFAULT_ACTION_TYPES,
  DEFAULT_CAMPAIGN_TYPES,
  getActionTypes,
  getCompatibleScripts,
  resolveVariablesDetailed,
} from '../../utils/cadenceUtils';
import { formatPhoneNumber, formatRelativeDate } from '../../utils/formatting';
import { STAGES_CONFIG } from '../../utils/constants';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';

interface ScheduleMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLeadId?: string;
  initialCompanyId?: string;
  initialCampaignId?: string;
  initialActionType?: string;
  initialChannel?: ContactChannel;
  initialDate?: string;
  initialTime?: string;
  initialScriptId?: string;
  preselectedTemplateId?: string;
  initialText?: string;
  onSuccess?: (action: ProspectAction) => void;
}

export const ScheduleMessageModal: React.FC<ScheduleMessageModalProps> = ({
  isOpen,
  onClose,
  initialLeadId,
  initialCompanyId,
  initialCampaignId,
  initialActionType,
  initialChannel,
  initialDate,
  initialTime,
  initialScriptId,
  preselectedTemplateId,
  initialText,
  onSuccess,
}) => {
  const {
    leads,
    companies,
    contacts,
    campaigns,
    services,
    templates,
    history,
    upsertAction,
  } = useApp();

  const { success, error, warning } = useToast();

  // 1. Estados do Formulário
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [campaignType, setCampaignType] = useState<CampaignType>('prospeccao');
  const [channel, setChannel] = useState<ContactChannel>('whatsapp');
  const [actionType, setActionType] = useState<string>('Primeiro contato');
  const [customActionTypeInput, setCustomActionTypeInput] = useState<string>('');
  const [isCustomActionType, setIsCustomActionType] = useState<boolean>(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [scheduledTime, setScheduledTime] = useState<string>('10:30');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [leadSearchQuery, setLeadSearchQuery] = useState<string>('');

  // Sincroniza props iniciais quando o modal abre
  useEffect(() => {
    if (isOpen) {
      const defaultDate = initialDate || new Date().toISOString().slice(0, 10);
      const defaultTime = initialTime || '10:30';
      setScheduledDate(defaultDate);
      setScheduledTime(defaultTime);

      if (initialLeadId) {
        setSelectedLeadId(initialLeadId);
      } else if (initialCompanyId) {
        const lead = leads.find((l) => l.companyId === initialCompanyId);
        if (lead) setSelectedLeadId(lead.id);
      } else if (leads.length > 0) {
        setSelectedLeadId(leads[0].id);
      }

      if (initialCampaignId) {
        setSelectedCampaignId(initialCampaignId);
        const camp = campaigns.find((c) => c.id === initialCampaignId);
        if (camp) {
          if (camp.campaignType || camp.type) setCampaignType(camp.campaignType || camp.type || 'prospeccao');
          if (camp.channel) setChannel(camp.channel);
        }
      } else {
        setSelectedCampaignId('');
      }

      if (initialChannel) {
        setChannel(initialChannel);
      }

      if (initialActionType) {
        setActionType(initialActionType);
      }

      const scriptToSelect = initialScriptId || preselectedTemplateId;
      if (scriptToSelect) {
        setSelectedTemplateId(scriptToSelect);
      }

      if (initialText) {
        setCustomMessage(initialText);
      }
    }
  }, [isOpen, initialLeadId, initialCompanyId, initialCampaignId, initialActionType, initialChannel, initialDate, initialTime, initialScriptId, preselectedTemplateId, initialText, leads, campaigns]);

  // Lead, Empresa e Contato selecionados
  const selectedLead = useMemo(() => {
    return leads.find((l) => l.id === selectedLeadId) || null;
  }, [leads, selectedLeadId]);

  const selectedCompany = useMemo(() => {
    if (!selectedLead) return null;
    return companies.find((c) => c.id === selectedLead.companyId) || null;
  }, [companies, selectedLead]);

  const selectedContact = useMemo(() => {
    if (!selectedLead) return null;
    if (selectedLead.contactId) {
      const c = contacts.find((ct) => ct.id === selectedLead.contactId);
      if (c) return c;
    }
    if (selectedCompany) {
      const comps = contacts.filter((ct) => ct.companyId === selectedCompany.id);
      return comps.find((ct) => ct.isPrimary) || comps[0] || null;
    }
    return null;
  }, [contacts, selectedLead, selectedCompany]);

  // Histórico de interações do lead selecionado
  const leadInteractions = useMemo(() => {
    if (!selectedCompany) return [];
    return history
      .filter((h) => h.companyId === selectedCompany.id)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 3);
  }, [history, selectedCompany]);

  // Campanha selecionada
  const selectedCampaign = useMemo(() => {
    return campaigns.find((c) => c.id === selectedCampaignId) || null;
  }, [campaigns, selectedCampaignId]);

  // Quando a campanha muda, atualiza o tipo de campanha e canal sugerido
  const handleCampaignChange = (cId: string) => {
    setSelectedCampaignId(cId);
    if (cId) {
      const camp = campaigns.find((c) => c.id === cId);
      if (camp) {
        if (camp.campaignType || camp.type) {
          setCampaignType(camp.campaignType || camp.type || 'prospeccao');
        }
        if (camp.channel) {
          setChannel(camp.channel);
        }
        if (camp.defaultTemplateId) {
          setSelectedTemplateId(camp.defaultTemplateId);
        }
      }
    }
  };

  // Lista dinâmica de tipos de ação (combina padrões + scripts)
  const availableActionTypes = useMemo(() => {
    return getActionTypes(templates);
  }, [templates]);

  // Scripts compatíveis filtrados estritamente por Canal e Tipo de Ação
  const effectiveActionType = isCustomActionType ? customActionTypeInput.trim() : actionType;

  const compatibleScripts = useMemo(() => {
    return getCompatibleScripts(templates, {
      channel,
      actionType: effectiveActionType || undefined,
      serviceId: selectedCampaign?.serviceId,
    });
  }, [templates, channel, effectiveActionType, selectedCampaign]);

  // Quando compatíveis mudam ou o tipo de ação muda, seleciona o melhor script
  useEffect(() => {
    if (compatibleScripts.length > 0) {
      const exists = compatibleScripts.find((s) => s.id === selectedTemplateId);
      if (!exists) {
        setSelectedTemplateId(compatibleScripts[0].id);
      }
    } else {
      setSelectedTemplateId('');
    }
  }, [compatibleScripts, selectedTemplateId]);

  // Template de script selecionado
  const selectedTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || null;
  }, [templates, selectedTemplateId]);

  // Serviço associado para variáveis
  const associatedService = useMemo(() => {
    if (selectedCampaign?.serviceId) {
      const s = services.find((srv) => srv.id === selectedCampaign.serviceId);
      if (s) return s;
    }
    return services[0] || null;
  }, [services, selectedCampaign]);

  // Resolução de variáveis detalhada em tempo real
  const variableResolution = useMemo(() => {
    const rawContent = selectedTemplate?.content || customMessage;
    return resolveVariablesDetailed(rawContent, {
      company: selectedCompany,
      contact: selectedContact,
      service: associatedService,
      scheduledDate,
      scheduledTime,
    });
  }, [selectedTemplate, customMessage, selectedCompany, selectedContact, associatedService, scheduledDate, scheduledTime]);

  // Sincroniza a mensagem customizável quando o template é trocado
  useEffect(() => {
    if (selectedTemplate) {
      const { resolvedText } = resolveVariablesDetailed(selectedTemplate.content, {
        company: selectedCompany,
        contact: selectedContact,
        service: associatedService,
        scheduledDate,
        scheduledTime,
      });
      setCustomMessage(resolvedText || selectedTemplate.content);
    }
  }, [selectedTemplate, selectedCompany, selectedContact, associatedService, scheduledDate, scheduledTime]);

  // Lista de leads filtrados para o seletor com busca rápida
  const filteredLeads = useMemo(() => {
    if (!leadSearchQuery.trim()) return leads;
    const q = leadSearchQuery.toLowerCase();
    return leads.filter((l) => {
      const comp = companies.find((c) => c.id === l.companyId);
      const cont = contacts.find((c) => c.id === l.contactId);
      return (
        comp?.name.toLowerCase().includes(q) ||
        cont?.name.toLowerCase().includes(q) ||
        cont?.phone?.includes(q) ||
        cont?.whatsapp?.includes(q)
      );
    });
  }, [leads, companies, contacts, leadSearchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLead) {
      error('Selecione um cliente/prospect válido.');
      return;
    }

    if (!scheduledDate) {
      error('Selecione a data de agendamento.');
      return;
    }

    if (!scheduledTime) {
      error('Selecione a hora de agendamento.');
      return;
    }

    if (!customMessage.trim()) {
      error('O conteúdo da mensagem agendada não pode ficar vazio.');
      return;
    }

    if (variableResolution.missingVariables.length > 0) {
      warning(
        `Atenção: Algumas variáveis não foram preenchidas no cadastro (${variableResolution.missingVariables.join(
          ', '
        )}). Você pode ajustar o texto manualmente antes de salvar.`
      );
    }

    try {
      setIsSubmitting(true);

      const nowIso = new Date().toISOString();
      const actionId = `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const newAction: ProspectAction = {
        id: actionId,
        clientId: selectedLead.id,
        leadId: selectedLead.id,
        companyId: selectedCompany?.id || selectedLead.companyId,
        contactId: selectedContact?.id || selectedLead.contactId,
        campaignId: selectedCampaignId || undefined,
        campaignType: campaignType || undefined,
        templateId: selectedTemplate?.id || undefined,
        scriptName: selectedTemplate?.title || 'Mensagem Personalizada',
        actionType: effectiveActionType || 'Primeiro contato',
        channel: channel || 'whatsapp',
        scheduledDate,
        scheduledTime,
        status: 'agendada',
        priority: 'medium',
        estMinutes: 2,
        customMessage: customMessage.trim(),
        originalScriptContent: selectedTemplate?.content || undefined,
        notes: notes.trim() || undefined,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      await upsertAction(newAction);
      success('Mensagem agendada com sucesso!');

      if (onSuccess) {
        onSuccess(newAction);
      }
      onClose();
    } catch (err) {
      console.error(err);
      error('Erro ao agendar mensagem', (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stageConfig = selectedLead?.stage ? STAGES_CONFIG[selectedLead.stage] : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agendar Mensagem de Prospecção"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bloco 1: Data e Hora */}
        <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>1. Data & Horário do Envio</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Data *"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
              leftIcon={<Calendar className="w-4 h-4 text-neutral-400" />}
            />

            <Input
              label="Hora *"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              required
              leftIcon={<Clock className="w-4 h-4 text-neutral-400" />}
            />
          </div>
        </div>

        {/* Bloco 2: Seleção e Contexto do Cliente / Prospect */}
        <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              <User className="w-4 h-4 text-cyan-400" />
              <span>2. Cliente / Prospect</span>
            </div>
            <span className="text-[11px] text-neutral-400">Banco de prospects cadastrados</span>
          </div>

          {/* Busca rápida e Seletor */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  label="Selecionar Prospect *"
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  options={filteredLeads.map((l) => {
                    const comp = companies.find((c) => c.id === l.companyId);
                    const cont = contacts.find((c) => c.id === l.contactId);
                    const labelName = cont?.name || 'Sem contato';
                    const compName = comp?.name || 'Empresa não informada';
                    return {
                      value: l.id,
                      label: `${compName} — ${labelName} (${cont?.phone || cont?.whatsapp || 'Sem tel'})`,
                    };
                  })}
                />
              </div>
            </div>
          </div>

          {/* Cartão de Informações Contextuais do Prospect Selecionado */}
          {selectedLead && selectedCompany && (
            <div className="bg-neutral-950 p-3.5 rounded-lg border border-neutral-800/80 space-y-3 animate-in fade-in duration-150">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    {selectedCompany.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                      {selectedCompany.name}
                      {selectedLead.stage && (
                        <Badge variant="blue" size="sm">
                          {stageConfig?.label || selectedLead.stage}
                        </Badge>
                      )}
                    </h4>
                    <p className="text-xs text-neutral-400">
                      {selectedContact?.name ? `${selectedContact.name} (${selectedContact.role || 'Decisor'})` : 'Sem contato nominal'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-300">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {formatPhoneNumber(
                      selectedContact?.whatsapp ||
                        selectedContact?.phone ||
                        selectedCompany.companyWhatsApp ||
                        selectedCompany.companyPhone
                    ) || 'Sem telefone'}
                  </span>
                </div>
              </div>

              {/* Detalhes rápidos: Nicho, Canal Preferencial, Histórico */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-neutral-900/60 p-2 rounded border border-neutral-800/60">
                  <span className="text-[10px] text-neutral-500 block">Nicho / Cidade</span>
                  <span className="font-medium text-neutral-300">
                    {selectedCompany.niche || 'Nicho geral'} • {selectedCompany.city || 'Brasil'}
                  </span>
                </div>

                <div className="bg-neutral-900/60 p-2 rounded border border-neutral-800/60">
                  <span className="text-[10px] text-neutral-500 block">Canal Preferencial</span>
                  <span className="font-medium text-emerald-400 flex items-center gap-1">
                    💬 WhatsApp
                  </span>
                </div>

                <div className="bg-neutral-900/60 p-2 rounded border border-neutral-800/60 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-neutral-500 block">Última Interação</span>
                  <span className="font-medium text-neutral-300">
                    {leadInteractions.length > 0
                      ? formatRelativeDate(leadInteractions[0].timestamp)
                      : 'Nenhuma interação'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bloco 3: Campanha, Tipo de Campanha e Canal */}
        <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>3. Campanha & Canal de Execução</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Campanha (Opcional)"
              value={selectedCampaignId}
              onChange={(e) => handleCampaignChange(e.target.value)}
              options={[
                { value: '', label: 'Nenhuma / Ação Avulsa' },
                ...campaigns.map((c) => ({
                  value: c.id,
                  label: `${c.name} (${c.channel || 'WhatsApp'})`,
                })),
              ]}
            />

            <Select
              label="Tipo de Campanha"
              value={campaignType}
              onChange={(e) => setCampaignType(e.target.value as CampaignType)}
              options={DEFAULT_CAMPAIGN_TYPES.map((ct) => ({
                value: ct.value,
                label: ct.label,
              }))}
            />

            <Select
              label="Canal de Envio *"
              value={channel}
              onChange={(e) => setChannel(e.target.value as ContactChannel)}
              options={CHANNEL_OPTIONS.map((ch) => ({
                value: ch.value,
                label: `${ch.icon} ${ch.label}`,
              }))}
            />
          </div>
        </div>

        {/* Bloco 4: Tipo de Ação e Script de Mensagem */}
        <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>4. Tipo de Ação & Script de Mensagem</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium">
              {compatibleScripts.length} script(s) compatíveis
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tipo de Ação */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">
                Tipo de Ação *
              </label>
              {!isCustomActionType ? (
                <div className="flex gap-2">
                  <select
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500"
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                  >
                    {availableActionTypes.map((act) => (
                      <option key={act} value={act}>
                        {act}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs whitespace-nowrap"
                    onClick={() => setIsCustomActionType(true)}
                  >
                    + Novo Tipo
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={customActionTypeInput}
                    onChange={(e) => setCustomActionTypeInput(e.target.value)}
                    placeholder="Digite o novo tipo de ação..."
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => setIsCustomActionType(false)}
                  >
                    Lista
                  </Button>
                </div>
              )}
            </div>

            {/* Script Filtrado */}
            <Select
              label="Script de Mensagem *"
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              options={
                compatibleScripts.length > 0
                  ? compatibleScripts.map((s) => ({
                      value: s.id,
                      label: `${s.title} (${s.actionType || s.category || 'Geral'})`,
                    }))
                  : [{ value: '', label: '⚠️ Nenhum script para este canal e tipo de ação' }]
              }
            />
          </div>

          {/* Editor da Mensagem Agendada (Snapshot Personalizado) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Mensagem Formatada para Envio (Prévia & Ajuste)</span>
              </label>
              {selectedTemplate && (
                <span className="text-[11px] text-neutral-400">
                  Script base: <strong>{selectedTemplate.title}</strong>
                </span>
              )}
            </div>

            <textarea
              className="w-full h-32 bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm text-neutral-200 font-sans focus:outline-none focus:border-emerald-500 leading-relaxed resize-y"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Digite ou personalize a mensagem para este agendamento..."
              required
            />

            {/* Alertas de Variáveis sem valor no cadastro */}
            {variableResolution.missingVariables.length > 0 && (
              <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Atenção para variáveis sem valor: </span>
                  {variableResolution.missingVariables.map((v) => `{{${v}}}`).join(', ')}.
                  <p className="text-[11px] text-amber-400/80 mt-0.5">
                    Substitua os campos assinalados acima antes de salvar.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Observações Opcionais */}
          <Input
            label="Observações / Notas Internas"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Prospect pediu para enviar pela manhã pois tem reunião às 14h."
          />
        </div>

        {/* Bloco 5: Resumo Claro antes de salvar */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>5. Resumo do Agendamento</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-neutral-400 block text-[10px]">Cliente:</span>
              <strong className="text-neutral-100">{selectedCompany?.name || '—'}</strong>
            </div>

            <div>
              <span className="text-neutral-400 block text-[10px]">Campanha:</span>
              <strong className="text-neutral-100">{selectedCampaign?.name || 'Ação Avulsa'}</strong>
            </div>

            <div>
              <span className="text-neutral-400 block text-[10px]">Tipo de Campanha:</span>
              <strong className="text-neutral-100">
                {CAMPAIGN_TYPE_LABELS[campaignType] || campaignType}
              </strong>
            </div>

            <div>
              <span className="text-neutral-400 block text-[10px]">Canal:</span>
              <strong className="text-emerald-400">
                {CHANNEL_OPTIONS.find((c) => c.value === channel)?.label || channel}
              </strong>
            </div>

            <div>
              <span className="text-neutral-400 block text-[10px]">Tipo de Ação:</span>
              <strong className="text-neutral-100">{effectiveActionType || '—'}</strong>
            </div>

            <div>
              <span className="text-neutral-400 block text-[10px]">Script:</span>
              <strong className="text-neutral-100">{selectedTemplate?.title || 'Personalizado'}</strong>
            </div>

            <div>
              <span className="text-neutral-400 block text-[10px]">Data:</span>
              <strong className="text-neutral-100">{scheduledDate}</strong>
            </div>

            <div>
              <span className="text-neutral-400 block text-[10px]">Hora:</span>
              <strong className="text-neutral-100">{scheduledTime}</strong>
            </div>
          </div>
        </div>

        {/* Ações do Rodapé */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<Calendar className="w-4 h-4" />}
          >
            Salvar e Adicionar à Fila
          </Button>
        </div>
      </form>
    </Modal>
  );
};

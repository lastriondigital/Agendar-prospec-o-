import React, { useMemo, useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Building2,
  Target,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  Zap,
  Info,
  Phone,
  Mail,
  Share2,
  Instagram,
  FileText,
  Layers,
  ChevronDown,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import {
  ContactChannel,
  MessageTemplate,
  ProspectAction,
  Company,
  Contact,
  Lead,
  Client,
  Service,
} from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import {
  ACTION_TYPE_OPTIONS,
  CAMPAIGN_TYPE_OPTIONS,
} from '../../utils/schedulingConfig';
import {
  interpolateMessage,
  validateMessageContent,
  formatPhoneNumber,
  generateWhatsAppLink,
  getChannelBadgeDetails,
} from '../../utils/formatting';
import { calculateLeadScore } from '../../utils/leadScoring';
import { ScoreBadge } from '../qualification/ScoreBadge';
import { STAGES_CONFIG } from '../../utils/constants';

interface ScheduleMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProspectId?: string; // Company ID, Lead ID, or Client ID
  initialClientId?: string; // Alias for initialProspectId
  initialLeadId?: string; // Alias for initialProspectId
  initialCompanyId?: string; // Alias for initialProspectId
  initialCampaignId?: string;
  initialTemplateId?: string;
  initialChannel?: ContactChannel;
  initialActionType?: string;
  initialDate?: string;
  initialTime?: string;
  initialNotes?: string;
  editingAction?: ProspectAction | null;
  onSaved?: (action: ProspectAction) => void;
  onSuccess?: (action: ProspectAction) => void;
}

export const ScheduleMessageModal: React.FC<ScheduleMessageModalProps> = ({
  isOpen,
  onClose,
  initialProspectId,
  initialClientId,
  initialLeadId,
  initialCompanyId,
  initialCampaignId,
  initialTemplateId,
  initialChannel,
  initialActionType,
  initialDate,
  initialTime,
  initialNotes,
  editingAction,
  onSaved,
  onSuccess,
}) => {
  const effectiveInitialProspectId =
    initialProspectId || initialClientId || initialLeadId || initialCompanyId;

  const {
    companies,
    contacts,
    leads,
    clients,
    campaigns,
    services,
    icps,
    templates,
    actions,
    upsertAction,
    settings,
  } = useApp();
  const { success, error, warning } = useToast();

  // Helper date/time functions
  const getTodayDateStr = () => new Date().toISOString().slice(0, 10);
  const getDefaultTimeStr = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 15);
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(Math.floor(d.getMinutes() / 5) * 5).padStart(2, '0');
    return `${hours}:${mins}`;
  };

  // Form State
  const [selectedProspectId, setSelectedProspectId] = useState<string>('');
  const [prospectSearchTerm, setProspectSearchTerm] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [campaignType, setCampaignType] = useState<string>('primeiro_contato');
  const [channel, setChannel] = useState<ContactChannel>('whatsapp');
  const [actionType, setActionType] = useState<string>('primeiro_contato');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isEditingMessage, setIsEditingMessage] = useState<boolean>(false);
  const [scheduledDate, setScheduledDate] = useState<string>(getTodayDateStr());
  const [scheduledTime, setScheduledTime] = useState<string>('10:30');
  const [notes, setNotes] = useState<string>('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search dropdown open state
  const [isProspectDropdownOpen, setIsProspectDropdownOpen] = useState(false);

  // Build Unified Prospect List
  const unifiedProspects = useMemo(() => {
    const list: Array<{
      id: string; // companyId or clientId
      type: 'company' | 'client';
      name: string;
      tradeName?: string;
      contactName?: string;
      contactRole?: string;
      phone?: string;
      whatsapp?: string;
      email?: string;
      niche?: string;
      city?: string;
      stage?: string;
      temperature?: string;
      companyObj?: Company;
      contactObj?: Contact;
      leadObj?: Lead;
      clientObj?: Client;
      score: number;
    }> = [];

    // Map companies
    companies.forEach((comp) => {
      const primaryContact = contacts.find((c) => c.companyId === comp.id && c.isPrimary) || contacts.find((c) => c.companyId === comp.id);
      const lead = leads.find((l) => l.companyId === comp.id);
      const scoreResult = calculateLeadScore(comp, primaryContact, lead, icps, services);

      list.push({
        id: comp.id,
        type: 'company',
        name: comp.name,
        tradeName: comp.tradeName,
        contactName: primaryContact?.name,
        contactRole: primaryContact?.role,
        phone: primaryContact?.phone,
        whatsapp: primaryContact?.whatsapp,
        email: primaryContact?.email,
        niche: comp.niche,
        city: comp.city,
        stage: lead?.stage,
        temperature: lead?.temperature,
        companyObj: comp,
        contactObj: primaryContact,
        leadObj: lead,
        score: scoreResult.score,
      });
    });

    // Add standalone clients if not already in list
    clients.forEach((cli) => {
      const existing = list.find((p) => p.id === cli.id || p.name.toLowerCase() === cli.company.toLowerCase());
      if (!existing) {
        list.push({
          id: cli.id,
          type: 'client',
          name: cli.company || cli.name,
          tradeName: cli.company,
          contactName: cli.name,
          contactRole: cli.role,
          phone: cli.phone,
          whatsapp: cli.whatsapp,
          email: cli.email,
          niche: cli.segment,
          stage: cli.stageId,
          clientObj: cli,
          score: 50,
        });
      }
    });

    return list;
  }, [companies, contacts, leads, clients, icps, services, settings.scoringWeights]);

  // Filtered prospects based on search query
  const filteredProspects = useMemo(() => {
    if (!prospectSearchTerm.trim()) return unifiedProspects.slice(0, 15);
    const q = prospectSearchTerm.toLowerCase();
    return unifiedProspects.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        (p.tradeName && p.tradeName.toLowerCase().includes(q)) ||
        (p.contactName && p.contactName.toLowerCase().includes(q)) ||
        (p.contactRole && p.contactRole.toLowerCase().includes(q)) ||
        (p.niche && p.niche.toLowerCase().includes(q)) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        (p.whatsapp && p.whatsapp.includes(q))
      );
    }).slice(0, 20);
  }, [unifiedProspects, prospectSearchTerm]);

  // Selected Prospect Object
  const selectedProspect = useMemo(() => {
    return unifiedProspects.find((p) => p.id === selectedProspectId) || null;
  }, [unifiedProspects, selectedProspectId]);

  // Selected Service (from company, lead or campaign)
  const selectedService = useMemo(() => {
    if (selectedProspect?.leadObj?.serviceId) {
      const s = services.find((srv) => srv.id === selectedProspect.leadObj?.serviceId);
      if (s) return s;
    }
    if (selectedCampaignId) {
      const cmp = campaigns.find((c) => c.id === selectedCampaignId);
      if (cmp?.serviceId) {
        const s = services.find((srv) => srv.id === cmp.serviceId);
        if (s) return s;
      }
    }
    return services[0] || null;
  }, [selectedProspect, selectedCampaignId, campaigns, services]);

  // Initialize/Reset form on open or editingAction change
  useEffect(() => {
    if (isOpen) {
      if (editingAction) {
        setSelectedProspectId(editingAction.clientId || editingAction.companyId || '');
        setSelectedCampaignId(editingAction.campaignId || '');
        setCampaignType(editingAction.campaignType || 'primeiro_contato');
        setChannel(editingAction.channel || 'whatsapp');
        setActionType(editingAction.actionType || 'primeiro_contato');
        setSelectedTemplateId(editingAction.templateId || editingAction.scriptId || '');
        setCustomMessage(editingAction.customMessage || '');
        setScheduledDate(editingAction.scheduledDate || getTodayDateStr());
        setScheduledTime(editingAction.scheduledTime || '10:30');
        setNotes(editingAction.notes || '');
        setPriority(editingAction.priority || 'medium');
      } else {
        const defaultProspectId = effectiveInitialProspectId || unifiedProspects[0]?.id || '';
        setSelectedProspectId(defaultProspectId);
        setSelectedCampaignId(initialCampaignId || '');
        setCampaignType(initialActionType || 'primeiro_contato');
        setChannel(initialChannel || 'whatsapp');
        setActionType(initialActionType || 'primeiro_contato');
        setSelectedTemplateId(initialTemplateId || templates[0]?.id || '');
        setCustomMessage('');
        setScheduledDate(initialDate || getTodayDateStr());
        setScheduledTime(initialTime || '10:30');
        setNotes(initialNotes || '');
        setPriority('medium');
      }
      setIsEditingMessage(false);
      setProspectSearchTerm('');
      setIsProspectDropdownOpen(false);
    }
  }, [
    isOpen,
    editingAction,
    initialProspectId,
    initialCampaignId,
    initialTemplateId,
    initialChannel,
    initialActionType,
    initialDate,
    initialTime,
    initialNotes,
    unifiedProspects,
    templates,
  ]);

  // When Campaign changes, update default channel, campaign type, and suggested template
  const handleCampaignChange = (cId: string) => {
    setSelectedCampaignId(cId);
    if (!cId) return;

    const cmp = campaigns.find((c) => c.id === cId);
    if (cmp) {
      if (cmp.channel) setChannel(cmp.channel);
      if (cmp.campaignType) setCampaignType(cmp.campaignType);
      if (cmp.defaultTemplateId) setSelectedTemplateId(cmp.defaultTemplateId);

      // Check if campaign has sequence steps
      if (cmp.sequence && cmp.sequence.length > 0) {
        const firstStep = cmp.sequence[0];
        if (firstStep.actionType) setActionType(firstStep.actionType);
        if (firstStep.templateId) setSelectedTemplateId(firstStep.templateId);
        if (firstStep.channel) setChannel(firstStep.channel);
      }
    }
  };

  // Filtered Message Templates for current Channel & Action Type
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (t.isArchived) return false;
      // Match channel if template channel matches
      const channelMatch = !t.channel || t.channel === channel;
      return channelMatch;
    });
  }, [templates, channel]);

  // Selected Template Object
  const selectedTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || null;
  }, [templates, selectedTemplateId]);

  // Live Interpolated Message
  const rawMessageToRender = useMemo(() => {
    if (customMessage.trim().length > 0) {
      return customMessage;
    }
    if (selectedTemplate) {
      return selectedTemplate.content;
    }
    return 'Olá {{primeiro_nome}}, tudo bem? Notei que a {{empresa}} tem grande potencial em {{servico}}. {{cta}}';
  }, [customMessage, selectedTemplate]);

  const liveRenderedMessage = useMemo(() => {
    return interpolateMessage(
      rawMessageToRender,
      selectedProspect?.clientObj,
      selectedService,
      selectedProspect?.companyObj,
      selectedProspect?.contactObj
    );
  }, [rawMessageToRender, selectedProspect, selectedService]);

  // Validation
  const validation = useMemo(() => {
    return validateMessageContent(rawMessageToRender, {
      company: selectedProspect?.companyObj,
      contact: selectedProspect?.contactObj,
      service: selectedService,
    });
  }, [rawMessageToRender, selectedProspect, selectedService]);

  // Duplicate Check: is there already an action scheduled for this prospect on this date & channel?
  const duplicateConflict = useMemo(() => {
    if (!selectedProspectId || !scheduledDate) return null;
    return (
      actions.find(
        (a) =>
          a.id !== editingAction?.id &&
          (a.clientId === selectedProspectId || a.companyId === selectedProspectId) &&
          a.scheduledDate === scheduledDate &&
          a.channel === channel &&
          a.status === 'pending'
      ) || null
    );
  }, [actions, selectedProspectId, scheduledDate, channel, editingAction]);

  // Labels for Summary
  const campaignLabel = useMemo(() => {
    if (!selectedCampaignId) return 'Avulsa / Nenhuma campanha';
    const c = campaigns.find((cmp) => cmp.id === selectedCampaignId);
    return c ? c.name : 'Avulsa';
  }, [campaigns, selectedCampaignId]);

  const campaignTypeLabel = useMemo(() => {
    const ct = CAMPAIGN_TYPE_OPTIONS.find((c) => c.id === campaignType);
    return ct ? ct.label : campaignType || 'Primeiro contato';
  }, [campaignType]);

  const actionTypeLabel = useMemo(() => {
    const at = ACTION_TYPE_OPTIONS.find((a) => a.id === actionType);
    return at ? at.label : actionType || 'Primeiro contato';
  }, [actionType]);

  const scriptLabel = useMemo(() => {
    if (customMessage.trim().length > 0) return 'Mensagem personalizada';
    if (selectedTemplate) return `${selectedTemplate.title} (${selectedTemplate.version || 'v1.0'})`;
    return 'Script padrão';
  }, [customMessage, selectedTemplate]);

  const channelBadge = useMemo(() => {
    return getChannelBadgeDetails(channel);
  }, [channel]);

  // Quick Date Selectors
  const setQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setScheduledDate(d.toISOString().slice(0, 10));
  };

  // Submit Handler
  const handleSave = async (executeNow: boolean = false) => {
    if (!selectedProspectId) {
      error('Por favor, selecione um Cliente/Prospect.');
      return;
    }
    if (!scheduledDate) {
      error('Por favor, defina a data de agendamento.');
      return;
    }
    if (!scheduledTime) {
      error('Por favor, defina o horário de agendamento.');
      return;
    }

    try {
      setIsSubmitting(true);

      const actionId = editingAction?.id || `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const now = new Date().toISOString();

      const actionToSave: ProspectAction = {
        id: actionId,
        clientId: selectedProspectId,
        companyId: selectedProspect?.companyObj?.id || selectedProspectId,
        contactId: selectedProspect?.contactObj?.id,
        campaignId: selectedCampaignId || undefined,
        campaignType: campaignTypeLabel,
        actionType: actionTypeLabel,
        templateId: selectedTemplateId || undefined,
        scriptId: selectedTemplateId || undefined,
        scriptTitle: scriptLabel,
        channel,
        scheduledDate,
        scheduledTime,
        status: 'pending',
        priority,
        estMinutes: settings.estMinutesPerAction || 2,
        customMessage: customMessage.trim() || undefined,
        notes: notes.trim() || undefined,
        createdAt: editingAction?.createdAt || now,
        updatedAt: now,
      };

      await upsertAction(actionToSave);

      if (onSaved) {
        onSaved(actionToSave);
      }
      if (onSuccess) {
        onSuccess(actionToSave);
      }

      success('Mensagem agendada com sucesso!', `${selectedProspect?.name} em ${scheduledDate} às ${scheduledTime}`);

      if (executeNow) {
        const phone = selectedProspect?.whatsapp || selectedProspect?.phone;
        if (channel === 'whatsapp' && phone) {
          const link = generateWhatsAppLink(phone, liveRenderedMessage);
          window.open(link, '_blank');
        }
      }

      onClose();
    } catch (err) {
      console.error(err);
      error('Erro ao agendar mensagem', (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingAction ? 'Editar Agendamento de Mensagem' : 'Agendar Mensagem de Prospecção'}
      maxWidth="xl"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
        {/* 1. SELEÇÃO DE CLIENTE / PROSPECT */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            1. Cliente / Prospect <span className="text-rose-400">*</span>
          </label>

          {/* Prospect Selector with Search */}
          <div className="relative">
            {selectedProspect ? (
              <div className="p-3 bg-neutral-900/90 border border-neutral-700/80 rounded-xl flex items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
                    {selectedProspect.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-neutral-100 truncate">
                        {selectedProspect.name}
                      </span>
                      {selectedProspect.tradeName && selectedProspect.tradeName !== selectedProspect.name && (
                        <span className="text-xs text-neutral-400">
                          ({selectedProspect.tradeName})
                        </span>
                      )}
                      <ScoreBadge score={selectedProspect.score} size="sm" />
                      {selectedProspect.stage && STAGES_CONFIG[selectedProspect.stage as keyof typeof STAGES_CONFIG] && (
                        <Badge variant="blue" size="sm">
                          {STAGES_CONFIG[selectedProspect.stage as keyof typeof STAGES_CONFIG]?.label}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-400 mt-0.5 flex-wrap">
                      {selectedProspect.contactName && (
                        <span className="flex items-center gap-1 text-neutral-300">
                          <User className="w-3 h-3 text-blue-400" />
                          {selectedProspect.contactName}
                          {selectedProspect.contactRole && ` • ${selectedProspect.contactRole}`}
                        </span>
                      )}
                      {selectedProspect.whatsapp && (
                        <span className="flex items-center gap-1 text-emerald-400 font-mono">
                          <MessageSquare className="w-3 h-3" />
                          {formatPhoneNumber(selectedProspect.whatsapp)}
                        </span>
                      )}
                      {selectedProspect.niche && (
                        <span className="text-neutral-500">
                          Nicho: {selectedProspect.niche}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsProspectDropdownOpen(true);
                    setProspectSearchTerm('');
                  }}
                  className="shrink-0 text-xs"
                >
                  Alterar
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  placeholder="Buscar prospect por nome, empresa, nicho ou telefone..."
                  value={prospectSearchTerm}
                  onChange={(e) => {
                    setProspectSearchTerm(e.target.value);
                    setIsProspectDropdownOpen(true);
                  }}
                  onFocus={() => setIsProspectDropdownOpen(true)}
                  leftIcon={<Search className="w-4 h-4 text-neutral-400" />}
                />
              </div>
            )}

            {/* Dropdown popup for searching & selecting prospect */}
            {isProspectDropdownOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
                <div className="p-2 border-b border-neutral-800 bg-neutral-950/60 sticky top-0">
                  <Input
                    placeholder="Digite para filtrar..."
                    value={prospectSearchTerm}
                    onChange={(e) => setProspectSearchTerm(e.target.value)}
                    autoFocus
                    leftIcon={<Search className="w-3.5 h-3.5 text-neutral-400" />}
                  />
                </div>

                <div className="divide-y divide-neutral-800/60">
                  {filteredProspects.length > 0 ? (
                    filteredProspects.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedProspectId(p.id);
                          setIsProspectDropdownOpen(false);
                          setProspectSearchTerm('');
                        }}
                        className={`w-full text-left p-2.5 hover:bg-neutral-800/80 transition-colors flex items-center justify-between gap-2 ${
                          selectedProspectId === p.id ? 'bg-blue-950/40 border-l-2 border-blue-500' : ''
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-neutral-200 truncate">
                              {p.name}
                            </span>
                            {p.contactName && (
                              <span className="text-[11px] text-neutral-400 truncate">
                                ({p.contactName})
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-neutral-400 flex items-center gap-2 mt-0.5">
                            {p.niche && <span>{p.niche}</span>}
                            {p.city && <span>• {p.city}</span>}
                            {p.whatsapp && <span className="text-emerald-400 font-mono">{p.whatsapp}</span>}
                          </div>
                        </div>
                        <ScoreBadge score={p.score} size="sm" />
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-neutral-400">
                      Nenhum prospect encontrado para "{prospectSearchTerm}".
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Conflict Warning */}
          {duplicateConflict && (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <span className="font-semibold">Atenção (Possível Duplicidade):</span> Já existe uma ação agendada para este prospect nesta mesma data ({scheduledDate}) via {channelBadge.label}.
              </div>
            </div>
          )}
        </div>

        {/* 2. CAMPANHA & TIPO DE CAMPANHA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-800/80">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              2. Campanha
            </label>
            <select
              value={selectedCampaignId}
              onChange={(e) => handleCampaignChange(e.target.value)}
              className="w-full h-9 rounded-lg bg-neutral-900 border border-neutral-700 px-3 text-xs text-neutral-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">(Avulsa / Nenhuma campanha)</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  🎯 {c.name} ({c.channel})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-neutral-500 mt-1">
              Vincula o agendamento à meta e sequência de uma campanha ativa.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              3. Tipo de Campanha
            </label>
            <select
              value={campaignType}
              onChange={(e) => setCampaignType(e.target.value)}
              className="w-full h-9 rounded-lg bg-neutral-900 border border-neutral-700 px-3 text-xs text-neutral-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              {CAMPAIGN_TYPE_OPTIONS.map((ct) => (
                <option key={ct.id} value={ct.id}>
                  {ct.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-neutral-500 mt-1">
              Objetivo macro da estratégia de contato.
            </p>
          </div>
        </div>

        {/* 3. CANAL & TIPO DE AÇÃO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-800/80">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              4. Canal de Contato <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'hover:border-emerald-500 text-emerald-400' },
                { id: 'linkedin', label: 'LinkedIn', icon: Share2, color: 'hover:border-sky-500 text-sky-400' },
                { id: 'email', label: 'E-mail', icon: Mail, color: 'hover:border-blue-500 text-blue-400' },
                { id: 'call', label: 'Ligação', icon: Phone, color: 'hover:border-amber-500 text-amber-400' },
                { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'hover:border-pink-500 text-pink-400' },
              ].map((c) => {
                const IconComponent = c.icon;
                const isSelected = channel === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setChannel(c.id as ContactChannel)}
                    className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-neutral-100 shadow-sm'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5 shrink-0" />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              5. Tipo de Ação <span className="text-rose-400">*</span>
            </label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="w-full h-9 rounded-lg bg-neutral-900 border border-neutral-700 px-3 text-xs text-neutral-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              {ACTION_TYPE_OPTIONS.map((at) => (
                <option key={at.id} value={at.id}>
                  {at.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-neutral-500 mt-1">
              Finalidade específica da mensagem neste passo.
            </p>
          </div>
        </div>

        {/* 4. SCRIPT DE MENSAGEM & PRÉ-VISUALIZAÇÃO */}
        <div className="space-y-3 pt-2 border-t border-neutral-800/80">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              6. Script de Mensagem
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditingMessage(!isEditingMessage)}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                {isEditingMessage ? 'Usar Script Selecionado' : 'Personalizar Texto'}
              </button>
            </div>
          </div>

          {!isEditingMessage ? (
            <div className="space-y-2">
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full h-9 rounded-lg bg-neutral-900 border border-neutral-700 px-3 text-xs text-neutral-200 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">(Selecione um Script da Biblioteca)</option>
                {filteredTemplates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    📄 {tpl.title} ({tpl.version || 'v1.0'}) [{tpl.category}]
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Escreva a mensagem personalizada. Use {{primeiro_nome}}, {{empresa}}, {{cidade}}, {{servico}}, {{cta}}..."
                rows={4}
                className="w-full rounded-lg bg-neutral-900 border border-neutral-700 p-2.5 text-xs text-neutral-200 focus:outline-none focus:border-blue-500 transition-colors font-mono"
              />
              <p className="text-[10px] text-neutral-500">
                Variáveis permitidas: {'{{nome}}'}, {'{{primeiro_nome}}'}, {'{{empresa}}'}, {'{{cidade}}'}, {'{{servico}}'}, {'{{problema}}'}, {'{{beneficio}}'}, {'{{preco}}'}, {'{{cta}}'}.
              </p>
            </div>
          )}

          {/* Validation warnings */}
          {validation.warnings.length > 0 && (
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 space-y-0.5">
              {validation.warnings.map((w, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}

          {/* Live Preview Box */}
          <div className="p-3 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span className="font-semibold text-neutral-300 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                Pré-visualização da Mensagem (Variáveis Resolvidas):
              </span>
              <span className="font-mono text-[10px] text-neutral-500">
                {liveRenderedMessage.length} caracteres
              </span>
            </div>
            <div className="p-2.5 bg-neutral-900/90 rounded-lg text-xs text-neutral-200 whitespace-pre-wrap font-sans leading-relaxed border border-neutral-800/80 shadow-inner">
              {liveRenderedMessage}
            </div>
          </div>
        </div>

        {/* 5. DATA & HORA DE EXECUÇÃO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-800/80">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              7. Data de Execução <span className="text-rose-400">*</span>
            </label>
            <Input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
              leftIcon={<Calendar className="w-4 h-4 text-neutral-400" />}
            />
            {/* Quick date shortcuts */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <button
                type="button"
                onClick={() => setQuickDate(0)}
                className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(1)}
                className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors"
              >
                Amanhã
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(2)}
                className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors"
              >
                +2 dias
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(7)}
                className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors"
              >
                +1 semana
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              8. Hora de Execução <span className="text-rose-400">*</span>
            </label>
            <Input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              required
              leftIcon={<Clock className="w-4 h-4 text-neutral-400" />}
            />
            {/* Quick time shortcuts */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {['09:00', '10:30', '14:00', '16:30', '18:00'].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setScheduledTime(time)}
                  className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors"
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 6. OBSERVAÇÕES */}
        <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
          <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            9. Observações & Instruções Táticas (Opcional)
          </label>
          <Input
            placeholder="Ex: Prospect pediu para enfatizar o tempo de entrega na segunda mensagem..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* 7. RESUMO ESTRUTURADO CLARO ANTES DE SALVAR */}
        <div className="p-4 bg-gradient-to-br from-neutral-900 to-neutral-950 border-2 border-blue-500/30 rounded-xl space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              Resumo do Agendamento
            </h4>
            <Badge variant="blue" size="sm">
              Pronto para Agendar
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div>
              <span className="text-neutral-400">Cliente / Prospect:</span>
              <p className="font-semibold text-neutral-100">
                {selectedProspect?.name || 'Não selecionado'}
                {selectedProspect?.contactName && ` (${selectedProspect.contactName})`}
              </p>
            </div>

            <div>
              <span className="text-neutral-400">Campanha:</span>
              <p className="font-semibold text-neutral-100">{campaignLabel}</p>
            </div>

            <div>
              <span className="text-neutral-400">Tipo de Campanha:</span>
              <p className="font-semibold text-neutral-100">{campaignTypeLabel}</p>
            </div>

            <div>
              <span className="text-neutral-400">Canal:</span>
              <p className="font-semibold text-neutral-100 flex items-center gap-1.5">
                <span className={`inline-block w-2 h-2 rounded-full ${channel === 'whatsapp' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                {channelBadge.label}
              </p>
            </div>

            <div>
              <span className="text-neutral-400">Tipo de Ação:</span>
              <p className="font-semibold text-neutral-100">{actionTypeLabel}</p>
            </div>

            <div>
              <span className="text-neutral-400">Script de Mensagem:</span>
              <p className="font-semibold text-neutral-100">{scriptLabel}</p>
            </div>

            <div>
              <span className="text-neutral-400">Data:</span>
              <p className="font-semibold text-neutral-100">
                {scheduledDate ? new Date(scheduledDate + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
              </p>
            </div>

            <div>
              <span className="text-neutral-400">Hora:</span>
              <p className="font-semibold text-neutral-100 font-mono">{scheduledTime || '10:30'}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>

          <div className="flex items-center gap-2">
            {channel === 'whatsapp' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSave(true)}
                isLoading={isSubmitting}
                leftIcon={<Send className="w-4 h-4 text-emerald-400" />}
                className="border-emerald-500/40 hover:bg-emerald-950/30 text-emerald-300"
              >
                Agendar & Abrir WhatsApp
              </Button>
            )}

            <Button
              type="button"
              variant="primary"
              onClick={() => handleSave(false)}
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              {editingAction ? 'Salvar Alterações' : 'Confirmar Agendamento'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

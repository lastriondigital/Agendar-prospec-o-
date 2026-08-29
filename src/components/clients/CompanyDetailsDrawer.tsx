import React, { useState } from 'react';
import {
  Archive,
  ArchiveRestore,
  Building2,
  Calendar,
  Check,
  Clock,
  Copy,
  Edit2,
  ExternalLink,
  Flame,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Send,
  Share2,
  Sparkles,
  Thermometer,
  Trash2,
  User,
  UserCheck,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useConfirm } from '../../context/ConfirmDialogContext';
import { useToast } from '../../context/ToastContext';
import { Company, Contact, HistoryEvent, Lead, LeadStage } from '../../types';
import { ALL_LEAD_STAGES, STAGES_CONFIG } from '../../utils/constants';
import { cleanPhoneNumberDigits, formatPhoneNumber, formatRelativeDate, generateWhatsAppLink } from '../../utils/formatting';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { AddContactModal } from './AddContactModal';
import { ScheduleActionModal } from './ScheduleActionModal';
import { LogInteractionModal } from './LogInteractionModal';
import { ScoreBadge } from '../qualification/ScoreBadge';
import { calculateLeadScore } from '../../utils/leadScoring';
import { resolveCommercialContext } from '../../utils/commercialPersonalization';
import { LeadMessageModal } from '../qualification/LeadMessageModal';
import { QualificationModal } from '../qualification/QualificationModal';
import { CopilotActionButtons } from '../copilot/CopilotActionButtons';
import { CopilotAssistantModal } from '../copilot/CopilotAssistantModal';
import { CopilotActionType } from '../../types';
import { ApproachRecommendationCard } from '../sales/ApproachRecommendationCard';
import { ScheduleMessageModal } from '../scheduling/ScheduleMessageModal';

interface CompanyDetailsDrawerProps {
  company: Company | null;
  onClose: () => void;
  onEditCompany: (company: Company) => void;
}

export const CompanyDetailsDrawer: React.FC<CompanyDetailsDrawerProps> = ({
  company,
  onClose,
  onEditCompany,
}) => {
  const {
    contacts,
    leads,
    services,
    icps,
    settings,
    history,
    advanceLeadStage,
    scheduleNextAction,
    addHistoryEvent,
    addContactToCompany,
    updateContact,
    archiveContact,
    unarchiveContact,
    setPrimaryContact,
    deleteContact,
    archiveCompany,
    unarchiveCompany,
    deleteCompany,
  } = useApp();

  const confirm = useConfirm();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'approach' | 'contacts' | 'history'>('overview');
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isScheduleMessageModalOpen, setIsScheduleMessageModalOpen] = useState(false);
  const [isLogInteractionOpen, setIsLogInteractionOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageTargetContactId, setMessageTargetContactId] = useState<string | undefined>(undefined);
  const [isQualificationOpen, setIsQualificationOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotInitialAction, setCopilotInitialAction] = useState<CopilotActionType>('PERSONALIZAR');
  const [quickNote, setQuickNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [copiedContactPhoneId, setCopiedContactPhoneId] = useState<string | null>(null);

  if (!company) return null;

  const companyContacts = contacts.filter((c) => c.companyId === company.id);
  const primaryContact = companyContacts.find((c) => c.isPrimary && c.status !== 'archived') ||
    companyContacts.find((c) => c.status !== 'archived') ||
    companyContacts[0];
  const companyLead = leads.find((l) => l.companyId === company.id);
  const companyHistory = history.filter((h) => h.companyId === company.id);

  // Calcula pontuação real e explicável
  const leadScoreResult = companyLead
    ? calculateLeadScore(company, primaryContact, companyLead, icps, services, companyHistory, settings.scoringWeights)
    : null;

  // Resolve contexto comercial em 6 níveis hierárquicos
  const commercialContext = resolveCommercialContext({
    company,
    contact: primaryContact,
    lead: companyLead,
    service: services.find((s) => s.id === companyLead?.serviceId) || null,
    campaign: null,
    icp: icps.find((i) => i.id === companyLead?.icpId) || null,
    settings: settings.commercialPersonalization || null,
  });

  const stageKey: LeadStage = companyLead?.stage || 'NOVO';
  const stageDef = STAGES_CONFIG[stageKey] || STAGES_CONFIG['NOVO'];

  const handleStageChange = async (newStage: LeadStage) => {
    if (!companyLead) return;
    await advanceLeadStage(companyLead.id, newStage);
  };

  const handleQuickAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim() || !companyLead) return;

    try {
      setIsAddingNote(true);
      await advanceLeadStage(companyLead.id, stageKey, quickNote.trim());
      setQuickNote('');
      success('Nota adicionada ao histórico');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDeleteCompany = () => {
    confirm({
      title: `Excluir ${company.name}?`,
      message:
        'Esta ação removerá permanentemente a empresa, todos os contatos vinculados, o lead e o histórico de interações.',
      confirmText: 'Sim, excluir definitivamente',
      cancelText: 'Cancelar',
      isDestructive: true,
      onConfirm: async () => {
        await deleteCompany(company.id);
        onClose();
      },
    });
  };

  const handleToggleArchive = () => {
    if (company.status === 'archived') {
      unarchiveCompany(company.id);
    } else {
      confirm({
        title: `Arquivar ${company.name}?`,
        message: 'A empresa será ocultada da lista ativa, mas poderá ser recuperada a qualquer momento.',
        confirmText: 'Arquivar empresa',
        cancelText: 'Cancelar',
        onConfirm: async () => {
          await archiveCompany(company.id);
        },
      });
    }
  };

  const handleDeleteContact = (c: Contact) => {
    confirm({
      title: `Remover contacto ${c.name}?`,
      message: `Tem certeza de que deseja excluir permanentemente o contacto ${c.name} da empresa?`,
      confirmText: 'Excluir definitivamente',
      cancelText: 'Cancelar',
      isDestructive: true,
      onConfirm: async () => {
        await deleteContact(c.id, company.id);
      },
    });
  };

  const handleToggleArchiveContact = async (c: Contact) => {
    if (c.status === 'archived') {
      await unarchiveContact(c.id, company.id);
    } else {
      confirm({
        title: `Arquivar contacto ${c.name}?`,
        message: 'O contacto será ocultado da lista ativa, mas seu histórico permanecerá salvo.',
        confirmText: 'Arquivar contacto',
        cancelText: 'Cancelar',
        onConfirm: async () => {
          await archiveContact(c.id, company.id);
        },
      });
    }
  };

  const handleCopyPhone = async (contactId: string, phoneStr?: string) => {
    if (!phoneStr) return;
    try {
      await navigator.clipboard.writeText(phoneStr);
      setCopiedContactPhoneId(contactId);
      success(`Número copiado: ${formatPhoneNumber(phoneStr)}`);
      setTimeout(() => setCopiedContactPhoneId(null), 2000);
    } catch {
      error('Falha ao copiar número de telefone');
    }
  };

  const handleOpenMessageForContact = (contactId?: string) => {
    setMessageTargetContactId(contactId);
    setIsMessageModalOpen(true);
  };

  const handleOpenCompanyWhatsApp = () => {
    const rawPhone = company.companyWhatsApp || company.companyPhone;
    if (!rawPhone) {
      error('Empresa não possui WhatsApp ou telefone corporativo cadastrado.');
      return;
    }
    const cleanDigits = cleanPhoneNumberDigits(rawPhone);
    const link = `https://wa.me/${cleanDigits}`;
    window.open(link, '_blank');
  };

  return (
    <div
      id="company-details-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="company-details-drawer-panel"
        className="w-full max-w-2xl bg-white dark:bg-[#181B20] border-l border-[#E6E8EB] dark:border-[#2D3139] h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="p-5 bg-[#F7F8FA] dark:bg-[#15171B] border-b border-[#E6E8EB] dark:border-[#2D3139] shrink-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center text-[#3F6FB5] dark:text-blue-300 font-bold text-lg">
                {company.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-[#202124] dark:text-[#E8EAED]">{company.name}</h2>
                  {company.status === 'archived' && (
                    <Badge variant="neutral" size="sm">
                      Arquivado
                    </Badge>
                  )}
                  {company.status === 'client' && (
                    <Badge variant="emerald" size="sm">
                      Cliente Fechado
                    </Badge>
                  )}
                </div>
                {company.tradeName && (
                  <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] font-medium">({company.tradeName})</p>
                )}
                <div className="flex items-center gap-2 text-xs text-[#5F6368] dark:text-[#9AA0A6] mt-1">
                  <span>{company.niche}</span>
                  <span>•</span>
                  <span>{company.city}, {company.country}</span>
                  {company.unitsCount && company.unitsCount > 1 && (
                    <>
                      <span>•</span>
                      <span className="text-[#3F6FB5] dark:text-blue-300">{company.unitsCount} unidades</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED] hover:bg-neutral-100 dark:hover:bg-[#20242A] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Stage Selector & Scores */}
          <div className="mt-4 pt-3 border-t border-[#ECEEF1] dark:border-[#2D3139] flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#5F6368] dark:text-[#9AA0A6] font-medium">Estágio:</span>
              <select
                value={stageKey}
                onChange={(e) => handleStageChange(e.target.value as LeadStage)}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-[#1E2228] border border-[#DADDE1] dark:border-[#2D3139] text-[#202124] dark:text-[#E8EAED] focus:outline-none focus:border-[#3F6FB5] cursor-pointer"
              >
                {ALL_LEAD_STAGES.map((stg) => (
                  <option key={stg} value={stg}>
                    {STAGES_CONFIG[stg].order}. {STAGES_CONFIG[stg].label}
                  </option>
                ))}
              </select>

              {companyLead && (
                <>
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => handleOpenMessageForContact(primaryContact?.id)}
                    leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                    className="ml-2"
                  >
                    Preparar Mensagem
                  </Button>

                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => setIsQualificationOpen(true)}
                    leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                  >
                    Qualificar Lead
                  </Button>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs">
              {companyLead?.temperature && (
                <div className="flex items-center gap-1 font-medium">
                  {companyLead.temperature === 'quente' ? (
                    <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-current" /> Quente
                    </span>
                  ) : companyLead.temperature === 'morno' ? (
                    <span className="text-[#3F6FB5] dark:text-blue-300 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> Morno
                    </span>
                  ) : (
                    <span className="text-[#5F6368] dark:text-[#9AA0A6] flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5" /> Frio
                    </span>
                  )}
                </div>
              )}

              {leadScoreResult ? (
                <ScoreBadge
                  score={leadScoreResult.score}
                  size="sm"
                  interactive
                  scoreResult={leadScoreResult}
                  companyName={company.name}
                  showLabel
                />
              ) : companyLead?.score !== undefined ? (
                <div className="flex items-center gap-1.5 font-mono text-[#202124] dark:text-[#E8EAED]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-bold">{companyLead.score} pts</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-[#E6E8EB] dark:border-[#2D3139] bg-white dark:bg-[#181B20] flex gap-4 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 text-xs border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#3F6FB5] text-[#3F6FB5] dark:text-blue-400 font-semibold'
                : 'border-transparent text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Visão Geral & Lead
          </button>

          <button
            onClick={() => setActiveTab('approach')}
            className={`py-3 text-xs border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'approach'
                ? 'border-[#3F6FB5] text-[#3F6FB5] dark:text-blue-400 font-semibold'
                : 'border-transparent text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#3F6FB5]" />
            Recomendação de Abordagem (7 Pilares)
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-3 text-xs border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'contacts'
                ? 'border-[#3F6FB5] text-[#3F6FB5] dark:text-blue-400 font-semibold'
                : 'border-transparent text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Contactos ({companyContacts.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 text-xs border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'border-[#3F6FB5] text-[#3F6FB5] dark:text-blue-400 font-semibold'
                : 'border-transparent text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Histórico & Timeline ({companyHistory.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB: RECOMENDAÇÃO DE ABORDAGEM (7 PILARES) */}
          {activeTab === 'approach' && (
            <div className="space-y-4">
              <ApproachRecommendationCard
                company={company}
                contact={primaryContact}
                lead={companyLead}
              />
            </div>
          )}

          {/* TAB 1: VISÃO GERAL */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Sales Engine: Recomendação de Abordagem Direta */}
              <ApproachRecommendationCard
                company={company}
                contact={primaryContact}
                lead={companyLead}
              />

              {/* Copiloto de Prospecção Gemini */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3F6FB5] dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#3F6FB5] dark:text-blue-400" />
                    Copiloto de Prospecção
                  </span>
                  <span className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">
                    Análise e Estratégia sem Disparo Automático
                  </span>
                </div>
                <CopilotActionButtons
                  size="xs"
                  onSelectAction={(action) => {
                    setCopilotInitialAction(action);
                    setIsCopilotOpen(true);
                  }}
                />
              </div>

              {/* Próxima Ação em Destaque */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Próxima Ação Agendada
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsScheduleMessageModalOpen(true)}
                      className="text-xs h-7 px-2"
                      leftIcon={<Clock className="w-3.5 h-3.5" />}
                    >
                      Agendar Mensagem
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsScheduleOpen(true)}
                      className="text-xs h-7 px-2"
                    >
                      Ação Rápida
                    </Button>
                  </div>
                </div>

                {companyLead?.nextActionTitle ? (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#202124] dark:text-[#E8EAED]">{companyLead.nextActionTitle}</p>
                    <div className="flex items-center gap-3 text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#80868B]" />
                        {companyLead.nextActionDate || 'Data a definir'}
                      </span>
                      <span>•</span>
                      <span className="uppercase font-mono text-[11px] text-[#202124] dark:text-[#E8EAED]">
                        Via {companyLead.nextActionChannel || 'WhatsApp'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#80868B]">Nenhuma ação planejada no momento.</p>
                )}
              </div>

              {/* Detalhes do Lead */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] space-y-3 shadow-xs">
                <h3 className="text-xs font-semibold text-[#5F6368] dark:text-[#9AA0A6] uppercase tracking-wider">
                  Qualificação & Estratégia
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[#5F6368] dark:text-[#9AA0A6] block">Serviço de Interesse:</span>
                    <span className="font-medium text-[#202124] dark:text-[#E8EAED]">
                      {companyLead?.serviceName || 'A definir'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#5F6368] dark:text-[#9AA0A6] block">Origem do Lead:</span>
                    <span className="font-medium text-[#202124] dark:text-[#E8EAED]">
                      {companyLead?.source || 'Outbound Direto'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#5F6368] dark:text-[#9AA0A6] block">Prioridade:</span>
                    <span className="font-medium text-[#202124] dark:text-[#E8EAED] capitalize">
                      {companyLead?.priority || 'Média'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#5F6368] dark:text-[#9AA0A6] block">Data de Entrada:</span>
                    <span className="font-medium text-[#202124] dark:text-[#E8EAED]">
                      {companyLead?.entryDate || company.createdAt?.slice(0, 10) || '—'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#5F6368] dark:text-[#9AA0A6] block">Último Contato:</span>
                    <span className="font-medium text-[#202124] dark:text-[#E8EAED]">
                      {companyLead?.lastContactDate || 'Ainda não contatado'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#5F6368] dark:text-[#9AA0A6] block">Nº de Unidades:</span>
                    <span className="font-medium text-[#202124] dark:text-[#E8EAED]">{company.unitsCount || 1}</span>
                  </div>
                </div>

                {companyLead?.notes && (
                  <div className="pt-2 border-t border-[#ECEEF1] dark:border-[#2D3139] text-xs">
                    <span className="text-[#5F6368] dark:text-[#9AA0A6] block mb-1">Notas do Lead:</span>
                    <p className="text-[#202124] dark:text-[#E8EAED] whitespace-pre-wrap">{companyLead.notes}</p>
                  </div>
                )}
              </div>

              {/* Perfil de Mercado & Personalização Comercial */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-[#3F6FB5] dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    Perfil de Mercado & Estratégia Comercial
                  </h3>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => onEditCompany(company)}
                    leftIcon={<Edit2 className="w-3 h-3" />}
                    className="text-[11px]"
                  >
                    Editar Perfil
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[#5F6368] dark:text-[#9AA0A6] block">País / Moeda:</span>
                    <span className="font-medium text-[#202124] dark:text-[#E8EAED]">
                      {commercialContext.country} • {commercialContext.currency} ({commercialContext.currencySymbol})
                    </span>
                  </div>

                  <div>
                    <span className="text-[#5F6368] dark:text-[#9AA0A6] block">Idioma de Abordagem:</span>
                    <span className="font-medium text-[#202124] dark:text-[#E8EAED]">
                      {commercialContext.language}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#5F6368] dark:text-[#9AA0A6] block">Nível de Formalidade:</span>
                    <span className="font-medium text-[#202124] dark:text-[#E8EAED] capitalize">
                      {commercialContext.formalityLevel}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#5F6368] dark:text-[#9AA0A6] block">Tratamento do Contacto:</span>
                    <span className="font-medium text-[#202124] dark:text-[#E8EAED]">
                      {commercialContext.salutation} ({commercialContext.contactFirstName})
                    </span>
                  </div>

                  <div>
                    <span className="text-[#5F6368] dark:text-[#9AA0A6] block">Preço do Serviço Alvo:</span>
                    <span className="font-medium text-emerald-700 dark:text-emerald-400 font-mono">
                      {commercialContext.priceFormatted}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#5F6368] dark:text-[#9AA0A6] block">Origem da Regra:</span>
                    <span className="font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800 text-[#5F6368] dark:text-[#9AA0A6] px-1.5 py-0.5 rounded">
                      Fonte: {commercialContext.hierarchySource.priceSource.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Presença Digital & Contato Corporativo */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-[#5F6368] dark:text-[#9AA0A6] uppercase tracking-wider">
                    Canais da Empresa & Presença Digital
                  </h3>
                  {(company.companyWhatsApp || company.companyPhone) && (
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={handleOpenCompanyWhatsApp}
                      leftIcon={<MessageSquare className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                      className="text-[11px]"
                    >
                      Abrir WhatsApp da Empresa
                    </Button>
                  )}
                </div>

                {/* Telefones da Empresa */}
                {(company.companyPhone || company.companyWhatsApp || company.companyEmail) && (
                  <div className="flex flex-wrap gap-2 pb-2 border-b border-[#ECEEF1] dark:border-[#2D3139]">
                    {company.companyWhatsApp && (
                      <a
                        href={generateWhatsAppLink(company.companyWhatsApp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/40 text-xs font-medium text-emerald-800 dark:text-emerald-300 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp Empresa: {formatPhoneNumber(company.companyWhatsApp)}</span>
                        {company.companyWhatsAppVerified && (
                          <span className="text-[10px] bg-emerald-600 text-white px-1 rounded font-bold">Verificado</span>
                        )}
                      </a>
                    )}

                    {company.companyPhone && (
                      <a
                        href={`tel:${cleanPhoneNumberDigits(company.companyPhone)}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] hover:bg-neutral-100 border border-[#E6E8EB] dark:border-[#2D3139] text-xs text-[#202124] dark:text-[#E8EAED] transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#3F6FB5]" />
                        <span>Recepção: {formatPhoneNumber(company.companyPhone)}</span>
                      </a>
                    )}

                    {company.companyEmail && (
                      <a
                        href={`mailto:${company.companyEmail}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] hover:bg-neutral-100 border border-[#E6E8EB] dark:border-[#2D3139] text-xs text-[#202124] dark:text-[#E8EAED] transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#80868B]" />
                        <span>E-mail Corporativo: {company.companyEmail}</span>
                      </a>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {company.website && (
                    <a
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] hover:bg-neutral-100 border border-[#E6E8EB] dark:border-[#2D3139] text-xs text-[#202124] dark:text-[#E8EAED] transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5 text-[#3F6FB5]" />
                      Website
                      <ExternalLink className="w-3 h-3 text-[#80868B]" />
                    </a>
                  )}

                  {company.instagram && (
                    <a
                      href={`https://instagram.com/${company.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] hover:bg-neutral-100 border border-[#E6E8EB] dark:border-[#2D3139] text-xs text-pink-700 dark:text-pink-300 transition-colors"
                    >
                      <Instagram className="w-3.5 h-3.5 text-pink-500" />
                      {company.instagram}
                      <ExternalLink className="w-3 h-3 text-[#80868B]" />
                    </a>
                  )}

                  {company.linkedin && (
                    <a
                      href={company.linkedin.startsWith('http') ? company.linkedin : `https://${company.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] hover:bg-neutral-100 border border-[#E6E8EB] dark:border-[#2D3139] text-xs text-blue-700 dark:text-blue-300 transition-colors"
                    >
                      <Linkedin className="w-3.5 h-3.5 text-blue-500" />
                      LinkedIn
                      <ExternalLink className="w-3 h-3 text-[#80868B]" />
                    </a>
                  )}

                  {company.googleBusiness && (
                    <a
                      href={company.googleBusiness.startsWith('http') ? company.googleBusiness : `https://${company.googleBusiness}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] hover:bg-neutral-100 border border-[#E6E8EB] dark:border-[#2D3139] text-xs text-emerald-700 dark:text-emerald-300 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      Google Maps
                      <ExternalLink className="w-3 h-3 text-[#80868B]" />
                    </a>
                  )}
                </div>

                {company.address && (
                  <div className="pt-2 border-t border-[#ECEEF1] dark:border-[#2D3139] flex items-start gap-2 text-xs text-[#202124] dark:text-[#E8EAED]">
                    <MapPin className="w-4 h-4 text-[#80868B] shrink-0 mt-0.5" />
                    <span>{company.address}</span>
                  </div>
                )}
              </div>

              {company.notes && (
                <div className="p-4 rounded-xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] space-y-1.5 shadow-xs">
                  <h3 className="text-xs font-semibold text-[#5F6368] dark:text-[#9AA0A6] uppercase tracking-wider">
                    Observações Cadastrais da Empresa
                  </h3>
                  <p className="text-xs text-[#202124] dark:text-[#E8EAED] whitespace-pre-wrap">{company.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CONTACTOS (1:N) */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#5F6368] dark:text-[#9AA0A6] uppercase tracking-wider">
                  Contactos Vinculados ({companyContacts.length})
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setEditingContact(null);
                    setIsAddContactOpen(true);
                  }}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Adicionar Contacto
                </Button>
              </div>

              <div className="space-y-3">
                {companyContacts.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] text-[#5F6368] dark:text-[#9AA0A6] text-xs space-y-2">
                    <User className="w-8 h-8 mx-auto text-[#80868B] mb-1" />
                    <p className="font-semibold text-[#202124] dark:text-[#E8EAED]">Nenhum contacto cadastrado ainda</p>
                    <p className="text-[#5F6368] dark:text-[#9AA0A6]">Adicione pessoas decisoras e operacionais desta empresa.</p>
                  </div>
                ) : (
                  companyContacts.map((c) => {
                    const rawWa = c.whatsapp || c.phone;
                    const rawTel = c.phone || c.whatsapp;
                    const isArchived = c.status === 'archived';

                    return (
                      <div
                        key={c.id}
                        className={`p-4 rounded-xl bg-white dark:bg-[#181B20] border transition-colors space-y-3 shadow-xs ${
                          isArchived
                            ? 'border-[#E6E8EB] dark:border-[#2D3139] opacity-60'
                            : c.isPrimary
                            ? 'border-blue-300 dark:border-blue-800'
                            : 'border-[#E6E8EB] dark:border-[#2D3139] hover:border-[#DADDE1]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm ${
                              c.isPrimary
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-[#3F6FB5] dark:text-blue-300 border border-blue-200 dark:border-blue-800/40'
                                : 'bg-[#F7F8FA] dark:bg-[#20242A] text-[#5F6368] dark:text-[#9AA0A6]'
                            }`}>
                              {c.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-semibold text-[#202124] dark:text-[#E8EAED]">{c.name}</h4>
                                {c.isPrimary && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-[#3F6FB5] dark:text-blue-300 font-medium flex items-center gap-1">
                                    <UserCheck className="w-3 h-3" /> Principal
                                  </span>
                                )}
                                {c.referredByName && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F7F8FA] dark:bg-[#20242A] text-[#5F6368] dark:text-[#9AA0A6] font-medium flex items-center gap-1" title={`Indicado por ${c.referredByName}`}>
                                    <Share2 className="w-3 h-3" /> Indicado por: {c.referredByName}
                                  </span>
                                )}
                                {isArchived && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-[#20242A] text-[#5F6368] dark:text-[#9AA0A6] font-medium">
                                    Arquivado
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-[#5F6368] dark:text-[#9AA0A6] mt-0.5 flex-wrap">
                                {c.role && <span>{c.role}</span>}
                                {c.role && c.department && <span>•</span>}
                                {c.department && <span>Depto: {c.department}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {!c.isPrimary && !isArchived && (
                              <button
                                onClick={async () => {
                                  await setPrimaryContact(company.id, c.id);
                                }}
                                className="px-2 py-1 rounded text-[11px] font-medium text-[#3F6FB5] dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 transition-colors flex items-center gap-1 mr-1 cursor-pointer"
                                title="Tornar este o contacto principal e decisor da empresa"
                              >
                                <UserCheck className="w-3 h-3" /> Tornar Principal
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setEditingContact(c);
                                setIsAddContactOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED] hover:bg-neutral-100 dark:hover:bg-[#20242A] transition-colors cursor-pointer"
                              title="Editar Contacto"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleToggleArchiveContact(c)}
                              className="p-1.5 rounded-lg text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED] hover:bg-neutral-100 dark:hover:bg-[#20242A] transition-colors cursor-pointer"
                              title={isArchived ? 'Desarquivar contacto' : 'Arquivar contacto'}
                            >
                              {isArchived ? <ArchiveRestore className="w-3.5 h-3.5 text-[#3F6FB5]" /> : <Archive className="w-3.5 h-3.5" />}
                            </button>

                            {companyContacts.length > 1 && (
                              <button
                                onClick={() => handleDeleteContact(c)}
                                className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                                title="Remover Contacto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Canais de Comunicação Direta */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {rawWa && (
                            <button
                              onClick={() => handleOpenMessageForContact(c.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/40 text-xs font-semibold text-emerald-800 dark:text-emerald-300 transition-colors cursor-pointer"
                              title="Preparar mensagem de script e abrir WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              WhatsApp: {c.whatsapp ? formatPhoneNumber(c.whatsapp) : formatPhoneNumber(rawWa)}
                            </button>
                          )}

                          {rawTel && (
                            <button
                              onClick={() => handleCopyPhone(c.id, rawTel)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] hover:bg-neutral-100 border border-[#E6E8EB] dark:border-[#2D3139] text-xs text-[#202124] dark:text-[#E8EAED] transition-colors cursor-pointer"
                              title="Copiar telefone para discagem"
                            >
                              {copiedContactPhoneId === c.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-[#80868B]" />
                              )}
                              {copiedContactPhoneId === c.id ? 'Copiado!' : formatPhoneNumber(rawTel)}
                            </button>
                          )}

                          {c.email && (
                            <a
                              href={`mailto:${c.email}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] hover:bg-neutral-100 border border-[#E6E8EB] dark:border-[#2D3139] text-xs text-[#202124] dark:text-[#E8EAED] transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5 text-[#80868B]" />
                              {c.email}
                            </a>
                          )}

                          {c.instagram && (
                            <a
                              href={`https://instagram.com/${c.instagram.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] hover:bg-neutral-100 border border-[#E6E8EB] dark:border-[#2D3139] text-xs text-pink-700 dark:text-pink-300 transition-colors"
                            >
                              <Instagram className="w-3.5 h-3.5 text-pink-500" />
                              {c.instagram}
                            </a>
                          )}

                          {c.linkedin && (
                            <a
                              href={c.linkedin.startsWith('http') ? c.linkedin : `https://${c.linkedin}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] hover:bg-neutral-100 border border-[#E6E8EB] dark:border-[#2D3139] text-xs text-blue-700 dark:text-blue-300 transition-colors"
                            >
                              <Linkedin className="w-3.5 h-3.5 text-blue-500" />
                              LinkedIn
                            </a>
                          )}
                        </div>

                        {c.notes && (
                          <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] pt-1 border-t border-[#ECEEF1] dark:border-[#2D3139]">
                            {c.notes}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: HISTÓRICO & TIMELINE */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#5F6368] dark:text-[#9AA0A6] uppercase tracking-wider">
                  Timeline de Eventos ({companyHistory.length})
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsLogInteractionOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Registrar Interação
                </Button>
              </div>

              {/* Campo para adicionar nota rápida ao histórico */}
              <form onSubmit={handleQuickAddNote} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                    placeholder="Registrar nota rápida ou resultado de contato..."
                    className="flex-1 px-3 py-2 bg-white dark:bg-[#1E2228] border border-[#DADDE1] dark:border-[#2D3139] rounded-lg text-xs text-[#202124] dark:text-[#E8EAED] placeholder:text-[#80868B] focus:outline-none focus:border-[#3F6FB5]"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isAddingNote}
                    disabled={!quickNote.trim()}
                    leftIcon={<Send className="w-3 h-3" />}
                  >
                    Registrar
                  </Button>
                </div>
              </form>

              {/* Linha do Tempo Visual */}
              <div className="space-y-3 pt-2">
                {companyHistory.length === 0 ? (
                  <p className="text-xs text-[#80868B] text-center py-6">
                    Nenhum evento registrado no histórico ainda.
                  </p>
                ) : (
                  companyHistory.map((item) => {
                    const isStage = item.type === 'stage_change';
                    const isMessage = item.type === 'message_sent';
                    const isPrepared = item.type === 'message_prepared';
                    const isWaOpened = item.type === 'whatsapp_opened';
                    const isCall = item.type === 'contact_made';
                    const isResponse = item.type === 'response_received';
                    const isProposal = item.type === 'proposal_sent';
                    const isMeeting = item.type === 'meeting_held' || item.type === 'meeting_scheduled';
                    const isContactEvent = item.type.startsWith('contact_');
                    const isReferral = item.type === 'referral_recorded';

                    let iconColor = 'text-[#5F6368] dark:text-[#9AA0A6]';
                    let bgColor = 'bg-white dark:bg-[#181B20] border-[#E6E8EB] dark:border-[#2D3139]';
                    if (isStage) {
                      iconColor = 'text-amber-700 dark:text-amber-400';
                      bgColor = 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40';
                    } else if (isMessage || isResponse) {
                      iconColor = 'text-emerald-700 dark:text-emerald-400';
                      bgColor = 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40';
                    } else if (isWaOpened || isPrepared) {
                      iconColor = 'text-emerald-700 dark:text-emerald-400';
                      bgColor = 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800/30';
                    } else if (isCall) {
                      iconColor = 'text-[#3F6FB5] dark:text-blue-300';
                      bgColor = 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/40';
                    } else if (isProposal || isMeeting) {
                      iconColor = 'text-purple-700 dark:text-purple-300';
                      bgColor = 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/40';
                    } else if (isReferral) {
                      iconColor = 'text-[#3F6FB5] dark:text-blue-300';
                      bgColor = 'bg-blue-50/30 dark:bg-blue-950/10 border-blue-200 dark:border-blue-800/30';
                    } else if (isContactEvent) {
                      iconColor = 'text-indigo-700 dark:text-indigo-300';
                      bgColor = 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/40';
                    }

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-xl border space-y-1.5 text-xs transition-colors shadow-xs ${bgColor}`}
                      >
                        <div className="flex items-center justify-between text-[#5F6368] dark:text-[#9AA0A6]">
                          <span className={`font-bold ${iconColor}`}>{item.title}</span>
                          <span className="text-[11px] font-mono text-[#80868B]">
                            {formatRelativeDate(item.timestamp)}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-[#202124] dark:text-[#E8EAED] text-xs whitespace-pre-wrap">{item.description}</p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé de Ações */}
        <div className="p-4 bg-[#F7F8FA] dark:bg-[#15171B] border-t border-[#E6E8EB] dark:border-[#2D3139] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEditCompany(company)}
              leftIcon={<Edit2 className="w-3.5 h-3.5" />}
            >
              Editar Empresa
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleArchive}
              leftIcon={
                company.status === 'archived' ? (
                  <ArchiveRestore className="w-3.5 h-3.5 text-[#3F6FB5]" />
                ) : (
                  <Archive className="w-3.5 h-3.5 text-[#5F6368]" />
                )
              }
            >
              {company.status === 'archived' ? 'Restaurar' : 'Arquivar'}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteCompany}
            className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Excluir
          </Button>
        </div>
      </div>

      {/* Modal para Adicionar/Editar Contato */}
      <AddContactModal
        isOpen={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
        companyId={company.id}
        companyName={company.name}
        existingContacts={companyContacts}
        editingContact={editingContact}
        onSave={async (contactData) => {
          if (editingContact) {
            await updateContact({
              ...editingContact,
              ...contactData,
            });
          } else {
            await addContactToCompany(company.id, contactData);
          }
        }}
      />

      {/* Modal para Registrar Interação Completa */}
      <LogInteractionModal
        isOpen={isLogInteractionOpen}
        onClose={() => setIsLogInteractionOpen(false)}
        companyId={company.id}
        companyName={company.name}
        contactId={primaryContact?.id}
        leadId={companyLead?.id}
        currentStage={companyLead?.stage}
        onSave={async (params) => {
          await addHistoryEvent({
            companyId: company.id,
            contactId: primaryContact?.id,
            leadId: companyLead?.id,
            type: params.type,
            title: params.title,
            description: params.description,
            metadata: { channel: params.channel, newStage: params.newStage },
          });
          if (companyLead && params.newStage && params.newStage !== companyLead.stage) {
            await advanceLeadStage(companyLead.id, params.newStage, params.description);
          }
          if (companyLead && params.nextActionTitle && params.nextActionDate) {
            await scheduleNextAction(companyLead.id, params.nextActionTitle, params.nextActionDate, params.channel || 'whatsapp');
          }
        }}
      />

      {/* Modal para Agendar Próxima Ação */}
      {companyLead && (
        <ScheduleActionModal
          isOpen={isScheduleOpen}
          onClose={() => setIsScheduleOpen(false)}
          leadId={companyLead.id}
          companyName={company.name}
          currentTitle={companyLead.nextActionTitle}
          currentDate={companyLead.nextActionDate}
          currentChannel={companyLead.nextActionChannel}
          onSchedule={async (title, date, channel) => {
            await scheduleNextAction(companyLead.id, title, date, channel);
          }}
        />
      )}

      {/* Modal de Mensagens e Preparação */}
      {companyLead && (
        <LeadMessageModal
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          lead={companyLead}
          company={company}
          initialContactId={messageTargetContactId}
        />
      )}

      {/* Modal de Qualificação de Lead */}
      {companyLead && (
        <QualificationModal
          isOpen={isQualificationOpen}
          onClose={() => setIsQualificationOpen(false)}
          company={company}
          contact={primaryContact}
          lead={companyLead}
        />
      )}

      {/* Modal do Copiloto Gemini */}
      <CopilotAssistantModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        company={company}
        contact={primaryContact}
        lead={companyLead}
        service={services.find((s) => s.id === companyLead?.serviceId)}
        initialActionType={copilotInitialAction}
      />

      {/* Modal Completo de Agendamento de Mensagem */}
      <ScheduleMessageModal
        isOpen={isScheduleMessageModalOpen}
        onClose={() => setIsScheduleMessageModalOpen(false)}
        initialClientId={company.id}
      />
    </div>
  );
};

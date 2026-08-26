import React, { useState } from 'react';
import {
  Archive,
  ArchiveRestore,
  Building2,
  Calendar,
  Clock,
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
import { formatPhoneNumber, formatRelativeDate } from '../../utils/formatting';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { AddContactModal } from './AddContactModal';
import { ScheduleActionModal } from './ScheduleActionModal';
import { LogInteractionModal } from './LogInteractionModal';
import { ScoreBadge } from '../qualification/ScoreBadge';
import { calculateLeadScore } from '../../utils/leadScoring';
import { LeadMessageModal } from '../qualification/LeadMessageModal';
import { CopilotActionButtons } from '../copilot/CopilotActionButtons';
import { CopilotAssistantModal } from '../copilot/CopilotAssistantModal';
import { CopilotActionType } from '../../types';
import { ApproachRecommendationCard } from '../sales/ApproachRecommendationCard';

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
    logInteractionAndAdvance,
    addContactToCompany,
    updateContact,
    deleteContact,
    archiveCompany,
    unarchiveCompany,
    deleteCompany,
  } = useApp();

  const confirm = useConfirm();
  const { success } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'approach' | 'contacts' | 'history'>('overview');
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isLogInteractionOpen, setIsLogInteractionOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotInitialAction, setCopilotInitialAction] = useState<CopilotActionType>('PERSONALIZAR');
  const [quickNote, setQuickNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  if (!company) return null;

  const companyContacts = contacts.filter((c) => c.companyId === company.id);
  const primaryContact = companyContacts.find((c) => c.isPrimary) || companyContacts[0];
  const companyLead = leads.find((l) => l.companyId === company.id);
  const companyHistory = history.filter((h) => h.companyId === company.id);

  // Calcula pontuação real e explicável
  const leadScoreResult = companyLead
    ? calculateLeadScore(company, primaryContact, companyLead, icps, services, companyHistory, settings.scoringWeights)
    : null;

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
      title: `Remover contato ${c.name}?`,
      message: 'Tem certeza de que deseja excluir este contato da empresa?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      isDestructive: true,
      onConfirm: async () => {
        await deleteContact(c.id, company.id);
      },
    });
  };

  const getCleanPhone = (phoneStr?: string) => {
    if (!phoneStr) return '';
    return phoneStr.replace(/\D/g, '');
  };

  return (
    <div
      id="company-details-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="company-details-drawer-panel"
        className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-lg">
                {company.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-slate-100">{company.name}</h2>
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
                  <p className="text-xs text-slate-400 font-medium">({company.tradeName})</p>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>{company.niche}</span>
                  <span>•</span>
                  <span>{company.city}, {company.country}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Stage Selector & Scores */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Estágio:</span>
              <select
                value={stageKey}
                onChange={(e) => handleStageChange(e.target.value as LeadStage)}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
              >
                {ALL_LEAD_STAGES.map((stg) => (
                  <option key={stg} value={stg}>
                    {STAGES_CONFIG[stg].order}. {STAGES_CONFIG[stg].label}
                  </option>
                ))}
              </select>

              {companyLead && (
                <Button
                  variant="primary"
                  size="xs"
                  onClick={() => setIsMessageModalOpen(true)}
                  leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white ml-2"
                >
                  Preparar Mensagem
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs">
              {companyLead?.temperature && (
                <div className="flex items-center gap-1 font-medium">
                  {companyLead.temperature === 'quente' ? (
                    <span className="text-amber-400 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" /> Quente
                    </span>
                  ) : companyLead.temperature === 'morno' ? (
                    <span className="text-blue-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> Morno
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
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
                <div className="flex items-center gap-1.5 font-mono text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold">{companyLead.score} pts</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-slate-800 bg-slate-950/50 flex gap-4 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-slate-200 text-slate-100 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Visão Geral & Lead
          </button>

          <button
            onClick={() => setActiveTab('approach')}
            className={`py-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'approach'
                ? 'border-indigo-400 text-indigo-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Recomendação de Abordagem (7 Pilares)
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'contacts'
                ? 'border-slate-200 text-slate-100 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Contatos ({companyContacts.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-slate-200 text-slate-100 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
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
            <div className="space-y-4 animate-fadeIn">
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
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Copiloto Gemini de Prospecção
                  </span>
                  <span className="text-[11px] text-slate-400">
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
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Próxima Ação Agendada
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsScheduleOpen(true)}
                    className="text-xs h-7 px-2"
                  >
                    Agendar / Alterar
                  </Button>
                </div>

                {companyLead?.nextActionTitle ? (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-100">{companyLead.nextActionTitle}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {companyLead.nextActionDate || 'Data a definir'}
                      </span>
                      <span>•</span>
                      <span className="uppercase font-mono text-[11px] text-slate-300">
                        Via {companyLead.nextActionChannel || 'WhatsApp'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Nenhuma ação planejada no momento.</p>
                )}
              </div>

              {/* Detalhes do Lead */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Qualificação & Estratégia
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Serviço de Interesse:</span>
                    <span className="font-medium text-slate-200">
                      {companyLead?.serviceName || 'A definir'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Origem do Lead:</span>
                    <span className="font-medium text-slate-200">
                      {companyLead?.source || 'Outbound Direto'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Prioridade:</span>
                    <span className="font-medium text-slate-200 capitalize">
                      {companyLead?.priority || 'Média'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Data de Entrada:</span>
                    <span className="font-medium text-slate-200">
                      {companyLead?.entryDate || company.createdAt?.slice(0, 10) || '—'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Último Contato:</span>
                    <span className="font-medium text-slate-200">
                      {companyLead?.lastContactDate || 'Ainda não contatado'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Nº de Unidades:</span>
                    <span className="font-medium text-slate-200">{company.unitsCount || 1}</span>
                  </div>
                </div>

                {companyLead?.notes && (
                  <div className="pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-500 block mb-1">Notas do Lead:</span>
                    <p className="text-slate-300 whitespace-pre-wrap">{companyLead.notes}</p>
                  </div>
                )}
              </div>

              {/* Presença Digital & Endereço */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Presença & Redes Sociais
                </h3>

                <div className="flex flex-wrap gap-2">
                  {company.website && (
                    <a
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5 text-blue-400" />
                      Website
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  )}

                  {company.instagram && (
                    <a
                      href={`https://instagram.com/${company.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-pink-300 transition-colors"
                    >
                      <Instagram className="w-3.5 h-3.5 text-pink-400" />
                      {company.instagram}
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  )}

                  {company.linkedin && (
                    <a
                      href={company.linkedin.startsWith('http') ? company.linkedin : `https://${company.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-blue-300 transition-colors"
                    >
                      <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                      LinkedIn
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  )}

                  {company.googleBusiness && (
                    <a
                      href={company.googleBusiness.startsWith('http') ? company.googleBusiness : `https://${company.googleBusiness}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-emerald-300 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      Google Maps
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  )}
                </div>

                {company.address && (
                  <div className="pt-2 border-t border-slate-800 flex items-start gap-2 text-xs text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{company.address}</span>
                  </div>
                )}
              </div>

              {company.notes && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Observações Cadastrais da Empresa
                  </h3>
                  <p className="text-xs text-slate-300 whitespace-pre-wrap">{company.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CONTATOS */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Contatos Vinculados
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingContact(null);
                    setIsAddContactOpen(true);
                  }}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Novo Contato
                </Button>
              </div>

              <div className="space-y-3">
                {companyContacts.map((c) => {
                  const cleanWa = getCleanPhone(c.whatsapp || c.phone);
                  const cleanTel = getCleanPhone(c.phone || c.whatsapp);

                  return (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-semibold text-sm">
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-slate-100">{c.name}</h4>
                              {c.isPrimary && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium flex items-center gap-1">
                                  <UserCheck className="w-3 h-3" /> Principal
                                </span>
                              )}
                            </div>
                            {c.role && <p className="text-xs text-slate-400">{c.role}</p>}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingContact(c);
                              setIsAddContactOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                            title="Editar Contato"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {companyContacts.length > 1 && (
                            <button
                              onClick={() => handleDeleteContact(c)}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                              title="Remover Contato"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Canais de Comunicação Direta */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {cleanWa && (
                          <a
                            href={`https://wa.me/55${cleanWa}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-medium text-emerald-300 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            {c.whatsapp ? formatPhoneNumber(c.whatsapp) : formatPhoneNumber(cleanWa)}
                          </a>
                        )}

                        {cleanTel && (
                          <a
                            href={`tel:${cleanTel}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {c.phone ? formatPhoneNumber(c.phone) : formatPhoneNumber(cleanTel)}
                          </a>
                        )}

                        {c.email && (
                          <a
                            href={`mailto:${c.email}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {c.email}
                          </a>
                        )}
                      </div>

                      {c.notes && (
                        <p className="text-xs text-slate-400 pt-1 border-t border-slate-900">
                          {c.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: HISTÓRICO & TIMELINE */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Timeline de Eventos ({companyHistory.length})
                </span>
                <Button
                  variant="outline"
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
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400"
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
                  <p className="text-xs text-slate-500 text-center py-6">
                    Nenhum evento registrado no histórico ainda.
                  </p>
                ) : (
                  companyHistory.map((item) => {
                    const isStage = item.type === 'stage_change';
                    const isMessage = item.type === 'message_sent';
                    const isCall = item.type === 'contact_made';
                    const isResponse = item.type === 'response_received';
                    const isProposal = item.type === 'proposal_sent';
                    const isMeeting = item.type === 'meeting_held' || item.type === 'meeting_scheduled';

                    let iconColor = 'text-slate-400';
                    let bgColor = 'bg-slate-900';
                    if (isStage) {
                      iconColor = 'text-amber-400';
                      bgColor = 'bg-amber-500/10 border-amber-500/30';
                    } else if (isMessage || isResponse) {
                      iconColor = 'text-emerald-400';
                      bgColor = 'bg-emerald-500/10 border-emerald-500/30';
                    } else if (isCall) {
                      iconColor = 'text-blue-400';
                      bgColor = 'bg-blue-500/10 border-blue-500/30';
                    } else if (isProposal || isMeeting) {
                      iconColor = 'text-purple-400';
                      bgColor = 'bg-purple-500/10 border-purple-500/30';
                    }

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-xl border space-y-1.5 text-xs transition-colors ${bgColor}`}
                      >
                        <div className="flex items-center justify-between text-slate-400">
                          <span className={`font-bold ${iconColor}`}>{item.title}</span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {formatRelativeDate(item.timestamp)}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-slate-200 text-xs whitespace-pre-wrap">{item.description}</p>
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
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
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
              className="text-slate-400 hover:text-slate-200"
              leftIcon={
                company.status === 'archived' ? (
                  <ArchiveRestore className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <Archive className="w-3.5 h-3.5 text-slate-400" />
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
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Excluir
          </Button>
        </div>
      </div>

      {/* Modal para Adicionar/Editar Contato Secundário */}
      <AddContactModal
        isOpen={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
        companyId={company.id}
        companyName={company.name}
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
    </div>
  );
};

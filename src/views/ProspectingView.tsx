import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
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
  MessageCircle,
  MessageSquare,
  Pause,
  Phone,
  Play,
  RotateCcw,
  Save,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  User,
  Zap,
  ListOrdered,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { useExecutionQueue } from '../hooks/useExecutionQueue';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Kbd } from '../components/ui/Kbd';
import { EmptyState } from '../components/ui/EmptyState';
import { ContextualTip } from '../components/common/ContextualTip';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import {
  generateWhatsAppLink,
  getChannelBadgeDetails,
  formatPhoneNumber,
  formatRelativeDate,
} from '../utils/formatting';
import {
  Company,
  Contact,
  ContactChannel,
  CopilotActionType,
  HistoryEventType,
  IdealCustomerProfile,
  Lead,
  LeadStage,
  OpportunityState,
  ProspectingMode,
} from '../types';
import { CompanyDetailsDrawer } from '../components/clients/CompanyDetailsDrawer';
import { CopilotAssistantModal } from '../components/copilot/CopilotAssistantModal';
import { QualificationModal } from '../components/qualification/QualificationModal';
import { LeadMessageModal } from '../components/qualification/LeadMessageModal';
import { ProspectingModeToggle } from '../components/prospecting/ProspectingModeToggle';
import { OpportunityScoreCard } from '../components/prospecting/OpportunityScoreCard';
import { SignalSelectorModal } from '../components/prospecting/SignalSelectorModal';
import { OpportunityDetailModal } from '../components/prospecting/OpportunityDetailModal';
import { PrioritizedItem, PrioritizedLeadList } from '../components/prospecting/PrioritizedLeadList';
import { IcpManagementDrawer } from '../components/prospecting/IcpManagementDrawer';
import { WhatToDoNowHub } from '../components/assistant/WhatToDoNowHub';
import { AiLeadAnalysisModal } from '../components/assistant/AiLeadAnalysisModal';
import { AdaptiveFunnelModal } from '../components/assistant/AdaptiveFunnelModal';
import { CommercialPlaybookModal } from '../components/assistant/CommercialPlaybookModal';
import { AiAuthorizedActionsModal } from '../components/assistant/AiAuthorizedActionsModal';
import { SystemLearningModal } from '../components/assistant/SystemLearningModal';
import {
  calculateDemandaIdentificadaScore,
  calculateOportunidadeLatenteScore,
  DEMANDA_FUNNEL_STEPS,
  getLeadSignals,
  getRecommendedScript,
  LATENTE_FUNNEL_STEPS,
  resolveProspectingMode,
} from '../utils/prospectingEngine';

export const ProspectingView: React.FC = () => {
  const {
    stages,
    companies,
    contacts,
    leads,
    services,
    icps,
    history,
    completeAction,
    skipAction,
    rescheduleAction,
    logInteractionAndAdvance,
    scheduleNextAction,
    updateCompany,
    updateLead,
    upsertIcp,
    deleteIcp,
    setActiveRoute,
    openAddCompanyModal,
  } = useApp();

  const {
    queueItems,
    metrics,
    formattedDuration,
    dailyGoal,
    streakDays,
    completedToday,
    totalMinutesLeft,
  } = useExecutionQueue();
  const { success, info } = useToast();

  // Modo Principal de Prospecção (Demanda Identificada vs Oportunidade Latente)
  const [activeMode, setActiveMode] = useState<ProspectingMode>('DEMANDA_IDENTIFICADA');

  // Tipo de Visualização: 'acoes' (Central O que Fazer Agora), 'foco' (1 a 1) ou 'lista' (Priorizada)
  const [viewType, setViewType] = useState<'acoes' | 'foco' | 'lista'>('acoes');

  // Filtros da Lista Priorizada
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState('todos');
  const [selectedNicheFilter, setSelectedNicheFilter] = useState('todos');

  // Modais de Controle
  const [selectedPrioritizedLead, setSelectedPrioritizedLead] = useState<PrioritizedItem | null>(null);
  const [isSignalsModalOpen, setIsSignalsModalOpen] = useState(false);
  const [targetCompanyForSignals, setTargetCompanyForSignals] = useState<Company | null>(null);
  const [targetLeadForSignals, setTargetLeadForSignals] = useState<Lead | null>(null);
  const [isIcpDrawerOpen, setIsIcpDrawerOpen] = useState(false);

  // Modais do Assistente Inteligente & Playbook
  const [isAiAnalysisModalOpen, setIsAiAnalysisModalOpen] = useState(false);
  const [selectedCompanyForAi, setSelectedCompanyForAi] = useState<Company | null>(null);
  const [selectedLeadForAi, setSelectedLeadForAi] = useState<Lead | null>(null);

  const [isAdaptiveFunnelModalOpen, setIsAdaptiveFunnelModalOpen] = useState(false);
  const [selectedCompanyForAdaptive, setSelectedCompanyForAdaptive] = useState<Company | null>(null);
  const [selectedLeadForAdaptive, setSelectedLeadForAdaptive] = useState<Lead | null>(null);

  const [isPlaybookModalOpen, setIsPlaybookModalOpen] = useState(false);
  const [playbookInitialStage, setPlaybookInitialStage] = useState<string>('abertura');

  const [isAiAuthorizedActionsModalOpen, setIsAiAuthorizedActionsModalOpen] = useState(false);
  const [isSystemLearningModalOpen, setIsSystemLearningModalOpen] = useState(false);

  // Estados da Fila 1 a 1
  const [copied, setCopied] = useState(false);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [selectedStage, setSelectedStage] = useState<LeadStage>('PRIMEIRO_CONTACTO');

  // Próxima Ação automática
  const [scheduleNext, setScheduleNext] = useState(true);
  const [nextActionTitle, setNextActionTitle] = useState('Follow-up #1');
  const [nextActionDays, setNextActionDays] = useState(2);

  // Modal de Adiar
  const [isAdiarOpen, setIsAdiarOpen] = useState(false);
  const [customAdiarDate, setCustomAdiarDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });

  // Estado de Pausa
  const [isPaused, setIsPaused] = useState(false);

  // Drawer de Detalhes da Empresa
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Copiloto Gemini de Prospecção
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotInitialAction, setCopilotInitialAction] = useState<CopilotActionType>('PERSONALIZAR');

  // Item atual da fila filtrado pelo modo ativo
  const filteredQueueItems = useMemo(() => {
    return queueItems.filter((item) => {
      const company = item.company || companies.find((c) => c.id === item.action.clientId);
      const lead = item.lead || leads.find((l) => l.companyId === company?.id);
      const itemMode = resolveProspectingMode(company, lead);
      return itemMode === activeMode;
    });
  }, [queueItems, companies, leads, activeMode]);

  // Contadores por Modo
  const { demandaCount, latenteCount } = useMemo(() => {
    let dCount = 0;
    let lCount = 0;
    companies.forEach((comp) => {
      const lead = leads.find((l) => l.companyId === comp.id);
      const m = resolveProspectingMode(comp, lead);
      if (m === 'OPORTUNIDADE_LATENTE') lCount++;
      else dCount++;
    });
    return { demandaCount: dCount, latenteCount: lCount };
  }, [companies, leads]);

  // Lista Priorizada Completa para o Modo Ativo
  const prioritizedItems: PrioritizedItem[] = useMemo(() => {
    return companies
      .filter((company) => {
        const lead = leads.find((l) => l.companyId === company.id);
        const compMode = resolveProspectingMode(company, lead);
        return compMode === activeMode;
      })
      .map((company) => {
        const contact = contacts.find((c) => c.companyId === company.id && c.isPrimary) || contacts.find((c) => c.companyId === company.id);
        const lead = leads.find((l) => l.companyId === company.id);
        const opportunityState: OpportunityState =
          company.opportunityState ||
          lead?.opportunityState ||
          (activeMode === 'OPORTUNIDADE_LATENTE' ? 'HIPOTESE' : 'CONFIRMADO');

        const explanation =
          activeMode === 'OPORTUNIDADE_LATENTE'
            ? calculateOportunidadeLatenteScore(company, contact, lead, icps)
            : calculateDemandaIdentificadaScore(company, contact, lead, icps);

        return {
          company,
          contact,
          lead,
          explanation,
          opportunityState,
        };
      })
      .sort((a, b) => b.explanation.totalScore - a.explanation.totalScore);
  }, [companies, contacts, leads, icps, activeMode]);

  // Filtragem na Lista Priorizada
  const filteredPrioritizedItems = useMemo(() => {
    return prioritizedItems.filter((item) => {
      const matchesSearch =
        searchTerm === '' ||
        (item.company.tradeName || item.company.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.company.niche || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.company.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.contact?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesState =
        selectedStateFilter === 'todos' || item.opportunityState === selectedStateFilter;

      const matchesNiche =
        selectedNicheFilter === 'todos' || item.company.niche === selectedNicheFilter;

      return matchesSearch && matchesState && matchesNiche;
    });
  }, [prioritizedItems, searchTerm, selectedStateFilter, selectedNicheFilter]);

  const allNiches = useMemo(() => {
    const set = new Set<string>();
    companies.forEach((c) => {
      if (c.niche) set.add(c.niche);
    });
    return Array.from(set);
  }, [companies]);

  const currentItem = filteredQueueItems[0] || null;

  // Atualizar dados quando o item mudar
  useEffect(() => {
    if (currentItem) {
      setCustomMessage(currentItem.interpolatedMessage);
      setIsEditingMessage(false);
      setOutcomeNotes('');

      // Auto-definir estágio sugerido após o envio
      const currentLeadStage: LeadStage = currentItem.lead?.stage || 'NOVO';
      if (currentLeadStage === 'NOVO') {
        setSelectedStage('PRIMEIRO_CONTACTO');
        setNextActionTitle('Follow-up #1');
      } else if (currentLeadStage === 'PRIMEIRO_CONTACTO') {
        setSelectedStage('PRIMEIRO_CONTACTO');
        setNextActionTitle('Follow-up #2');
      } else if (currentLeadStage === 'RESPONDEU' || currentLeadStage === 'INTERESSADO') {
        setSelectedStage('REUNIÃO');
        setNextActionTitle('Apresentação Comercial');
      } else if (currentLeadStage === 'REUNIÃO') {
        setSelectedStage('PROPOSTA');
        setNextActionTitle('Envio de Proposta');
      } else if (currentLeadStage === 'PROPOSTA') {
        setSelectedStage('NEGOCIAÇÃO');
        setNextActionTitle('Follow-up de Fechamento');
      } else {
        setSelectedStage(currentLeadStage);
        setNextActionTitle('Acompanhamento');
      }
    }
  }, [currentItem?.action.id]);

  const activeMessage = isEditingMessage ? customMessage : currentItem?.interpolatedMessage || '';

  // 1. AÇÃO: Copiar Mensagem
  const handleCopyMessage = () => {
    if (!activeMessage) return;
    navigator.clipboard.writeText(activeMessage);
    setCopied(true);
    success('Mensagem copiada para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  // 2. AÇÃO: Abrir WhatsApp
  const handleOpenWhatsApp = () => {
    if (!currentItem) return;
    const phone = currentItem.contact?.whatsapp || currentItem.contact?.phone || currentItem.client.whatsapp;
    if (!phone) {
      info('Nenhum número de WhatsApp cadastrado para este contato.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const encoded = encodeURIComponent(activeMessage);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 3. AÇÃO: Marcar como Enviado & Avançar
  const handleComplete = async () => {
    if (!currentItem) return;

    try {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + nextActionDays);
      const nextDateStr = nextDate.toISOString().slice(0, 10);

      const company = currentItem.company || companies.find((c) => c.id === currentItem.action.clientId);
      const contact = currentItem.contact || contacts.find((c) => c.companyId === company?.id);
      const lead = currentItem.lead || leads.find((l) => l.companyId === company?.id);

      if (company) {
        await logInteractionAndAdvance({
          companyId: company.id,
          contactId: contact?.id,
          leadId: lead?.id,
          channel: currentItem.action.channel,
          messageSent: activeMessage,
          notes: outcomeNotes.trim(),
          newStage: selectedStage,
          nextActionTitle: scheduleNext ? nextActionTitle : undefined,
          nextActionDate: scheduleNext ? nextDateStr : undefined,
          nextActionChannel: currentItem.action.channel,
        });
      }

      await completeAction(currentItem.action.id, outcomeNotes, undefined);
      success('Ação concluída! Avançando para o próximo prospect...');
    } catch (err) {
      console.error(err);
    }
  };

  // 4. AÇÃO: Pular
  const handleSkip = async () => {
    if (!currentItem) return;
    await skipAction(currentItem.action.id, 'Ação pulada na fila');
    info('Prospect movido para o final da fila.');
  };

  // 5. AÇÃO: Adiar
  const handleAdiar = async (days: number) => {
    if (!currentItem) return;
    const d = new Date();
    d.setDate(d.getDate() + days);
    await rescheduleAction(currentItem.action.id, d.toISOString().slice(0, 10));
    setIsAdiarOpen(false);
    success(`Ação adiada em ${days} ${days === 1 ? 'dia' : 'dias'}.`);
  };

  const handleCustomAdiar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem || !customAdiarDate) return;
    await rescheduleAction(currentItem.action.id, customAdiarDate);
    setIsAdiarOpen(false);
    success(`Ação reagendada para ${formatRelativeDate(customAdiarDate)}.`);
  };

  // Salvar Sinais no Modal
  const handleSaveSignals = async (signals: string[], customSignals: string[]) => {
    if (!targetCompanyForSignals) return;
    const updatedCompany: Company = {
      ...targetCompanyForSignals,
      signals,
      customSignals,
      updatedAt: new Date().toISOString(),
    };
    await updateCompany(updatedCompany);

    if (targetLeadForSignals) {
      const updatedLead: Lead = {
        ...targetLeadForSignals,
        customSignals,
        updatedAt: new Date().toISOString(),
      };
      await updateLead(updatedLead);
    }
    success('Sinais atualizados com sucesso e score recalculado!');
  };

  const handleOpenSignals = (company: Company, lead?: Lead) => {
    setTargetCompanyForSignals(company);
    setTargetLeadForSignals(lead || null);
    setIsSignalsModalOpen(true);
  };

  // Atualizar Estado da Oportunidade
  const handleUpdateOpportunityState = async (state: OpportunityState) => {
    if (!selectedPrioritizedLead) return;
    const updatedCompany: Company = {
      ...selectedPrioritizedLead.company,
      opportunityState: state,
      updatedAt: new Date().toISOString(),
    };
    await updateCompany(updatedCompany);

    if (selectedPrioritizedLead.lead) {
      const updatedLead: Lead = {
        ...selectedPrioritizedLead.lead,
        opportunityState: state,
        updatedAt: new Date().toISOString(),
      };
      await updateLead(updatedLead);
    }
    setSelectedPrioritizedLead({
      ...selectedPrioritizedLead,
      opportunityState: state,
    });
    success(`Estado atualizado para: ${state}`);
  };

  // Atalhos de teclado (C: copiar, W: whatsapp, Enter: enviar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        isPaused ||
        isAdiarOpen ||
        isDrawerOpen ||
        isCopilotOpen ||
        isSignalsModalOpen ||
        selectedPrioritizedLead ||
        isIcpDrawerOpen ||
        viewType === 'lista'
      ) {
        return;
      }
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleCopyMessage();
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleOpenWhatsApp();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleComplete();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setIsPaused(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentItem,
    activeMessage,
    selectedStage,
    outcomeNotes,
    scheduleNext,
    nextActionTitle,
    nextActionDays,
    isPaused,
    isAdiarOpen,
    isDrawerOpen,
    isCopilotOpen,
    isSignalsModalOpen,
    selectedPrioritizedLead,
    isIcpDrawerOpen,
    viewType,
  ]);

  // Objeto de Explicação para o Item Atual da Fila
  const currentExplanation = useMemo(() => {
    if (!currentItem) return null;
    const company = currentItem.company || companies.find((c) => c.id === currentItem.action.clientId);
    const contact = currentItem.contact || contacts.find((c) => c.companyId === company?.id);
    const lead = currentItem.lead || leads.find((l) => l.companyId === company?.id);

    return activeMode === 'OPORTUNIDADE_LATENTE'
      ? calculateOportunidadeLatenteScore(company, contact, lead, icps)
      : calculateDemandaIdentificadaScore(company, contact, lead, icps);
  }, [currentItem, companies, contacts, leads, icps, activeMode]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* 1. TOPO: SELETOR DE MODOS & BARRA DE AÇÕES RÁPIDAS */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1E293B] dark:text-white tracking-tight">
              Central de Prospecção & Priorização
            </h1>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Qualifique empresas por sinais reais e priorize abordagens de alta conversão
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Alternar entre Central O que fazer agora, Fila 1 a 1 e Lista Priorizada */}
            <div className="flex items-center bg-[#F1F5F9] dark:bg-[#1E222A] p-1 rounded-xl border border-[#E2E6EC] dark:border-[#272B33]">
              <button
                type="button"
                onClick={() => setViewType('acoes')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewType === 'acoes'
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#1E293B]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> O que Fazer Agora?
              </button>
              <button
                type="button"
                onClick={() => setViewType('foco')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewType === 'foco'
                    ? 'bg-white dark:bg-[#252B35] text-[#1E293B] dark:text-white shadow-2xs'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#1E293B]'
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> Fila 1 a 1
              </button>
              <button
                type="button"
                onClick={() => setViewType('lista')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewType === 'lista'
                    ? 'bg-white dark:bg-[#252B35] text-[#1E293B] dark:text-white shadow-2xs'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#1E293B]'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" /> Lista Priorizada
              </button>
            </div>

            {/* Playbook Comercial */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaybookModalOpen(true)}
              className="text-xs font-semibold"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1" />
              Playbook
            </Button>

            {/* Ações Autorizadas IA */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAiAuthorizedActionsModalOpen(true)}
              className="text-xs font-semibold"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-purple-600" />
              Ações IA
            </Button>

            {/* Aprendizado do Sistema */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSystemLearningModalOpen(true)}
              className="text-xs font-semibold"
            >
              <Trophy className="w-3.5 h-3.5 mr-1 text-amber-500" />
              Aprendizado
            </Button>

            {/* Gerenciador de ICPs */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsIcpDrawerOpen(true)}
              leftIcon={<Target className="w-3.5 h-3.5" />}
            >
              ICPs
            </Button>
          </div>
        </div>

        {/* TOGGLE DOS 2 MODOS (DEMANDA IDENTIFICADA vs OPORTUNIDADE LATENTE) */}
        {viewType !== 'acoes' && (
          <ProspectingModeToggle
            currentMode={activeMode}
            onChangeMode={(m) => {
              setActiveMode(m);
              setViewType('foco');
            }}
            demandaCount={demandaCount}
            latenteCount={latenteCount}
          />
        )}
      </div>

      {/* 2. CONTEÚDO PRINCIPAL DE ACORDO COM A VISÃO */}
      {viewType === 'acoes' ? (
        /* VISÃO CENTRAL O QUE FAZER AGORA (ASSISTENTE INTELIGENTE) */
        <WhatToDoNowHub
          onOpenCompany={(comp) => {
            setSelectedCompany(comp);
            setIsDrawerOpen(true);
          }}
          onOpenAiAnalysis={(comp, ld) => {
            setSelectedCompanyForAi(comp);
            setSelectedLeadForAi(ld || null);
            setIsAiAnalysisModalOpen(true);
          }}
          onOpenAdaptiveFunnel={(comp, ld) => {
            setSelectedCompanyForAdaptive(comp);
            setSelectedLeadForAdaptive(ld || null);
            setIsAdaptiveFunnelModalOpen(true);
          }}
          onOpenPlaybook={(stage) => {
            if (stage) setPlaybookInitialStage(stage);
            setIsPlaybookModalOpen(true);
          }}
        />
      ) : viewType === 'lista' ? (
        /* VISÃO LISTA PRIORIZADA DE OPORTUNIDADES */
        <PrioritizedLeadList
          items={filteredPrioritizedItems}
          mode={activeMode}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedStateFilter={selectedStateFilter}
          onStateFilterChange={setSelectedStateFilter}
          selectedNicheFilter={selectedNicheFilter}
          onNicheFilterChange={setSelectedNicheFilter}
          allNiches={allNiches}
          onSelectLead={(item) => setSelectedPrioritizedLead(item)}
          onOpenSignalsModal={(comp, ld) => handleOpenSignals(comp, ld)}
          onAddNewCompany={openAddCompanyModal}
        />
      ) : (
        /* VISÃO FOCO (FILA 1 A 1) */
        <div>
          {!currentItem ? (
            <div className="p-8 sm:p-12 text-center bg-white dark:bg-[#181B20] rounded-2xl border border-[#E2E6EC] dark:border-[#272B33] space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#1E293B] dark:text-white">
                  Fila de {activeMode === 'OPORTUNIDADE_LATENTE' ? 'Oportunidade Latente' : 'Demanda Identificada'} em Dia!
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-md mx-auto">
                  Você não possui ações pendentes para hoje neste modo. Você pode adicionar novas empresas ou consultar a lista priorizada.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={openAddCompanyModal}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  + Adicionar Empresa
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setViewType('lista')}
                  leftIcon={<ListOrdered className="w-3.5 h-3.5" />}
                >
                  Ver Lista Priorizada
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Card da Empresa Atual & Decisor */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#181B20] border border-[#E2E6EC] dark:border-[#272B33] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-bold text-[#1E293B] dark:text-white">
                        {currentItem.company?.tradeName || currentItem.company?.name || currentItem.client.name}
                      </h3>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        {currentItem.company?.niche || 'Geral'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {currentItem.company?.city || 'Sem cidade'}, {currentItem.company?.country || 'Brasil'}
                      </span>
                      {currentItem.contact && (
                        <span className="flex items-center gap-1 font-medium text-[#1E293B] dark:text-white">
                          <User className="w-3.5 h-3.5 text-[#2563EB]" />
                          Decisor: {currentItem.contact.name} {currentItem.contact.role ? `(${currentItem.contact.role})` : ''}
                        </span>
                      )}
                      {(currentItem.contact?.whatsapp || currentItem.client.whatsapp) && (
                        <span className="font-mono text-[#334155] dark:text-[#CBD5E1]">
                          {currentItem.contact?.whatsapp || currentItem.client.whatsapp}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const comp = currentItem.company || companies.find((c) => c.id === currentItem.action.clientId);
                        if (comp) handleOpenSignals(comp, currentItem.lead || undefined);
                      }}
                      leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
                    >
                      Qualificar / Sinais
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsDrawerOpen(true)}
                    >
                      Ver Cadastro
                    </Button>
                  </div>
                </div>

                {/* SEÇÃO DO SCORE EXPLICÁVEL & ESTADO DA OPORTUNIDADE */}
                {currentExplanation && (
                  <OpportunityScoreCard
                    explanation={currentExplanation}
                    opportunityState={
                      currentItem.company?.opportunityState ||
                      currentItem.lead?.opportunityState ||
                      (activeMode === 'OPORTUNIDADE_LATENTE' ? 'HIPOTESE' : 'CONFIRMADO')
                    }
                    onUpdateState={async (newState) => {
                      const comp = currentItem.company || companies.find((c) => c.id === currentItem.action.clientId);
                      if (comp) {
                        await updateCompany({ ...comp, opportunityState: newState, updatedAt: new Date().toISOString() });
                        if (currentItem.lead) {
                          await updateLead({ ...currentItem.lead, opportunityState: newState, updatedAt: new Date().toISOString() });
                        }
                        success(`Estado da oportunidade atualizado para: ${newState}`);
                      }
                    }}
                  />
                )}

                {/* Bloco de Mensagem & Script de Abordagem */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1E293B] dark:text-white flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-[#2563EB]" />
                      Mensagem Preparada para este Prospect:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyMessage}
                        className="text-xs text-[#2563EB] dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
                      >
                        {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copiado!' : 'Copiar (C)'}
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#121418] border border-[#CBD5E1] dark:border-[#334155] text-xs sm:text-sm text-[#1E293B] dark:text-[#E2E8F0] whitespace-pre-line leading-relaxed">
                    {activeMessage}
                  </div>

                  {/* Ações de Execução */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleSkip}
                      >
                        Pular
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsAdiarOpen(true)}
                      >
                        Adiar
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleOpenWhatsApp}
                        leftIcon={<MessageCircle className="w-4 h-4 text-emerald-600" />}
                      >
                        ABRIR WHATSAPP (W)
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleComplete}
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Marcar Enviado & Avançar (Enter)
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. MODAIS E DRAWERS INTEGRADOS */}

      {/* Modal de Detalhes e Análise da Oportunidade */}
      {selectedPrioritizedLead && (
        <OpportunityDetailModal
          isOpen={Boolean(selectedPrioritizedLead)}
          onClose={() => setSelectedPrioritizedLead(null)}
          company={selectedPrioritizedLead.company}
          contact={selectedPrioritizedLead.contact}
          lead={selectedPrioritizedLead.lead}
          mode={activeMode}
          icps={icps}
          services={services}
          onOpenSignalSelector={() => {
            handleOpenSignals(selectedPrioritizedLead.company, selectedPrioritizedLead.lead);
          }}
          onUpdateOpportunityState={handleUpdateOpportunityState}
          onAdvanceToFunnelStage={async (newStage, note) => {
            if (selectedPrioritizedLead.lead) {
              await logInteractionAndAdvance({
                companyId: selectedPrioritizedLead.company.id,
                contactId: selectedPrioritizedLead.contact?.id,
                leadId: selectedPrioritizedLead.lead.id,
                channel: 'whatsapp',
                notes: note || `Avançado para ${newStage}`,
                newStage,
              });
            }
          }}
          onScheduleNextAction={async (title, date) => {
            if (selectedPrioritizedLead.lead) {
              await scheduleNextAction(selectedPrioritizedLead.lead.id, title, date);
            }
          }}
        />
      )}

      {/* Modal de Sinais e Diagnóstico */}
      {isSignalsModalOpen && targetCompanyForSignals && (
        <SignalSelectorModal
          isOpen={isSignalsModalOpen}
          onClose={() => {
            setIsSignalsModalOpen(false);
            setTargetCompanyForSignals(null);
            setTargetLeadForSignals(null);
          }}
          company={targetCompanyForSignals}
          lead={targetLeadForSignals}
          mode={activeMode}
          onSaveSignals={handleSaveSignals}
        />
      )}

      {/* Drawer de Perfis de Cliente Ideal (ICP) */}
      <IcpManagementDrawer
        isOpen={isIcpDrawerOpen}
        onClose={() => setIsIcpDrawerOpen(false)}
        icps={icps}
        services={services}
        onSaveIcp={async (newIcp) => {
          await upsertIcp(newIcp);
          success('Perfil ICP salvo com sucesso!');
        }}
        onDeleteIcp={async (id) => {
          await deleteIcp(id);
          success('Perfil ICP excluído.');
        }}
      />

      {/* Drawer de Detalhes da Empresa */}
      {isDrawerOpen && (
        <CompanyDetailsDrawer
          company={selectedCompanyForAi || currentItem?.company || companies.find((c) => c.id === currentItem?.action.clientId) || null}
          onClose={() => setIsDrawerOpen(false)}
          onEditCompany={(comp) => {
            setIsDrawerOpen(false);
          }}
        />
      )}

      {/* Modal de Análise Detalhada de Lead pela IA */}
      <AiLeadAnalysisModal
        isOpen={isAiAnalysisModalOpen}
        onClose={() => {
          setIsAiAnalysisModalOpen(false);
          setSelectedCompanyForAi(null);
          setSelectedLeadForAi(null);
        }}
        company={selectedCompanyForAi}
        lead={selectedLeadForAi}
      />

      {/* Modal de Funil Adaptativo */}
      <AdaptiveFunnelModal
        isOpen={isAdaptiveFunnelModalOpen}
        onClose={() => {
          setIsAdaptiveFunnelModalOpen(false);
          setSelectedCompanyForAdaptive(null);
          setSelectedLeadForAdaptive(null);
        }}
        company={selectedCompanyForAdaptive}
        lead={selectedLeadForAdaptive}
      />

      {/* Modal do Playbook Comercial */}
      <CommercialPlaybookModal
        isOpen={isPlaybookModalOpen}
        onClose={() => setIsPlaybookModalOpen(false)}
        initialStageId={playbookInitialStage}
      />

      {/* Modal de Ações Autorizadas da IA (Human-in-the-Loop) */}
      <AiAuthorizedActionsModal
        isOpen={isAiAuthorizedActionsModalOpen}
        onClose={() => setIsAiAuthorizedActionsModalOpen(false)}
      />

      {/* Modal de Aprendizado do Sistema & Métricas Fatuais */}
      <SystemLearningModal
        isOpen={isSystemLearningModalOpen}
        onClose={() => setIsSystemLearningModalOpen(false)}
      />

      {/* Modal de Adiar Ação */}
      {isAdiarOpen && (
        <Modal
          isOpen={isAdiarOpen}
          onClose={() => setIsAdiarOpen(false)}
          title="Adiar Próxima Ação"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Escolha quando este prospect deve reaparecer na sua fila:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleAdiar(1)}>
                Amanhã
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleAdiar(3)}>
                Em 3 dias
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleAdiar(7)}>
                Em 1 semana
              </Button>
            </div>
            <form onSubmit={handleCustomAdiar} className="space-y-2 pt-2 border-t border-[#E2E6EC] dark:border-[#272B33]">
              <label className="text-xs font-semibold text-[#1E293B] dark:text-white block">
                Ou selecione uma data específica:
              </label>
              <Input
                type="date"
                value={customAdiarDate}
                onChange={(e) => setCustomAdiarDate(e.target.value)}
              />
              <Button type="submit" variant="primary" size="sm" className="w-full">
                Reagendar
              </Button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

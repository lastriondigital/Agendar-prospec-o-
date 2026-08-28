import React, { useEffect, useState } from 'react';
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
  FastForward,
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
  Trophy,
  User,
  Zap,
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
import { Select } from '../components/ui/Select';
import {
  generateWhatsAppLink,
  getChannelBadgeDetails,
  formatPhoneNumber,
  formatRelativeDate,
} from '../utils/formatting';
import { ALL_LEAD_STAGES, STAGES_CONFIG } from '../utils/constants';
import { ContactChannel, HistoryEventType, LeadStage, CopilotActionType } from '../types';
import { CompanyDetailsDrawer } from '../components/clients/CompanyDetailsDrawer';
import { CopilotActionButtons } from '../components/copilot/CopilotActionButtons';
import { CopilotAssistantModal } from '../components/copilot/CopilotAssistantModal';
import { ApproachRecommendationCard } from '../components/sales/ApproachRecommendationCard';
import { ScoreBadge } from '../components/qualification/ScoreBadge';
import { QualificationModal } from '../components/qualification/QualificationModal';
import { LeadMessageModal } from '../components/qualification/LeadMessageModal';

export const ProspectingView: React.FC = () => {
  const {
    stages,
    companies,
    contacts,
    leads,
    services,
    history,
    completeAction,
    skipAction,
    rescheduleAction,
    logInteractionAndAdvance,
    scheduleNextAction,
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

  // Modal de Qualificação
  const [isQualificationOpen, setIsQualificationOpen] = useState(false);

  // Modal do Motor de Personalização (4x3)
  const [isLeadMessageModalOpen, setIsLeadMessageModalOpen] = useState(false);

  // Copiloto Gemini de Prospecção
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotInitialAction, setCopilotInitialAction] = useState<CopilotActionType>('PERSONALIZAR');
  const [showSalesApproach, setShowSalesApproach] = useState(false);

  // Item atual da fila
  const currentItem = queueItems[0] || null;

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

  // Atalhos de teclado (C: copiar, W: whatsapp, Enter: enviar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused || isAdiarOpen || isDrawerOpen || isQualificationOpen || isCopilotOpen) {
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
    isQualificationOpen,
    isCopilotOpen,
  ]);

  // Se a fila estiver vazia:
  if (!currentItem || queueItems.length === 0) {
    if (companies.length === 0) {
      return (
        <div className="space-y-6 max-w-2xl mx-auto py-8 animate-in fade-in duration-300">
          <ContextualTip
            id="prospecting_first_access_tip"
            title="Modo Prospecção Ativa"
            message="O Modo Prospecção é a tela de foco onde você executa uma ação por vez (mensagens WhatsApp, ligações, emails) com atalhos de teclado e scripts prontos."
          />

          <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] shadow-xs text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-[#3F6FB5] dark:text-blue-300 mx-auto flex items-center justify-center">
              <Zap className="w-8 h-8 fill-[#3F6FB5] dark:fill-blue-300" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#202124] dark:text-[#E8EAED]">
                Fila de Prospecção Vazia
              </h2>
              <p className="text-xs sm:text-sm text-[#5F6368] dark:text-[#9AA0A6] max-w-md mx-auto leading-relaxed">
                Adicione sua primeira empresa para que o sistema gere automaticamente as ações de abordagem e follow-up na sua fila de execução.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={openAddCompanyModal}
                leftIcon={<Building2 className="w-4 h-4" />}
                className="w-full sm:w-auto font-bold"
              >
                + Adicionar Primeira Empresa
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setActiveRoute('dashboard')}
                className="w-full sm:w-auto"
              >
                Voltar ao Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (completedToday.length === 0) {
      return (
        <div className="space-y-6 max-w-2xl mx-auto py-8 animate-in fade-in duration-300">
          <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] shadow-xs text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#3F6FB5] dark:text-blue-300 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#202124] dark:text-[#E8EAED]">
                Nenhuma Ação Agendada para Hoje
              </h2>
              <p className="text-xs sm:text-sm text-[#5F6368] dark:text-[#9AA0A6] max-w-md mx-auto leading-relaxed">
                Suas tarefas e follow-ups estão em dia. Você pode cadastrar novas empresas ou agendar novas abordagens no painel de clientes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => setActiveRoute('clients')}
                leftIcon={<Building2 className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Ver Empresas & Prospects
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setActiveRoute('dashboard')}
                className="w-full sm:w-auto"
              >
                Ir para o Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 max-w-2xl mx-auto py-8 animate-in fade-in duration-300">
        <div className="p-8 rounded-2xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] shadow-xs text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/40">
              Rotina Concluída com Sucesso
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#202124] dark:text-[#E8EAED]">
              Fila de Prospecção Finalizada!
            </h2>
            <p className="text-xs sm:text-sm text-[#5F6368] dark:text-[#9AA0A6] max-w-md mx-auto leading-relaxed">
              Você executou todas as ações planejadas para hoje. Excelente consistência!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto p-4 rounded-xl bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] text-left">
            <div>
              <span className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] font-medium uppercase block">Executadas Hoje</span>
              <span className="text-xl font-bold text-[#202124] dark:text-[#E8EAED] mt-0.5 block">{completedToday.length} ações</span>
            </div>
            <div>
              <span className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] font-medium uppercase block">Streak Atual</span>
              <span className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1">
                <Flame className="w-4 h-4 fill-current" />
                {streakDays} dias
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => setActiveRoute('dashboard')}
              leftIcon={<Zap className="w-4 h-4" />}
            >
              Ir para o Início
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setActiveRoute('clients')}
              leftIcon={<Building2 className="w-4 h-4" />}
            >
              Ver Clientes & Cadastros
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const channelDetails = getChannelBadgeDetails(currentItem.action.channel);
  const company = currentItem.company || companies.find((c) => c.id === currentItem.action.clientId);
  const contact = currentItem.contact || contacts.find((c) => c.companyId === company?.id);
  const lead = currentItem.lead || leads.find((l) => l.companyId === company?.id);
  const targetService = currentItem.service || services.find((s) => s.id === lead?.serviceId);
  const stageDef = STAGES_CONFIG[lead?.stage || 'NOVO'] || STAGES_CONFIG['NOVO'];

  const rawPhone = contact?.whatsapp || contact?.phone || currentItem.client.whatsapp || currentItem.client.phone;
  const currentActionEstMinutes = currentItem.action.estMinutes || 3;

  return (
    <div className="space-y-5 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* 1. BARRA DE STATUS DA SESSÃO ATIVA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] p-4 rounded-xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-[#3F6FB5] dark:text-blue-300 flex items-center justify-center font-bold text-sm">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#202124] dark:text-[#E8EAED] flex items-center gap-2">
              <span>Modo Foco em Execução</span>
              <Badge variant="blue" size="sm">
                Ao Vivo
              </Badge>
              {streakDays > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/40">
                  <Flame className="w-3 h-3 fill-current" /> {streakDays}d seguidos
                </span>
              )}
            </div>
            <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] mt-0.5">
              <strong>{metrics.pendingToday}</strong> restantes • Duração estimada: <strong>{formattedDuration}</strong> (~{currentActionEstMinutes} min nesta ação)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsPaused(true)}
            leftIcon={<Pause className="w-3.5 h-3.5" />}
          >
            Pausar
          </Button>

          <div className="hidden lg:flex items-center gap-2 text-xs text-[#5F6368] dark:text-[#9AA0A6] ml-2">
            <span className="flex items-center gap-1 bg-[#F7F8FA] dark:bg-[#1E2228] px-2 py-1 rounded-md border border-[#E6E8EB] dark:border-[#2D3139]">
              <Kbd>W</Kbd> WhatsApp
            </span>
            <span className="flex items-center gap-1 bg-[#F7F8FA] dark:bg-[#1E2228] px-2 py-1 rounded-md border border-[#E6E8EB] dark:border-[#2D3139]">
              <Kbd>C</Kbd> Copiar
            </span>
            <span className="flex items-center gap-1 bg-[#F7F8FA] dark:bg-[#1E2228] px-2 py-1 rounded-md border border-[#E6E8EB] dark:border-[#2D3139]">
              <Kbd>↵ Enter</Kbd> Concluir
            </span>
          </div>
        </div>
      </div>

      {/* 2. PALCO PRINCIPAL DE EXECUÇÃO EM 2 COLUNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* COLUNA ESQUERDA: DOSSIER COMPLETO & SCRIPT (7 colunas) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Card: Dossiê do Cliente, Empresa & Serviço */}
          <Card padding="md" className="space-y-4">
            {/* Topo do Dossiê */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant={channelDetails.label === 'WhatsApp' ? 'emerald' : 'blue'} size="sm">
                    {channelDetails.label}
                  </Badge>
                  {currentItem.objective && (
                    <Badge variant="purple" size="sm">
                      {currentItem.objective}
                    </Badge>
                  )}
                  <Badge variant={stageDef.badgeVariant} size="sm">
                    {stageDef.label}
                  </Badge>
                  <ScoreBadge
                    score={lead?.score || 50}
                    size="xs"
                    interactive
                    companyName={company?.name}
                  />
                </div>

                <h2 className="text-lg font-bold text-[#202124] dark:text-[#E8EAED] truncate pt-0.5">
                  {contact?.name || company?.name || 'Decisor Principal'}
                </h2>

                <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                  {contact?.role ? `${contact.role} • ` : ''}
                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="font-semibold text-[#202124] dark:text-[#E8EAED] hover:underline cursor-pointer"
                  >
                    {company?.name}
                  </button>
                  {company?.niche ? ` (${company.niche})` : ''}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setIsQualificationOpen(true)}
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                >
                  Qualificar
                </Button>
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => setIsDrawerOpen(true)}
                  leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Dossiê
                </Button>
              </div>
            </div>

            {/* Informações Rápidas de Contato */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-[#ECEEF1] dark:border-[#2D3139]">
              <div className="flex items-center gap-2 text-[#5F6368] dark:text-[#9AA0A6]">
                <Phone className="w-3.5 h-3.5 text-[#80868B]" />
                <span>{rawPhone ? formatPhoneNumber(rawPhone) : 'Sem telefone'}</span>
              </div>
              {company?.city && (
                <div className="flex items-center gap-2 text-[#5F6368] dark:text-[#9AA0A6]">
                  <MapPin className="w-3.5 h-3.5 text-[#80868B]" />
                  <span>{company.city}</span>
                </div>
              )}
              {company?.website && (
                <div className="flex items-center gap-2 text-[#5F6368] dark:text-[#9AA0A6] truncate">
                  <Globe className="w-3.5 h-3.5 text-[#80868B]" />
                  <a
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#3F6FB5] hover:underline truncate"
                  >
                    {company.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {targetService && (
                <div className="flex items-center gap-2 text-[#5F6368] dark:text-[#9AA0A6]">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Oferta: <strong>{targetService.name}</strong></span>
                </div>
              )}
            </div>

            {/* MOTIVO / GATILHO DE PRIORIDADE (POR QUÊ) */}
            <div className="p-3 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] text-xs space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#3F6FB5] block">
                Por que este prospect é prioritário hoje?
              </span>
              <p className="text-[#5F6368] dark:text-[#9AA0A6]">
                {lead?.qualificationResult?.recommendation ||
                  (lead?.score && lead.score >= 80
                    ? 'Lead com score alto (>80 pts). Excelente alinhamento com a oferta de serviço.'
                    : 'Ação planejada na rotina diária de prospecção.')}
              </p>
            </div>
          </Card>

          {/* Card: O Que Dizer — Script Pronto com Edição Rápida */}
          <Card padding="md" className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#3F6FB5]" />
                <h3 className="text-sm font-semibold text-[#202124] dark:text-[#E8EAED]">
                  Mensagem Personalizada & Script
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => setIsLeadMessageModalOpen(true)}
                  leftIcon={<Sparkles className="w-3 h-3 text-blue-500" />}
                  className="font-medium"
                >
                  Personalizar (4x3)
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setIsEditingMessage(!isEditingMessage)}
                  leftIcon={<Edit2 className="w-3 h-3" />}
                >
                  {isEditingMessage ? 'Fechar Edição' : 'Editar Mensagem'}
                </Button>
              </div>
            </div>

            {isEditingMessage ? (
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={7}
                className="w-full p-3 rounded-lg bg-white dark:bg-[#181B20] border border-[#DADDE1] dark:border-[#2D3139] text-xs text-[#202124] dark:text-[#E8EAED] font-sans leading-relaxed focus:outline-none focus:border-[#3F6FB5] resize-none"
              />
            ) : (
              <div className="p-3.5 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] text-xs sm:text-sm text-[#202124] dark:text-[#E8EAED] font-sans leading-relaxed whitespace-pre-line select-text">
                {activeMessage}
              </div>
            )}

            {/* Copiloto Gemini para Ajuste Rápido do Script */}
            <div className="pt-2 border-t border-[#ECEEF1] dark:border-[#2D3139]">
              <CopilotActionButtons
                onSelectAction={(action) => {
                  setCopilotInitialAction(action);
                  setIsCopilotOpen(true);
                }}
              />
            </div>
          </Card>
        </div>

        {/* COLUNA DIREITA: BOTÕES DE EXECUÇÃO & REGISTRO (5 colunas) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card de Ações Imediatas */}
          <Card padding="md" className="space-y-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5F6368] dark:text-[#9AA0A6]">
                Execução
              </span>
              <h3 className="text-sm font-bold text-[#202124] dark:text-[#E8EAED]">
                Enviar & Registrar
              </h3>
            </div>

            <div className="space-y-2">
              {/* Botão 1: Abrir WhatsApp */}
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Abrir WhatsApp com Mensagem</span>
              </button>

              {/* Botão 2: Copiar Mensagem */}
              <button
                type="button"
                onClick={handleCopyMessage}
                className="w-full py-2.5 px-4 rounded-lg bg-white dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] hover:bg-neutral-50 dark:hover:bg-[#252A32] text-[#202124] dark:text-[#E8EAED] font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-[#5F6368] dark:text-[#9AA0A6]" />
                <span>{copied ? '✓ Copiado!' : 'Copiar Mensagem (C)'}</span>
              </button>
            </div>

            {/* Formulário de Registro & Avanço */}
            <div className="pt-3 border-t border-[#ECEEF1] dark:border-[#2D3139] space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#202124] dark:text-[#E8EAED]">
                  Estágio no Funil Após Envio
                </label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value as LeadStage)}
                  className="w-full h-10 px-3 rounded-lg bg-white dark:bg-[#1E2228] border border-[#DADDE1] dark:border-[#2D3139] text-xs text-[#202124] dark:text-[#E8EAED] focus:outline-none focus:border-[#3F6FB5] font-medium"
                >
                  {ALL_LEAD_STAGES.map((st) => (
                    <option key={st} value={st}>
                      {STAGES_CONFIG[st]?.label || st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#202124] dark:text-[#E8EAED]">
                  Notas & Resultado do Contato (Opcional)
                </label>
                <textarea
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  rows={2}
                  placeholder="Ex: Mensagem enviada pelo WhatsApp, aguardando resposta..."
                  className="w-full p-2.5 bg-white dark:bg-[#1E2228] border border-[#DADDE1] dark:border-[#2D3139] rounded-lg text-xs text-[#202124] dark:text-[#E8EAED] placeholder:text-[#80868B] dark:placeholder:text-[#5F6368] focus:outline-none focus:border-[#3F6FB5] resize-none"
                />
              </div>

              {/* Próxima Ação Automática */}
              <div className="p-3 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scheduleNext}
                    onChange={(e) => setScheduleNext(e.target.checked)}
                    className="rounded border-[#DADDE1] text-[#3F6FB5] focus:ring-0"
                  />
                  <span className="text-xs font-semibold text-[#202124] dark:text-[#E8EAED]">
                    Agendar Próxima Ação Automática
                  </span>
                </label>

                {scheduleNext && (
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <input
                      type="text"
                      value={nextActionTitle}
                      onChange={(e) => setNextActionTitle(e.target.value)}
                      placeholder="Título da ação"
                      className="px-2.5 py-1.5 rounded-md bg-white dark:bg-[#181B20] border border-[#DADDE1] dark:border-[#2D3139] text-[#202124] dark:text-[#E8EAED] text-xs"
                    />
                    <select
                      value={nextActionDays}
                      onChange={(e) => setNextActionDays(Number(e.target.value))}
                      className="px-2 py-1.5 rounded-md bg-white dark:bg-[#181B20] border border-[#DADDE1] dark:border-[#2D3139] text-[#202124] dark:text-[#E8EAED] text-xs"
                    >
                      <option value={1}>Em 1 dia</option>
                      <option value={2}>Em 2 dias</option>
                      <option value={3}>Em 3 dias</option>
                      <option value={5}>Em 5 dias</option>
                      <option value={7}>Em 7 dias</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Botão de Envio & Avanço (Principal) */}
              <button
                type="button"
                onClick={handleComplete}
                className="w-full py-3.5 px-4 rounded-lg bg-[#3F6FB5] hover:bg-[#345d99] active:bg-[#2b4e82] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Marcar Enviado & Próximo (Enter)</span>
              </button>

              {/* Ações Secundárias: Pular e Adiar */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSkip}
                  className="flex-1 text-[#5F6368] dark:text-[#9AA0A6]"
                >
                  Pular (Mover p/ Final)
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAdiarOpen(true)}
                  className="flex-1 text-[#5F6368] dark:text-[#9AA0A6]"
                >
                  Adiar Ação...
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* MODAL DE PAUSA */}
      {isPaused && (
        <Modal
          isOpen={isPaused}
          onClose={() => setIsPaused(false)}
          title="Sessão em Pausa"
          size="sm"
        >
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 mx-auto flex items-center justify-center border border-amber-200 dark:border-amber-800/40">
              <Pause className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-semibold text-[#202124] dark:text-[#E8EAED]">
                Resumo da Sua Sessão
              </h3>
              <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                Você concluiu <strong>{completedToday.length}</strong> ações hoje. Restam <strong>{metrics.pendingToday}</strong> ações pendentes (~{formattedDuration}).
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsPaused(false)}
                leftIcon={<Play className="w-4 h-4" />}
                className="w-full"
              >
                Continuar Prospecção Agora
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsPaused(false);
                  setActiveRoute('dashboard');
                }}
                className="w-full"
              >
                Sair para o Início
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL DE ADIAR / REAGENDAR */}
      {isAdiarOpen && (
        <Modal
          isOpen={isAdiarOpen}
          onClose={() => setIsAdiarOpen(false)}
          title="Adiar ou Reagendar Ação"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
              Escolha para quando deseja mover esta ação de prospecção:
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleAdiar(1)}
                className="p-3 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] hover:bg-neutral-100 dark:hover:bg-[#252A32] text-xs font-semibold text-[#202124] dark:text-[#E8EAED] text-center transition-colors cursor-pointer"
              >
                +1 Dia
                <span className="block text-[10px] text-[#5F6368] dark:text-[#9AA0A6] font-normal mt-0.5">Amanhã</span>
              </button>
              <button
                type="button"
                onClick={() => handleAdiar(2)}
                className="p-3 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] hover:bg-neutral-100 dark:hover:bg-[#252A32] text-xs font-semibold text-[#202124] dark:text-[#E8EAED] text-center transition-colors cursor-pointer"
              >
                +2 Dias
                <span className="block text-[10px] text-[#5F6368] dark:text-[#9AA0A6] font-normal mt-0.5">Em 2 dias</span>
              </button>
              <button
                type="button"
                onClick={() => handleAdiar(7)}
                className="p-3 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] hover:bg-neutral-100 dark:hover:bg-[#252A32] text-xs font-semibold text-[#202124] dark:text-[#E8EAED] text-center transition-colors cursor-pointer"
              >
                +7 Dias
                <span className="block text-[10px] text-[#5F6368] dark:text-[#9AA0A6] font-normal mt-0.5">Em 1 semana</span>
              </button>
            </div>

            <form onSubmit={handleCustomAdiar} className="space-y-3 pt-2 border-t border-[#ECEEF1] dark:border-[#2D3139]">
              <label className="block text-xs font-medium text-[#202124] dark:text-[#E8EAED]">
                Ou selecione uma data específica:
              </label>
              <input
                type="date"
                value={customAdiarDate}
                onChange={(e) => setCustomAdiarDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className="w-full h-10 px-3 bg-white dark:bg-[#181B20] border border-[#DADDE1] dark:border-[#2D3139] rounded-lg text-xs text-[#202124] dark:text-[#E8EAED] focus:outline-none focus:border-[#3F6FB5]"
              />
              <Button type="submit" variant="primary" size="sm" className="w-full">
                Confirmar Reagendamento
              </Button>
            </form>
          </div>
        </Modal>
      )}

      {/* DRAWER DE DETALHES DA EMPRESA */}
      {isDrawerOpen && company && (
        <CompanyDetailsDrawer
          company={company}
          onClose={() => setIsDrawerOpen(false)}
          onEditCompany={() => {
            setIsDrawerOpen(false);
            setActiveRoute('clients');
          }}
        />
      )}

      {/* MODAL DE QUALIFICAÇÃO DE LEAD */}
      {company && lead && (
        <QualificationModal
          isOpen={isQualificationOpen}
          onClose={() => setIsQualificationOpen(false)}
          company={company}
          contact={contact}
          lead={lead}
        />
      )}

      {/* MODAL DO MOTOR DE PERSONALIZAÇÃO 4x3 & AUDITORIA */}
      {company && lead && (
        <LeadMessageModal
          isOpen={isLeadMessageModalOpen}
          onClose={() => setIsLeadMessageModalOpen(false)}
          company={company}
          lead={lead}
          initialContactId={contact?.id}
        />
      )}

      {/* MODAL DO COPILOTO GEMINI */}
      {company && (
        <CopilotAssistantModal
          isOpen={isCopilotOpen}
          onClose={() => setIsCopilotOpen(false)}
          company={company}
          contact={contact}
          lead={lead}
          service={targetService}
          initialActionType={copilotInitialAction}
        />
      )}
    </div>
  );
};

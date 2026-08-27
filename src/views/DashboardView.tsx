import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Kanban,
  MessageCircle,
  MessageSquareText,
  Phone,
  Plus,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useExecutionQueue } from '../hooks/useExecutionQueue';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { ContextualTip } from '../components/common/ContextualTip';
import { formatPhoneNumber, formatRelativeDate, getChannelBadgeDetails } from '../utils/formatting';
import { Company, Lead } from '../types';
import { STAGES_CONFIG } from '../utils/constants';
import { ScheduleActionModal } from '../components/clients/ScheduleActionModal';
import { CompanyDetailsDrawer } from '../components/clients/CompanyDetailsDrawer';
import { ScoreBadge } from '../components/qualification/ScoreBadge';

export const DashboardView: React.FC = () => {
  const {
    setActiveRoute,
    companies,
    contacts,
    leads,
    completeAction,
    rescheduleAction,
    scheduleNextAction,
    openTutorial,
    openAddCompanyModal,
  } = useApp();

  const {
    metrics,
    pendingActions,
    overdueActions,
    completedToday,
    queueItems,
    nextItem,
    categoryCounts,
    streakDays,
    weeklyProgress,
    priorityLeads,
    leadsWithoutNextAction,
    formattedDuration,
    dailyGoal,
    progressPercentage,
  } = useExecutionQueue();

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [schedulingLead, setSchedulingLead] = useState<{ lead: Lead; company: Company } | null>(null);

  const todayFormatted = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const handleStartProspecting = () => {
    setActiveRoute('prospecting');
  };

  const handleOpenCompanyDrawer = (companyId: string) => {
    const comp = companies.find((c) => c.id === companyId);
    if (comp) {
      setSelectedCompany(comp);
    }
  };

  const handleQuickReschedule = async (actionId: string, days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    await rescheduleAction(actionId, d.toISOString().slice(0, 10));
  };

  // ESTADO VAZIO / PRIMEIRO ACESSO: Sem empresas cadastradas
  if (companies.length === 0) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Dica Contextual Inicial */}
        <ContextualTip
          id="dashboard_first_access"
          title="Bem-vindo ao PROSPECT OS"
          message="Adicione sua primeira empresa para gerar a fila de execução diária, qualificar decisores e acompanhar o pipeline."
          actionLabel="Ver Tutorial Rápido (7 Passos)"
          onAction={openTutorial}
        />

        {/* Hero Card do Primeiro Acesso */}
        <div className="rounded-2xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] p-8 sm:p-12 shadow-xs text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-[#3F6FB5] dark:text-blue-300 mx-auto flex items-center justify-center shadow-xs">
            <Zap className="w-8 h-8 fill-[#3F6FB5] dark:fill-blue-300" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F8FA] dark:bg-[#20242A] border border-[#E6E8EB] dark:border-[#2D3139] text-xs font-semibold text-[#5F6368] dark:text-[#9AA0A6]">
              <span>Base Pronta</span>
              <span>•</span>
              <span>0 contatos • 0 follow-ups • 0 tarefas</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#202124] dark:text-[#E8EAED] tracking-tight">
              Olá! Vamos preparar sua prospecção.
            </h1>
            <p className="text-xs sm:text-sm text-[#5F6368] dark:text-[#9AA0A6] leading-relaxed">
              Seu painel está pronto para operar. Cadastre sua primeira empresa e seus decisores para gerar sua fila diária de execução sem hesitação.
            </p>
          </div>

          {/* Ação Principal: + ADICIONAR PRIMEIRA EMPRESA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={openAddCompanyModal}
              leftIcon={<Plus className="w-5 h-5" />}
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold shadow-xs"
            >
              + Adicionar Primeira Empresa
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={openTutorial}
              leftIcon={<Sparkles className="w-4 h-4 text-amber-500" />}
              className="w-full sm:w-auto"
            >
              Como Funciona (Tutorial)
            </Button>
          </div>
        </div>

        {/* Módulos de Inicialização (Você também pode:) */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5F6368] dark:text-[#9AA0A6] px-1">
            Você também pode:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveRoute('messages')}
              className="p-5 rounded-xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] hover:border-blue-300 dark:hover:border-blue-700/60 transition-colors flex flex-col justify-between space-y-4 cursor-pointer shadow-xs"
            >
              <div className="space-y-2">
                <div className="p-2.5 w-fit rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                  <MessageSquareText className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-[#202124] dark:text-[#E8EAED]">
                  Explorar Scripts Base
                </h4>
                <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] leading-relaxed">
                  Consulte os modelos de 1º Contato, Follow-up e Quebra de Objeções prontos para uso.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#3F6FB5] dark:text-blue-300 inline-flex items-center gap-1">
                Ver Scripts <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div
              onClick={() => setActiveRoute('pipeline')}
              className="p-5 rounded-xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-colors flex flex-col justify-between space-y-4 cursor-pointer shadow-xs"
            >
              <div className="space-y-2">
                <div className="p-2.5 w-fit rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <Kanban className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-[#202124] dark:text-[#E8EAED]">
                  Visualizar o Funil Comercial
                </h4>
                <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] leading-relaxed">
                  Conheça os estágios do pipeline (Novo, Primeiro Contato, Respondeu, Reunião, Proposta).
                </p>
              </div>
              <span className="text-xs font-semibold text-[#3F6FB5] dark:text-blue-300 inline-flex items-center gap-1">
                Ver Pipeline <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div
              onClick={() => setActiveRoute('sales-engine')}
              className="p-5 rounded-xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] hover:border-purple-300 dark:hover:border-purple-700/60 transition-colors flex flex-col justify-between space-y-4 cursor-pointer shadow-xs"
            >
              <div className="space-y-2">
                <div className="p-2.5 w-fit rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-[#202124] dark:text-[#E8EAED]">
                  Sales Engine & Objeções
                </h4>
                <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] leading-relaxed">
                  Biblioteca de argumentos de valor, contorno de objeções de preço e chamadas de ação (CTAs).
                </p>
              </div>
              <span className="text-xs font-semibold text-[#3F6FB5] dark:text-blue-300 inline-flex items-center gap-1">
                Ver Sales Engine <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. TOPO: SISTEMA OPERACIONAL DIÁRIO - HERO "HOJE" */}
      <div className="rounded-xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Lado Esquerdo: Identificação & Números Centrais do Dia */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#5F6368] dark:text-[#9AA0A6]">
                {todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1)}
              </span>
              {streakDays > 0 && (
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/40">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{streakDays} {streakDays === 1 ? 'dia' : 'dias'} de streak</span>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-baseline gap-3">
                <h1 className="text-3xl sm:text-4xl font-bold text-[#202124] dark:text-[#E8EAED] tracking-tight">
                  Hoje
                </h1>
                <span className="text-xl sm:text-2xl font-semibold text-[#3F6FB5]">
                  {metrics.pendingToday} {metrics.pendingToday === 1 ? 'ação pendente' : 'ações pendentes'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#5F6368] dark:text-[#9AA0A6] mt-1">
                <strong>{metrics.completedToday}/{dailyGoal}</strong> concluídas
                <span className="mx-2 text-[#DADDE1] dark:text-[#2D3139]">•</span>
                Tempo estimado: <strong>{formattedDuration}</strong>
              </p>
            </div>

            {/* Barra de Progresso Rápida da Meta */}
            <div className="max-w-md space-y-1 pt-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-[#5F6368] dark:text-[#9AA0A6]">Meta diária ({dailyGoal} ações)</span>
                <span className="text-[#3F6FB5] font-semibold">{progressPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-[#ECEEF1] dark:bg-[#20242A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3F6FB5] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, progressPercentage)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Lado Direito: Botão Central "COMEÇAR PROSPECÇÃO" */}
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={handleStartProspecting}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-lg bg-[#3F6FB5] hover:bg-[#345d99] active:bg-[#2b4e82] text-white font-semibold text-base shadow-xs transition-colors cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-white" />
              <span>COMEÇAR PROSPECÇÃO</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-[#5F6368] dark:text-[#9AA0A6]">
              <Clock className="w-3.5 h-3.5 text-[#80868B]" />
              <span>Modo foco: 1 ação por vez</span>
            </div>
          </div>
        </div>

        {/* 2. GRADE DE MÉTRICAS OPERACIONAIS DO DIA ("HOJE") */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-[#ECEEF1] dark:border-[#2D3139]">
          {/* Ações Pendentes */}
          <div className="p-3 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139]">
            <span className="text-xs text-[#5F6368] dark:text-[#9AA0A6] block font-medium">Pendentes</span>
            <span className="text-lg font-bold text-[#202124] dark:text-[#E8EAED] mt-0.5 block">
              {metrics.pendingToday}
            </span>
          </div>

          {/* Primeiros Contactos */}
          <div className="p-3 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139]">
            <span className="text-xs text-sky-700 dark:text-sky-400 block font-medium">1ºs Contactos</span>
            <span className="text-lg font-bold text-[#202124] dark:text-[#E8EAED] mt-0.5 block">
              {categoryCounts.firstContacts}
            </span>
          </div>

          {/* Follow-ups */}
          <div className="p-3 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139]">
            <span className="text-xs text-indigo-700 dark:text-indigo-400 block font-medium">Follow-ups</span>
            <span className="text-lg font-bold text-[#202124] dark:text-[#E8EAED] mt-0.5 block">
              {categoryCounts.followUps}
            </span>
          </div>

          {/* Propostas */}
          <div className="p-3 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139]">
            <span className="text-xs text-amber-700 dark:text-amber-400 block font-medium">Propostas</span>
            <span className="text-lg font-bold text-[#202124] dark:text-[#E8EAED] mt-0.5 block">
              {categoryCounts.proposals}
            </span>
          </div>

          {/* Reativações */}
          <div className="p-3 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139]">
            <span className="text-xs text-teal-700 dark:text-teal-400 block font-medium">Reativações</span>
            <span className="text-lg font-bold text-[#202124] dark:text-[#E8EAED] mt-0.5 block">
              {categoryCounts.reactivations}
            </span>
          </div>

          {/* Tarefas Atrasadas */}
          <div className={`p-3 rounded-lg border ${
            overdueActions.length > 0
              ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/40'
              : 'bg-[#F7F8FA] dark:bg-[#1E2228] border-[#E6E8EB] dark:border-[#2D3139]'
          }`}>
            <span className={`text-xs block font-medium ${
              overdueActions.length > 0 ? 'text-red-700 dark:text-red-300 font-semibold' : 'text-[#5F6368] dark:text-[#9AA0A6]'
            }`}>
              Atrasadas
            </span>
            <span className={`text-lg font-bold mt-0.5 block ${
              overdueActions.length > 0 ? 'text-red-700 dark:text-red-300' : 'text-[#202124] dark:text-[#E8EAED]'
            }`}>
              {overdueActions.length}
            </span>
          </div>
        </div>
      </div>

      {/* 3. ALERTAS DE TAREFAS ATRASADAS (SE HOUVER) */}
      {overdueActions.length > 0 && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Atenção: {overdueActions.length} {overdueActions.length === 1 ? 'ação atrasada' : 'ações atrasadas'}</span>
            </div>
            <span className="text-xs text-red-700 dark:text-red-400">Recomendado executar ou reagendar agora</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {overdueActions.slice(0, 4).map((action) => {
              const comp = companies.find((c) => c.id === action.clientId);
              const cont = contacts.find((c) => c.companyId === action.clientId);
              return (
                <div
                  key={action.id}
                  className="p-3 rounded-lg bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-[#202124] dark:text-[#E8EAED] truncate">
                      {cont?.name || comp?.name || 'Cliente'}
                    </div>
                    <div className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] truncate">
                      {comp?.name} • Agendado para {formatRelativeDate(action.scheduledDate)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleQuickReschedule(action.id, 1)}
                      title="Mover para amanhã"
                    >
                      +1d
                    </Button>
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={handleStartProspecting}
                    >
                      Executar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. PROGRESSO SEMANAL & STREAK DE EXECUÇÃO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Progresso Semanal (7 Dias) */}
        <Card padding="md" className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#202124] dark:text-[#E8EAED] flex items-center gap-2">
                <Target className="w-4 h-4 text-[#3F6FB5]" />
                Progresso Semanal de Execução
              </h3>
              <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                Consistência de prospecção nos dias da semana atual
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-[#5F6368] dark:text-[#9AA0A6]">
              Meta: {dailyGoal} / dia
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weeklyProgress.map((day) => (
              <div
                key={day.dateStr}
                className={`p-2.5 rounded-lg border text-center transition-colors ${
                  day.isToday
                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/40'
                    : day.completedCount > 0
                    ? 'bg-[#F7F8FA] dark:bg-[#1E2228] border-[#E6E8EB] dark:border-[#2D3139]'
                    : 'bg-white dark:bg-[#181B20] border-[#E6E8EB] dark:border-[#2D3139]'
                }`}
              >
                <span className={`text-[11px] font-semibold block ${
                  day.isToday ? 'text-[#3F6FB5] dark:text-blue-300' : 'text-[#5F6368] dark:text-[#9AA0A6]'
                }`}>
                  {day.dayShort}
                </span>

                <div className="my-1.5 flex items-center justify-center">
                  {day.completedCount >= day.goal ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  ) : (
                    <span className={`text-sm font-semibold font-mono ${
                      day.completedCount > 0 ? 'text-[#202124] dark:text-[#E8EAED]' : 'text-[#80868B]'
                    }`}>
                      {day.completedCount}
                    </span>
                  )}
                </div>

                <span className="text-[10px] text-[#80868B] font-mono">
                  {day.completedCount}/{day.goal}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Card Streak & Consistência */}
        <Card padding="md" className="flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#5F6368] dark:text-[#9AA0A6] uppercase tracking-wider">
                Streak de Prospecção
              </span>
              <Flame className="w-4 h-4 text-amber-500 fill-current" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#202124] dark:text-[#E8EAED]">
                {streakDays}
              </span>
              <span className="text-xs font-medium text-[#5F6368] dark:text-[#9AA0A6]">
                {streakDays === 1 ? 'dia consecutivo' : 'dias consecutivos'}
              </span>
            </div>

            <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] leading-relaxed">
              A disciplina diária de prospecção gera previsibilidade no pipeline e acelera novos fechos.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] text-xs text-[#5F6368] dark:text-[#9AA0A6]">
            <span className="text-[#202124] dark:text-[#E8EAED] font-semibold">Foco diário: </span>
            Execute os contatos sem hesitar em decisões que já foram planejadas.
          </div>
        </Card>
      </div>

      {/* 5. PRÓXIMA AÇÃO IMEDIATA (HERO DO FOCO) */}
      {nextItem ? (
        <Card padding="lg" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-[#3F6FB5] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Próxima Ação Imediata
                </span>
                <Badge variant="blue" size="sm">
                  {getChannelBadgeDetails(nextItem.action.channel).label}
                </Badge>
                {nextItem.objective && (
                  <Badge variant="neutral" size="sm">
                    {nextItem.objective}
                  </Badge>
                )}
                {nextItem.action.priority === 'high' && (
                  <Badge variant="rose" size="sm">
                    Alta Prioridade
                  </Badge>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#202124] dark:text-[#E8EAED]">
                  {nextItem.client.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#5F6368] dark:text-[#9AA0A6]">
                  {nextItem.client.role ? `${nextItem.client.role} na ` : ''}
                  <button
                    onClick={() => handleOpenCompanyDrawer(nextItem.action.clientId)}
                    className="text-[#202124] dark:text-[#E8EAED] font-semibold hover:underline cursor-pointer"
                  >
                    {nextItem.client.company}
                  </button>
                  {nextItem.client.segment && ` • ${nextItem.client.segment}`}
                </p>
              </div>

              {/* Pré-visualização da Mensagem */}
              <div className="p-3.5 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] text-xs sm:text-sm text-[#202124] dark:text-[#E8EAED] font-sans leading-relaxed whitespace-pre-line select-text">
                <div className="text-[10px] font-semibold text-[#5F6368] dark:text-[#9AA0A6] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Mensagem Preparada</span>
                  {nextItem.template && <span>{nextItem.template.title}</span>}
                </div>
                {nextItem.interpolatedMessage}
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 md:w-48 justify-center">
              <Button
                variant="primary"
                size="md"
                onClick={handleStartProspecting}
                leftIcon={<Zap className="w-4 h-4 fill-white" />}
              >
                Abrir Modo Foco
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => completeAction(nextItem.action.id, 'Concluído diretamente pelo dashboard')}
                leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              >
                Marcar Concluído
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenCompanyDrawer(nextItem.action.clientId)}
                leftIcon={<ExternalLink className="w-4 h-4" />}
              >
                Ver Empresa
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={<CheckCircle2 className="w-8 h-8 text-emerald-600" />}
          title="Todas as ações de hoje foram concluídas!"
          description="A fila diária está zerada. Deseja prospectar novos leads ou verificar o pipeline de oportunidades?"
          actionLabel="Ver Clientes & Leads"
          onAction={() => setActiveRoute('clients')}
          secondaryActionLabel="Ver Pipeline (Funil)"
          onSecondaryAction={() => setActiveRoute('pipeline')}
        />
      )}

      {/* 6. LEADS PRIORITÁRIOS & ENFORCEMENT DE PRÓXIMA AÇÃO */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#202124] dark:text-[#E8EAED] flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              Leads Prioritários
            </h3>
            <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
              Oportunidades em andamento que demandam acompanhamento
            </p>
          </div>

          <Button
            variant="ghost"
            size="xs"
            onClick={() => setActiveRoute('clients')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Ver todos
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {priorityLeads.map((item) => {
            const lead = item.lead;
            const comp = item.company || companies.find((c) => c.id === lead.companyId);
            const cont = item.contact || contacts.find((c) => c.id === lead.contactId) || contacts.find((c) => c.companyId === lead.companyId);
            const stageDef = STAGES_CONFIG[lead.stage] || STAGES_CONFIG['NOVO'];
            const hasNextAction = Boolean(lead.nextActionTitle && lead.nextActionDate);

            return (
              <Card
                key={lead.id}
                padding="sm"
                className="space-y-2.5 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={stageDef.badgeVariant} size="sm">
                        {stageDef.label}
                      </Badge>
                      <ScoreBadge
                        score={lead.score || item.scoreResult?.score || 50}
                        size="xs"
                        interactive
                        scoreResult={item.scoreResult}
                        companyName={comp?.name}
                      />
                    </div>
                    <h4
                      onClick={() => comp && setSelectedCompany(comp)}
                      className="text-sm font-semibold text-[#202124] dark:text-[#E8EAED] mt-1 truncate hover:underline cursor-pointer"
                    >
                      {cont?.name || comp?.name}
                    </h4>
                    <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] truncate">
                      {comp?.name} {comp?.niche ? `• ${comp.niche}` : ''}
                    </p>
                  </div>

                  <button
                    onClick={() => comp && setSelectedCompany(comp)}
                    className="p-1.5 rounded-lg text-[#5F6368] hover:text-[#202124] dark:text-[#9AA0A6] dark:hover:text-[#E8EAED] hover:bg-neutral-100 dark:hover:bg-[#20242A] transition-colors cursor-pointer shrink-0"
                    title="Ver detalhes"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Status da Próxima Ação com Alerta Visual Obrigatório */}
                <div className="pt-2 border-t border-[#ECEEF1] dark:border-[#2D3139] text-xs">
                  {hasNextAction ? (
                    <div className="flex items-center justify-between text-[#5F6368] dark:text-[#9AA0A6]">
                      <span className="truncate">📅 {lead.nextActionTitle}</span>
                      <span className="text-[11px] font-mono shrink-0 ml-2">
                        {formatRelativeDate(lead.nextActionDate!)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300">
                      <span className="font-medium text-[11px]">
                        ⚠️ Precisa de próxima ação
                      </span>
                      <button
                        onClick={() => comp && setSchedulingLead({ lead, company: comp })}
                        className="text-[11px] font-semibold underline hover:text-amber-950 cursor-pointer shrink-0 ml-2"
                      >
                        Agendar
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Drawer de Detalhes da Empresa */}
      {selectedCompany && (
        <CompanyDetailsDrawer
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onEditCompany={() => {
            setSelectedCompany(null);
            setActiveRoute('clients');
          }}
        />
      )}

      {/* Modal para Agendar Próxima Ação Rápida */}
      {schedulingLead && (
        <ScheduleActionModal
          isOpen={true}
          onClose={() => setSchedulingLead(null)}
          leadId={schedulingLead.lead.id}
          companyName={schedulingLead.company.name}
          currentTitle={schedulingLead.lead.nextActionTitle}
          currentDate={schedulingLead.lead.nextActionDate}
          currentChannel={schedulingLead.lead.nextActionChannel}
          onSchedule={async (title, date, channel) => {
            await scheduleNextAction(schedulingLead.lead.id, title, date, channel);
            setSchedulingLead(null);
          }}
        />
      )}
    </div>
  );
};

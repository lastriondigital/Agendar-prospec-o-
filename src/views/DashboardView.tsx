import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  MessageCircle,
  Phone,
  Plus,
  RotateCcw,
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. TOPO: SISTEMA OPERACIONAL DIÁRIO - HERO "HOJE" */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900/95 to-neutral-950 border border-neutral-800 p-6 sm:p-8 shadow-xl">
        {/* Glow sutil */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Lado Esquerdo: Identificação & Números Centrais do Dia */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Hoje • {todayFormatted}
              </span>
              {streakDays > 0 && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{streakDays} {streakDays === 1 ? 'dia' : 'dias'} de streak</span>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-baseline gap-3">
                <h1 className="text-4xl sm:text-5xl font-black text-neutral-100 tracking-tight">
                  Hoje
                </h1>
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                  {metrics.pendingToday} {metrics.pendingToday === 1 ? 'ação' : 'ações'}
                </span>
              </div>
              <p className="text-sm sm:text-base text-neutral-400 font-medium mt-1">
                <strong className="text-neutral-200">{metrics.completedToday}/{dailyGoal}</strong> concluídas
                <span className="mx-2 text-neutral-600">•</span>
                Tempo estimado: <strong className="text-neutral-200">{formattedDuration}</strong>
              </p>
            </div>

            {/* Barra de Progresso Rápida da Meta */}
            <div className="max-w-md space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-neutral-400">Progresso da meta diária</span>
                <span className="text-emerald-400">{progressPercentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-neutral-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, progressPercentage)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Lado Direito: Botão Central "COMEÇAR PROSPECÇÃO" */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={handleStartProspecting}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-base sm:text-lg tracking-wide uppercase shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              <Zap className="w-6 h-6 fill-neutral-950 text-neutral-950 transition-transform group-hover:scale-110" />
              <span>COMEÇAR PROSPECÇÃO</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-neutral-400">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              <span>Decisões eliminadas: 1 ação por vez</span>
            </div>
          </div>
        </div>

        {/* 2. GRADE DE MÉTRICAS OPERACIONAIS DO DIA ("HOJE") */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8 pt-6 border-t border-neutral-800/80">
          {/* Ações Pendentes */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
            <span className="text-[11px] font-medium text-neutral-400 block">Pendentes</span>
            <span className="text-xl font-bold text-neutral-100 mt-1 block">
              {metrics.pendingToday}
            </span>
          </div>

          {/* Primeiros Contactos */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
            <span className="text-[11px] font-medium text-sky-400 block">1ºs Contactos</span>
            <span className="text-xl font-bold text-sky-300 mt-1 block">
              {categoryCounts.firstContacts}
            </span>
          </div>

          {/* Follow-ups */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
            <span className="text-[11px] font-medium text-indigo-400 block">Follow-ups</span>
            <span className="text-xl font-bold text-indigo-300 mt-1 block">
              {categoryCounts.followUps}
            </span>
          </div>

          {/* Propostas */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
            <span className="text-[11px] font-medium text-amber-400 block">Propostas</span>
            <span className="text-xl font-bold text-amber-300 mt-1 block">
              {categoryCounts.proposals}
            </span>
          </div>

          {/* Reativações */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
            <span className="text-[11px] font-medium text-teal-400 block">Reativações</span>
            <span className="text-xl font-bold text-teal-300 mt-1 block">
              {categoryCounts.reactivations}
            </span>
          </div>

          {/* Tarefas Atrasadas */}
          <div className={`p-3.5 rounded-xl border ${
            overdueActions.length > 0
              ? 'bg-rose-500/10 border-rose-500/30'
              : 'bg-neutral-950/60 border-neutral-800/80'
          }`}>
            <span className={`text-[11px] font-medium block ${
              overdueActions.length > 0 ? 'text-rose-400' : 'text-neutral-400'
            }`}>
              Atrasadas
            </span>
            <span className={`text-xl font-bold mt-1 block ${
              overdueActions.length > 0 ? 'text-rose-400' : 'text-neutral-100'
            }`}>
              {overdueActions.length}
            </span>
          </div>
        </div>
      </div>

      {/* 3. ALERTAS DE TAREFAS ATRASADAS (SE HOUVER) */}
      {overdueActions.length > 0 && (
        <Card padding="md" className="bg-rose-950/20 border-rose-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Atenção: {overdueActions.length} {overdueActions.length === 1 ? 'ação atrasada' : 'ações atrasadas'}</span>
            </div>
            <span className="text-xs text-rose-300/80">Recomendado executar ou reagendar agora</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {overdueActions.slice(0, 4).map((action) => {
              const comp = companies.find((c) => c.id === action.clientId);
              const cont = contacts.find((c) => c.companyId === action.clientId);
              return (
                <div
                  key={action.id}
                  className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-neutral-200 truncate">
                      {cont?.name || comp?.name || 'Cliente'}
                    </div>
                    <div className="text-[11px] text-neutral-400 truncate">
                      {comp?.name} • Agendado para {formatRelativeDate(action.scheduledDate)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleQuickReschedule(action.id, 1)}
                      className="text-neutral-400 hover:text-neutral-200"
                      title="Mover para amanhã"
                    >
                      +1d
                    </Button>
                    <Button
                      variant="execution"
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
        </Card>
      )}

      {/* 4. PROGRESSO SEMANAL & STREAK DE EXECUÇÃO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Progresso Semanal (7 Dias) */}
        <Card padding="md" className="lg:col-span-2 bg-neutral-900/90 border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Progresso Semanal de Execução
              </h3>
              <p className="text-xs text-neutral-400">
                Consistência de prospecção nos dias da semana atual
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-neutral-400">
              Meta: {dailyGoal} / dia
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weeklyProgress.map((day) => (
              <div
                key={day.dateStr}
                className={`p-3 rounded-xl border text-center transition-all ${
                  day.isToday
                    ? 'bg-emerald-500/10 border-emerald-500/50 shadow-sm'
                    : day.completedCount > 0
                    ? 'bg-neutral-950 border-neutral-800'
                    : 'bg-neutral-950/40 border-neutral-900 text-neutral-600'
                }`}
              >
                <span className={`text-[11px] font-bold block ${
                  day.isToday ? 'text-emerald-400' : 'text-neutral-400'
                }`}>
                  {day.dayShort}
                </span>

                <div className="my-2 flex items-center justify-center">
                  {day.completedCount >= day.goal ? (
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  ) : (
                    <span className={`text-base font-extrabold font-mono ${
                      day.completedCount > 0 ? 'text-neutral-200' : 'text-neutral-600'
                    }`}>
                      {day.completedCount}
                    </span>
                  )}
                </div>

                <span className="text-[10px] text-neutral-500 font-mono">
                  {day.completedCount}/{day.goal}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Card Streak & Consistência */}
        <Card padding="md" className="bg-neutral-900/90 border-neutral-800 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Streak de Prospecção
              </span>
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-400">
                {streakDays}
              </span>
              <span className="text-sm font-semibold text-neutral-300">
                {streakDays === 1 ? 'dia consecutivo' : 'dias consecutivos'}
              </span>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              A disciplina de prospecção diária gera previsibilidade no pipeline e fecha mais clientes.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
            <span className="text-emerald-400 font-semibold">Dica de alta velocidade: </span>
            Execute os contatos sem pausar para analisar detalhes que já foram decididos.
          </div>
        </Card>
      </div>

      {/* 5. PRÓXIMA AÇÃO IMEDIATA (HERO DO FOCO) */}
      {nextItem ? (
        <Card
          variant="accent"
          padding="lg"
          className="border-emerald-500/40 bg-neutral-900/95 relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 fill-emerald-400" />
                  Próxima Ação Imediata
                </span>
                <Badge variant="emerald" size="sm">
                  {getChannelBadgeDetails(nextItem.action.channel).label}
                </Badge>
                {nextItem.objective && (
                  <Badge variant="blue" size="sm">
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
                <h3 className="text-xl font-extrabold text-neutral-100">
                  {nextItem.client.name}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 font-medium">
                  {nextItem.client.role ? `${nextItem.client.role} na ` : ''}
                  <button
                    onClick={() => handleOpenCompanyDrawer(nextItem.action.clientId)}
                    className="text-neutral-200 font-bold hover:underline cursor-pointer"
                  >
                    {nextItem.client.company}
                  </button>
                  {nextItem.client.segment && ` • ${nextItem.client.segment}`}
                </p>
              </div>

              {/* Pré-visualização da Mensagem */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs sm:text-sm text-neutral-200 font-sans leading-relaxed whitespace-pre-line select-text">
                <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Mensagem Preparada</span>
                  {nextItem.template && <span>{nextItem.template.title}</span>}
                </div>
                {nextItem.interpolatedMessage}
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 md:w-52 justify-center">
              <Button
                variant="execution"
                size="lg"
                onClick={handleStartProspecting}
                leftIcon={<Zap className="w-4 h-4 fill-white" />}
              >
                Abrir Modo Foco
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => completeAction(nextItem.action.id, 'Concluído diretamente pelo dashboard')}
                leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
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
          icon={<CheckCircle2 className="w-10 h-10 text-emerald-400" />}
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
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Leads Prioritários
            </h3>
            <p className="text-xs text-neutral-400">
              Oportunidades quentes que demandam acompanhamento rigoroso
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
          {priorityLeads.map((lead) => {
            const comp = companies.find((c) => c.id === lead.companyId);
            const cont = contacts.find((c) => c.id === lead.contactId) || contacts.find((c) => c.companyId === lead.companyId);
            const stageDef = STAGES_CONFIG[lead.stage] || STAGES_CONFIG['NOVO'];
            const hasNextAction = Boolean(lead.nextActionTitle && lead.nextActionDate);

            return (
              <Card
                key={lead.id}
                padding="sm"
                className="bg-neutral-900/90 border-neutral-800 space-y-3 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={stageDef.badgeVariant} size="sm">
                        {stageDef.label}
                      </Badge>
                      <ScoreBadge
                        score={lead.score || 50}
                        size="xs"
                        interactive
                        scoreResult={(lead as any).scoreResult}
                        companyName={comp?.name}
                      />
                    </div>
                    <h4
                      onClick={() => comp && setSelectedCompany(comp)}
                      className="text-sm font-bold text-neutral-100 mt-1 truncate hover:underline cursor-pointer"
                    >
                      {cont?.name || comp?.name}
                    </h4>
                    <p className="text-xs text-neutral-400 truncate">
                      {comp?.name} {comp?.niche ? `• ${comp.niche}` : ''}
                    </p>
                  </div>

                  <button
                    onClick={() => comp && setSelectedCompany(comp)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
                    title="Ver detalhes"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Status da Próxima Ação com Alerta Visual Obrigatório */}
                <div className="pt-2 border-t border-neutral-800/80 text-xs">
                  {hasNextAction ? (
                    <div className="flex items-center justify-between text-neutral-300">
                      <span className="truncate">📅 {lead.nextActionTitle}</span>
                      <span className="text-[11px] font-mono text-neutral-400 shrink-0 ml-2">
                        {formatRelativeDate(lead.nextActionDate!)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
                      <span className="font-semibold text-[11px]">
                        ⚠️ Este lead precisa de uma próxima ação.
                      </span>
                      <button
                        onClick={() => comp && setSchedulingLead({ lead, company: comp })}
                        className="text-[11px] font-bold underline hover:text-amber-200 cursor-pointer shrink-0 ml-2"
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

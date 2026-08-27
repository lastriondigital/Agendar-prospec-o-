import React, { useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Trash2,
  Zap,
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  MessageSquare,
  Building2,
  Phone,
  Layers,
  Sparkles,
  Send,
  Eye,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import { useToast } from '../context/ToastContext';
import { ContactChannel, ProspectAction } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { ScheduleMessageModal } from '../components/messaging/ScheduleMessageModal';
import { getChannelBadgeDetails, formatPhoneNumber } from '../utils/formatting';
import { CAMPAIGN_TYPE_LABELS } from '../utils/cadenceUtils';

export const PlannerView: React.FC = () => {
  const {
    actions,
    leads,
    companies,
    contacts,
    campaigns,
    templates,
    upsertAction,
    completeAction,
    deleteAction,
    rescheduleAction,
    setActiveRoute,
  } = useApp();

  const confirm = useConfirm();
  const { success, error } = useToast();

  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'year'>('month');
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'overdue' | 'all'>('pending');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Modal para criar novo agendamento completo
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Modal para visualizar/editar mensagem agendada
  const [previewAction, setPreviewAction] = useState<ProspectAction | null>(null);

  // Modal para adiar / reagendar
  const [reschedulingAction, setReschedulingAction] = useState<ProspectAction | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [newRescheduleTime, setNewRescheduleTime] = useState('10:30');

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const dailyLimit = 25; // Limite padrão diário para evitar sobrecarga

  // Ações do dia selecionado
  const actionsOnSelectedDate = useMemo(() => {
    return actions.filter(
      (a) =>
        a.scheduledDate === selectedDate &&
        (a.status === 'pending' || a.status === 'agendada' || a.status === 'rescheduled')
    );
  }, [actions, selectedDate]);

  const isOverloaded = actionsOnSelectedDate.length >= dailyLimit;

  // Filtragem de ações
  const filteredActions = useMemo(() => {
    return actions
      .filter((a) => {
        const isPending =
          a.status === 'pending' || a.status === 'agendada' || a.status === 'rescheduled';
        if (activeTab === 'pending') return isPending;
        if (activeTab === 'completed') return a.status === 'completed';
        if (activeTab === 'overdue') return isPending && a.scheduledDate < todayStr;
        return true;
      })
      .sort((a, b) => {
        const dateCompare = a.scheduledDate.localeCompare(b.scheduledDate);
        if (dateCompare !== 0) return dateCompare;
        return (a.scheduledTime || '00:00').localeCompare(b.scheduledTime || '00:00');
      });
  }, [actions, activeTab, todayStr]);

  const overdueCount = useMemo(
    () =>
      actions.filter(
        (a) =>
          (a.status === 'pending' || a.status === 'agendada' || a.status === 'rescheduled') &&
          a.scheduledDate < todayStr
      ).length,
    [actions, todayStr]
  );

  const pendingCount = useMemo(
    () =>
      actions.filter(
        (a) => a.status === 'pending' || a.status === 'agendada' || a.status === 'rescheduled'
      ).length,
    [actions]
  );

  const completedCount = useMemo(
    () => actions.filter((a) => a.status === 'completed').length,
    [actions]
  );

  const handleRescheduleSubmit = async () => {
    if (!reschedulingAction) return;
    const now = new Date().toISOString();
    const updated: ProspectAction = {
      ...reschedulingAction,
      scheduledDate: newRescheduleDate,
      scheduledTime: newRescheduleTime,
      status: 'rescheduled',
      updatedAt: now,
    };
    await upsertAction(updated);
    setReschedulingAction(null);
    success(`Mensagem reagendada para ${newRescheduleDate} às ${newRescheduleTime}`);
  };

  const handleDeleteAction = (action: ProspectAction) => {
    confirm({
      title: 'Excluir Mensagem Agendada',
      message: 'Deseja remover esta mensagem agendada da sua fila de prospecção?',
      isDestructive: true,
      onConfirm: async () => {
        await deleteAction(action.id);
        success('Mensagem removida da fila.');
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-400" />
            Fila & Planejador de Mensagens Agendadas
          </h2>
          <p className="text-xs text-neutral-400">
            Acompanhe a linha do tempo, execute mensagens agendadas e controle o fluxo diário de prospecção.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="execution"
            size="sm"
            onClick={() => setActiveRoute('prospecting')}
            leftIcon={<Zap className="w-4 h-4 fill-white" />}
          >
            Execução Ativa
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsScheduleModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Agendar Mensagem
          </Button>
        </div>
      </div>

      {/* Visão Hierárquica e Painel de Controle */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Painel Esquerdo: Contadores e Modos */}
        <Card padding="md" className="bg-neutral-900 border-neutral-800 space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Visão Temporal
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-medium">
              Sincronizado
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" /> Mês
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" /> Semana
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'day'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" /> Dia
            </button>
            <button
              onClick={() => setViewMode('year')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'year'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5" /> Ano ({selectedYear})
            </button>
          </div>

          <div className="pt-3 border-t border-neutral-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-400">Mensagens Pendentes:</span>
              <span className="font-bold text-neutral-100">{pendingCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Atrasadas / Atenção:</span>
              <span className="font-bold text-rose-400">{overdueCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Concluídas / Enviadas:</span>
              <span className="font-bold text-emerald-400">{completedCount}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-neutral-800/60">
              <span className="text-neutral-400">Carga do Dia ({selectedDate}):</span>
              <span className="font-bold text-neutral-200">
                {actionsOnSelectedDate.length} / {dailyLimit}
              </span>
            </div>
          </div>

          {isOverloaded && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>Atenção: Limite diário atingido. Considere redistribuir os envios para outros dias.</span>
            </div>
          )}
        </Card>

        {/* Painel Principal com Fila de Ações */}
        <div className="lg:col-span-3 space-y-4">
          {/* Tabs de Filtro por Status */}
          <div className="flex flex-wrap items-center justify-between border-b border-neutral-800 pb-3 gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'pending'
                    ? 'bg-neutral-800 text-emerald-400 border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Agendadas ({pendingCount})
              </button>
              <button
                onClick={() => setActiveTab('overdue')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'overdue'
                    ? 'bg-neutral-800 text-rose-400 border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Atrasadas ({overdueCount})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'completed'
                    ? 'bg-neutral-800 text-emerald-400 border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Concluídas ({completedCount})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-neutral-800 text-emerald-400 border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Todas ({actions.length})
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span>Data foco:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-100 text-xs focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Lista de Mensagens Agendadas */}
          <div className="space-y-3">
            {filteredActions.length > 0 ? (
              filteredActions.map((action) => {
                const lead = leads.find((l) => l.id === action.clientId || l.id === action.leadId);
                const comp = companies.find(
                  (c) => c.id === action.companyId || (lead && c.id === lead.companyId)
                );
                const cont = contacts.find(
                  (c) => c.id === action.contactId || (lead && c.id === lead.contactId)
                );
                const campaign = campaigns.find((c) => c.id === action.campaignId);
                const channel = getChannelBadgeDetails(action.channel);
                const isOverdue =
                  (action.status === 'pending' || action.status === 'agendada' || action.status === 'rescheduled') &&
                  action.scheduledDate < todayStr;
                const isToday = action.scheduledDate === todayStr;
                const displayActionType = action.actionType || 'Primeiro contato';

                return (
                  <Card
                    key={action.id}
                    padding="md"
                    className={`bg-neutral-900 border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                      isOverdue
                        ? 'border-rose-500/40 bg-rose-950/10'
                        : isToday
                        ? 'border-emerald-500/40 bg-emerald-950/5'
                        : ''
                    }`}
                  >
                    <div className="space-y-2.5 flex-1">
                      {/* Badges: Canal, Tipo de Ação, Data, Hora, Campanha */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${channel.bgClass} ${channel.textClass}`}
                        >
                          {channel.label}
                        </span>

                        <Badge variant="emerald" size="sm">
                          🎯 {displayActionType}
                        </Badge>

                        <Badge
                          variant={isOverdue ? 'rose' : isToday ? 'emerald' : 'neutral'}
                          size="sm"
                        >
                          {isOverdue
                            ? `Atrasada (${action.scheduledDate})`
                            : isToday
                            ? 'Hoje'
                            : action.scheduledDate}
                        </Badge>

                        {action.scheduledTime && (
                          <span className="text-[11px] font-mono text-neutral-300 bg-neutral-800 px-2 py-0.5 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-400" />
                            {action.scheduledTime}
                          </span>
                        )}

                        {campaign && (
                          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                            Campanha: {campaign.name}
                          </span>
                        )}
                      </div>

                      {/* Prospect / Empresa e Contato */}
                      <div>
                        <h4 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                          {comp?.name || 'Prospect não identificado'}
                          <span className="text-xs font-normal text-neutral-400">
                            • {cont?.name ? `${cont.name}` : 'Sem contato nominal'}
                          </span>
                        </h4>

                        {/* Mensagem customizada snapshot */}
                        {action.customMessage && (
                          <p className="text-xs text-neutral-300 bg-neutral-950 p-2 rounded-lg border border-neutral-800/80 mt-1 line-clamp-2 italic">
                            "{action.customMessage}"
                          </p>
                        )}

                        {/* Observações */}
                        {action.notes && (
                          <p className="text-[11px] text-neutral-400 mt-1">
                            <span className="text-neutral-500 font-semibold">Obs:</span> {action.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Botões Operacionais */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setPreviewAction(action)}
                        title="Ver Mensagem Completa"
                      >
                        <Eye className="w-3.5 h-3.5 text-neutral-300" />
                      </Button>

                      {action.status !== 'completed' ? (
                        <>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => {
                              setReschedulingAction(action);
                              setNewRescheduleDate(action.scheduledDate);
                              setNewRescheduleTime(action.scheduledTime || '10:30');
                            }}
                          >
                            Adiar / Reagendar
                          </Button>

                          <Button
                            variant="execution"
                            size="xs"
                            onClick={() => completeAction(action.id)}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          >
                            Concluir Envio
                          </Button>
                        </>
                      ) : (
                        <Badge variant="emerald" size="sm">
                          Concluída
                        </Badge>
                      )}

                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDeleteAction(action)}
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      </Button>
                    </div>
                  </Card>
                );
              })
            ) : (
              <EmptyState
                icon={<CalendarIcon className="w-8 h-8 text-neutral-400" />}
                title="Nenhuma mensagem agendada para este filtro"
                description="Use o botão acima para agendar mensagens de prospecção para seus contatos."
                actionLabel="Agendar Mensagem Agora"
                onAction={() => setIsScheduleModalOpen(true)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal Principal de Agendamento */}
      {isScheduleModalOpen && (
        <ScheduleMessageModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
        />
      )}

      {/* Modal Visualizar Prévia da Mensagem */}
      {previewAction && (
        <Modal
          isOpen={Boolean(previewAction)}
          onClose={() => setPreviewAction(null)}
          title="Detalhes da Mensagem Agendada"
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-2 bg-neutral-900 p-3 rounded-xl border border-neutral-800">
              <div>
                <span className="text-neutral-500 block text-[10px]">Data & Hora:</span>
                <strong className="text-neutral-100">
                  {previewAction.scheduledDate} às {previewAction.scheduledTime || '10:30'}
                </strong>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">Tipo de Ação:</span>
                <strong className="text-emerald-400">{previewAction.actionType || 'Geral'}</strong>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">Canal:</span>
                <strong className="text-neutral-100 uppercase">{previewAction.channel}</strong>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">Script Base:</span>
                <strong className="text-neutral-100">
                  {previewAction.scriptName || 'Personalizado'}
                </strong>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Texto Formatado para Disparo:
              </label>
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-neutral-100 whitespace-pre-line leading-relaxed font-sans select-text">
                {previewAction.customMessage || 'Sem conteúdo de texto'}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(previewAction.customMessage || '');
                  success('Texto copiado!');
                }}
              >
                Copiar Mensagem
              </Button>
              <Button variant="primary" size="sm" onClick={() => setPreviewAction(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Reagendar / Adiar */}
      {reschedulingAction && (
        <Modal
          isOpen={Boolean(reschedulingAction)}
          onClose={() => setReschedulingAction(null)}
          title="Reagendar / Adiar Mensagem"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-neutral-300">
              Defina a nova data e horário para a execução desta mensagem agendada:
            </p>

            <Input
              label="Nova Data *"
              type="date"
              value={newRescheduleDate}
              onChange={(e) => setNewRescheduleDate(e.target.value)}
              required
            />

            <Input
              label="Novo Horário *"
              type="time"
              value={newRescheduleTime}
              onChange={(e) => setNewRescheduleTime(e.target.value)}
              required
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <Button variant="ghost" size="sm" onClick={() => setReschedulingAction(null)}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleRescheduleSubmit}>
                Confirmar Reagendamento
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

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
  Send,
  Edit2,
  RotateCcw,
  Search,
  Building2,
  User,
  Sparkles,
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
import { getChannelBadgeDetails, generateWhatsAppLink, formatPhoneNumber, interpolateMessage } from '../utils/formatting';
import { ScheduleMessageModal } from '../components/scheduling/ScheduleMessageModal';
import { ACTION_TYPE_OPTIONS } from '../utils/schedulingConfig';

export const PlannerView: React.FC = () => {
  const {
    actions,
    companies,
    contacts,
    clients,
    campaigns,
    templates,
    services,
    settings,
    upsertAction,
    completeAction,
    deleteAction,
    rescheduleAction,
    setActiveRoute,
  } = useApp();
  const confirm = useConfirm();
  const { success, error } = useToast();

  const [viewMode, setViewMode] = useState<'year' | 'month' | 'week' | 'day'>('month');
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'overdue' | 'all'>('pending');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Search and channel filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string>('all');
  const [selectedCampaignFilter, setSelectedCampaignFilter] = useState<string>('all');

  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<ProspectAction | null>(null);

  const [reschedulingAction, setReschedulingAction] = useState<ProspectAction | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState(new Date().toISOString().slice(0, 10));
  const [newRescheduleTime, setNewRescheduleTime] = useState('10:30');

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Metas e Limites Calculados
  const dailyLimit = settings.dailyGoal || 20;
  const actionsOnSelectedDate = useMemo(() => {
    return actions.filter((a) => a.scheduledDate === selectedDate && a.status === 'pending');
  }, [actions, selectedDate]);

  const isOverloaded = actionsOnSelectedDate.length >= dailyLimit;

  // Filtragem de ações baseada na aba selecionada e filtros adicionais
  const filteredActions = useMemo(() => {
    return actions
      .filter((a) => {
        // Status filter
        if (activeTab === 'pending' && a.status !== 'pending') return false;
        if (activeTab === 'completed' && a.status !== 'completed') return false;
        if (activeTab === 'overdue' && (a.status !== 'pending' || a.scheduledDate >= todayStr)) return false;

        // Channel filter
        if (selectedChannelFilter !== 'all' && a.channel !== selectedChannelFilter) return false;

        // Campaign filter
        if (selectedCampaignFilter !== 'all' && a.campaignId !== selectedCampaignFilter) return false;

        // Search term filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const comp = companies.find((c) => c.id === a.companyId || c.id === a.clientId);
          const cli = clients.find((c) => c.id === a.clientId);
          const name = comp?.name || cli?.name || cli?.company || '';
          const actionTitle = a.actionType || a.customMessage || a.scriptTitle || '';
          return name.toLowerCase().includes(q) || actionTitle.toLowerCase().includes(q);
        }

        return true;
      })
      .sort((a, b) => {
        const dateComp = a.scheduledDate.localeCompare(b.scheduledDate);
        if (dateComp !== 0) return dateComp;
        return (a.scheduledTime || '00:00').localeCompare(b.scheduledTime || '00:00');
      });
  }, [
    actions,
    activeTab,
    todayStr,
    selectedChannelFilter,
    selectedCampaignFilter,
    searchTerm,
    companies,
    clients,
  ]);

  const overdueCount = useMemo(
    () => actions.filter((a) => a.status === 'pending' && a.scheduledDate < todayStr).length,
    [actions, todayStr]
  );
  const pendingCount = useMemo(() => actions.filter((a) => a.status === 'pending').length, [actions]);
  const completedCount = useMemo(
    () => actions.filter((a) => a.status === 'completed').length,
    [actions]
  );

  const handleOpenNewSchedule = () => {
    setEditingAction(null);
    setIsScheduleModalOpen(true);
  };

  const handleOpenEditAction = (action: ProspectAction) => {
    setEditingAction(action);
    setIsScheduleModalOpen(true);
  };

  const handleRescheduleSubmit = async () => {
    if (!reschedulingAction) return;
    const updated: ProspectAction = {
      ...reschedulingAction,
      scheduledDate: newRescheduleDate,
      scheduledTime: newRescheduleTime,
      updatedAt: new Date().toISOString(),
    };
    await upsertAction(updated);
    setReschedulingAction(null);
    success('Ação reagendada com sucesso.', `Nova data: ${newRescheduleDate} às ${newRescheduleTime}`);
  };

  const handleDeleteAction = (action: ProspectAction) => {
    confirm({
      title: 'Excluir Agendamento',
      message: 'Deseja remover esta mensagem agendada da sua fila de prospecção?',
      isDestructive: true,
      onConfirm: async () => {
        await deleteAction(action.id);
        success('Agendamento removido.');
      },
    });
  };

  // Direct Execution on WhatsApp
  const handleExecuteWhatsApp = (action: ProspectAction) => {
    const comp = companies.find((c) => c.id === action.companyId || c.id === action.clientId);
    const cont = contacts.find((c) => c.companyId === comp?.id);
    const cli = clients.find((c) => c.id === action.clientId);
    const tpl = templates.find((t) => t.id === action.templateId || t.id === action.scriptId);
    const srv = services[0];

    const phone = cont?.whatsapp || cont?.phone || cli?.whatsapp || cli?.phone;
    if (!phone) {
      error('Telefone / WhatsApp não encontrado para este contato.');
      return;
    }

    const rawMsg = action.customMessage || tpl?.content || 'Olá, tudo bem?';
    const message = interpolateMessage(rawMsg, cli, srv, comp, cont);

    const link = generateWhatsAppLink(phone, message);
    window.open(link, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100">Planejador & Agendamentos</h2>
          <p className="text-xs text-neutral-400">
            Organize agendamentos de mensagens, horários exatos e sequências com cadência controlada.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="execution"
            size="sm"
            onClick={() => setActiveRoute('prospecting')}
            leftIcon={<Zap className="w-4 h-4 fill-white" />}
          >
            Modo Execução
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenNewSchedule}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Agendar Mensagem
          </Button>
        </div>
      </div>

      {/* Visão Hierárquica & Métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Seletor de Visão & Contadores */}
        <Card padding="md" className="bg-neutral-900 border-neutral-800 space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Modo de Visualização
            </span>
            <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded font-medium">
              Offline Ativo
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setViewMode('year')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'year'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5" /> Ano ({selectedYear})
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" /> Mês
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" /> Semana
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'day'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" /> Dia
            </button>
          </div>

          <div className="pt-3 border-t border-neutral-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-400">Mensagens Pendentes:</span>
              <span className="font-bold text-neutral-200">{pendingCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Atrasadas:</span>
              <span className="font-bold text-rose-400">{overdueCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Concluídas:</span>
              <span className="font-bold text-emerald-400">{completedCount}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-neutral-800/60">
              <span className="text-neutral-400">Capacidade do Dia:</span>
              <span className="font-bold text-neutral-200">
                {actionsOnSelectedDate.length}/{dailyLimit}
              </span>
            </div>
          </div>

          {isOverloaded && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Capacidade diária sugerida ({dailyLimit} ações) atingida para {selectedDate}. Considere distribuir os agendamentos.
              </span>
            </div>
          )}
        </Card>

        {/* Painel Principal */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search & Filters Toolbar */}
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Tabs de Status */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'pending'
                      ? 'bg-neutral-800 text-blue-400 border border-neutral-700'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Pendentes ({pendingCount})
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
                      ? 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Todas ({actions.length})
                </button>
              </div>

              {/* Data Picker */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Data foco:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-neutral-200 font-mono"
                />
              </div>
            </div>

            {/* Filter Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-neutral-800">
              <Input
                placeholder="Filtrar por prospect ou ação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-3.5 h-3.5 text-neutral-400" />}
              />

              <select
                value={selectedChannelFilter}
                onChange={(e) => setSelectedChannelFilter(e.target.value)}
                className="h-8 bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 text-xs text-neutral-300"
              >
                <option value="all">Todos os Canais</option>
                <option value="whatsapp">💬 WhatsApp</option>
                <option value="linkedin">💼 LinkedIn</option>
                <option value="email">✉️ E-mail</option>
                <option value="call">📞 Ligação</option>
                <option value="instagram">📷 Instagram</option>
              </select>

              <select
                value={selectedCampaignFilter}
                onChange={(e) => setSelectedCampaignFilter(e.target.value)}
                className="h-8 bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 text-xs text-neutral-300"
              >
                <option value="all">Todas as Campanhas</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    🎯 {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Render View Mode Content */}
          {viewMode === 'year' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                'Janeiro',
                'Fevereiro',
                'Março',
                'Abril',
                'Maio',
                'Junho',
                'Julho',
                'Agosto',
                'Setembro',
                'Outubro',
                'Novembro',
                'Dezembro',
              ].map((m, idx) => {
                const monthNum = String(idx + 1).padStart(2, '0');
                const monthActions = actions.filter((a) =>
                  a.scheduledDate.startsWith(`${selectedYear}-${monthNum}`)
                );
                const completedM = monthActions.filter((a) => a.status === 'completed').length;
                return (
                  <Card key={m} padding="sm" className="bg-neutral-900 border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-200">
                        {m} {selectedYear}
                      </span>
                      <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded text-neutral-400">
                        {monthActions.length} ações
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 flex justify-between">
                      <span>
                        Pendentes:{' '}
                        <strong className="text-neutral-200">{monthActions.length - completedM}</strong>
                      </span>
                      <span>
                        Concluídas: <strong className="text-emerald-400">{completedM}</strong>
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        setSelectedDate(`${selectedYear}-${monthNum}-01`);
                        setViewMode('month');
                      }}
                      className="w-full mt-1"
                    >
                      Ver Mês
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}

          {viewMode === 'month' && (
            <div className="space-y-3">
              {/* Highlight of day's actions */}
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                    <CalendarCheck className="w-4 h-4 text-blue-400" />
                    Agendamentos para {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')} ({actionsOnSelectedDate.length} ações)
                  </span>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      setEditingAction(null);
                      setIsScheduleModalOpen(true);
                    }}
                    leftIcon={<Plus className="w-3.5 h-3.5 text-blue-400" />}
                  >
                    Novo Agendamento nesta data
                  </Button>
                </div>
              </div>

              {/* Action List */}
              <div className="space-y-3">
                {filteredActions.length > 0 ? (
                  filteredActions.map((action) => {
                    const comp = companies.find((c) => c.id === action.companyId || c.id === action.clientId);
                    const cont = contacts.find((c) => c.companyId === comp?.id);
                    const cli = clients.find((c) => c.id === action.clientId);
                    const campaign = campaigns.find((c) => c.id === action.campaignId);
                    const channel = getChannelBadgeDetails(action.channel);
                    const isOverdue = action.status === 'pending' && action.scheduledDate < todayStr;
                    const isToday = action.scheduledDate === todayStr;

                    const prospectName = comp?.name || cli?.company || cli?.name || 'Cliente';
                    const contactPerson = cont?.name || cli?.name;
                    const phone = cont?.whatsapp || cont?.phone || cli?.whatsapp || cli?.phone;

                    return (
                      <Card
                        key={action.id}
                        padding="md"
                        className={`bg-neutral-900 border-neutral-800 flex flex-col justify-between gap-3 hover:border-neutral-700 transition-all ${
                          isOverdue
                            ? 'border-rose-500/40 bg-rose-950/10'
                            : isToday
                            ? 'border-blue-500/40 bg-blue-950/10'
                            : ''
                        }`}
                      >
                        <div className="space-y-2.5">
                          {/* Badges bar */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[11px] px-2 py-0.5 rounded font-medium flex items-center gap-1 ${channel.bgClass} ${channel.textClass}`}
                              >
                                {channel.label}
                              </span>

                              <Badge
                                variant={isOverdue ? 'rose' : isToday ? 'blue' : 'neutral'}
                                size="sm"
                              >
                                {isOverdue
                                  ? `Atrasada (${new Date(action.scheduledDate + 'T00:00:00').toLocaleDateString('pt-BR')})`
                                  : isToday
                                  ? `Hoje às ${action.scheduledTime || '10:30'}`
                                  : `${new Date(action.scheduledDate + 'T00:00:00').toLocaleDateString('pt-BR')} às ${action.scheduledTime || '10:30'}`}
                              </Badge>

                              {action.actionType && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 font-medium">
                                  {action.actionType}
                                </span>
                              )}

                              {campaign && (
                                <span className="text-[10px] text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-medium">
                                  🎯 {campaign.name}
                                </span>
                              )}

                              {action.cadenceStepIndex && (
                                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
                                  Etapa {action.cadenceStepIndex}
                                </span>
                              )}
                            </div>

                            <span className="font-mono text-xs font-bold text-neutral-300 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-blue-400" />
                              {action.scheduledTime || '10:30'}
                            </span>
                          </div>

                          {/* Prospect info */}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-neutral-100">{prospectName}</h4>
                              {contactPerson && contactPerson !== prospectName && (
                                <span className="text-xs text-neutral-400">({contactPerson})</span>
                              )}
                              {phone && (
                                <span className="text-xs font-mono text-emerald-400">
                                  {formatPhoneNumber(phone)}
                                </span>
                              )}
                            </div>

                            {action.scriptTitle && (
                              <p className="text-xs text-blue-400 font-medium mt-0.5">
                                📄 Script: {action.scriptTitle}
                              </p>
                            )}

                            {action.notes && (
                              <p className="text-xs text-neutral-400 italic bg-neutral-950/60 p-2 rounded-lg mt-1 border border-neutral-800">
                                💡 Obs: {action.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            {action.status === 'pending' && action.channel === 'whatsapp' && (
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => handleExecuteWhatsApp(action)}
                                leftIcon={<Send className="w-3.5 h-3.5 text-emerald-400" />}
                                className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/30 text-xs"
                              >
                                Executar no WhatsApp
                              </Button>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {action.status === 'pending' ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => {
                                    setReschedulingAction(action);
                                    setNewRescheduleDate(action.scheduledDate);
                                    setNewRescheduleTime(action.scheduledTime || '10:30');
                                  }}
                                  leftIcon={<RotateCcw className="w-3 h-3 text-neutral-400" />}
                                >
                                  Reagendar
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => handleOpenEditAction(action)}
                                  leftIcon={<Edit2 className="w-3 h-3 text-neutral-400" />}
                                >
                                  Editar
                                </Button>

                                <Button
                                  variant="execution"
                                  size="xs"
                                  onClick={() => completeAction(action.id)}
                                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                                >
                                  Concluir
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
                        </div>
                      </Card>
                    );
                  })
                ) : (
                  <EmptyState
                    icon={<CalendarIcon className="w-8 h-8 text-neutral-400" />}
                    title="Nenhum agendamento encontrado"
                    description="Não há mensagens agendadas para os filtros selecionados."
                    actionLabel="Agendar Mensagem"
                    onAction={handleOpenNewSchedule}
                  />
                )}
              </div>
            </div>
          )}

          {(viewMode === 'week' || viewMode === 'day') && (
            <div className="space-y-3">
              {filteredActions.length > 0 ? (
                filteredActions.map((action) => {
                  const comp = companies.find((c) => c.id === action.companyId || c.id === action.clientId);
                  const cont = contacts.find((c) => c.companyId === comp?.id);
                  const cli = clients.find((c) => c.id === action.clientId);
                  const channel = getChannelBadgeDetails(action.channel);
                  const isOverdue = action.status === 'pending' && action.scheduledDate < todayStr;
                  const isToday = action.scheduledDate === todayStr;

                  return (
                    <Card
                      key={action.id}
                      padding="md"
                      className={`bg-neutral-900 border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isOverdue ? 'border-rose-500/30 bg-rose-950/10' : isToday ? 'border-blue-500/30' : ''
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded font-medium ${channel.bgClass} ${channel.textClass}`}
                          >
                            {channel.label}
                          </span>
                          <Badge
                            variant={isOverdue ? 'rose' : isToday ? 'blue' : 'neutral'}
                            size="sm"
                          >
                            {isOverdue
                              ? 'Atrasada'
                              : isToday
                              ? 'Hoje'
                              : new Date(action.scheduledDate + 'T00:00:00').toLocaleDateString('pt-BR')}{' '}
                            às {action.scheduledTime || '10:30'}
                          </Badge>
                          {action.actionType && (
                            <span className="text-[11px] text-neutral-300 bg-neutral-800 px-2 py-0.5 rounded font-medium">
                              {action.actionType}
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-neutral-100">
                            {comp?.name || cli?.name || 'Cliente'}
                          </h4>
                          <p className="text-xs text-neutral-400">
                            Script: <strong className="text-neutral-200">{action.scriptTitle || 'Script Padrão'}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {action.status === 'pending' ? (
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
                              Reagendar
                            </Button>
                            <Button
                              variant="execution"
                              size="xs"
                              onClick={() => completeAction(action.id)}
                              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            >
                              Concluir
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
                  title="Nenhuma mensagem agendada"
                  description="Não há ações correspondentes aos critérios selecionados."
                  actionLabel="Agendar Mensagem"
                  onAction={handleOpenNewSchedule}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Global Schedule Message Modal */}
      <ScheduleMessageModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setEditingAction(null);
        }}
        editingAction={editingAction}
      />

      {/* Modal Reagendar Rápido */}
      <Modal
        isOpen={Boolean(reschedulingAction)}
        onClose={() => setReschedulingAction(null)}
        title="Reagendar Mensagem"
        maxWidth="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setReschedulingAction(null)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleRescheduleSubmit}>
              Salvar Nova Data & Hora
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-neutral-400">
            Defina a nova data e horário para este agendamento:
          </p>

          <Input
            label="Nova Data"
            type="date"
            value={newRescheduleDate}
            onChange={(e) => setNewRescheduleDate(e.target.value)}
            leftIcon={<CalendarIcon className="w-4 h-4 text-neutral-400" />}
          />

          <Input
            label="Novo Horário"
            type="time"
            value={newRescheduleTime}
            onChange={(e) => setNewRescheduleTime(e.target.value)}
            leftIcon={<Clock className="w-4 h-4 text-neutral-400" />}
          />
        </div>
      </Modal>
    </div>
  );
};

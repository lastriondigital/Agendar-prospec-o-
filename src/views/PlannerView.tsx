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
import { getChannelBadgeDetails } from '../utils/formatting';

export const PlannerView: React.FC = () => {
  const { actions, clients, campaigns, templates, upsertAction, completeAction, deleteAction, rescheduleAction, setActiveRoute } = useApp();
  const confirm = useConfirm();
  const { success, error } = useToast();

  const [viewMode, setViewMode] = useState<'year' | 'month' | 'week' | 'day'>('month');
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'overdue' | 'all'>('pending');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reschedulingAction, setReschedulingAction] = useState<ProspectAction | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState(new Date().toISOString().slice(0, 10));

  // New Action Form State
  const [newActionClientId, setNewActionClientId] = useState('');
  const [newActionCampaignId, setNewActionCampaignId] = useState('');
  const [newActionChannel, setNewActionChannel] = useState<ContactChannel>('whatsapp');
  const [newActionDate, setNewActionDate] = useState(new Date().toISOString().slice(0, 10));
  const [newActionPriority, setNewActionPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newActionTitle, setNewActionTitle] = useState('Primeiro contacto');

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Metas e Limites Calculados
  const dailyLimit = 20; // Limite padrão diário para evitar sobrecarga
  const actionsOnSelectedDate = useMemo(() => {
    return actions.filter((a) => a.scheduledDate === selectedDate && a.status === 'pending');
  }, [actions, selectedDate]);

  const isOverloaded = actionsOnSelectedDate.length >= dailyLimit;

  // Filtragem de ações baseada na aba selecionada
  const filteredActions = useMemo(() => {
    return actions.filter((a) => {
      if (activeTab === 'pending') return a.status === 'pending';
      if (activeTab === 'completed') return a.status === 'completed';
      if (activeTab === 'overdue') return a.status === 'pending' && a.scheduledDate < todayStr;
      return true;
    }).sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  }, [actions, activeTab, todayStr]);

  const overdueCount = useMemo(() => actions.filter((a) => a.status === 'pending' && a.scheduledDate < todayStr).length, [actions, todayStr]);
  const pendingCount = useMemo(() => actions.filter((a) => a.status === 'pending').length, [actions]);
  const completedCount = useMemo(() => actions.filter((a) => a.status === 'completed').length, [actions]);

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionClientId) {
      error('Selecione um cliente para a ação.');
      return;
    }

    // Verificar limite diário
    const countOnDate = actions.filter((a) => a.scheduledDate === newActionDate && a.status === 'pending').length;
    if (countOnDate >= dailyLimit) {
      error(`Limite diário excedido (${dailyLimit} ações). Escolha outra data para evitar sobrecarga.`);
      return;
    }

    const action: ProspectAction = {
      id: `act-${Date.now()}`,
      clientId: newActionClientId,
      campaignId: newActionCampaignId || undefined,
      channel: newActionChannel,
      scheduledDate: newActionDate,
      status: 'pending',
      priority: newActionPriority,
      estMinutes: 2,
      customMessage: newActionTitle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await upsertAction(action);
    success('Ação de prospecção agendada com sucesso!');
    setIsModalOpen(false);
  };

  const handleRescheduleSubmit = async () => {
    if (!reschedulingAction) return;
    await rescheduleAction(reschedulingAction.id, newRescheduleDate);
    setReschedulingAction(null);
    success('Ação reagendada com sucesso.');
  };

  const handleDeleteAction = (action: ProspectAction) => {
    confirm({
      title: 'Excluir Ação',
      message: 'Deseja remover esta ação agendada da sua fila de prospecção?',
      isDestructive: true,
      onConfirm: async () => {
        await deleteAction(action.id);
        success('Ação removida.');
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100">Planejador & Cadência de Prospecção</h2>
          <p className="text-xs text-neutral-400">
            Gerencie o planejamento por ano, mês, semana e dia com proteção contra sobrecarga diária.
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
            onClick={() => {
              setNewActionClientId(clients[0]?.id || '');
              setIsModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Agendar Ação
          </Button>
        </div>
      </div>

      {/* Visão Hierárquica (Ano / Mês / Semana / Dia) & Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Seletor de Visão & Contadores */}
        <Card padding="md" className="bg-neutral-900 border-neutral-800 space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Visão Hierárquica</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-medium">Offline Ativo</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setViewMode('year')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'year' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5" /> Ano ({selectedYear})
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'month' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" /> Mês
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'week' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" /> Semana
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'day' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" /> Dia
            </button>
          </div>

          <div className="pt-3 border-t border-neutral-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-400">Ações Pendentes:</span>
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
              <span className="text-neutral-400">Limite Diário:</span>
              <span className="font-bold text-neutral-200">{actionsOnSelectedDate.length}/{dailyLimit}</span>
            </div>
          </div>

          {isOverloaded && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>Atenção: Limite diário atingido para esta data. Evite sobrecarregar o dia.</span>
            </div>
          )}
        </Card>

        {/* Visão Selecionada (Ano, Mês, Semana, Dia) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Tabs de Status */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'pending' ? 'bg-neutral-800 text-emerald-400 border border-neutral-700' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Pendentes ({pendingCount})
              </button>
              <button
                onClick={() => setActiveTab('overdue')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'overdue' ? 'bg-neutral-800 text-rose-400 border border-neutral-700' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Atrasadas ({overdueCount})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'completed' ? 'bg-neutral-800 text-emerald-400 border border-neutral-700' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Concluídas ({completedCount})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'all' ? 'bg-neutral-800 text-emerald-400 border border-neutral-700' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Todas ({actions.length})
              </button>
            </div>

            <div className="text-xs text-neutral-400 font-mono">
              Data selecionada: <strong className="text-neutral-200">{selectedDate}</strong>
            </div>
          </div>

          {/* Renderização baseada no Modo de Visão */}
          {viewMode === 'year' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((m, idx) => {
                const monthNum = String(idx + 1).padStart(2, '0');
                const monthActions = actions.filter((a) => a.scheduledDate.startsWith(`${selectedYear}-${monthNum}`));
                const completedM = monthActions.filter((a) => a.status === 'completed').length;
                return (
                  <Card key={m} padding="sm" className="bg-neutral-900 border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-200">{m} {selectedYear}</span>
                      <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded text-neutral-400">{monthActions.length} ações</span>
                    </div>
                    <div className="text-[11px] text-neutral-400 flex justify-between">
                      <span>Pendentes: <strong className="text-neutral-200">{monthActions.length - completedM}</strong></span>
                      <span>Concluídas: <strong className="text-emerald-400">{completedM}</strong></span>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-200">Visão Mensal & Dias</h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-100"
                />
              </div>

              {/* Lista de Ações do Dia Selecionado */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-neutral-400">Ações para {selectedDate}:</span>
                {actionsOnSelectedDate.length > 0 ? (
                  actionsOnSelectedDate.map((act) => {
                    const client = clients.find((c) => c.id === act.clientId);
                    return (
                      <Card key={act.id} padding="sm" className="bg-neutral-900 border-neutral-800 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-neutral-100">{act.customMessage || 'Prospecção'}</p>
                          <p className="text-[11px] text-neutral-400">{client?.name || 'Cliente'} • {client?.company || ''}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="xs" onClick={() => setReschedulingAction(act)}>Reagendar</Button>
                          <Button variant="ghost" size="xs" onClick={() => completeAction(act.id)}>Concluir</Button>
                        </div>
                      </Card>
                    );
                  })
                ) : (
                  <p className="text-xs text-neutral-500 italic">Nenhuma ação agendada para esta data exata.</p>
                )}
              </div>
            </div>
          )}

          {(viewMode === 'week' || viewMode === 'day') && (
            <div className="space-y-3">
              {filteredActions.length > 0 ? (
                filteredActions.map((action) => {
                  const client = clients.find((c) => c.id === action.clientId);
                  const campaign = campaigns.find((c) => c.id === action.campaignId);
                  const channel = getChannelBadgeDetails(action.channel);
                  const isOverdue = action.status === 'pending' && action.scheduledDate < todayStr;
                  const isToday = action.scheduledDate === todayStr;

                  return (
                    <Card
                      key={action.id}
                      padding="md"
                      className={`bg-neutral-900 border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isOverdue ? 'border-rose-500/30 bg-rose-950/10' : isToday ? 'border-emerald-500/30' : ''
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${channel.bgClass} ${channel.textClass}`}>
                            {channel.label}
                          </span>
                          <Badge
                            variant={isOverdue ? 'rose' : isToday ? 'emerald' : 'neutral'}
                            size="sm"
                          >
                            {isOverdue ? 'Atrasada' : isToday ? 'Hoje' : action.scheduledDate}
                          </Badge>
                          {campaign && (
                            <span className="text-[11px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                              {campaign.name}
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-neutral-100">
                            {action.customMessage || 'Ação de Prospecção'}
                          </h4>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            Cliente: <strong className="text-neutral-200">{client?.name || 'Não vinculado'}</strong> ({client?.company || ''})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {action.status === 'pending' ? (
                          <>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => setReschedulingAction(action)}
                            >
                              Adiar / Reagendar
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
                          <Badge variant="emerald" size="sm">Concluída</Badge>
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
                  title="Nenhuma ação encontrada"
                  description="Não há ações correspondentes ao filtro ou visualização selecionada."
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Agendar Ação */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Agendar Nova Ação de Prospecção"
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateAction}>
              Agendar
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateAction} className="space-y-4">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-medium text-neutral-300">Cliente / Lead *</label>
            <select
              value={newActionClientId}
              onChange={(e) => setNewActionClientId(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">Selecione o Cliente...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.company}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-medium text-neutral-300">Campanha Associada</label>
            <select
              value={newActionCampaignId}
              onChange={(e) => setNewActionCampaignId(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Nenhuma / Avulsa</option>
              {campaigns.map((camp) => (
                <option key={camp.id} value={camp.id}>
                  {camp.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Título da Ação"
            value={newActionTitle}
            onChange={(e) => setNewActionTitle(e.target.value)}
            placeholder="Ex: Primeiro contacto, Follow-up #2"
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-medium text-neutral-300">Canal</label>
              <select
                value={newActionChannel}
                onChange={(e) => setNewActionChannel(e.target.value as ContactChannel)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="linkedin">LinkedIn</option>
                <option value="email">E-mail</option>
                <option value="call">Ligação</option>
              </select>
            </div>

            <Input
              label="Data Agendada"
              type="date"
              value={newActionDate}
              onChange={(e) => setNewActionDate(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* Modal Reagendar / Adiar */}
      <Modal
        isOpen={Boolean(reschedulingAction)}
        onClose={() => setReschedulingAction(null)}
        title="Reagendar / Adiar Ação"
        maxWidth="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setReschedulingAction(null)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleRescheduleSubmit}>
              Confirmar Nova Data
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-400">
            Escolha a nova data para executar esta ação de prospecção:
          </p>
          <Input
            label="Nova Data"
            type="date"
            value={newRescheduleDate}
            onChange={(e) => setNewRescheduleDate(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

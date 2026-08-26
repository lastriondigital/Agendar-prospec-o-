import React, { useMemo, useState } from 'react';
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Trash2,
  Zap,
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
import { formatRelativeDate, getChannelBadgeDetails } from '../utils/formatting';

export const PlannerView: React.FC = () => {
  const { actions, clients, campaigns, templates, upsertAction, completeAction, deleteAction, setActiveRoute } = useApp();
  const confirm = useConfirm();
  const { success } = useToast();

  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'all'>('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Action Form State
  const [newActionClientId, setNewActionClientId] = useState('');
  const [newActionCampaignId, setNewActionCampaignId] = useState('');
  const [newActionChannel, setNewActionChannel] = useState<ContactChannel>('whatsapp');
  const [newActionDate, setNewActionDate] = useState(new Date().toISOString().slice(0, 10));
  const [newActionPriority, setNewActionPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const filteredActions = useMemo(() => {
    return actions.filter((a) => {
      if (activeTab === 'pending') return a.status === 'pending';
      if (activeTab === 'completed') return a.status === 'completed';
      return true;
    }).sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  }, [actions, activeTab]);

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionClientId) return;

    const action: ProspectAction = {
      id: `act-${Date.now()}`,
      clientId: newActionClientId,
      campaignId: newActionCampaignId || undefined,
      channel: newActionChannel,
      scheduledDate: newActionDate,
      status: 'pending',
      priority: newActionPriority,
      estMinutes: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await upsertAction(action);
    success('Ação de prospecção agendada com sucesso!');
    setIsModalOpen(false);
  };

  const handleDeleteAction = (action: ProspectAction) => {
    confirm({
      title: 'Excluir Ação',
      message: 'Deseja remover esta ação agendada da sua fila de prospecção?',
      isDestructive: true,
      onConfirm: async () => {
        await deleteAction(action.id);
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100">Planejador de Follow-ups</h2>
          <p className="text-xs text-neutral-400">
            Organize sua cadência e mantenha os contatos sempre preparados para execução.
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-neutral-800 text-emerald-400 border border-neutral-700'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Pendentes ({actions.filter((a) => a.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-neutral-800 text-emerald-400 border border-neutral-700'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Concluídas ({actions.filter((a) => a.status === 'completed').length})
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

      {/* Actions List */}
      {filteredActions.length > 0 ? (
        <div className="space-y-3">
          {filteredActions.map((action) => {
            const client = clients.find((c) => c.id === action.clientId);
            const campaign = campaigns.find((c) => c.id === action.campaignId);
            const channel = getChannelBadgeDetails(action.channel);
            const isOverdue = action.status === 'pending' && action.scheduledDate < todayStr;
            const isToday = action.scheduledDate === todayStr;

            return (
              <Card
                key={action.id}
                padding="sm"
                className={`bg-neutral-900 border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isOverdue ? 'border-l-4 border-l-rose-500' : isToday ? 'border-l-4 border-l-emerald-500' : ''
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${channel.bgClass} ${channel.textClass}`}>
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-neutral-100">
                        {client?.name || 'Cliente'}
                      </h4>
                      <span className="text-xs text-neutral-400">({client?.company})</span>
                      <Badge variant={action.status === 'completed' ? 'emerald' : isOverdue ? 'rose' : 'neutral'} size="sm">
                        {action.status === 'completed' ? 'Concluído' : isOverdue ? 'Atrasado' : formatRelativeDate(action.scheduledDate)}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Canal: <span className="font-semibold text-neutral-300">{channel.label}</span>
                      {campaign && ` • Campanha: ${campaign.name}`}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {action.status === 'pending' ? (
                    <>
                      <Button
                        variant="execution"
                        size="xs"
                        onClick={() => setActiveRoute('prospecting')}
                        leftIcon={<Zap className="w-3.5 h-3.5 fill-white" />}
                      >
                        Executar
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => completeAction(action.id, 'Concluído no planejador')}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      >
                        Concluir
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs text-neutral-500 font-mono">
                      Concluído em {new Date(action.executedAt || action.updatedAt).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleDeleteAction(action)}
                    title="Excluir ação"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-neutral-500 hover:text-rose-400" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<CalendarCheck className="w-8 h-8 text-neutral-400" />}
          title="Nenhuma ação nesta visualização"
          description="Você pode agendar contatos pontuais ou gerar lotes a partir de campanhas."
          actionLabel="Agendar Ação"
          onAction={() => setIsModalOpen(true)}
        />
      )}

      {/* Schedule Action Modal */}
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
              Salvar Ação
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
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              required
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.company})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-medium text-neutral-300">Canal de Contato</label>
              <select
                value={newActionChannel}
                onChange={(e) => setNewActionChannel(e.target.value as ContactChannel)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="linkedin">LinkedIn</option>
                <option value="email">E-mail</option>
                <option value="call">Ligação Telefônica</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-medium text-neutral-300">Data Agendada</label>
              <input
                type="date"
                value={newActionDate}
                onChange={(e) => setNewActionDate(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

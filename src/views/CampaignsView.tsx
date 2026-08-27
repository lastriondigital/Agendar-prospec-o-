import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Edit2,
  Play,
  Plus,
  Target,
  Trash2,
  Users,
  Zap,
  Calendar,
  Layers,
  Sparkles,
  Clock,
  Send,
  ArrowRight,
  Filter,
  Check,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import { useToast } from '../context/ToastContext';
import {
  Campaign,
  CampaignSequenceStep,
  CampaignType,
  ContactChannel,
  Lead,
  ProspectAction,
} from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { ScheduleMessageModal } from '../components/messaging/ScheduleMessageModal';
import { getChannelBadgeDetails } from '../utils/formatting';
import {
  CAMPAIGN_TYPE_LABELS,
  CHANNEL_OPTIONS,
  DEFAULT_ACTION_TYPES,
  DEFAULT_CAMPAIGN_TYPES,
  calculateCadenceTimeline,
  generateScheduledMessagesFromCadence,
  getActionTypes,
  getCompatibleScripts,
} from '../utils/cadenceUtils';

const DEFAULT_CADENCE_STEPS: CampaignSequenceStep[] = [
  {
    id: 'seq-1',
    order: 1,
    title: 'Primeiro Contato Direto',
    actionType: 'Primeiro contato',
    channel: 'whatsapp',
    waitDays: 0,
    waitHours: 0,
    waitMinutes: 0,
    dayOffset: 0,
  },
  {
    id: 'seq-2',
    order: 2,
    title: 'Follow-up 1 (48h após)',
    actionType: 'Follow-up 1',
    channel: 'whatsapp',
    waitDays: 2,
    waitHours: 0,
    waitMinutes: 0,
    dayOffset: 2,
  },
  {
    id: 'seq-3',
    order: 3,
    title: 'Follow-up 2 com Prova Social',
    actionType: 'Follow-up 2',
    channel: 'whatsapp',
    waitDays: 3,
    waitHours: 0,
    waitMinutes: 0,
    dayOffset: 5,
  },
  {
    id: 'seq-4',
    order: 4,
    title: 'Reativação Final',
    actionType: 'Reativação',
    channel: 'whatsapp',
    waitDays: 7,
    waitHours: 0,
    waitMinutes: 0,
    dayOffset: 12,
  },
];

export const CampaignsView: React.FC = () => {
  const {
    campaigns,
    leads,
    companies,
    contacts,
    services,
    templates,
    actions,
    upsertCampaign,
    deleteCampaign,
    upsertAction,
    setActiveRoute,
  } = useApp();

  const confirm = useConfirm();
  const { success, error, warning } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Modal para disparar cadência em lote
  const [isCadenceModalOpen, setIsCadenceModalOpen] = useState(false);
  const [cadenceCampaign, setCadenceCampaign] = useState<Campaign | null>(null);
  const [cadenceStartDate, setCadenceStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [cadenceStartTime, setCadenceStartTime] = useState('09:30');
  const [selectedLeadIdsForCadence, setSelectedLeadIdsForCadence] = useState<string[]>([]);
  const [isGeneratingCadence, setIsGeneratingCadence] = useState(false);

  // Modal para agendar mensagem avulsa na campanha
  const [scheduleCampaignId, setScheduleCampaignId] = useState<string | null>(null);

  // Form State da Campanha
  const [name, setName] = useState('');
  const [campaignType, setCampaignType] = useState<CampaignType>('prospeccao');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [objective, setObjective] = useState('');
  const [channel, setChannel] = useState<ContactChannel>('whatsapp');
  const [serviceId, setServiceId] = useState('');
  const [defaultTemplateId, setDefaultTemplateId] = useState('');
  const [dailyGoal, setDailyGoal] = useState(15);
  const [totalTarget, setTotalTarget] = useState(50);
  const [criteria, setCriteria] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('09:30');
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [status, setStatus] = useState<'active' | 'inactive' | 'paused' | 'draft'>('active');
  const [sequence, setSequence] = useState<CampaignSequenceStep[]>(DEFAULT_CADENCE_STEPS);

  const availableActionTypes = useMemo(() => {
    return getActionTypes(templates);
  }, [templates]);

  const handleOpenAdd = () => {
    setEditingCampaign(null);
    setName('');
    setCampaignType('prospeccao');
    setDescription('');
    setTargetAudience('');
    setObjective('Gerar Reuniões & Qualificação');
    setChannel('whatsapp');
    setServiceId(services[0]?.id || '');
    setDefaultTemplateId(templates[0]?.id || '');
    setDailyGoal(15);
    setTotalTarget(50);
    setCriteria('Empresas no perfil ideal sem contato nos últimos 30 dias');
    setStartDate(new Date().toISOString().slice(0, 10));
    setStartTime('09:30');
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    setEndDate(d.toISOString().slice(0, 10));
    setStatus('active');
    setSequence(DEFAULT_CADENCE_STEPS);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Campaign) => {
    setEditingCampaign(c);
    setName(c.name);
    setCampaignType(c.campaignType || c.type || 'prospeccao');
    setDescription(c.description || '');
    setTargetAudience(c.targetAudience || '');
    setObjective(c.objective || '');
    setChannel(c.channel);
    setServiceId(c.serviceId || '');
    setDefaultTemplateId(c.defaultTemplateId || '');
    setDailyGoal(c.dailyGoal || 15);
    setTotalTarget(c.totalTarget || 50);
    setCriteria(c.criteria || '');
    setStartDate(c.startDate || new Date().toISOString().slice(0, 10));
    setStartTime(c.startTime || '09:30');
    setEndDate(c.endDate || new Date().toISOString().slice(0, 10));
    setStatus(c.status === 'completed' ? 'active' : c.status);
    setSequence(c.sequence && c.sequence.length > 0 ? c.sequence : DEFAULT_CADENCE_STEPS);
    setIsModalOpen(true);
  };

  const handleAddSequenceStep = () => {
    const nextOrder = sequence.length + 1;
    const defaultWait = sequence.length === 0 ? 0 : 2;
    setSequence([
      ...sequence,
      {
        id: `seq-${Date.now()}-${nextOrder}`,
        order: nextOrder,
        title: `Follow-up ${nextOrder - 1}`,
        actionType: `Follow-up ${nextOrder - 1}`,
        channel,
        waitDays: defaultWait,
        waitHours: 0,
        waitMinutes: 0,
        dayOffset: sequence.length > 0 ? (sequence[sequence.length - 1].dayOffset || 0) + defaultWait : 0,
      },
    ]);
  };

  const handleRemoveSequenceStep = (index: number) => {
    const updated = sequence
      .filter((_, idx) => idx !== index)
      .map((step, idx) => ({ ...step, order: idx + 1 }));
    setSequence(updated);
  };

  const handleUpdateSequenceStep = (
    index: number,
    field: keyof CampaignSequenceStep,
    value: any
  ) => {
    const updated = [...sequence];
    updated[index] = { ...updated[index], [field]: value };
    setSequence(updated);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Preencha o nome da campanha.');
      return;
    }

    const campaign: Campaign = {
      id: editingCampaign ? editingCampaign.id : `cmp-${Date.now()}`,
      name: name.trim(),
      campaignType,
      type: campaignType,
      description: description.trim(),
      targetAudience: targetAudience.trim(),
      objective: objective.trim(),
      status,
      channel,
      serviceId: serviceId || undefined,
      defaultTemplateId: defaultTemplateId || undefined,
      dailyGoal: Number(dailyGoal) || 15,
      totalTarget: Number(totalTarget) || 50,
      criteria: criteria.trim(),
      startDate,
      startTime,
      endDate,
      sequence: sequence.map((s, idx) => ({ ...s, order: idx + 1 })),
      createdAt: editingCampaign?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await upsertCampaign(campaign);
    setIsModalOpen(false);
    success('Campanha e cadência salvas com sucesso!');
  };

  const handleDeleteCampaign = (camp: Campaign) => {
    confirm({
      title: 'Excluir Campanha',
      message: `Tem certeza que deseja remover a campanha "${camp.name}"? Todas as ações não executadas permanecerão no histórico.`,
      isDestructive: true,
      onConfirm: async () => {
        await deleteCampaign(camp.id);
        success('Campanha removida com sucesso.');
      },
    });
  };

  // Abre modal para disparar cadência para leads
  const handleOpenCadenceBatch = (camp: Campaign) => {
    setCadenceCampaign(camp);
    setCadenceStartDate(new Date().toISOString().slice(0, 10));
    setCadenceStartTime('09:30');
    // Pre-seleciona todos os leads ativos
    setSelectedLeadIdsForCadence(leads.map((l) => l.id));
    setIsCadenceModalOpen(true);
  };

  const handleExecuteCadenceBatch = async () => {
    if (!cadenceCampaign) return;
    if (selectedLeadIdsForCadence.length === 0) {
      error('Selecione pelo menos 1 lead para aplicar a cadência.');
      return;
    }

    try {
      setIsGeneratingCadence(true);

      const allGeneratedActions: ProspectAction[] = [];

      for (const leadId of selectedLeadIdsForCadence) {
        const targetLead = leads.find((l) => l.id === leadId);
        if (!targetLead) continue;

        const targetCompany = companies.find((c) => c.id === targetLead.companyId);
        const targetContact =
          contacts.find((c) => c.id === targetLead.contactId) ||
          contacts.find((c) => c.companyId === targetLead.companyId);
        const targetService = services.find(
          (s) => s.id === (cadenceCampaign.serviceId || targetLead.serviceId)
        );

        const actionsForLead = generateScheduledMessagesFromCadence({
          campaign: cadenceCampaign,
          lead: targetLead,
          company: targetCompany,
          contact: targetContact,
          service: targetService,
          templates,
          startDate: cadenceStartDate,
          startTime: cadenceStartTime,
        });

        allGeneratedActions.push(...actionsForLead);
      }

      if (allGeneratedActions.length === 0) {
        warning('Nenhuma mensagem gerada. Verifique se a campanha possui etapas configuradas.');
        return;
      }

      for (const act of allGeneratedActions) {
        await upsertAction(act);
      }

      success(
        `Cadência ativada com sucesso! ${allGeneratedActions.length} mensagens agendadas para ${selectedLeadIdsForCadence.length} prospects.`
      );
      setIsCadenceModalOpen(false);
      setActiveRoute('planner');
    } catch (err) {
      console.error(err);
      error('Erro ao gerar mensagens da cadência', (err as Error).message);
    } finally {
      setIsGeneratingCadence(false);
    }
  };

  const toggleLeadForCadence = (leadId: string) => {
    setSelectedLeadIdsForCadence((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const toggleAllLeads = () => {
    if (selectedLeadIdsForCadence.length === leads.length) {
      setSelectedLeadIdsForCadence([]);
    } else {
      setSelectedLeadIdsForCadence(leads.map((l) => l.id));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            Campanhas & Cadências de Prospecção
          </h2>
          <p className="text-xs text-neutral-400">
            Defina cadências automatizadas por intervalos (dias, horas, minutos) e vincule scripts por tipo de ação.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Nova Campanha
        </Button>
      </div>

      {/* Grid de Campanhas */}
      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((camp) => {
            const channelBadge = getChannelBadgeDetails(camp.channel);
            const service = services.find((s) => s.id === camp.serviceId);
            const seqSteps = camp.sequence && camp.sequence.length > 0 ? camp.sequence : [];
            const campaignActions = actions.filter((a) => a.campaignId === camp.id);
            const pendingCount = campaignActions.filter(
              (a) => a.status === 'pending' || a.status === 'agendada'
            ).length;
            const completedCount = campaignActions.filter((a) => a.status === 'completed').length;
            const displayType = camp.campaignType || camp.type || 'prospeccao';

            // Linha do tempo calculada
            const timeline = calculateCadenceTimeline(seqSteps, camp.startDate, camp.startTime, templates);

            return (
              <Card
                key={camp.id}
                padding="md"
                className="bg-neutral-900 border-neutral-800 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Cabeçalho */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${channelBadge.bgClass} ${channelBadge.textClass}`}
                        >
                          {channelBadge.label}
                        </span>

                        <Badge variant="blue" size="sm">
                          {CAMPAIGN_TYPE_LABELS[displayType] || displayType}
                        </Badge>

                        <Badge
                          variant={camp.status === 'active' ? 'emerald' : 'neutral'}
                          size="sm"
                        >
                          {camp.status === 'active' ? 'Ativa' : camp.status}
                        </Badge>
                      </div>

                      <h3 className="text-base font-bold text-neutral-100">{camp.name}</h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleOpenEdit(camp)}
                        title="Editar Campanha"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-neutral-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDeleteCampaign(camp)}
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      </Button>
                    </div>
                  </div>

                  {camp.description && (
                    <p className="text-xs text-neutral-400 line-clamp-2">{camp.description}</p>
                  )}

                  {/* Linha do Tempo da Cadência */}
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Layers className="w-3 h-3" /> Sequência de Cadência ({seqSteps.length} etapas)
                      </span>
                      <span>Início: {camp.startDate || 'Imediato'}</span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {timeline.map((item, idx) => {
                        const stepScript = templates.find((t) => t.id === item.templateId);
                        return (
                          <div
                            key={item.id || idx}
                            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800/80 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                                {idx + 1}
                              </span>
                              <div>
                                <span className="font-medium text-neutral-200 block">
                                  {item.title}
                                </span>
                                <span className="text-[10px] text-neutral-400">
                                  Tipo: <strong className="text-neutral-300">{item.actionType || 'Geral'}</strong>
                                  {stepScript && ` • Script: ${stepScript.title}`}
                                </span>
                              </div>
                            </div>

                            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                              {item.intervalLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dados adicionais: ICP e Serviço */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-neutral-400">
                    <div>
                      <span className="text-[10px] text-neutral-500 block">Público / ICP:</span>
                      <strong className="text-neutral-200 truncate block">
                        {camp.targetAudience || 'Geral'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block">Serviço:</span>
                      <strong className="text-neutral-200 truncate block">
                        {service?.name || 'Geral'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Rodapé: KPIs e Disparo da Cadência */}
                <div className="pt-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-neutral-400 flex items-center gap-3">
                    <span>
                      Fila: <strong className="text-amber-400">{pendingCount}</strong>
                    </span>
                    <span>
                      Concluídas: <strong className="text-emerald-400">{completedCount}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setScheduleCampaignId(camp.id)}
                      leftIcon={<Calendar className="w-3.5 h-3.5 text-neutral-300" />}
                    >
                      + Mensagem
                    </Button>

                    <Button
                      variant="execution"
                      size="xs"
                      onClick={() => handleOpenCadenceBatch(camp)}
                      leftIcon={<Zap className="w-3.5 h-3.5 fill-white" />}
                    >
                      Disparar Cadência
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Target className="w-8 h-8 text-neutral-400" />}
          title="Nenhuma campanha configurada"
          description="Crie campanhas estruturadas com intervalos precisos de follow-up para sua equipe de prospecção."
          actionLabel="Criar Campanha"
          onAction={handleOpenAdd}
        />
      )}

      {/* Modal Criar / Editar Campanha */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCampaign ? 'Editar Campanha & Cadência' : 'Criar Nova Campanha & Cadência'}
        maxWidth="xl"
      >
        <form onSubmit={handleSaveCampaign} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Nome da Campanha *"
                placeholder="Ex: Prospecção de Clínicas Médicas Q3"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Tipo de Campanha</label>
              <select
                value={campaignType}
                onChange={(e) => setCampaignType(e.target.value as CampaignType)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
              >
                {DEFAULT_CAMPAIGN_TYPES.map((ct) => (
                  <option key={ct.value} value={ct.value}>
                    {ct.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Canal Principal</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as ContactChannel)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
              >
                {CHANNEL_OPTIONS.map((ch) => (
                  <option key={ch.value} value={ch.value}>
                    {ch.icon} {ch.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Serviço Vinculado</label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="">Nenhum (Geral)</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="active">Ativa</option>
                <option value="paused">Pausada</option>
                <option value="inactive">Inativa</option>
                <option value="draft">Rascunho</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Público Alvo / ICP"
              placeholder="Ex: Diretores Médicos e Sócios"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            />
            <Input
              label="Objetivo da Campanha"
              placeholder="Ex: Agendar reuniões de demonstração"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="Meta Diária"
              type="number"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
            />
            <Input
              label="Meta Total"
              type="number"
              value={totalTarget}
              onChange={(e) => setTotalTarget(Number(e.target.value))}
            />
            <Input
              label="Data Inicial"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="Horário Padrão"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-300">Descrição e Critérios</label>
            <textarea
              rows={2}
              placeholder="Critérios de seleção e detalhes da campanha..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Builder de Sequência de Cadência com Dias, Horas e Minutos */}
          <div className="space-y-3 pt-3 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Passos da Cadência (Intervalos & Scripts)
                </label>
                <span className="text-[11px] text-neutral-400">
                  Configure o tempo de espera desde a etapa anterior e o script correspondente.
                </span>
              </div>

              <Button
                variant="secondary"
                size="xs"
                type="button"
                onClick={handleAddSequenceStep}
                leftIcon={<Plus className="w-3 h-3" />}
              >
                Adicionar Etapa
              </Button>
            </div>

            <div className="space-y-2.5">
              {sequence.map((step, idx) => {
                const stepActionType = step.actionType || 'Primeiro contato';
                const compatible = getCompatibleScripts(templates, {
                  channel: step.channel || channel,
                  actionType: stepActionType,
                });

                return (
                  <div
                    key={step.id || idx}
                    className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => handleUpdateSequenceStep(idx, 'title', e.target.value)}
                          placeholder="Título da Etapa (Ex: Follow-up 1)"
                          className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-100 font-medium w-48 sm:w-64"
                        />
                      </div>

                      <Button
                        variant="ghost"
                        size="xs"
                        type="button"
                        onClick={() => handleRemoveSequenceStep(idx)}
                        title="Remover etapa"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                      {/* Intervalo: Dias, Horas, Minutos */}
                      <div className="flex items-center gap-1.5 sm:col-span-2">
                        <span className="text-[11px] text-neutral-400 shrink-0">Esperar:</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={step.waitDays ?? step.dayOffset ?? 0}
                            onChange={(e) =>
                              handleUpdateSequenceStep(idx, 'waitDays', Math.max(0, Number(e.target.value)))
                            }
                            className="w-12 bg-neutral-900 border border-neutral-700 rounded px-1.5 py-1 text-xs text-emerald-400 font-mono text-center"
                          />
                          <span className="text-[10px] text-neutral-500">dias</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="23"
                            value={step.waitHours ?? 0}
                            onChange={(e) =>
                              handleUpdateSequenceStep(idx, 'waitHours', Math.max(0, Number(e.target.value)))
                            }
                            className="w-12 bg-neutral-900 border border-neutral-700 rounded px-1.5 py-1 text-xs text-emerald-400 font-mono text-center"
                          />
                          <span className="text-[10px] text-neutral-500">horas</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={step.waitMinutes ?? 0}
                            onChange={(e) =>
                              handleUpdateSequenceStep(idx, 'waitMinutes', Math.max(0, Number(e.target.value)))
                            }
                            className="w-12 bg-neutral-900 border border-neutral-700 rounded px-1.5 py-1 text-xs text-emerald-400 font-mono text-center"
                          />
                          <span className="text-[10px] text-neutral-500">min</span>
                        </div>
                      </div>

                      {/* Tipo de Ação */}
                      <div>
                        <select
                          value={stepActionType}
                          onChange={(e) => handleUpdateSequenceStep(idx, 'actionType', e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-100"
                        >
                          {availableActionTypes.map((act) => (
                            <option key={act} value={act}>
                              {act}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Script Vinculado */}
                      <div>
                        <select
                          value={step.templateId || ''}
                          onChange={(e) => handleUpdateSequenceStep(idx, 'templateId', e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-100"
                        >
                          <option value="">Selecione o script...</option>
                          {compatible.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Salvar Campanha
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Disparar Cadência em Lote */}
      {isCadenceModalOpen && cadenceCampaign && (
        <Modal
          isOpen={isCadenceModalOpen}
          onClose={() => setIsCadenceModalOpen(false)}
          title={`Disparar Cadência: ${cadenceCampaign.name}`}
          maxWidth="xl"
        >
          <div className="space-y-4">
            <p className="text-xs text-neutral-300">
              O sistema criará automaticamente as mensagens agendadas para todas as etapas da cadência,
              calculando a linha do tempo exata para cada prospect selecionado.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
              <Input
                label="Data Inicial da Cadência *"
                type="date"
                value={cadenceStartDate}
                onChange={(e) => setCadenceStartDate(e.target.value)}
                required
              />

              <Input
                label="Horário Inicial *"
                type="time"
                value={cadenceStartTime}
                onChange={(e) => setCadenceStartTime(e.target.value)}
                required
              />
            </div>

            {/* Seleção de Prospects */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-200">
                  Selecionar Prospects ({selectedLeadIdsForCadence.length} de {leads.length})
                </span>
                <Button variant="ghost" size="xs" onClick={toggleAllLeads}>
                  {selectedLeadIdsForCadence.length === leads.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </Button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 bg-neutral-950 p-2 rounded-xl border border-neutral-800">
                {leads.map((lead) => {
                  const comp = companies.find((c) => c.id === lead.companyId);
                  const cont = contacts.find((c) => c.id === lead.contactId);
                  const isSelected = selectedLeadIdsForCadence.includes(lead.id);

                  return (
                    <div
                      key={lead.id}
                      onClick={() => toggleLeadForCadence(lead.id)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                        isSelected
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-neutral-100'
                          : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center ${
                            isSelected ? 'bg-emerald-500 text-white' : 'border border-neutral-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <span className="font-semibold text-neutral-200">{comp?.name || 'Empresa'}</span>
                        <span className="text-neutral-400">({cont?.name || 'Sem contato'})</span>
                      </div>

                      <span className="text-[10px] text-neutral-500">
                        {cont?.phone || cont?.whatsapp || 'Sem tel'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCadenceModalOpen(false)}
                disabled={isGeneratingCadence}
              >
                Cancelar
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleExecuteCadenceBatch}
                isLoading={isGeneratingCadence}
                leftIcon={<Zap className="w-3.5 h-3.5 fill-white" />}
              >
                Gerar e Agendar Cadência
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal para agendar mensagem avulsa na campanha */}
      {scheduleCampaignId && (
        <ScheduleMessageModal
          isOpen={!!scheduleCampaignId}
          onClose={() => setScheduleCampaignId(null)}
          initialCampaignId={scheduleCampaignId}
        />
      )}
    </div>
  );
};

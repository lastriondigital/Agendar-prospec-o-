import React, { useState } from 'react';
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
  ArrowUp,
  ArrowDown,
  Copy,
  MessageSquare,
  Clock,
  Send,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import { useToast } from '../context/ToastContext';
import { Campaign, CampaignSequenceStep, ContactChannel } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { getChannelBadgeDetails } from '../utils/formatting';
import {
  ACTION_TYPE_OPTIONS,
  CAMPAIGN_TYPE_OPTIONS,
  CADENCE_PRESETS,
} from '../utils/schedulingConfig';
import { ScheduleMessageModal } from '../components/scheduling/ScheduleMessageModal';
import { ApplyCadenceModal } from '../components/campaigns/ApplyCadenceModal';

export const CampaignsView: React.FC = () => {
  const {
    campaigns,
    clients,
    companies,
    services,
    templates,
    actions,
    upsertCampaign,
    deleteCampaign,
    setActiveRoute,
  } = useApp();
  const confirm = useConfirm();
  const { success, error } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Modals for Scheduling
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleModalCampaignId, setScheduleModalCampaignId] = useState<string | undefined>(undefined);
  const [isApplyCadenceOpen, setIsApplyCadenceOpen] = useState(false);
  const [selectedCampaignForCadence, setSelectedCampaignForCadence] = useState<Campaign | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [campaignType, setCampaignType] = useState<string>('primeiro_contato');
  const [targetAudience, setTargetAudience] = useState('');
  const [objective, setObjective] = useState('');
  const [channel, setChannel] = useState<ContactChannel>('whatsapp');
  const [serviceId, setServiceId] = useState('');
  const [defaultTemplateId, setDefaultTemplateId] = useState('');
  const [dailyGoal, setDailyGoal] = useState(15);
  const [totalTarget, setTotalTarget] = useState(50);
  const [criteria, setCriteria] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [status, setStatus] = useState<'active' | 'inactive' | 'paused' | 'draft'>('active');
  const [sequence, setSequence] = useState<CampaignSequenceStep[]>(CADENCE_PRESETS[0].steps);

  const handleOpenAdd = () => {
    setEditingCampaign(null);
    setName('');
    setDescription('');
    setCampaignType('primeiro_contato');
    setTargetAudience('');
    setObjective('Gerar Reuniões & Qualificação');
    setChannel('whatsapp');
    setServiceId(services[0]?.id || '');
    setDefaultTemplateId(templates[0]?.id || '');
    setDailyGoal(15);
    setTotalTarget(50);
    setCriteria('Empresas sem site ou com posicionamento desatualizado');
    setStartDate(new Date().toISOString().slice(0, 10));
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    setEndDate(d.toISOString().slice(0, 10));
    setStatus('active');
    setSequence(CADENCE_PRESETS[0].steps);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Campaign) => {
    setEditingCampaign(c);
    setName(c.name);
    setDescription(c.description || '');
    setCampaignType(c.campaignType || 'primeiro_contato');
    setTargetAudience(c.targetAudience || '');
    setObjective(c.objective || '');
    setChannel(c.channel);
    setServiceId(c.serviceId || '');
    setDefaultTemplateId(c.defaultTemplateId || '');
    setDailyGoal(c.dailyGoal || 15);
    setTotalTarget(c.totalTarget || 50);
    setCriteria(c.criteria || '');
    setStartDate(c.startDate || new Date().toISOString().slice(0, 10));
    setEndDate(c.endDate || new Date().toISOString().slice(0, 10));
    setStatus(c.status === 'completed' ? 'active' : c.status);
    setSequence(c.sequence && c.sequence.length > 0 ? c.sequence : CADENCE_PRESETS[0].steps);
    setIsModalOpen(true);
  };

  // Load a Cadence Preset
  const handleApplyPreset = (presetId: string) => {
    const preset = CADENCE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSequence(preset.steps);
    if (preset.campaignType) setCampaignType(preset.campaignType);
    if (preset.channel) setChannel(preset.channel);
    success(`Preset "${preset.name}" carregado!`);
  };

  const handleAddSequenceStep = () => {
    const lastOffset = sequence.length > 0 ? sequence[sequence.length - 1].dayOffset + 3 : 0;
    setSequence([
      ...sequence,
      {
        id: `seq-${Date.now()}`,
        dayOffset: lastOffset,
        title: 'Novo Follow-up',
        actionType: 'follow_up_1',
        channel: channel,
        notes: 'Verificar se o prospect visualizou a mensagem anterior.',
      },
    ]);
  };

  const handleRemoveSequenceStep = (index: number) => {
    setSequence(sequence.filter((_, idx) => idx !== index));
  };

  const handleDuplicateSequenceStep = (index: number) => {
    const stepToDup = sequence[index];
    const newStep: CampaignSequenceStep = {
      ...stepToDup,
      id: `seq-${Date.now()}`,
      dayOffset: stepToDup.dayOffset + 2,
      title: `${stepToDup.title} (Cópia)`,
    };
    const updated = [...sequence];
    updated.splice(index + 1, 0, newStep);
    setSequence(updated);
    success('Etapa duplicada com sucesso.');
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sequence.length) return;
    const updated = [...sequence];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSequence(updated);
  };

  const handleUpdateSequenceStep = (index: number, field: keyof CampaignSequenceStep, value: any) => {
    const updated = [...sequence];
    updated[index] = { ...updated[index], [field]: value };
    setSequence(updated);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      error('Preencha o nome da campanha.');
      return;
    }

    const campaign: Campaign = {
      id: editingCampaign ? editingCampaign.id : `cmp-${Date.now()}`,
      name,
      description,
      campaignType,
      targetAudience,
      objective,
      status,
      channel,
      serviceId: serviceId || undefined,
      defaultTemplateId: defaultTemplateId || undefined,
      dailyGoal: Number(dailyGoal) || 15,
      totalTarget: Number(totalTarget) || 50,
      criteria,
      startDate,
      endDate,
      sequence,
      createdAt: editingCampaign?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await upsertCampaign(campaign);
    setIsModalOpen(false);
    success('Campanha e cadência salvas com sucesso!');
  };

  const handleDeleteCampaign = (campaign: Campaign) => {
    confirm({
      title: 'Excluir Campanha',
      message: `Tem certeza que deseja excluir a campanha "${campaign.name}"? As ações agendadas ativas permanecerão no planejador.`,
      isDestructive: true,
      onConfirm: async () => {
        await deleteCampaign(campaign.id);
        success('Campanha excluída.');
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100">Motor de Campanhas & Cadências</h2>
          <p className="text-xs text-neutral-400">
            Estruture cadências automáticas com atrasos por dias, múltiplos canais e scripts de mensagem vinculados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setScheduleModalCampaignId(undefined);
              setIsScheduleModalOpen(true);
            }}
            leftIcon={<Clock className="w-4 h-4 text-blue-400" />}
          >
            Agendar Mensagem
          </Button>

          <Button variant="primary" size="sm" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
            Criar Campanha
          </Button>
        </div>
      </div>

      {/* Campaigns List */}
      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((camp) => {
            const channelBadge = getChannelBadgeDetails(camp.channel);
            const service = services.find((s) => s.id === camp.serviceId);
            const linkedActions = actions.filter((a) => a.campaignId === camp.id);
            const pendingActions = linkedActions.filter((a) => a.status === 'pending').length;
            const completedActions = linkedActions.filter((a) => a.status === 'completed').length;
            const seqSteps = camp.sequence || CADENCE_PRESETS[0].steps;

            return (
              <Card key={camp.id} padding="md" className="bg-neutral-900 border-neutral-800 space-y-4 flex flex-col justify-between hover:border-neutral-700/80 transition-all">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${channelBadge.bgClass} ${channelBadge.textClass}`}>
                          {channelBadge.label}
                        </span>
                        <Badge variant={camp.status === 'active' ? 'emerald' : camp.status === 'paused' ? 'amber' : 'neutral'} size="sm">
                          {camp.status === 'active' ? 'Ativa' : camp.status === 'paused' ? 'Pausada' : 'Inativa'}
                        </Badge>
                        {camp.campaignType && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                            {CAMPAIGN_TYPE_OPTIONS.find((ct) => ct.id === camp.campaignType)?.label || camp.campaignType}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-neutral-100 mt-1.5">
                        {camp.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="xs" onClick={() => handleOpenEdit(camp)} title="Editar Campanha e Sequência">
                        <Edit2 className="w-3.5 h-3.5 text-neutral-300" />
                      </Button>
                      <Button variant="ghost" size="xs" onClick={() => handleDeleteCampaign(camp)} title="Excluir">
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      </Button>
                    </div>
                  </div>

                  {camp.objective && (
                    <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-emerald-400" />
                      Objetivo: {camp.objective}
                    </p>
                  )}

                  {camp.description && (
                    <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                      {camp.description}
                    </p>
                  )}

                  {/* Sequence Timeline Preview */}
                  <div className="p-3 rounded-xl bg-neutral-950/90 border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-neutral-300 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-400" />
                        Cadência Estruturada ({seqSteps.length} passos):
                      </span>
                      <span className="text-neutral-500 text-[10px]">
                        Até Dia {seqSteps[seqSteps.length - 1]?.dayOffset || 0}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {seqSteps.map((step, idx) => {
                        const stepBadge = getChannelBadgeDetails(step.channel || camp.channel);
                        return (
                          <span
                            key={step.id || idx}
                            className="px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 flex items-center gap-1.5"
                          >
                            <span className="text-emerald-400 font-mono font-bold">D+{step.dayOffset}:</span>
                            <span className="truncate max-w-[130px]">{step.title}</span>
                            <span className={`text-[9px] px-1 py-0.2 rounded font-medium ${stepBadge.bgClass} ${stepBadge.textClass}`}>
                              {stepBadge.label}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800/80 text-xs">
                    <div>
                      <span className="text-neutral-500">Público / ICP:</span>
                      <p className="font-medium text-neutral-300 truncate">
                        {camp.targetAudience || 'Geral'}
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-500">Serviço:</span>
                      <p className="font-medium text-neutral-300 truncate">
                        {service?.name || 'Não vinculado'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer KPIs & Cadence Trigger */}
                <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-xs text-neutral-400 flex items-center gap-2 flex-wrap">
                    <span className="text-emerald-400 font-bold">{pendingActions} pendentes</span>
                    <span>•</span>
                    <span className="text-neutral-300 font-bold">{completedActions} concluídas</span>
                    <span>•</span>
                    <span>Limite: <strong className="text-neutral-200">{camp.dailyGoal}/dia</strong></span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => {
                        setScheduleModalCampaignId(camp.id);
                        setIsScheduleModalOpen(true);
                      }}
                      leftIcon={<Clock className="w-3.5 h-3.5 text-blue-400" />}
                      className="text-xs"
                    >
                      Agendar Mensagem
                    </Button>

                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => {
                        setSelectedCampaignForCadence(camp);
                        setIsApplyCadenceOpen(true);
                      }}
                      leftIcon={<Zap className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      Aplicar Cadência a Leads
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
          description="Crie sua primeira campanha para estruturar cadências automáticas de follow-up com scripts integrados."
          actionLabel="Criar Campanha"
          onAction={handleOpenAdd}
        />
      )}

      {/* Modal Add / Edit Campaign */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCampaign ? 'Editar Campanha & Cadência' : 'Criar Nova Campanha & Cadência'}
        maxWidth="xl"
      >
        <form onSubmit={handleSaveCampaign} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          {/* Preset Selector Banner */}
          <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Carregar Modelo de Cadência Pré-Configurado:
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CADENCE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset.id)}
                  className="p-2 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-left transition-colors"
                >
                  <p className="text-xs font-semibold text-neutral-200 truncate">{preset.name}</p>
                  <p className="text-[10px] text-neutral-400 truncate mt-0.5">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Nome da Campanha *"
                placeholder="Ex: Prospecção Q3 - Clínicas Médicas"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Ativa</option>
                <option value="paused">Pausada</option>
                <option value="inactive">Inativa</option>
                <option value="draft">Rascunho</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Tipo de Campanha</label>
              <select
                value={campaignType}
                onChange={(e) => setCampaignType(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CAMPAIGN_TYPE_OPTIONS.map((ct) => (
                  <option key={ct.id} value={ct.id}>
                    {ct.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Canal Padrão</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as ContactChannel)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="linkedin">LinkedIn</option>
                <option value="email">E-mail</option>
                <option value="call">Ligação</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Serviço Associado</label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Nenhum (Geral)</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Objetivo Principal"
              placeholder="Ex: Gerar Reuniões de Diagnóstico"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
            />
            <Input
              label="Público Alvo / ICP"
              placeholder="Ex: Sócios e Diretores Comerciais"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="Meta Diária (Limite)"
              type="number"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
            />
            <Input
              label="Meta Total (Leads)"
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
              label="Data Final"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Builder de Sequência / Cadência */}
          <div className="space-y-3 pt-3 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-neutral-100 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Construtor de Cadência ({sequence.length} passos configurados)
                </label>
                <p className="text-[11px] text-neutral-400">
                  Configure os dias de atraso (offset), tipo de ação, canal e script de mensagem para cada etapa.
                </p>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="xs"
                onClick={handleAddSequenceStep}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Adicionar Etapa
              </Button>
            </div>

            <div className="space-y-3">
              {sequence.map((step, idx) => (
                <div
                  key={step.id || idx}
                  className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/90 space-y-3 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-neutral-900 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 font-mono text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-neutral-200">
                        Passo {idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveStep(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-neutral-400 hover:text-neutral-200 disabled:opacity-30"
                        title="Mover para cima"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveStep(idx, 'down')}
                        disabled={idx === sequence.length - 1}
                        className="p-1 text-neutral-400 hover:text-neutral-200 disabled:opacity-30"
                        title="Mover para baixo"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateSequenceStep(idx)}
                        className="p-1 text-neutral-400 hover:text-blue-400"
                        title="Duplicar etapa"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSequenceStep(idx)}
                        className="p-1 text-neutral-400 hover:text-rose-400"
                        title="Remover etapa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-neutral-400 mb-1">Dias de Atraso</label>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-neutral-400 font-mono font-bold">D+</span>
                        <input
                          type="number"
                          value={step.dayOffset}
                          onChange={(e) => handleUpdateSequenceStep(idx, 'dayOffset', Number(e.target.value))}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-emerald-400 font-mono text-center"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-neutral-400 mb-1">Título da Etapa</label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => handleUpdateSequenceStep(idx, 'title', e.target.value)}
                        placeholder="Ex: Primeiro contato, Follow-up 1..."
                        className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1 text-xs text-neutral-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-neutral-400 mb-1">Canal</label>
                      <select
                        value={step.channel || channel}
                        onChange={(e) => handleUpdateSequenceStep(idx, 'channel', e.target.value as ContactChannel)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-200"
                      >
                        <option value="whatsapp">WhatsApp</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="email">E-mail</option>
                        <option value="call">Ligação</option>
                        <option value="instagram">Instagram</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-neutral-400 mb-1">Tipo de Ação</label>
                      <select
                        value={step.actionType || 'primeiro_contato'}
                        onChange={(e) => handleUpdateSequenceStep(idx, 'actionType', e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1 text-xs text-neutral-200"
                      >
                        {ACTION_TYPE_OPTIONS.map((at) => (
                          <option key={at.id} value={at.id}>
                            {at.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-neutral-400 mb-1">Script de Mensagem Vinculado</label>
                      <select
                        value={step.templateId || ''}
                        onChange={(e) => handleUpdateSequenceStep(idx, 'templateId', e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1 text-xs text-neutral-200"
                      >
                        <option value="">(Usar Script Padrão da Campanha)</option>
                        {templates.map((tpl) => (
                          <option key={tpl.id} value={tpl.id}>
                            📄 {tpl.title} ({tpl.version || 'v1.0'}) [{tpl.category}]
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Salvar Campanha & Cadência
            </Button>
          </div>
        </form>
      </Modal>

      {/* Global Schedule Message Modal */}
      <ScheduleMessageModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        initialCampaignId={scheduleModalCampaignId}
      />

      {/* Apply Cadence Batch Modal */}
      {selectedCampaignForCadence && (
        <ApplyCadenceModal
          isOpen={isApplyCadenceOpen}
          onClose={() => {
            setIsApplyCadenceOpen(false);
            setSelectedCampaignForCadence(null);
          }}
          campaign={selectedCampaignForCadence}
        />
      )}
    </div>
  );
};

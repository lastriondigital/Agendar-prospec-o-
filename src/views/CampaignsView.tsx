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

const DEFAULT_SEQUENCE_PRESET: CampaignSequenceStep[] = [
  { id: 'seq-0', dayOffset: 0, title: 'Primeiro contacto' },
  { id: 'seq-1', dayOffset: 2, title: 'Follow-up' },
  { id: 'seq-2', dayOffset: 5, title: 'Prova' },
  { id: 'seq-3', dayOffset: 9, title: 'Follow-up' },
  { id: 'seq-4', dayOffset: 20, title: 'Reativação' },
  { id: 'seq-5', dayOffset: 45, title: 'Nova tentativa' },
];

export const CampaignsView: React.FC = () => {
  const { campaigns, clients, services, templates, upsertCampaign, deleteCampaign, createActionBatchForCampaign, setActiveRoute } = useApp();
  const confirm = useConfirm();
  const { success, error } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Form State
  const [name, setName] = useState('');
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
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [status, setStatus] = useState<'active' | 'inactive' | 'paused' | 'draft'>('active');
  const [sequence, setSequence] = useState<CampaignSequenceStep[]>(DEFAULT_SEQUENCE_PRESET);

  const handleOpenAdd = () => {
    setEditingCampaign(null);
    setName('');
    setDescription('');
    setTargetAudience('');
    setObjective('Gerar Reuniões & Qualificação');
    setChannel('whatsapp');
    setServiceId(services[0]?.id || '');
    setDefaultTemplateId(templates[0]?.id || '');
    setDailyGoal(15);
    setTotalTarget(50);
    setCriteria('Empresas sem site ou com site desatualizado');
    setStartDate(new Date().toISOString().slice(0, 10));
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    setEndDate(d.toISOString().slice(0, 10));
    setStatus('active');
    setSequence(DEFAULT_SEQUENCE_PRESET);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Campaign) => {
    setEditingCampaign(c);
    setName(c.name);
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
    setEndDate(c.endDate || new Date().toISOString().slice(0, 10));
    setStatus(c.status === 'completed' ? 'active' : c.status);
    setSequence(c.sequence && c.sequence.length > 0 ? c.sequence : DEFAULT_SEQUENCE_PRESET);
    setIsModalOpen(true);
  };

  const handleAddSequenceStep = () => {
    const lastOffset = sequence.length > 0 ? sequence[sequence.length - 1].dayOffset + 10 : 0;
    setSequence([
      ...sequence,
      {
        id: `seq-${Date.now()}`,
        dayOffset: lastOffset,
        title: 'Novo Follow-up',
      },
    ]);
  };

  const handleRemoveSequenceStep = (index: number) => {
    setSequence(sequence.filter((_, idx) => idx !== index));
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
    success('Campanha salva com sucesso!');
  };

  const handleDeleteCampaign = (campaign: Campaign) => {
    confirm({
      title: 'Excluir Campanha',
      message: `Tem certeza que deseja excluir a campanha "${campaign.name}"?`,
      isDestructive: true,
      onConfirm: async () => {
        await deleteCampaign(campaign.id);
        success('Campanha excluída.');
      },
    });
  };

  const handleGenerateBatch = async (campaign: Campaign) => {
    const candidateClients = clients.filter((c) => c.campaignId === campaign.id || !c.campaignId);
    if (candidateClients.length === 0) {
      success('Nenhum cliente disponível. Adicione novos contatos primeiro.');
      return;
    }

    const templateId = campaign.defaultTemplateId || templates[0]?.id || '';
    await createActionBatchForCampaign(
      campaign.id,
      candidateClients.slice(0, campaign.dailyGoal).map((c) => c.id),
      templateId
    );

    setActiveRoute('prospecting');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100">Motor de Campanhas & Sequências</h2>
          <p className="text-xs text-neutral-400">
            Estruture cadências automáticas por dias (Dia 0, Dia 2, Dia 5...) com metas de conversão e limites diários.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
          Criar Campanha
        </Button>
      </div>

      {/* Campaigns List */}
      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((camp) => {
            const channelBadge = getChannelBadgeDetails(camp.channel);
            const service = services.find((s) => s.id === camp.serviceId);
            const linkedClientsCount = clients.filter((c) => c.campaignId === camp.id).length;
            const seqSteps = camp.sequence || DEFAULT_SEQUENCE_PRESET;

            return (
              <Card key={camp.id} padding="md" className="bg-neutral-900 border-neutral-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${channelBadge.bgClass} ${channelBadge.textClass}`}>
                          {channelBadge.label}
                        </span>
                        <Badge variant={camp.status === 'active' ? 'emerald' : camp.status === 'paused' ? 'amber' : 'neutral'} size="sm">
                          {camp.status === 'active' ? 'Ativa' : camp.status === 'paused' ? 'Pausada' : 'Inativa'}
                        </Badge>
                      </div>
                      <h3 className="text-base font-bold text-neutral-100 mt-1.5">
                        {camp.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="xs" onClick={() => handleOpenEdit(camp)} title="Editar">
                        <Edit2 className="w-3.5 h-3.5 text-neutral-300" />
                      </Button>
                      <Button variant="ghost" size="xs" onClick={() => handleDeleteCampaign(camp)} title="Excluir">
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      </Button>
                    </div>
                  </div>

                  {camp.objective && (
                    <p className="text-xs font-semibold text-emerald-400">
                      🎯 Objetivo: {camp.objective}
                    </p>
                  )}

                  {camp.description && (
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {camp.description}
                    </p>
                  )}

                  {/* Sequence Timeline Preview */}
                  <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-emerald-400" /> Sequência de Cadência ({seqSteps.length} passos):
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {seqSteps.map((step, idx) => (
                        <span key={step.id || idx} className="px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 flex items-center gap-1">
                          <strong className="text-emerald-400">Dia {step.dayOffset}:</strong> {step.title}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800/80 text-xs">
                    <div>
                      <span className="text-neutral-500">ICP / Público:</span>
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

                {/* Footer KPIs & Batch Generation */}
                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-3">
                  <div className="text-xs text-neutral-400">
                    <span className="font-bold text-neutral-200">{linkedClientsCount}</span> leads • Limite/Dia: <span className="font-bold text-neutral-200">{camp.dailyGoal}</span>
                  </div>

                  <Button
                    variant="execution"
                    size="xs"
                    onClick={() => handleGenerateBatch(camp)}
                    leftIcon={<Zap className="w-3.5 h-3.5 fill-white" />}
                  >
                    Gerar Fila do Dia
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Target className="w-8 h-8 text-neutral-400" />}
          title="Nenhuma campanha configurada"
          description="Crie sua primeira campanha para estructurar sequências de follow-ups automáticas."
          actionLabel="Criar Campanha"
          onAction={handleOpenAdd}
        />
      )}

      {/* Modal Add / Edit Campaign */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCampaign ? 'Editar Campanha' : 'Criar Nova Campanha & Sequência'}
        maxWidth="xl"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveCampaign}>
              Salvar Campanha
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveCampaign} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
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
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              <label className="block text-xs font-medium text-neutral-300 mb-1">Canal</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as ContactChannel)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              <Input
                label="Objetivo Principal"
                placeholder="Ex: Gerar Reuniões"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="ICP / Público Alvo"
              placeholder="Ex: Sócios e Diretores Comerciais"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            />
            <Input
              label="Critérios de Seleção"
              placeholder="Ex: Sem site ou Google Reviews < 4.0"
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
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

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-medium text-neutral-300">Descrição</label>
            <textarea
              rows={2}
              placeholder="Detalhes adicionais da campanha..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Sequência Builder */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Sequência de Cadência por Dias (Ex: Dia 0, 2, 5...)
              </label>
              <Button variant="secondary" size="xs" onClick={handleAddSequenceStep} leftIcon={<Plus className="w-3 h-3" />}>
                Adicionar Passo
              </Button>
            </div>

            <div className="space-y-2">
              {sequence.map((step, idx) => (
                <div key={step.id || idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="w-28 shrink-0 flex items-center gap-1">
                    <span className="text-xs font-bold text-neutral-400">Dia</span>
                    <input
                      type="number"
                      value={step.dayOffset}
                      onChange={(e) => handleUpdateSequenceStep(idx, 'dayOffset', Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-emerald-400 font-mono text-center"
                    />
                  </div>

                  <div className="flex-1">
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => handleUpdateSequenceStep(idx, 'title', e.target.value)}
                      placeholder="Título da Ação (Ex: Primeiro contacto, Follow-up)"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1 text-xs text-neutral-100"
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleRemoveSequenceStep(idx)}
                    title="Remover passo"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

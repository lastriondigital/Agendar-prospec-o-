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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import { useToast } from '../context/ToastContext';
import { Campaign, ContactChannel } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { getChannelBadgeDetails } from '../utils/formatting';

export const CampaignsView: React.FC = () => {
  const { campaigns, clients, services, templates, upsertCampaign, deleteCampaign, createActionBatchForCampaign, setActiveRoute } = useApp();
  const confirm = useConfirm();
  const { success } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [channel, setChannel] = useState<ContactChannel>('whatsapp');
  const [serviceId, setServiceId] = useState('');
  const [defaultTemplateId, setDefaultTemplateId] = useState('');
  const [dailyGoal, setDailyGoal] = useState(10);
  const [totalTarget, setTotalTarget] = useState(50);

  const handleOpenAdd = () => {
    setEditingCampaign(null);
    setName('');
    setDescription('');
    setTargetAudience('');
    setChannel('whatsapp');
    setServiceId(services[0]?.id || '');
    setDefaultTemplateId(templates[0]?.id || '');
    setDailyGoal(10);
    setTotalTarget(50);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Campaign) => {
    setEditingCampaign(c);
    setName(c.name);
    setDescription(c.description || '');
    setTargetAudience(c.targetAudience || '');
    setChannel(c.channel);
    setServiceId(c.serviceId || '');
    setDefaultTemplateId(c.defaultTemplateId || '');
    setDailyGoal(c.dailyGoal);
    setTotalTarget(c.totalTarget);
    setIsModalOpen(true);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const campaign: Campaign = {
      id: editingCampaign ? editingCampaign.id : `cmp-${Date.now()}`,
      name,
      description,
      targetAudience,
      status: editingCampaign?.status || 'active',
      channel,
      serviceId: serviceId || undefined,
      defaultTemplateId: defaultTemplateId || undefined,
      dailyGoal: Number(dailyGoal) || 10,
      totalTarget: Number(totalTarget) || 50,
      createdAt: editingCampaign?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await upsertCampaign(campaign);
    setIsModalOpen(false);
  };

  const handleDeleteCampaign = (campaign: Campaign) => {
    confirm({
      title: 'Excluir Campanha',
      message: `Tem certeza que deseja excluir a campanha "${campaign.name}"?`,
      isDestructive: true,
      onConfirm: async () => {
        await deleteCampaign(campaign.id);
      },
    });
  };

  const handleGenerateBatch = async (campaign: Campaign) => {
    // Find clients linked to this campaign or unassigned
    const candidateClients = clients.filter((c) => c.campaignId === campaign.id || !c.campaignId);
    if (candidateClients.length === 0) {
      success('Nenhum cliente disponível para esta campanha. Adicione novos contatos primeiro.');
      return;
    }

    const templateId = campaign.defaultTemplateId || templates[0]?.id || '';
    const count = await createActionBatchForCampaign(
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
          <h2 className="text-xl font-bold text-neutral-100">Campanhas Estratégicas</h2>
          <p className="text-xs text-neutral-400">
            Estruture metas, canais e scripts para disparar lotes de prospecção com facilidade.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
          Nova Campanha
        </Button>
      </div>

      {/* Campaigns List */}
      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((camp) => {
            const channelBadge = getChannelBadgeDetails(camp.channel);
            const service = services.find((s) => s.id === camp.serviceId);
            const linkedClientsCount = clients.filter((c) => c.campaignId === camp.id).length;

            return (
              <Card key={camp.id} padding="md" className="bg-neutral-900 border-neutral-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${channelBadge.bgClass} ${channelBadge.textClass}`}>
                          {channelBadge.label}
                        </span>
                        <Badge variant={camp.status === 'active' ? 'emerald' : 'neutral'} size="sm">
                          {camp.status === 'active' ? 'Ativa' : 'Pausada'}
                        </Badge>
                      </div>
                      <h3 className="text-base font-bold text-neutral-100 mt-1.5">
                        {camp.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="xs" onClick={() => handleOpenEdit(camp)}>
                        <Edit2 className="w-3.5 h-3.5 text-neutral-300" />
                      </Button>
                      <Button variant="ghost" size="xs" onClick={() => handleDeleteCampaign(camp)}>
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      </Button>
                    </div>
                  </div>

                  {camp.description && (
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {camp.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800/80 text-xs">
                    <div>
                      <span className="text-neutral-500">Público Alvo:</span>
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
                    <span className="font-bold text-neutral-200">{linkedClientsCount}</span> leads vinculados • Meta diária: <span className="font-bold text-neutral-200">{camp.dailyGoal}</span>
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
          description="Crie sua primeira campanha para definir metas de prospecção e vincular scripts aos leads certos."
          actionLabel="Criar Campanha"
          onAction={handleOpenAdd}
        />
      )}

      {/* Modal Add/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCampaign ? 'Editar Campanha' : 'Nova Campanha de Prospecção'}
        maxWidth="md"
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
        <form onSubmit={handleSaveCampaign} className="space-y-4">
          <Input
            label="Nome da Campanha *"
            placeholder="Ex: Prospecção Q3 - Diretores Logística"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Público-alvo / Segmento"
            placeholder="Ex: Sócios e Diretores Comerciais"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-medium text-neutral-300">Canal Principal</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as ContactChannel)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="linkedin">LinkedIn</option>
                <option value="email">E-mail</option>
                <option value="call">Ligação</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-medium text-neutral-300">Serviço Ofertado</label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Nenhum / Geral</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Meta Diária de Contatos"
              type="number"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
            />
            <Input
              label="Meta Total de Leads"
              type="number"
              value={totalTarget}
              onChange={(e) => setTotalTarget(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-medium text-neutral-300">Descrição / Objetivo</label>
            <textarea
              rows={2}
              placeholder="Objetivo estratégico da campanha..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

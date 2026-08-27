import React, { useState, useMemo } from 'react';
import {
  MessageSquareText,
  Plus,
  Search,
  Filter,
  Star,
  Archive,
  Copy,
  Edit2,
  Trash2,
  Eye,
  Check,
  AlertTriangle,
  Code,
  Sparkles,
  Layers,
  FileText,
  Calendar,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import { useToast } from '../context/ToastContext';
import { ContactChannel, MessageTemplate, TemplateCategory, LeadStage, Client } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { ContextualTip } from '../components/common/ContextualTip';
import { ScheduleMessageModal } from '../components/messaging/ScheduleMessageModal';
import {
  getChannelBadgeDetails,
  interpolateMessage,
  validateMessageContent,
  ALLOWED_VARIABLES,
} from '../utils/formatting';
import {
  getActionTypes,
  CHANNEL_OPTIONS,
  DEFAULT_ACTION_TYPES,
  resolveVariablesDetailed,
} from '../utils/cadenceUtils';

export const MessagesView: React.FC = () => {
  const { templates, services, companies, contacts, upsertTemplate, deleteTemplate } = useApp();
  const confirm = useConfirm();
  const { success, error } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedActionType, setSelectedActionType] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  // Modal para agendar diretamente a partir do script
  const [scheduleTemplateId, setScheduleTemplateId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formChannel, setFormChannel] = useState<ContactChannel>('whatsapp');
  const [formActionType, setFormActionType] = useState<string>('Primeiro contato');
  const [customActionType, setCustomActionType] = useState('');
  const [isCustomTypeMode, setIsCustomTypeMode] = useState(false);
  const [formContent, setFormContent] = useState('');
  const [formVersion, setFormVersion] = useState('v1.0');
  const [formServiceId, setFormServiceId] = useState('');
  const [formNiche, setFormNiche] = useState('');
  const [formPipelineStage, setFormPipelineStage] = useState<LeadStage | ''>('');
  const [formStatus, setFormStatus] = useState<'active' | 'archived' | 'draft'>('active');
  const [formNotes, setFormNotes] = useState('');

  // Amostras para prévia em tempo real
  const sampleCompany = companies[0] || {
    name: 'Clínica Alfa',
    niche: 'Saúde & Estética',
    city: 'São Paulo',
    country: 'Brasil',
  };
  const sampleContact: Partial<Client> = {
    name: contacts[0]?.name || 'Dr. Roberto Santos',
    role: contacts[0]?.role || 'Diretor Clínico',
    phone: contacts[0]?.phone || '(11) 98765-4321',
    whatsapp: contacts[0]?.whatsapp || '(11) 98765-4321',
    company: companies[0]?.name || 'Clínica Alfa',
    segment: companies[0]?.niche || 'Saúde & Estética',
  };
  const sampleService = services[0] || {
    name: 'Consultoria de Aquisição Digital',
    basePrice: 3500,
    currency: 'R$',
  };

  // Tipos de ação disponíveis na base
  const availableActionTypes = useMemo(() => {
    return getActionTypes(templates);
  }, [templates]);

  // Filtragem inteligente de templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (showArchived && !t.isArchived && t.status !== 'archived') return false;
      if (!showArchived && (t.isArchived || t.status === 'archived')) return false;
      if (showFavoritesOnly && !t.isFavorite) return false;
      if (selectedChannel !== 'all' && t.channel !== selectedChannel) return false;
      if (selectedActionType !== 'all') {
        const itemType = t.actionType || t.category || t.type;
        if (itemType !== selectedActionType) return false;
      }
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.content.toLowerCase().includes(q) ||
          (t.actionType && t.actionType.toLowerCase().includes(q)) ||
          t.notes?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [templates, showArchived, showFavoritesOnly, selectedChannel, selectedActionType, searchTerm]);

  const handleOpenAdd = () => {
    setEditingTemplate(null);
    setFormTitle('');
    setFormChannel('whatsapp');
    setFormActionType('Primeiro contato');
    setCustomActionType('');
    setIsCustomTypeMode(false);
    setFormContent(
      'Olá {{primeiro_nome}}, tudo bem?\n\nVi que você lidera a {{empresa}} em {{cidade}}. Analisando seu setor ({{nicho}}), notei que muitos negócios enfrentam desafios com {{problema}}.\n\nNós ajudamos empresas como a sua a {{beneficio}} através do {{servico}}.\n\n{{cta}}'
    );
    setFormVersion('v1.0');
    setFormServiceId('');
    setFormNiche('');
    setFormPipelineStage('');
    setFormStatus('active');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setFormTitle(template.title);
    setFormChannel(template.channel);
    const actType = template.actionType || template.category || template.type || 'Primeiro contato';
    setFormActionType(actType);
    setCustomActionType('');
    setIsCustomTypeMode(false);
    setFormContent(template.content);
    setFormVersion(template.version || 'v1.0');
    setFormServiceId(template.serviceId || '');
    setFormNiche(template.niche || '');
    setFormPipelineStage(template.pipelineStage || '');
    setFormStatus(
      (template.status as 'active' | 'archived' | 'draft') ||
        (template.isArchived ? 'archived' : 'active')
    );
    setFormNotes(template.notes || '');
    setIsModalOpen(true);
  };

  const handleDuplicate = async (template: MessageTemplate) => {
    const duplicated: MessageTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      title: `${template.title} (Cópia)`,
      version: 'v1.0',
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await upsertTemplate(duplicated);
    success('Script duplicado com sucesso!');
  };

  const handleToggleFavorite = async (template: MessageTemplate) => {
    const updated: MessageTemplate = {
      ...template,
      isFavorite: !template.isFavorite,
      updatedAt: new Date().toISOString(),
    };
    await upsertTemplate(updated);
  };

  const handleToggleArchive = async (template: MessageTemplate) => {
    const isNowArchived = !template.isArchived;
    const updated: MessageTemplate = {
      ...template,
      isArchived: isNowArchived,
      status: isNowArchived ? 'archived' : 'active',
      updatedAt: new Date().toISOString(),
    };
    await upsertTemplate(updated);
    success(isNowArchived ? 'Script arquivado.' : 'Script restaurado.');
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      error('Preencha o título e o conteúdo da mensagem.');
      return;
    }

    const effectiveAction = isCustomTypeMode ? customActionType.trim() : formActionType;
    if (!effectiveAction) {
      error('Defina o tipo de ação para este script.');
      return;
    }

    const template: MessageTemplate = {
      id: editingTemplate ? editingTemplate.id : `tpl-${Date.now()}`,
      title: formTitle.trim(),
      channel: formChannel,
      channels: [formChannel],
      actionType: effectiveAction,
      category: effectiveAction as any,
      type: effectiveAction,
      content: formContent.trim(),
      variables: ALLOWED_VARIABLES.filter((v) => formContent.includes(`{{${v}}}`)),
      version: formVersion || 'v1.0',
      serviceId: formServiceId || undefined,
      niche: formNiche || undefined,
      pipelineStage: formPipelineStage || undefined,
      status: formStatus,
      isFavorite: editingTemplate ? editingTemplate.isFavorite : false,
      isArchived: formStatus === 'archived',
      notes: formNotes.trim(),
      createdAt: editingTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await upsertTemplate(template);
    setIsModalOpen(false);
    success('Script de mensagem salvo com sucesso!');
  };

  const handleDeleteTemplate = (template: MessageTemplate) => {
    confirm({
      title: 'Excluir Script de Mensagem',
      message: `Tem certeza que deseja remover o modelo "${template.title}"?`,
      isDestructive: true,
      onConfirm: async () => {
        await deleteTemplate(template.id);
        success('Template excluído com sucesso.');
      },
    });
  };

  const insertVariableIntoForm = (varTag: string) => {
    setFormContent((prev) => prev + ` {{${varTag}}}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    success('Mensagem copiada para a área de transferência!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Dica Contextual */}
      <ContextualTip
        id="messages_view_tip"
        title="Scripts & Relação com Tipos de Ações"
        message="Vincule seus scripts diretamente a um Tipo de Ação (ex: Primeiro contato, Follow-up 1, Quebra de objeção) e Canal. Ao agendar uma mensagem, o sistema selecionará e preencherá automaticamente o script ideal."
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-emerald-400" />
            Biblioteca & Relação de Scripts de Prospecção
          </h2>
          <p className="text-xs text-neutral-400">
            Gerencie scripts organizados por Tipo de Ação, Canal e Etapa com substituição dinâmica de variáveis.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Novo Script
        </Button>
      </div>

      {/* Filtros e Barra de Pesquisa */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Pesquisar por título, conteúdo, tipo de ação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Canal */}
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos os Canais</option>
            {CHANNEL_OPTIONS.map((ch) => (
              <option key={ch.value} value={ch.value}>
                {ch.icon} {ch.label}
              </option>
            ))}
          </select>

          {/* Seletor de Tipo de Ação */}
          <select
            value={selectedActionType}
            onChange={(e) => setSelectedActionType(e.target.value)}
            className="px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos os Tipos de Ação</option>
            {availableActionTypes.map((act) => (
              <option key={act} value={act}>
                🎯 {act}
              </option>
            ))}
          </select>

          {/* Filtro de Favoritos */}
          <Button
            variant={showFavoritesOnly ? 'primary' : 'secondary'}
            size="xs"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            leftIcon={
              <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            }
          >
            Favoritos
          </Button>

          {/* Toggle de Arquivados */}
          <Button
            variant={showArchived ? 'primary' : 'ghost'}
            size="xs"
            onClick={() => setShowArchived(!showArchived)}
            leftIcon={<Archive className="w-3.5 h-3.5" />}
          >
            {showArchived ? 'Ver Ativos' : 'Arquivados'}
          </Button>
        </div>
      </div>

      {/* Grid de Scripts */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => {
            const channelBadge = getChannelBadgeDetails(template.channel);
            const livePreview = interpolateMessage(
              template.content,
              sampleContact,
              sampleService,
              sampleCompany
            );
            const validation = validateMessageContent(template.content);
            const matchedService = services.find((s) => s.id === template.serviceId);
            const displayActionType =
              template.actionType || template.category || template.type || 'Primeiro contato';

            return (
              <Card
                key={template.id}
                padding="md"
                className={`bg-neutral-900 border-neutral-800 space-y-3.5 flex flex-col justify-between transition-all ${
                  template.isArchived || template.status === 'archived'
                    ? 'opacity-60 grayscale'
                    : ''
                }`}
              >
                <div className="space-y-3">
                  {/* Cabeçalho com Badges de Canal e Tipo de Ação */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${channelBadge.bgClass} ${channelBadge.textClass}`}
                        >
                          {channelBadge.label}
                        </span>

                        <Badge variant="emerald" size="sm">
                          🎯 {displayActionType}
                        </Badge>

                        <span className="font-mono text-[10px] text-neutral-400 bg-neutral-800 px-1.5 py-0.5 rounded">
                          {template.version || 'v1.0'}
                        </span>

                        {matchedService && (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            Serviço: {matchedService.name}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-neutral-100 mt-1 flex items-center gap-2">
                        {template.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleToggleFavorite(template)}
                        title={template.isFavorite ? 'Desfavoritar' : 'Favoritar'}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            template.isFavorite
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-neutral-500'
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => copyToClipboard(template.content)}
                        title="Copiar texto"
                      >
                        <Copy className="w-3.5 h-3.5 text-neutral-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDuplicate(template)}
                        title="Duplicar template"
                      >
                        <Layers className="w-3.5 h-3.5 text-neutral-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleOpenEdit(template)}
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-neutral-300" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleToggleArchive(template)}
                        title={template.isArchived ? 'Restaurar' : 'Arquivar'}
                      >
                        <Archive className="w-3.5 h-3.5 text-neutral-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDeleteTemplate(template)}
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      </Button>
                    </div>
                  </div>

                  {/* Conteúdo do Script */}
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 font-sans leading-relaxed whitespace-pre-line select-text">
                    {template.content}
                  </div>

                  {/* Prévia Dinâmica */}
                  <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-neutral-300 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Prévia com Dados de Exemplo ({sampleCompany.name}):
                    </span>
                    <p className="italic text-neutral-300">{livePreview}</p>
                  </div>
                </div>

                {/* Rodapé com Ação Rápida de Agendar */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-[11px]">
                  <span className="text-neutral-500 truncate max-w-[200px]">
                    {template.notes || 'Pronto para uso operacional'}
                  </span>

                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20"
                    leftIcon={<Calendar className="w-3.5 h-3.5" />}
                    onClick={() => setScheduleTemplateId(template.id)}
                  >
                    Agendar Envio
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<MessageSquareText className="w-8 h-8 text-neutral-400" />}
          title="Nenhum script encontrado"
          description="Ajuste os filtros de canal e tipo de ação ou crie um novo script para sua biblioteca."
          actionLabel="Criar Novo Script"
          onAction={handleOpenAdd}
        />
      )}

      {/* Modal Criar / Editar Script */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTemplate ? 'Editar Script de Mensagem' : 'Novo Script de Mensagem'}
        maxWidth="xl"
      >
        <form onSubmit={handleSaveTemplate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Nome / Título do Script *"
                placeholder="Ex: Abordagem Direta WhatsApp - Clínicas"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Versão</label>
              <input
                type="text"
                value={formVersion}
                onChange={(e) => setFormVersion(e.target.value)}
                placeholder="Ex: v1.0"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Canal */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Canal de Envio *</label>
              <select
                value={formChannel}
                onChange={(e) => setFormChannel(e.target.value as ContactChannel)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
              >
                {CHANNEL_OPTIONS.map((ch) => (
                  <option key={ch.value} value={ch.value}>
                    {ch.icon} {ch.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Ação */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Tipo de Ação *</label>
              {!isCustomTypeMode ? (
                <div className="flex gap-1.5">
                  <select
                    value={formActionType}
                    onChange={(e) => setFormActionType(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                  >
                    {availableActionTypes.map((act) => (
                      <option key={act} value={act}>
                        {act}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="whitespace-nowrap text-[11px]"
                    onClick={() => setIsCustomTypeMode(true)}
                  >
                    + Novo
                  </Button>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Digite o novo tipo de ação..."
                    value={customActionType}
                    onChange={(e) => setCustomActionType(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="text-[11px]"
                    onClick={() => setIsCustomTypeMode(false)}
                  >
                    Lista
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Vincular a Serviço (Opcional)</label>
              <select
                value={formServiceId}
                onChange={(e) => setFormServiceId(e.target.value)}
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
              <label className="block text-xs font-medium text-neutral-300 mb-1">Status do Script</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as 'active' | 'archived' | 'draft')}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="active">Ativo (Disponível para agendamento)</option>
                <option value="draft">Rascunho (Em elaboração)</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>
          </div>

          {/* Variáveis Dinâmicas */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Inserir Variável Dinâmica:
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-neutral-950 border border-neutral-800 max-h-24 overflow-y-auto">
              {ALLOWED_VARIABLES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => insertVariableIntoForm(v)}
                  className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-mono transition-colors cursor-pointer"
                >
                  {`{{${v}}}`}
                </button>
              ))}
            </div>
          </div>

          {/* Editor e Prévia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Conteúdo do Script *</label>
              <textarea
                rows={8}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Escreva a mensagem usando as variáveis..."
                className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 font-sans leading-relaxed focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-emerald-400" /> Prévia com Dados de Exemplo:
              </label>
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 font-sans leading-relaxed whitespace-pre-line h-[178px] overflow-y-auto">
                {interpolateMessage(formContent, sampleContact, sampleService, sampleCompany)}
              </div>
            </div>
          </div>

          <Input
            label="Notas Internas / Dica de Uso"
            placeholder="Ex: Usar após 48h sem resposta do primeiro contato."
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Salvar Script
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Agendamento Aberto pelo Script */}
      {scheduleTemplateId && (
        <ScheduleMessageModal
          isOpen={!!scheduleTemplateId}
          onClose={() => setScheduleTemplateId(null)}
          initialActionType={
            templates.find((t) => t.id === scheduleTemplateId)?.actionType ||
            templates.find((t) => t.id === scheduleTemplateId)?.category ||
            'Primeiro contato'
          }
          initialChannel={templates.find((t) => t.id === scheduleTemplateId)?.channel}
        />
      )}
    </div>
  );
};

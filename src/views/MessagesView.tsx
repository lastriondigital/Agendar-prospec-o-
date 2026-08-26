import React, { useState } from 'react';
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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import { useToast } from '../context/ToastContext';
import { ContactChannel, MessageTemplate, TemplateCategory, LeadStage } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { getChannelBadgeDetails, interpolateMessage, validateMessageContent, ALLOWED_VARIABLES } from '../utils/formatting';

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  primeiro_contacto: 'Primeiro Contato',
  follow_up: 'Follow-up',
  diagnóstico: 'Diagnóstico',
  prova: 'Prova',
  proposta: 'Proposta',
  objeção: 'Objeção',
  fechamento: 'Fechamento',
  pós_venda: 'Pós-Venda',
  reativação: 'Reativação',
  custom: 'Personalizado',
};

export const MessagesView: React.FC = () => {
  const { templates, services, companies, upsertTemplate, deleteTemplate } = useApp();
  const confirm = useConfirm();
  const { success, error } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formChannel, setFormChannel] = useState<ContactChannel>('whatsapp');
  const [formCategory, setFormCategory] = useState<TemplateCategory>('primeiro_contacto');
  const [formContent, setFormContent] = useState('');
  const [formVersion, setFormVersion] = useState('v1.0');
  const [formServiceId, setFormServiceId] = useState('');
  const [formNiche, setFormNiche] = useState('');
  const [formPipelineStage, setFormPipelineStage] = useState<LeadStage | ''>('');
  const [formNotes, setFormNotes] = useState('');

  // Sample data for live preview
  const sampleCompany = companies[0] || { name: 'Clínica Alfa', niche: 'Saúde & Estética', city: 'São Paulo', country: 'Brasil' };
  const sampleService = services[0] || { name: 'Landing Page de Alta Conversão', basePrice: 2500, currency: 'R$' };

  const filteredTemplates = templates.filter((t) => {
    if (showArchived && !t.isArchived) return false;
    if (!showArchived && t.isArchived) return false;
    if (showFavoritesOnly && !t.isFavorite) return false;
    if (selectedChannel !== 'all' && t.channel !== selectedChannel) return false;
    if (selectedCategory !== 'all' && t.category !== selectedCategory && t.type !== selectedCategory) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q) ||
        t.notes?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingTemplate(null);
    setFormTitle('');
    setFormChannel('whatsapp');
    setFormCategory('primeiro_contacto');
    setFormContent('Olá {{primeiro_nome}}, tudo bem?\n\nVi que você lidera a {{empresa}} em {{cidade}}. Analisando seu setor ({{nicho}}), notei que muitos negócios enfrentam desafios com {{problema}}.\n\nNós ajudamos empresas como a sua a {{beneficio}} através do {{servico}}.\n\n{{cta}}');
    setFormVersion('v1.0');
    setFormServiceId('');
    setFormNiche('');
    setFormPipelineStage('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setFormTitle(template.title);
    setFormChannel(template.channel);
    setFormCategory(template.category || template.type || 'primeiro_contacto');
    setFormContent(template.content);
    setFormVersion(template.version || 'v1.0');
    setFormServiceId(template.serviceId || '');
    setFormNiche(template.niche || '');
    setFormPipelineStage(template.pipelineStage || '');
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
    success('Template duplicado com sucesso!');
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
    const updated: MessageTemplate = {
      ...template,
      isArchived: !template.isArchived,
      updatedAt: new Date().toISOString(),
    };
    await upsertTemplate(updated);
    success(updated.isArchived ? 'Template arquivado.' : 'Template restaurado.');
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formContent) {
      error('Preencha o título e o conteúdo da mensagem.');
      return;
    }

    const template: MessageTemplate = {
      id: editingTemplate ? editingTemplate.id : `tpl-${Date.now()}`,
      title: formTitle,
      channel: formChannel,
      category: formCategory,
      type: formCategory,
      content: formContent,
      variables: ALLOWED_VARIABLES.filter((v) => formContent.includes(`{{${v}}}`)),
      version: formVersion || 'v1.0',
      serviceId: formServiceId || undefined,
      niche: formNiche || undefined,
      pipelineStage: formPipelineStage || undefined,
      isFavorite: editingTemplate ? editingTemplate.isFavorite : false,
      isArchived: editingTemplate ? editingTemplate.isArchived : false,
      notes: formNotes,
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
        success('Template excluído.');
      },
    });
  };

  const insertVariableIntoForm = (varTag: string) => {
    setFormContent((prev) => prev + ` {{${varTag}}}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100">Biblioteca & Motor de Mensagens</h2>
          <p className="text-xs text-neutral-400">
            Gerencie templates versionados por categoria, serviço, nicho e estágio com validação inteligente e pré-visualização.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
          Novo Script
        </Button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Pesquisar por título, conteúdo ou notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Channel selector */}
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos os Canais</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="linkedin">LinkedIn</option>
            <option value="email">E-mail</option>
            <option value="call">Ligação</option>
            <option value="instagram">Instagram</option>
          </select>

          {/* Category selector */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todas as Categorias</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* Favorites filter */}
          <Button
            variant={showFavoritesOnly ? 'primary' : 'secondary'}
            size="xs"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            leftIcon={<Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-current' : ''}`} />}
          >
            Favoritos
          </Button>

          {/* Archive toggle */}
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

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => {
            const channelBadge = getChannelBadgeDetails(template.channel);
            const livePreview = interpolateMessage(template.content, null, sampleService, sampleCompany);
            const validation = validateMessageContent(template.content);

            const matchedService = services.find((s) => s.id === template.serviceId);

            return (
              <Card
                key={template.id}
                padding="md"
                className={`bg-neutral-900 border-neutral-800 space-y-3.5 flex flex-col justify-between transition-all ${
                  template.isArchived ? 'opacity-60 grayscale' : ''
                }`}
              >
                <div className="space-y-3">
                  {/* Top badges & title */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${channelBadge.bgClass} ${channelBadge.textClass}`}>
                          {channelBadge.label}
                        </span>
                        <Badge variant="neutral" size="sm">
                          {CATEGORY_LABELS[template.category || template.type] || template.category}
                        </Badge>
                        <span className="font-mono text-[10px] text-neutral-400 bg-neutral-800 px-1.5 py-0.5 rounded">
                          {template.version || 'v1.0'}
                        </span>
                        {matchedService && (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            Serviço: {matchedService.name}
                          </span>
                        )}
                        {template.niche && (
                          <span className="text-[10px] text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">
                            Nicho: {template.niche}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-neutral-100 mt-2 flex items-center gap-2">
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
                        <Star className={`w-3.5 h-3.5 ${template.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-neutral-500'}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDuplicate(template)}
                        title="Duplicar template"
                      >
                        <Copy className="w-3.5 h-3.5 text-neutral-400" />
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

                  {/* Content Raw */}
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 font-sans leading-relaxed whitespace-pre-line select-text">
                    {template.content}
                  </div>

                  {/* Live Simulation Preview */}
                  <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-neutral-300 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Preview com Exemplo ({sampleCompany.name}):
                    </span>
                    <p className="italic text-neutral-400">{livePreview}</p>
                  </div>
                </div>

                {/* Footer notes & validation status */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-[11px] text-neutral-500">
                  <span>{template.notes || 'Pronto para uso'}</span>
                  {!validation.isValid && (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Revisar variáveis
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<MessageSquareText className="w-8 h-8 text-neutral-400" />}
          title="Nenhum script encontrado"
          description="Ajuste os filtros de busca ou crie um novo modelo de mensagem para a sua biblioteca."
          actionLabel="Criar Script"
          onAction={handleOpenAdd}
        />
      )}

      {/* Modal Add / Edit Template */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTemplate ? 'Editar Script de Mensagem' : 'Novo Script de Mensagem'}
        maxWidth="xl"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveTemplate}>
              Salvar Script
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveTemplate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Título do Script *"
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
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Canal</label>
              <select
                value={formChannel}
                onChange={(e) => setFormChannel(e.target.value as ContactChannel)}
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
              <label className="block text-xs font-medium text-neutral-300 mb-1">Categoria / Objetivo</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as TemplateCategory)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Vincular a Serviço (Opcional)</label>
              <select
                value={formServiceId}
                onChange={(e) => setFormServiceId(e.target.value)}
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Nicho Específico (Opcional)</label>
              <input
                type="text"
                value={formNiche}
                onChange={(e) => setFormNiche(e.target.value)}
                placeholder="Ex: Saúde & Estética"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Etapa do Pipeline (Opcional)</label>
              <select
                value={formPipelineStage}
                onChange={(e) => setFormPipelineStage(e.target.value as LeadStage | '')}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Qualquer Etapa</option>
                <option value="NOVO">Novo</option>
                <option value="QUALIFICADO">Qualificado</option>
                <option value="PRIMEIRO_CONTACTO">Primeiro Contato</option>
                <option value="RESPONDEU">Respondeu</option>
                <option value="REUNIÃO">Reunião</option>
                <option value="PROPOSTA">Proposta</option>
                <option value="NEGOCIAÇÃO">Negociação</option>
                <option value="CLIENTE">Cliente</option>
              </select>
            </div>
          </div>

          {/* Variables Quick Insert Toolbar */}
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

          {/* Content Editor & Live Preview */}
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
                <Eye className="w-3.5 h-3.5 text-emerald-400" /> Pré-visualização Real:
              </label>
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 font-sans leading-relaxed whitespace-pre-line h-[178px] overflow-y-auto">
                {interpolateMessage(formContent, null, sampleService, sampleCompany)}
              </div>
            </div>
          </div>

          <Input
            label="Notas Internas / Dica de Uso"
            placeholder="Ex: Usar apenas após o lead responder o e-mail inicial."
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};

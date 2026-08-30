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
  ShieldCheck,
  HelpCircle,
  Clock,
  Globe,
  Sliders,
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
import { FlowStepsExplorer } from '../components/scripts/FlowStepsExplorer';
import { ObjectionsExplorer } from '../components/scripts/ObjectionsExplorer';
import { ContextFollowUpsMatrix } from '../components/scripts/ContextFollowUpsMatrix';
import { ScriptSimulatorTester } from '../components/scripts/ScriptSimulatorTester';
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

type MessagesSubTab = 'templates' | 'flows' | 'objections' | 'context_followups' | 'simulator';

export const MessagesView: React.FC = () => {
  const { templates, services, companies, contacts, upsertTemplate, deleteTemplate } = useApp();
  const confirm = useConfirm();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<MessagesSubTab>('templates');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedActionType, setSelectedActionType] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  // Modal para agendar diretamente a partir do script
  const [scheduleTemplateId, setScheduleTemplateId] = useState<string | null>(null);
  const [scheduleInitialText, setScheduleInitialText] = useState<string | undefined>(undefined);

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

      {/* Header com Navegação em Abas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Central de Mensagens, Cadência e Scripts
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Acesse templates, o motor de fluxos de 23 etapas, matriz de objeções, follow-ups contextuais e simulador em tempo real.
          </p>
        </div>

        {activeTab === 'templates' && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Novo Script
          </Button>
        )}
      </div>

      {/* 5 Navegação por Abas Principais */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-neutral-200 dark:border-neutral-800 scrollbar-thin">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'templates'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Templates & Biblioteca ({templates.length})
        </button>

        <button
          onClick={() => setActiveTab('flows')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'flows'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Motor de Fluxos (23 e 16 Etapas)
        </button>

        <button
          onClick={() => setActiveTab('objections')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'objections'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Matriz de Objeções (25+)
        </button>

        <button
          onClick={() => setActiveTab('context_followups')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'context_followups'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Follow-ups por Contexto (14 Cenários)
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'simulator'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Simulador & Testador de Scripts
        </button>
      </div>

      {/* Conteúdo da Aba 2: Motor de Fluxos */}
      {activeTab === 'flows' && (
        <FlowStepsExplorer
          onScheduleStep={(step, text) => {
            setScheduleInitialText(text);
            setScheduleTemplateId(step.id);
          }}
        />
      )}

      {/* Conteúdo da Aba 3: Matriz de Objeções */}
      {activeTab === 'objections' && <ObjectionsExplorer />}

      {/* Conteúdo da Aba 4: Follow-ups por Contexto */}
      {activeTab === 'context_followups' && <ContextFollowUpsMatrix />}

      {/* Conteúdo da Aba 5: Simulador de Scripts */}
      {activeTab === 'simulator' && <ScriptSimulatorTester />}

      {/* Conteúdo da Aba 1: Biblioteca & Templates Salvos */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* Filtros e Barra de Pesquisa */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Pesquisar por título, conteúdo, tipo de ação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Seletor de Canal */}
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                aria-label="Filtrar por canal"
                className="px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:border-emerald-500"
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
                aria-label="Filtrar por tipo de ação"
                className="px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:border-emerald-500"
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
                variant={showFavoritesOnly ? 'primary' : 'outline'}
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
                    className={`bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 space-y-3.5 flex flex-col justify-between transition-all ${
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

                            {matchedService && (
                              <Badge variant="neutral" size="sm">
                                💼 {matchedService.name}
                              </Badge>
                            )}

                            {template.version && (
                              <span className="text-[10px] text-neutral-400 font-mono">
                                {template.version}
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            {template.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleFavorite(template)}
                            className="p-1 rounded text-neutral-400 hover:text-amber-400 transition-colors"
                            title={template.isFavorite ? 'Remover favorito' : 'Favoritar'}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                template.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Prévia do Script Formatado com Amostra */}
                      <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed max-h-44 overflow-y-auto">
                        {livePreview}
                      </div>

                      {/* Observações / Notas Rápidas */}
                      {template.notes && (
                        <p className="text-[11px] text-neutral-500 italic bg-neutral-100 dark:bg-neutral-800/40 p-2 rounded border border-neutral-200 dark:border-neutral-800/60">
                          💬 <strong>Nota de envio:</strong> {template.notes}
                        </p>
                      )}

                      {/* Validação de Variáveis e Caracteres */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-neutral-400 border-t border-neutral-100 dark:border-neutral-800/60">
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{template.content.length} caracteres</span>
                          {(validation.invalidVariables.length > 0 || validation.missingValueVariables.length > 0) && (
                            <span className="text-amber-500 flex items-center gap-1 font-semibold">
                              <AlertTriangle className="w-3 h-3" /> Variáveis pendentes
                            </span>
                          )}
                        </div>

                        {template.pipelineStage && (
                          <span className="text-neutral-500">
                            Funil: <strong>{template.pipelineStage}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Barra de Ações Rápidas */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => copyToClipboard(livePreview)}
                          title="Copiar mensagem preenchida"
                          leftIcon={<Copy className="w-3.5 h-3.5" />}
                        >
                          Copiar
                        </Button>

                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleDuplicate(template)}
                          title="Duplicar script"
                        >
                          Duplicar
                        </Button>

                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleOpenEdit(template)}
                          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                        >
                          Editar
                        </Button>

                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleToggleArchive(template)}
                          className="text-neutral-400 hover:text-neutral-200"
                        >
                          {template.isArchived ? 'Desarquivar' : 'Arquivar'}
                        </Button>

                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleDeleteTemplate(template)}
                          className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => {
                          setScheduleInitialText(undefined);
                          setScheduleTemplateId(template.id);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        leftIcon={<Calendar className="w-3.5 h-3.5" />}
                      >
                        Agendar
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
              description="Não encontramos modelos de mensagens que correspondam aos filtros selecionados."
              actionLabel="Criar Novo Script"
              onAction={handleOpenAdd}
            />
          )}
        </div>
      )}

      {/* Modal de Agendamento disparado a partir do script */}
      {scheduleTemplateId && (
        <ScheduleMessageModal
          isOpen={true}
          onClose={() => {
            setScheduleTemplateId(null);
            setScheduleInitialText(undefined);
          }}
          preselectedTemplateId={scheduleTemplateId}
          initialText={scheduleInitialText}
        />
      )}

      {/* Modal de Adicionar / Editar Script */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTemplate ? 'Editar Script de Mensagem' : 'Novo Script de Mensagem'}
        size="lg"
      >
        <form onSubmit={handleSaveTemplate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Título do Script *
              </label>
              <Input
                placeholder="Ex: Abordagem Direta para Clínicas"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Canal de Envio *
              </label>
              <select
                value={formChannel}
                onChange={(e) => setFormChannel(e.target.value as ContactChannel)}
                aria-label="Selecionar canal de envio do script"
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:outline-hidden focus:border-emerald-500"
              >
                {CHANNEL_OPTIONS.map((ch) => (
                  <option key={ch.value} value={ch.value}>
                    {ch.icon} {ch.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tipo de Ação & Relação com a Cadência */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-neutral-300">
                  Tipo de Ação (Vínculo Operacional) *
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomTypeMode(!isCustomTypeMode)}
                  className="text-[10px] text-emerald-400 hover:underline"
                >
                  {isCustomTypeMode ? 'Selecionar da lista' : '+ Criar novo tipo'}
                </button>
              </div>

              {isCustomTypeMode ? (
                <Input
                  placeholder="Ex: Reativação 30 Dias, Convite Webinar..."
                  value={customActionType}
                  onChange={(e) => setCustomActionType(e.target.value)}
                  required
                />
              ) : (
                <select
                  value={formActionType}
                  onChange={(e) => setFormActionType(e.target.value)}
                  aria-label="Selecionar tipo de ação do script"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:outline-hidden focus:border-emerald-500"
                >
                  {availableActionTypes.map((act) => (
                    <option key={act} value={act}>
                      🎯 {act}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Serviço Vinculado (Opcional)
              </label>
              <select
                value={formServiceId}
                onChange={(e) => setFormServiceId(e.target.value)}
                aria-label="Selecionar serviço vinculado ao script"
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:outline-hidden focus:border-emerald-500"
              >
                <option value="">Qualquer Serviço / Geral</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    💼 {s.name} ({s.currency} {s.basePrice})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Variáveis Dinâmicas para Inserção Rápida */}
          <div className="space-y-1.5 bg-neutral-950 p-3 rounded-lg border border-neutral-800">
            <label className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1">
              <Code className="w-3 h-3 text-emerald-400" /> Clique para inserir variáveis dinâmicas:
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {ALLOWED_VARIABLES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => insertVariableIntoForm(v)}
                  className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-mono transition-colors"
                >
                  {`{{${v}}}`}
                </button>
              ))}
            </div>
          </div>

          {/* Conteúdo do Script */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-neutral-300">
                Conteúdo do Script *
              </label>
              <span className="text-[10px] text-neutral-500 font-mono">
                {formContent.length} caracteres
              </span>
            </div>
            <textarea
              rows={6}
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="Digite o texto da mensagem usando as variáveis acima..."
              className="w-full p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 font-mono focus:outline-hidden focus:border-emerald-500 leading-relaxed"
              required
            />
          </div>

          {/* Notas Operacionais e Versão */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Orientação de Envio / Gatilho Recomendado
              </label>
              <Input
                placeholder="Ex: Enviar preferencialmente entre 10h e 11h30"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Versão
                </label>
                <Input
                  placeholder="v1.0"
                  value={formVersion}
                  onChange={(e) => setFormVersion(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  aria-label="Selecionar status do script"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="active">Ativo</option>
                  <option value="draft">Rascunho</option>
                  <option value="archived">Arquivado</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {editingTemplate ? 'Salvar Alterações' : 'Criar Script'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

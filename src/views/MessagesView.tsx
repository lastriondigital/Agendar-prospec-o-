import React, { useState } from 'react';
import {
  Code,
  Copy,
  Edit2,
  Eye,
  MessageSquareText,
  Plus,
  Trash2,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import { useToast } from '../context/ToastContext';
import { ContactChannel, MessageTemplate, TemplateType } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { getChannelBadgeDetails, interpolateMessage } from '../utils/formatting';

export const MessagesView: React.FC = () => {
  const { templates, clients, services, upsertTemplate, deleteTemplate } = useApp();
  const confirm = useConfirm();
  const { success } = useToast();

  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formChannel, setFormChannel] = useState<ContactChannel>('whatsapp');
  const [formType, setFormType] = useState<TemplateType>('first_contact');
  const [formContent, setFormContent] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Live Test State
  const sampleClient = clients[0] || { name: 'João da Silva', company: 'Silva Logística', role: 'Diretor' };
  const sampleService = services[0] || { name: 'Consultoria de Vendas', valueProposition: 'aumentar faturamento' };

  const filteredTemplates = templates.filter(
    (t) => selectedChannelFilter === 'all' || t.channel === selectedChannelFilter
  );

  const handleOpenAdd = () => {
    setEditingTemplate(null);
    setFormTitle('');
    setFormChannel('whatsapp');
    setFormType('first_contact');
    setFormContent('Olá {{primeiro_nome}}, tudo bem?\n\nVi que você atua na {{empresa}}. Gostaria de apresentar {{servico}} para ajudar a {{proposta_valor}}.\n\nFaz sentido conversarmos?');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setFormTitle(template.title);
    setFormChannel(template.channel);
    setFormType(template.type);
    setFormContent(template.content);
    setFormNotes(template.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formContent) return;

    const template: MessageTemplate = {
      id: editingTemplate ? editingTemplate.id : `tpl-${Date.now()}`,
      title: formTitle,
      channel: formChannel,
      type: formType,
      content: formContent,
      variables: ['nome', 'primeiro_nome', 'empresa', 'cargo', 'servico', 'proposta_valor'],
      notes: formNotes,
      createdAt: editingTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await upsertTemplate(template);
    setIsModalOpen(false);
  };

  const handleDeleteTemplate = (template: MessageTemplate) => {
    confirm({
      title: 'Excluir Script de Mensagem',
      message: `Tem certeza que deseja remover o modelo "${template.title}"?`,
      isDestructive: true,
      onConfirm: async () => {
        await deleteTemplate(template.id);
      },
    });
  };

  const insertVariable = (tag: string) => {
    setFormContent((prev) => prev + ` {{${tag}}}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100">Mensagens & Scripts Preparados</h2>
          <p className="text-xs text-neutral-400">
            Crie copys de alto impacto com variáveis dinâmicas que são substituídas automaticamente.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
          Novo Script
        </Button>
      </div>

      {/* Channel Filters */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {['all', 'whatsapp', 'linkedin', 'email', 'call'].map((channel) => (
          <button
            key={channel}
            onClick={() => setSelectedChannelFilter(channel)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              selectedChannelFilter === channel
                ? 'bg-neutral-800 text-emerald-400 border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {channel === 'all' ? 'Todos os Canais' : channel}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => {
            const channelBadge = getChannelBadgeDetails(template.channel);
            const livePreview = interpolateMessage(template.content, sampleClient, sampleService);

            return (
              <Card key={template.id} padding="md" className="bg-neutral-900 border-neutral-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${channelBadge.bgClass} ${channelBadge.textClass}`}>
                          {channelBadge.label}
                        </span>
                        <Badge variant="neutral" size="sm">
                          {template.type}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-bold text-neutral-100 mt-1.5">
                        {template.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleOpenEdit(template)}
                        title="Editar modelo"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-neutral-300" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDeleteTemplate(template)}
                        title="Excluir modelo"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      </Button>
                    </div>
                  </div>

                  {/* Raw / Preview Tabs */}
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 font-sans leading-relaxed whitespace-pre-line select-text">
                    {template.content}
                  </div>

                  {/* Live Simulation */}
                  <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-neutral-300 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Pré-visualização com lead de exemplo:
                    </span>
                    <p className="italic text-neutral-400">{livePreview}</p>
                  </div>
                </div>

                {template.notes && (
                  <p className="text-[11px] text-neutral-500 italic pt-2 border-t border-neutral-800/80">
                    Dica: {template.notes}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<MessageSquareText className="w-8 h-8 text-neutral-400" />}
          title="Nenhum script encontrado"
          description="Crie modelos de mensagens para agilizar o contato com um único clique durante a prospecção."
          actionLabel="Criar Primeiro Script"
          onAction={handleOpenAdd}
        />
      )}

      {/* Modal Add / Edit Script */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTemplate ? 'Editar Script de Mensagem' : 'Novo Script de Mensagem'}
        maxWidth="lg"
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
          <Input
            label="Título do Script *"
            placeholder="Ex: Abordagem Direta WhatsApp - B2B"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-medium text-neutral-300">Canal</label>
              <select
                value={formChannel}
                onChange={(e) => setFormChannel(e.target.value as ContactChannel)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="linkedin">LinkedIn</option>
                <option value="email">E-mail</option>
                <option value="call">Ligação Telefônica</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-medium text-neutral-300">Tipo de Abordagem</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as TemplateType)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="first_contact">Primeiro Contato</option>
                <option value="follow_up">Follow-up</option>
                <option value="break_up">Break-up (Encerramento)</option>
                <option value="value_nudge">Gatilho de Valor</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
          </div>

          {/* Variable Insertion Tags */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-medium text-neutral-300">Variáveis Dinâmicas (Clique para inserir):</label>
            <div className="flex flex-wrap gap-1.5">
              {['primeiro_nome', 'nome', 'empresa', 'cargo', 'servico', 'proposta_valor'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => insertVariable(tag)}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-neutral-700 cursor-pointer"
                >
                  +{`{{${tag}}}`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-medium text-neutral-300">Conteúdo do Script *</label>
            <textarea
              rows={5}
              placeholder="Digite o texto da mensagem..."
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-100 font-sans leading-relaxed placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <Input
            label="Dica ou Observação do Script (Opcional)"
            placeholder="Ex: Utilizar após 48h sem resposta."
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Edit2,
  ExternalLink,
  FastForward,
  Flame,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  RotateCcw,
  Save,
  Send,
  Share2,
  Sparkles,
  User,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { useExecutionQueue } from '../hooks/useExecutionQueue';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Kbd } from '../components/ui/Kbd';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { generateWhatsAppLink, getChannelBadgeDetails, formatPhoneNumber, formatRelativeDate } from '../utils/formatting';
import { ALL_LEAD_STAGES, STAGES_CONFIG } from '../utils/constants';
import { ContactChannel, HistoryEventType, LeadStage, CopilotActionType } from '../types';
import { CompanyDetailsDrawer } from '../components/clients/CompanyDetailsDrawer';
import { CopilotActionButtons } from '../components/copilot/CopilotActionButtons';
import { CopilotAssistantModal } from '../components/copilot/CopilotAssistantModal';
import { ApproachRecommendationCard } from '../components/sales/ApproachRecommendationCard';

export const ProspectingView: React.FC = () => {
  const {
    stages,
    companies,
    contacts,
    leads,
    services,
    history,
    completeAction,
    skipAction,
    rescheduleAction,
    logInteractionAndAdvance,
    scheduleNextAction,
    setActiveRoute,
  } = useApp();

  const { queueItems, metrics, formattedDuration, dailyGoal } = useExecutionQueue();
  const { success, info } = useToast();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [selectedStage, setSelectedStage] = useState<LeadStage>('PRIMEIRO_CONTACTO');
  
  // Próxima Ação automática
  const [scheduleNext, setScheduleNext] = useState(true);
  const [nextActionTitle, setNextActionTitle] = useState('Follow-up #1');
  const [nextActionDays, setNextActionDays] = useState(2);

  // Modal de Adiar
  const [isAdiarOpen, setIsAdiarOpen] = useState(false);
  const [customAdiarDate, setCustomAdiarDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });

  // Drawer de Detalhes da Empresa
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Copiloto Gemini de Prospecção
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotInitialAction, setCopilotInitialAction] = useState<CopilotActionType>('PERSONALIZAR');
  const [showSalesApproach, setShowSalesApproach] = useState(false);

  // Seleção do item atual na fila
  const currentItem = queueItems[0] || null;

  // Atualizar dados quando o item mudar
  useEffect(() => {
    if (currentItem) {
      setCustomMessage(currentItem.interpolatedMessage);
      setIsEditingMessage(false);
      setOutcomeNotes('');

      // Auto-definir estágio sugerido após o envio
      const currentLeadStage: LeadStage = currentItem.lead?.stage || 'NOVO';
      if (currentLeadStage === 'NOVO') {
        setSelectedStage('PRIMEIRO_CONTACTO');
        setNextActionTitle('Follow-up #1');
      } else if (currentLeadStage === 'PRIMEIRO_CONTACTO') {
        setSelectedStage('PRIMEIRO_CONTACTO');
        setNextActionTitle('Follow-up #2');
      } else if (currentLeadStage === 'RESPONDEU' || currentLeadStage === 'INTERESSADO') {
        setSelectedStage('REUNIÃO');
        setNextActionTitle('Apresentação Comercial');
      } else if (currentLeadStage === 'REUNIÃO') {
        setSelectedStage('PROPOSTA');
        setNextActionTitle('Envio de Proposta');
      } else if (currentLeadStage === 'PROPOSTA') {
        setSelectedStage('NEGOCIAÇÃO');
        setNextActionTitle('Follow-up de Fechamento');
      } else {
        setSelectedStage(currentLeadStage);
        setNextActionTitle('Acompanhamento');
      }
    }
  }, [currentItem?.action.id]);

  const activeMessage = isEditingMessage ? customMessage : currentItem?.interpolatedMessage || '';

  // 1. AÇÃO: Copiar Mensagem
  const handleCopyMessage = () => {
    if (!activeMessage) return;
    navigator.clipboard.writeText(activeMessage);
    setCopied(true);
    success('Mensagem copiada para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  // 2. AÇÃO: Abrir WhatsApp
  const handleOpenWhatsApp = () => {
    if (!currentItem) return;
    const phone = currentItem.contact?.whatsapp || currentItem.contact?.phone || currentItem.client.whatsapp;
    if (!phone) {
      info('Nenhum número de WhatsApp cadastrado para este contato.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const encoded = encodeURIComponent(activeMessage);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 3. AÇÃO: Marcar como Enviado & Avançar
  const handleComplete = async () => {
    if (!currentItem) return;

    try {
      // Calcular data da próxima ação
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + nextActionDays);
      const nextDateStr = nextDate.toISOString().slice(0, 10);

      // Usar o motor central de registro e avanço
      if (company) {
        await logInteractionAndAdvance({
          companyId: company.id,
          contactId: contact?.id,
          leadId: lead?.id,
          channel: currentItem.action.channel,
          messageSent: activeMessage,
          notes: outcomeNotes.trim(),
          newStage: selectedStage,
          nextActionTitle: scheduleNext ? nextActionTitle : undefined,
          nextActionDate: scheduleNext ? nextDateStr : undefined,
          nextActionChannel: currentItem.action.channel,
        });
      }

      // Concluir a ação na fila diária
      await completeAction(currentItem.action.id, outcomeNotes, undefined);
      success('Ação concluída! Avançando para o próximo prospect...');
    } catch (err) {
      console.error(err);
    }
  };

  // 4. AÇÃO: Pular
  const handleSkip = async () => {
    if (!currentItem) return;
    await skipAction(currentItem.action.id, 'Ação pulada na fila');
    info('Prospect movido para o final da fila.');
  };

  // 5. AÇÃO: Adiar
  const handleAdiar = async (days: number) => {
    if (!currentItem) return;
    const d = new Date();
    d.setDate(d.getDate() + days);
    await rescheduleAction(currentItem.action.id, d.toISOString().slice(0, 10));
    setIsAdiarOpen(false);
    success(`Ação adiada em ${days} ${days === 1 ? 'dia' : 'dias'}.`);
  };

  const handleCustomAdiar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem || !customAdiarDate) return;
    await rescheduleAction(currentItem.action.id, customAdiarDate);
    setIsAdiarOpen(false);
    success(`Ação reagendada para ${formatRelativeDate(customAdiarDate)}.`);
  };

  // Atalhos de teclado (C: copiar, W: whatsapp, Enter: enviar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleCopyMessage();
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleOpenWhatsApp();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentItem, activeMessage, selectedStage, outcomeNotes, scheduleNext, nextActionTitle, nextActionDays]);

  // Se a fila estiver vazia
  if (!currentItem || queueItems.length === 0) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-8">
        <EmptyState
          icon={<CheckCircle2 className="w-12 h-12 text-emerald-400" />}
          title="Fila de Prospecção Diária Concluída!"
          description="Você executou todas as ações planejadas para hoje. Parabéns pela consistência na rotina operacional!"
          actionLabel="Ver Painel Operacional"
          onAction={() => setActiveRoute('dashboard')}
          secondaryActionLabel="Ver Pipeline de Oportunidades"
          onSecondaryAction={() => setActiveRoute('pipeline')}
        />
      </div>
    );
  }

  const channelDetails = getChannelBadgeDetails(currentItem.action.channel);
  const company = currentItem.company || companies.find((c) => c.id === currentItem.action.clientId);
  const contact = currentItem.contact || contacts.find((c) => c.companyId === company?.id);
  const lead = currentItem.lead || leads.find((l) => l.companyId === company?.id);
  const targetService = currentItem.service || services.find((s) => s.id === lead?.serviceId);
  const stageDef = STAGES_CONFIG[lead?.stage || 'NOVO'] || STAGES_CONFIG['NOVO'];

  // Histórico recente do prospect
  const recentHistory = history
    .filter((h) => h.companyId === company?.id)
    .slice(0, 3);

  const rawPhone = contact?.whatsapp || contact?.phone || currentItem.client.whatsapp || currentItem.client.phone;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* 1. BARRA DE STATUS DA SESSÃO ATIVA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/90 border border-neutral-800 p-4 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-extrabold text-sm">
            <Zap className="w-5 h-5 fill-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-black text-neutral-100 flex items-center gap-2">
              <span>Modo Foco em Execução</span>
              <Badge variant="emerald" size="sm">
                Ao Vivo
              </Badge>
            </div>
            <p className="text-xs text-neutral-400">
              <strong className="text-neutral-200">{metrics.pendingToday}</strong> restantes • Tempo estimado: <strong className="text-neutral-200">{formattedDuration}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span className="hidden md:inline font-semibold text-neutral-500">Atalhos rápidos:</span>
          <span className="flex items-center gap-1 bg-neutral-950 px-2 py-1 rounded-md border border-neutral-800">
            <Kbd>W</Kbd> WhatsApp
          </span>
          <span className="flex items-center gap-1 bg-neutral-950 px-2 py-1 rounded-md border border-neutral-800">
            <Kbd>C</Kbd> Copiar
          </span>
          <span className="flex items-center gap-1 bg-neutral-950 px-2 py-1 rounded-md border border-neutral-800">
            <Kbd>↵ Enter</Kbd> Marcar Enviado
          </span>
        </div>
      </div>

      {/* 2. PALCO PRINCIPAL DE EXECUÇÃO EM 2 COLUNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUNA ESQUERDA: DOSSIER COMPLETO & SCRIPT (7 colunas) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Card: Dossiê do Cliente, Empresa & Serviço */}
          <Card padding="md" className="space-y-4 bg-neutral-900 border-neutral-800 shadow-md">
            {/* Topo do Dossiê */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={channelDetails.label === 'WhatsApp' ? 'emerald' : 'blue'} size="sm">
                    {channelDetails.label}
                  </Badge>
                  {currentItem.objective && (
                    <Badge variant="purple" size="sm">
                      Objetivo: {currentItem.objective}
                    </Badge>
                  )}
                  <Badge variant={stageDef.badgeVariant} size="sm">
                    Estágio: {stageDef.label}
                  </Badge>
                  {lead?.score && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      Score {lead.score}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-black text-neutral-100 pt-1 truncate">
                  {contact?.name || company?.name || currentItem.client.name}
                </h2>

                <p className="text-sm text-neutral-300 font-medium flex items-center gap-1.5 truncate">
                  {contact?.role && <span className="text-neutral-400">{contact.role} na</span>}
                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="font-bold text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Building2 className="w-3.5 h-3.5 inline text-emerald-400" />
                    {company?.name || currentItem.client.company}
                  </button>
                  {company?.niche && <span className="text-neutral-500">• {company.niche}</span>}
                </p>
              </div>

              {/* Botão de Ver Dossiê Completo da Empresa */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDrawerOpen(true)}
                className="shrink-0 text-neutral-400 hover:text-neutral-200"
                leftIcon={<ExternalLink className="w-4 h-4" />}
              >
                Ficha
              </Button>
            </div>

            {/* Informações Cadastrais e Redes Sociais */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-neutral-800/80 text-xs">
              <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/60">
                <span className="text-[10px] text-neutral-500 font-semibold block">Contato Principal</span>
                <p className="font-semibold text-neutral-200 truncate mt-0.5">
                  {contact?.name || 'Não atribuído'}
                </p>
                <p className="text-[11px] font-mono text-neutral-400 truncate">
                  {rawPhone ? formatPhoneNumber(rawPhone) : 'Sem telefone'}
                </p>
              </div>

              <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/60">
                <span className="text-[10px] text-neutral-500 font-semibold block">Localização / Unidades</span>
                <p className="font-semibold text-neutral-200 truncate mt-0.5">
                  {company?.city ? `${company.city}, ${company.country || 'BR'}` : 'Não informada'}
                </p>
                <p className="text-[11px] text-neutral-400 truncate">
                  {company?.unitsCount ? `${company.unitsCount} unidade(s)` : '1 unidade'}
                </p>
              </div>

              <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/60 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-neutral-500 font-semibold block">Serviço de Interesse</span>
                <p className="font-semibold text-emerald-300 truncate mt-0.5">
                  {targetService?.name || lead?.serviceName || 'Geral'}
                </p>
                <p className="text-[11px] text-neutral-400 truncate">
                  {targetService?.ticketValue ? `R$ ${targetService.ticketValue.toLocaleString('pt-BR')}` : 'Proposta personalizada'}
                </p>
              </div>
            </div>

            {/* Links Rápidos de Presença Digital */}
            {company && (company.website || company.instagram || company.linkedin || company.googleBusiness) && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {company.website && (
                  <a
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-neutral-300 transition-colors"
                  >
                    <Globe className="w-3 h-3 text-sky-400" />
                    Website
                  </a>
                )}
                {company.instagram && (
                  <a
                    href={`https://instagram.com/${company.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-pink-300 transition-colors"
                  >
                    <Instagram className="w-3 h-3 text-pink-400" />
                    {company.instagram}
                  </a>
                )}
                {company.linkedin && (
                  <a
                    href={company.linkedin.startsWith('http') ? company.linkedin : `https://${company.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-blue-300 transition-colors"
                  >
                    <Linkedin className="w-3 h-3 text-blue-400" />
                    LinkedIn
                  </a>
                )}
                {company.googleBusiness && (
                  <a
                    href={company.googleBusiness.startsWith('http') ? company.googleBusiness : `https://${company.googleBusiness}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-emerald-300 transition-colors"
                  >
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    Google Maps
                  </a>
                )}
              </div>
            )}

            {/* Contexto: Anotações & Histórico Recente */}
            {(lead?.notes || recentHistory.length > 0) && (
              <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80 space-y-2 text-xs">
                {lead?.notes && (
                  <div>
                    <span className="font-bold text-neutral-400 block mb-0.5">Anotações do Lead:</span>
                    <p className="text-neutral-300 leading-relaxed">{lead.notes}</p>
                  </div>
                )}

                {recentHistory.length > 0 && (
                  <div className="pt-2 border-t border-neutral-800/60">
                    <span className="font-bold text-neutral-400 block mb-1 text-[11px]">Últimas Interações:</span>
                    <div className="space-y-1">
                      {recentHistory.map((h) => (
                        <div key={h.id} className="text-[11px] text-neutral-400 flex items-center justify-between">
                          <span className="truncate">• {h.title}</span>
                          <span className="text-neutral-500 font-mono shrink-0 ml-2">{formatRelativeDate(h.timestamp)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Card: Script / Mensagem Preparada com Edição Inline */}
          <Card padding="md" className="bg-neutral-900 border-neutral-800 space-y-3">
            {/* Faixa de Ações do Copiloto Gemini & Sales Engine */}
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between flex-wrap gap-2">
              <CopilotActionButtons
                size="xs"
                onSelectAction={(act) => {
                  setCopilotInitialAction(act);
                  setIsCopilotOpen(true);
                }}
              />
              <Button
                variant="outline"
                size="xs"
                onClick={() => setShowSalesApproach(!showSalesApproach)}
                className="text-xs text-indigo-400 border-indigo-500/40 hover:bg-indigo-950/40"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                {showSalesApproach ? 'Ocultar Sales Engine' : 'Recomendação Sales Engine'}
              </Button>
            </div>

            {/* Sales Engine: Recomendação dos 7 Pilares */}
            {showSalesApproach && company && (
              <div className="animate-fadeIn">
                <ApproachRecommendationCard
                  company={company}
                  contact={contact}
                  lead={lead}
                  onApplyMessage={(msg) => {
                    setCustomMessage(msg);
                    setIsEditingMessage(true);
                    success('Mensagem do Sales Engine aplicada!');
                  }}
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-200 uppercase tracking-wider">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Mensagem Preparada</span>
                {currentItem.template && (
                  <span className="text-neutral-500 font-normal">({currentItem.template.title})</span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setIsEditingMessage(!isEditingMessage)}
                  leftIcon={isEditingMessage ? <Save className="w-3.5 h-3.5 text-emerald-400" /> : <Edit2 className="w-3.5 h-3.5 text-neutral-400" />}
                >
                  {isEditingMessage ? 'Concluir Edição' : 'Editar Mensagem'}
                </Button>

                <Button
                  variant={copied ? 'success' : 'secondary'}
                  size="xs"
                  onClick={handleCopyMessage}
                  leftIcon={<Copy className="w-3.5 h-3.5" />}
                >
                  {copied ? 'Copiado!' : 'Copiar (C)'}
                </Button>
              </div>
            </div>

            {/* Caixa de Texto da Mensagem */}
            {isEditingMessage ? (
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={6}
                className="w-full p-4 rounded-xl bg-neutral-950 border border-emerald-500/50 text-sm text-neutral-100 font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Edite o texto da mensagem..."
              />
            ) : (
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/90 text-sm text-neutral-100 font-sans leading-relaxed whitespace-pre-line select-text">
                {activeMessage || <span className="text-neutral-600 italic">Nenhuma mensagem preparada.</span>}
              </div>
            )}

            {/* Dica do Template se houver */}
            {currentItem.template?.notes && (
              <p className="text-xs text-neutral-500 italic">
                💡 {currentItem.template.notes}
              </p>
            )}
          </Card>
        </div>

        {/* COLUNA DIREITA: PAINEL DE DISPARO & CONTROLE DE EXECUÇÃO (5 colunas) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card Central de Disparo & Conclusão */}
          <Card padding="md" className="bg-neutral-900 border-emerald-500/40 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-neutral-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Painel de Execução
              </h3>
              <span className="text-[11px] font-mono font-bold text-neutral-400">
                Ação #{1} de {queueItems.length}
              </span>
            </div>

            {/* Botão de Disparo Direto no WhatsApp */}
            {rawPhone && (
              <button
                onClick={handleOpenWhatsApp}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-900/30 transition-all cursor-pointer active:scale-[0.99]"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>Abrir WhatsApp com Mensagem (W)</span>
              </button>
            )}

            {/* Atualização de Estágio do Lead */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Avançar Estágio do Lead para:
              </label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value as LeadStage)}
                className="w-full bg-neutral-950 text-neutral-200 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {ALL_LEAD_STAGES.map((stg) => (
                  <option key={stg} value={stg}>
                    {STAGES_CONFIG[stg].order}. {STAGES_CONFIG[stg].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Anotação Opcional do Resultado */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-400">
                Observação do contato (opcional):
              </label>
              <input
                type="text"
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
                placeholder="Ex: Mensagem enviada, visualizou status..."
                className="w-full bg-neutral-950 text-neutral-200 border border-neutral-800 rounded-xl px-3 py-2 text-xs placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Configuração da Próxima Ação Obrigatória */}
            <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scheduleNext}
                    onChange={(e) => setScheduleNext(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-neutral-950 border-neutral-700"
                  />
                  <span className="text-xs font-bold text-neutral-200">
                    Agendar Próxima Ação (Sem lead órfão)
                  </span>
                </label>
              </div>

              {scheduleNext && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <input
                    type="text"
                    value={nextActionTitle}
                    onChange={(e) => setNextActionTitle(e.target.value)}
                    placeholder="Título da ação"
                    className="px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <select
                    value={nextActionDays}
                    onChange={(e) => setNextActionDays(Number(e.target.value))}
                    className="px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value={1}>Em 1 dia (Amanhã)</option>
                    <option value={2}>Em 2 dias</option>
                    <option value={3}>Em 3 dias</option>
                    <option value={5}>Em 5 dias</option>
                    <option value={7}>Em 7 dias (1 semana)</option>
                    <option value={14}>Em 14 dias (2 semanas)</option>
                    <option value={30}>Em 30 dias (1 mês)</option>
                  </select>
                </div>
              )}
            </div>

            {/* BOTÃO PRINCIPAL: MARCAR COMO ENVIADO */}
            <Button
              variant="execution"
              size="lg"
              className="w-full py-4 text-base font-black shadow-lg shadow-emerald-500/20"
              onClick={handleComplete}
              leftIcon={<CheckCircle2 className="w-5 h-5 fill-white text-emerald-600" />}
              rightIcon={<Kbd className="bg-emerald-700 text-emerald-100 border-emerald-600">↵ Enter</Kbd>}
            >
              Marcar como Enviado
            </Button>

            {/* Ações Secundárias: PULAR & ADIAR */}
            <div className="pt-2 border-t border-neutral-800/80 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSkip}
                leftIcon={<FastForward className="w-3.5 h-3.5 text-neutral-400" />}
              >
                Pular
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAdiarOpen(true)}
                leftIcon={<Clock className="w-3.5 h-3.5 text-neutral-400" />}
              >
                Adiar Ação
              </Button>
            </div>
          </Card>

          {/* Mini Fila de Execução em Tempo Real */}
          <Card padding="sm" className="bg-neutral-900/60 border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-400">
              <span>Sequência da Fila</span>
              <span className="font-mono">{queueItems.length} restantes</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {queueItems.map((item, idx) => (
                <div
                  key={item.action.id}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                    idx === 0
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold'
                      : 'bg-neutral-950/60 text-neutral-400'
                  }`}
                >
                  <div className="truncate">
                    <span className="font-mono text-neutral-500 mr-2">#{idx + 1}</span>
                    <span>{item.client.name}</span>
                    <span className="text-neutral-500 ml-1">({item.client.company})</span>
                  </div>
                  {idx === 0 && <Badge variant="emerald" size="sm">Foco Atual</Badge>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal para Adiar Ação */}
      <Modal
        isOpen={isAdiarOpen}
        onClose={() => setIsAdiarOpen(false)}
        title="Adiar Próxima Ação"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-400">
            Selecione por quanto tempo deseja adiar esta ação de prospecção para {company?.name}:
          </p>

          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => handleAdiar(1)}>
              +1 dia
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAdiar(2)}>
              +2 dias
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAdiar(7)}>
              +7 dias
            </Button>
          </div>

          <form onSubmit={handleCustomAdiar} className="space-y-3 pt-2 border-t border-neutral-800">
            <Input
              label="Ou selecione uma data específica"
              type="date"
              value={customAdiarDate}
              onChange={(e) => setCustomAdiarDate(e.target.value)}
              required
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdiarOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Confirmar
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Drawer de Detalhes da Empresa */}
      {company && isDrawerOpen && (
        <CompanyDetailsDrawer
          company={company}
          onClose={() => setIsDrawerOpen(false)}
          onEditCompany={() => {
            setIsDrawerOpen(false);
            setActiveRoute('clients');
          }}
        />
      )}

      {/* Modal do Copiloto de Prospecção Gemini */}
      <CopilotAssistantModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        company={company}
        contact={contact}
        lead={lead}
        service={targetService}
        campaign={currentItem?.campaign}
        initialMessage={activeMessage}
        initialActionType={copilotInitialAction}
        onApplyMessage={(newMsg) => {
          setCustomMessage(newMsg);
          setIsEditingMessage(true);
        }}
      />
    </div>
  );
};

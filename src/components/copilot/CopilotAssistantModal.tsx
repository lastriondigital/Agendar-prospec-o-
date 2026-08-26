import React, { useEffect, useMemo, useState } from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  RefreshCw,
  Send,
  HelpCircle,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Building2,
  User,
  ArrowRight,
  Info,
  Check,
  Edit3,
} from 'lucide-react';
import {
  Company,
  Contact,
  Lead,
  Service,
  Campaign,
  HistoryEvent,
  CopilotActionType,
  CopilotResult,
  CopilotTone,
} from '../../types';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { buildCopilotLeadContext, checkCopilotStatus, executeCopilotAction } from '../../services/copilotService';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { getChannelBadgeDetails } from '../../utils/formatting';

interface CopilotAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  company?: Company;
  contact?: Contact;
  lead?: Lead;
  service?: Service;
  campaign?: Campaign;
  initialMessage?: string;
  initialActionType?: CopilotActionType;
  onApplyMessage?: (message: string) => void;
}

export const CopilotAssistantModal: React.FC<CopilotAssistantModalProps> = ({
  isOpen,
  onClose,
  company,
  contact,
  lead,
  service,
  campaign,
  initialMessage = '',
  initialActionType = 'PERSONALIZAR',
  onApplyMessage,
}) => {
  const { services, history, addHistoryEvent, updateLead } = useApp();
  const { success, info, error: toastError } = useToast();

  const [activeAction, setActiveAction] = useState<CopilotActionType>(initialActionType);
  const [tone, setTone] = useState<CopilotTone>('consultivo');
  const [inputMessage, setInputMessage] = useState(initialMessage);
  const [customInstructions, setCustomInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Copilot output state
  const [copilotResult, setCopilotResult] = useState<CopilotResult | null>(null);
  const [editableResultText, setEditableResultText] = useState('');
  const [selectedAlternativeIndex, setSelectedAlternativeIndex] = useState<number | null>(null);

  // AI Connection Status
  const [aiStatus, setAiStatus] = useState<{ online: boolean; aiAvailable: boolean; model: string }>({
    online: true,
    aiAvailable: true,
    model: 'gemini-3.7-flash',
  });

  useEffect(() => {
    if (isOpen) {
      checkCopilotStatus().then(setAiStatus).catch(() => {});
      setInputMessage(initialMessage);
      setActiveAction(initialActionType);
    }
  }, [isOpen, initialMessage, initialActionType]);

  const recentEvents: HistoryEvent[] = useMemo(() => {
    if (!company) return [];
    return history.filter((h) => h.companyId === company.id).slice(0, 5);
  }, [history, company?.id]);

  const handleRunCopilot = async (actionToRun = activeAction) => {
    setIsLoading(true);
    setCopied(false);
    setSelectedAlternativeIndex(null);

    try {
      const leadContext = buildCopilotLeadContext({
        company,
        contact,
        lead,
        service,
        campaign,
        recentEvents,
      });

      const result = await executeCopilotAction({
        actionType: actionToRun,
        leadContext,
        inputMessage: inputMessage.trim(),
        tone: tone,
        options: {
          instructions: customInstructions.trim(),
          prospectResponse: activeAction === 'ANALISAR_RESPOSTA' ? inputMessage : undefined,
          availableServices: services.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            benefits: s.benefits,
            problemsSolved: s.problemsSolved,
          })),
        },
      });

      setCopilotResult(result);
      setEditableResultText(result.resultText);

      if (result.isOfflineFallback) {
        info('Modo Offline Ativo', 'Resultado gerado por heurísticas locais.');
      } else {
        success('Análise gerada pelo Copiloto Gemini!');
      }
    } catch (err: any) {
      console.error(err);
      toastError('Erro ao executar Copiloto', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!editableResultText) return;
    navigator.clipboard.writeText(editableResultText);
    setCopied(true);
    success('Texto copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (!editableResultText) return;
    if (onApplyMessage) {
      onApplyMessage(editableResultText);
      success('Mensagem aplicada na fila de prospecção!');
    }
    onClose();
  };

  const handleSaveToLeadNotes = async () => {
    if (!lead || !company) {
      info('Nenhum lead associado para salvar anotação.');
      return;
    }

    const noteText = `[Copiloto ${activeAction}] ${editableResultText}`;
    const updatedNotes = lead.notes ? `${lead.notes}\n\n${noteText}` : noteText;

    await updateLead({
      ...lead,
      notes: updatedNotes,
      updatedAt: new Date().toISOString(),
    });

    await addHistoryEvent({
      companyId: company.id,
      leadId: lead.id,
      type: 'note_added',
      title: `Copiloto: ${activeAction}`,
      description: editableResultText.slice(0, 140) + '...',
    });

    success('Salvo nas anotações do Lead com sucesso!');
  };

  const handleSelectAlternative = (altText: string, index: number) => {
    setSelectedAlternativeIndex(index);
    setEditableResultText(altText);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Copiloto de Prospecção"
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span
              className={`w-2 h-2 rounded-full ${
                aiStatus.aiAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>
              {aiStatus.aiAvailable
                ? `Gemini ${aiStatus.model}`
                : 'Offline Seguro (Heurísticas Ativas)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Fechar
            </Button>
            {editableResultText && onApplyMessage && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleApply}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Aplicar Mensagem
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Context Strip do Prospect */}
        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-bold text-neutral-100 truncate">
                {company?.name || 'Prospect Não Selecionado'}
              </span>
              {company?.niche && (
                <span className="text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                  {company.niche}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-neutral-400 text-[11px] pt-1">
              <span>Contato: <strong className="text-neutral-300">{contact?.name || 'Geral'}</strong> ({contact?.role || 'Cargo não informado'})</span>
              {lead?.stage && <span>Estágio: <strong className="text-emerald-400">{lead.stage}</strong></span>}
              {service?.name && <span>Serviço: <strong className="text-neutral-300">{service.name}</strong></span>}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant={aiStatus.aiAvailable ? 'emerald' : 'neutral'} size="sm">
              <Sparkles className="w-3 h-3 mr-1" />
              {aiStatus.aiAvailable ? 'IA Pronta' : 'Motor Offline'}
            </Badge>
          </div>
        </div>

        {/* 7 AÇÕES DO COPILOTO */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
            Ações do Copiloto
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
            {[
              { id: 'PERSONALIZAR', label: 'Personalizar', icon: Sparkles },
              { id: 'GERAR_FOLLOWUP', label: 'Follow-up', icon: RefreshCw },
              { id: 'ANALISAR_RESPOSTA', label: 'Analisar Resposta', icon: MessageSquare },
              { id: 'SUGERIR_SERVICO', label: 'Sugerir Serviço', icon: TrendingUp },
              { id: 'MELHORAR', label: 'Melhorar', icon: Edit3 },
              { id: 'RESUMIR', label: 'Resumir', icon: FileText },
              { id: 'PROXIMA_ACAO', label: 'Próxima Ação', icon: Zap },
            ].map((act) => {
              const Icon = act.icon;
              const isSelected = activeAction === act.id;
              return (
                <button
                  key={act.id}
                  onClick={() => {
                    setActiveAction(act.id as CopilotActionType);
                    setCopilotResult(null);
                    setEditableResultText('');
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-sm'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-neutral-500'}`} />
                  <span className="text-[11px] text-center leading-tight">{act.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Controles e Entradas Contextuais */}
        <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-3">
          {/* Seletor de Tom (para Personalizar, Follow-up, Melhorar) */}
          {['PERSONALIZAR', 'GERAR_FOLLOWUP', 'MELHORAR'].includes(activeAction) && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-neutral-400">Tom de Comunicação:</span>
              <div className="flex items-center gap-1">
                {(['consultivo', 'direto', 'persuasivo', 'conciso', 'amigavel', 'urgente'] as CopilotTone[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-colors cursor-pointer ${
                      tone === t
                        ? 'bg-neutral-800 text-emerald-400 border border-neutral-700 font-bold'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Campo de Entrada de Mensagem / Resposta / Rascunho */}
          {['ANALISAR_RESPOSTA', 'MELHORAR', 'GERAR_FOLLOWUP'].includes(activeAction) && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-300">
                {activeAction === 'ANALISAR_RESPOSTA'
                  ? 'Cole a resposta recebida do prospect:'
                  : activeAction === 'MELHORAR'
                  ? 'Mensagem a ser refinada e otimizada:'
                  : 'Contexto ou mensagem do contato anterior (opcional):'}
              </label>
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                rows={3}
                placeholder={
                  activeAction === 'ANALISAR_RESPOSTA'
                    ? 'Ex: "Achei interessante mas estamos sem orçamento no momento..."'
                    : 'Cole ou digite o texto aqui...'
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans leading-relaxed"
              />
            </div>
          )}

          {/* Instruções Adicionais Opcionais */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Instrução adicional opcional (ex: 'Focar em cases de estética', 'Propor ligação rápida')..."
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Button
              variant="execution"
              size="sm"
              isLoading={isLoading}
              onClick={() => handleRunCopilot(activeAction)}
              leftIcon={<Sparkles className="w-4 h-4 fill-white" />}
            >
              Executar [{activeAction.replace('_', ' ')}]
            </Button>
          </div>
        </div>

        {/* RESULTADO GERADO PELO COPILOTO */}
        {copilotResult && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Bloco Editável do Resultado */}
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-750 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                    Resultado Gerado (Permitido Editar)
                  </span>
                  {copilotResult.intentClassification && (
                    <Badge variant="blue" size="sm">
                      Intenção: {copilotResult.intentClassification}
                    </Badge>
                  )}
                  {copilotResult.sentiment && (
                    <Badge
                      variant={
                        copilotResult.sentiment === 'Positivo'
                          ? 'emerald'
                          : copilotResult.sentiment === 'Negativo'
                          ? 'rose'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {copilotResult.sentiment}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={handleCopy}
                    leftIcon={<Copy className="w-3.5 h-3.5" />}
                  >
                    {copied ? 'Copiado!' : 'Copiar'}
                  </Button>
                  {lead && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={handleSaveToLeadNotes}
                      leftIcon={<FileText className="w-3.5 h-3.5" />}
                    >
                      Salvar no Lead
                    </Button>
                  )}
                </div>
              </div>

              {/* Textarea editável antes de salvar */}
              <textarea
                value={editableResultText}
                onChange={(e) => setEditableResultText(e.target.value)}
                rows={5}
                className="w-full bg-neutral-950 border border-emerald-500/40 rounded-xl p-3.5 text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans leading-relaxed select-text"
              />

              {/* Alternativas Geradas */}
              {copilotResult.alternatives && copilotResult.alternatives.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                  <span className="text-[11px] font-semibold text-neutral-400">
                    Alternativas prontas (clique para aplicar no editor):
                  </span>
                  <div className="space-y-1.5">
                    {copilotResult.alternatives.map((alt, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectAlternative(alt, idx)}
                        className={`p-2.5 rounded-lg border text-xs text-neutral-300 hover:text-white cursor-pointer transition-colors ${
                          selectedAlternativeIndex === idx
                            ? 'bg-neutral-800 border-emerald-500/50'
                            : 'bg-neutral-950 border-neutral-850 hover:bg-neutral-850'
                        }`}
                      >
                        <p className="line-clamp-2 leading-relaxed">{alt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AS 3 SEÇÕES DE AUDITORIA & TRANSPARÊNCIA EXIGIDAS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* 1. FATOS UTILIZADOS */}
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="uppercase tracking-wider text-[11px]">Fatos Utilizados</span>
                </div>
                {copilotResult.factsUsed && copilotResult.factsUsed.length > 0 ? (
                  <ul className="space-y-1 text-neutral-300 text-[11px]">
                    {copilotResult.factsUsed.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 shrink-0">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-500 text-[11px] italic">Apenas dados de contexto geral.</p>
                )}
              </div>

              {/* 2. INFERÊNCIAS */}
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Info className="w-4 h-4 shrink-0" />
                  <span className="uppercase tracking-wider text-[11px]">Inferências Feitas</span>
                </div>
                {copilotResult.inferences && copilotResult.inferences.length > 0 ? (
                  <ul className="space-y-1 text-neutral-300 text-[11px]">
                    {copilotResult.inferences.map((inf, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-400 shrink-0">•</span>
                        <span>{inf}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-500 text-[11px] italic">Nenhuma inferência não fundamentada.</p>
                )}
              </div>

              {/* 3. DADOS AUSENTES */}
              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="uppercase tracking-wider text-[11px]">Dados Ausentes</span>
                </div>
                {copilotResult.missingData && copilotResult.missingData.length > 0 ? (
                  <ul className="space-y-1 text-neutral-300 text-[11px]">
                    {copilotResult.missingData.map((m, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-400 shrink-0">•</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-emerald-400 text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Dossiê completo.
                  </p>
                )}
              </div>
            </div>

            {/* Sugestão de Próxima Ação ou Serviço */}
            {(copilotResult.nextActionSuggestion || copilotResult.recommendedService) && (
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {copilotResult.recommendedService && (
                  <div>
                    <span className="text-neutral-500 text-[11px] block">Serviço Recomendado:</span>
                    <strong className="text-emerald-300">{copilotResult.recommendedService}</strong>
                  </div>
                )}
                {copilotResult.nextActionSuggestion && (
                  <div>
                    <span className="text-neutral-500 text-[11px] block">Próximo Passo Sugerido:</span>
                    <span className="text-neutral-200">{copilotResult.nextActionSuggestion}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

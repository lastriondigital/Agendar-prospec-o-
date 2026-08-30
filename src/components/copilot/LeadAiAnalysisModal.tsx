import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Flame,
  Target,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Copy,
  Check,
  Send,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  Zap,
} from 'lucide-react';
import { Company, Contact, HistoryEvent, IdealCustomerProfile, Lead, Service } from '../../types';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { buildCopilotLeadContext, executeCopilotAction } from '../../services/copilotService';
import { generateWhatsAppLink } from '../../utils/formatting';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface LeadAiAnalysisModalProps {
  company: Company;
  contact?: Contact;
  lead?: Lead;
  onClose: () => void;
  onScheduleAction?: () => void;
}

export const LeadAiAnalysisModal: React.FC<LeadAiAnalysisModalProps> = ({
  company,
  contact,
  lead,
  onClose,
  onScheduleAction,
}) => {
  const { services, icps, history, updateLead, addHistoryEvent, scheduleNextAction } = useApp();
  const { success, error } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'script' | 'facts'>('diagnosis');
  const [copied, setCopied] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    icpFit?: string;
    opportunityScore?: number;
    qualificationScore?: number;
    potential?: string;
    identifiedProblems?: string[];
    pitchAngle?: string;
    recommendedService?: string;
    nextActionSuggestion?: string;
    recommendedChannel?: string;
    suggestedScript?: string;
    factsUsed?: string[];
    inferences?: string[];
    missingData?: string[];
    isOfflineFallback?: boolean;
  } | null>(null);

  const matchedContact = contact || undefined;

  useEffect(() => {
    let isMounted = true;

    async function runAnalysis() {
      setIsLoading(true);
      try {
        const leadContext = buildCopilotLeadContext({
          company,
          contact: matchedContact,
          lead,
          service: services.find((s) => s.id === lead?.serviceId) || services[0],
          recentEvents: history.filter((h) => h.companyId === company.id),
        });

        const res = await executeCopilotAction({
          actionType: 'ANALISAR_LEAD_COMPLETO',
          leadContext,
          options: {
            availableServices: services.map((s) => ({
              id: s.id,
              name: s.name,
              description: s.description,
              benefits: s.benefits,
              problemsSolved: s.problemsSolved,
            })),
          },
        });

        if (isMounted) {
          setAnalysisResult(res);
        }
      } catch (err: any) {
        console.error('Erro ao analisar lead com IA:', err);
        error('Falha ao processar análise inteligente. Modo offline acionado.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    runAnalysis();

    return () => {
      isMounted = false;
    };
  }, [company.id]);

  const handleCopyScript = () => {
    if (!analysisResult?.suggestedScript) return;
    navigator.clipboard.writeText(analysisResult.suggestedScript);
    setCopied(true);
    success('Script copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const phone = matchedContact?.whatsapp || matchedContact?.phone;
    if (!phone) {
      error('Este contato não possui número de WhatsApp ou telefone cadastrado.');
      return;
    }
    const text = analysisResult?.suggestedScript || '';
    const link = generateWhatsAppLink(phone, text);
    window.open(link, '_blank');
    addHistoryEvent({
      companyId: company.id,
      leadId: lead?.id,
      contactId: matchedContact?.id,
      type: 'whatsapp_opened',
      title: 'WhatsApp Aberto via Assistente IA',
      description: `Mensagem personalizada do Copiloto enviada para ${matchedContact?.name || company.name}.`,
    });
    success('WhatsApp aberto!');
  };

  const handleSaveDiagnosis = async () => {
    if (!analysisResult) return;

    if (lead) {
      const updatedLead: Lead = {
        ...lead,
        score: Math.round(((analysisResult.opportunityScore || 50) + (analysisResult.qualificationScore || 50)) / 2),
        opportunityScore: analysisResult.opportunityScore || lead.opportunityScore,
        qualificationScore: analysisResult.qualificationScore || lead.qualificationScore,
        icpFit: (analysisResult.icpFit?.charAt(0) as 'A' | 'B' | 'C' | 'D') || lead.icpFit,
        demandType: (analysisResult.opportunityScore || 0) >= 75 ? 'demanda_identificada' : 'oportunidade_latente',
        aiDiagnosis: {
          analyzedAt: new Date().toISOString(),
          icpFit: analysisResult.icpFit,
          opportunityScore: analysisResult.opportunityScore,
          qualificationScore: analysisResult.qualificationScore,
          potential: analysisResult.potential,
          identifiedProblems: analysisResult.identifiedProblems,
          pitchAngle: analysisResult.pitchAngle,
          recommendedService: analysisResult.recommendedService,
          recommendedNextAction: analysisResult.nextActionSuggestion,
          recommendedChannel: analysisResult.recommendedChannel,
          suggestedScript: analysisResult.suggestedScript,
          factsUsed: analysisResult.factsUsed,
          inferences: analysisResult.inferences,
          missingData: analysisResult.missingData,
        },
        notes: [
          lead.notes,
          analysisResult.pitchAngle ? `[IA Ângulo]: ${analysisResult.pitchAngle}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
      };

      await updateLead(updatedLead);
      await addHistoryEvent({
        companyId: company.id,
        leadId: lead.id,
        type: 'action_completed',
        title: 'Diagnóstico Inteligente com IA Salvo',
        description: `ICP Fit ${analysisResult.icpFit} • Opp Score: ${analysisResult.opportunityScore} • Qual Score: ${analysisResult.qualificationScore}`,
      });

      success('Diagnóstico salvo no lead com sucesso!');
    }
  };

  const handleSaveAndSchedule = async () => {
    await handleSaveDiagnosis();
    if (onScheduleAction) {
      onScheduleAction();
    } else {
      // Agenda para hoje ou amanhã
      const today = new Date().toISOString().slice(0, 10);
      await scheduleNextAction(
        company.id,
        analysisResult?.nextActionSuggestion || 'Primeiro contato personalizado',
        today,
        (analysisResult?.recommendedChannel as any) || 'whatsapp'
      );
      success('Próxima ação agendada no Planejador!');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#181B20] rounded-2xl border border-[#E6E8EB] dark:border-[#2D3139] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E6E8EB] dark:border-[#2D3139] sticky top-0 bg-white dark:bg-[#181B20] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/50 text-[#3F6FB5] dark:text-blue-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3F6FB5] dark:text-blue-400">
                  Assistente Inteligente
                </span>
                {analysisResult?.isOfflineFallback && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
                    Heurística Offline
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-[#202124] dark:text-[#E8EAED]">
                Análise com IA: {company.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5F6368] hover:text-[#202124] dark:text-[#9AA0A6] dark:hover:text-[#E8EAED] rounded-lg hover:bg-[#F7F8FA] dark:hover:bg-[#20242A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Header Tabs */}
        <div className="flex border-b border-[#E6E8EB] dark:border-[#2D3139] px-5 bg-[#F7F8FA] dark:bg-[#20242A]">
          <button
            onClick={() => setActiveTab('diagnosis')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'diagnosis'
                ? 'border-[#3F6FB5] text-[#3F6FB5] dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]'
            }`}
          >
            <Zap className="w-4 h-4" />
            Diagnóstico & Scores
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'script'
                ? 'border-[#3F6FB5] text-[#3F6FB5] dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Ângulo & Script Sugerido
          </button>
          <button
            onClick={() => setActiveTab('facts')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'facts'
                ? 'border-[#3F6FB5] text-[#3F6FB5] dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Fatos x Inferências x Faltantes
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 flex-1">
          {isLoading ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#202124] dark:text-[#E8EAED]">
                  Analisando dados do prospect com IA...
                </p>
                <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                  Avaliando aderência ao ICP, presença digital, dores de mercado e calculando scores explicáveis.
                </p>
              </div>
            </div>
          ) : !analysisResult ? (
            <div className="py-8 text-center text-[#5F6368] dark:text-[#9AA0A6]">
              Não foi possível gerar a análise.
            </div>
          ) : (
            <>
              {/* TAB 1: DIAGNÓSTICO & SCORES */}
              {activeTab === 'diagnosis' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Grid de Métricas Principais */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Aderência ao ICP */}
                    <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20 text-center space-y-1">
                      <span className="text-[10px] uppercase font-bold text-purple-900 dark:text-purple-300">
                        Aderência ICP
                      </span>
                      <div className="text-2xl font-black text-purple-700 dark:text-purple-300">
                        Grau {analysisResult.icpFit || 'A'}
                      </div>
                      <span className="text-[10px] text-purple-800/80 dark:text-purple-400">
                        {analysisResult.potential || 'Alto'} Potencial
                      </span>
                    </div>

                    {/* Score de Oportunidade */}
                    <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 text-center space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-900 dark:text-amber-300 flex items-center justify-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        Oportunidade
                      </span>
                      <div className="text-2xl font-black text-amber-700 dark:text-amber-300">
                        {analysisResult.opportunityScore || 85}<span className="text-xs font-normal">/100</span>
                      </div>
                      <span className="text-[10px] text-amber-800/80 dark:text-amber-400">
                        Urgência & Sinais
                      </span>
                    </div>

                    {/* Score de Qualificação */}
                    <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 text-center space-y-1">
                      <span className="text-[10px] uppercase font-bold text-blue-900 dark:text-blue-300 flex items-center justify-center gap-1">
                        <Target className="w-3.5 h-3.5 text-[#3F6FB5]" />
                        Qualificação
                      </span>
                      <div className="text-2xl font-black text-blue-700 dark:text-blue-300">
                        {analysisResult.qualificationScore || 90}<span className="text-xs font-normal">/100</span>
                      </div>
                      <span className="text-[10px] text-blue-800/80 dark:text-blue-400">
                        Fit de Decisor & Porte
                      </span>
                    </div>
                  </div>

                  {/* Dores e Sinais Identificados */}
                  <div className="p-4 rounded-xl border border-[#E6E8EB] dark:border-[#2D3139] bg-white dark:bg-[#181B20] space-y-2">
                    <div className="text-xs font-bold text-[#202124] dark:text-[#E8EAED] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Dores e Oportunidades Identificadas no Perfil
                    </div>
                    <ul className="space-y-1.5">
                      {(analysisResult.identifiedProblems || ['Sem website oficial', 'Potencial de geração de novos agendamentos']).map(
                        (p, idx) => (
                          <li key={idx} className="text-xs text-[#5F6368] dark:text-[#9AA0A6] flex items-start gap-2">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{p}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Próxima Ação Recomendada */}
                  <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1.5">
                    <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Próxima Melhor Ação Recomendada
                    </div>
                    <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                      {analysisResult.nextActionSuggestion || 'Enviar mensagem de primeiro contato no WhatsApp'}
                    </p>
                    <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                      Canal ideal: <span className="font-bold uppercase">{analysisResult.recommendedChannel || 'WhatsApp'}</span> • Serviço: {analysisResult.recommendedService || 'Landing Page de Alta Conversão'}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ÂNGULO & SCRIPT SUGERIDO */}
              {activeTab === 'script' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Ângulo Consultivo */}
                  <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 space-y-1.5">
                    <div className="text-xs font-bold text-[#3F6FB5] dark:text-blue-300 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Ângulo de Abordagem Estratégico (Linguagem Hipotética & Ética)
                    </div>
                    <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] leading-relaxed">
                      {analysisResult.pitchAngle ||
                        'Abordagem consultiva com foco na presença digital e diagnóstico de conversão, sem confrontar fornecedores existentes.'}
                    </p>
                  </div>

                  {/* Script Pronto */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#202124] dark:text-[#E8EAED]">
                        Mensagem Personalizada Pronta para Envio
                      </label>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleCopyScript}
                        leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      >
                        {copied ? 'Copiado!' : 'Copiar Texto'}
                      </Button>
                    </div>

                    <div className="p-4 rounded-xl border border-[#E6E8EB] dark:border-[#2D3139] bg-[#F7F8FA] dark:bg-[#20242A] text-xs text-[#202124] dark:text-[#E8EAED] leading-relaxed whitespace-pre-wrap font-sans">
                      {analysisResult.suggestedScript || 'Mensagem sugerida gerada pela IA...'}
                    </div>
                  </div>

                  {/* Botão de Disparo WhatsApp */}
                  {Boolean(matchedContact?.whatsapp || matchedContact?.phone) && (
                    <Button
                      variant="primary"
                      className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white"
                      leftIcon={<Send className="w-4 h-4" />}
                      onClick={handleOpenWhatsApp}
                    >
                      Abrir WhatsApp com este Script
                    </Button>
                  )}
                </div>
              )}

              {/* TAB 3: FATOS X INFERÊNCIAS X FALTANTES */}
              {activeTab === 'facts' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#20242A] border border-[#E6E8EB] dark:border-[#2D3139] text-xs text-[#5F6368] dark:text-[#9AA0A6] leading-relaxed">
                    <ShieldCheck className="w-4 h-4 inline mr-1.5 text-blue-500" />
                    <strong>Transparência Algorítmica:</strong> O PROSPECT OS separa com rigor absoluto o que foi confirmado nos dados, o que é inferência de mercado e o que ainda precisa ser investigado.
                  </div>

                  {/* Fatos */}
                  <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/10 space-y-1.5">
                    <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      ✓ Fatos Confirmados ({analysisResult.factsUsed?.length || 0})
                    </div>
                    <ul className="space-y-1">
                      {(analysisResult.factsUsed || []).map((f, i) => (
                        <li key={i} className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                          • {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Inferências */}
                  <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/10 space-y-1.5">
                    <div className="text-xs font-bold text-blue-800 dark:text-blue-300">
                      ℹ️ Inferências de Mercado ({analysisResult.inferences?.length || 0})
                    </div>
                    <ul className="space-y-1">
                      {(analysisResult.inferences || []).map((inf, i) => (
                        <li key={i} className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                          • {inf}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Dados Ausentes */}
                  <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/10 space-y-1.5">
                    <div className="text-xs font-bold text-amber-800 dark:text-amber-300">
                      ⚠️ Dados Ausentes a Coletar ({analysisResult.missingData?.length || 0})
                    </div>
                    <ul className="space-y-1">
                      {(analysisResult.missingData || []).map((m, i) => (
                        <li key={i} className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                          • {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E6E8EB] dark:border-[#2D3139] flex flex-wrap items-center justify-between gap-3 bg-[#F7F8FA] dark:bg-[#20242A]">
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleSaveDiagnosis} disabled={isLoading || !analysisResult}>
              Salvar Diagnóstico no Lead
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveAndSchedule}
              disabled={isLoading || !analysisResult}
              leftIcon={<Calendar className="w-4 h-4" />}
            >
              Salvar & Agendar Ação
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Flame,
  Globe,
  Info,
  Lightbulb,
  MessageCircle,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  User,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  AiLeadAnalysisResult,
  Company,
  Contact,
  Lead,
  Service,
} from '../../types';
import { analyzeLeadDataDeterministic } from '../../utils/assistantEngine';
import { buildCopilotLeadContext } from '../../services/copilotService';
import { generateWhatsAppLink, formatPhoneNumber } from '../../utils/formatting';

interface AiLeadAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  lead?: Lead | null;
  onApplyNextAction?: (actionText: string, scriptText: string) => void;
}

export const AiLeadAnalysisModal: React.FC<AiLeadAnalysisModalProps> = ({
  isOpen,
  onClose,
  company,
  lead,
  onApplyNextAction,
}) => {
  const { services, icps, contacts, history, updateLead, addHistoryEvent } = useApp();
  const { success, info } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AiLeadAnalysisResult | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  const contact = contacts.find((c) => c.companyId === company?.id && c.isPrimary) || company?.contacts?.[0];
  const service = services.find((s) => s.id === lead?.serviceId) || services[0];

  const runAnalysis = async () => {
    if (!company) return;
    setIsLoading(true);

    try {
      // 1. Gera análise determinística auditável
      const deterministic = analyzeLeadDataDeterministic(
        company,
        contact,
        lead || undefined,
        service,
        icps,
        undefined,
        history
      );

      // 2. Tenta enriquecer via Gemini Server API se disponível
      const ctx = buildCopilotLeadContext({
        company,
        contact,
        lead: lead || undefined,
        service,
        icp: icps.find((i) => i.niches.includes(company.niche)),
        recentEvents: history.filter((h) => h.companyId === company.id),
      });

      const response = await fetch('/api/copilot/analyze-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadContext: ctx,
          icps,
          availableServices: services.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            benefits: s.benefits,
            problemsSolved: s.problemsSolved,
          })),
        }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.data && json.success) {
          const aiData = json.data;
          setAnalysisResult({
            ...deterministic,
            icpAdequacy: aiData.icpAdequacy || deterministic.icpAdequacy,
            icpScore: typeof aiData.icpScore === 'number' ? aiData.icpScore : deterministic.icpScore,
            problemsAndSignals: aiData.problemsAndSignals || deterministic.problemsAndSignals,
            commercialPotential: aiData.commercialPotential || deterministic.commercialPotential,
            opportunityState: (aiData.opportunityState as any) || deterministic.opportunityState,
            opportunityScore: aiData.opportunityScore || deterministic.opportunityScore,
            qualificationScore: aiData.qualificationScore || deterministic.qualificationScore,
            recommendedService: aiData.recommendedService || deterministic.recommendedService,
            analysisRiskOrLimitations: aiData.analysisRiskOrLimitations || deterministic.analysisRiskOrLimitations,
            recommendedNextAction: aiData.recommendedNextAction || deterministic.recommendedNextAction,
            recommendedScript: aiData.recommendedScript || deterministic.recommendedScript,
            confidence: aiData.confidence === 'alta' ? 'alta' : 'baixa',
            confidenceReason: aiData.confidenceReason || deterministic.confidenceReason,
            factsUsed: aiData.factsUsed || deterministic.factsUsed,
            missingData: aiData.missingData || deterministic.missingData,
          });
          setIsLoading(false);
          return;
        }
      }

      // Fallback determinístico perfeito
      setAnalysisResult(deterministic);
    } catch (err) {
      console.warn('Utilizando análise determinística de segurança:', err);
      if (company) {
        setAnalysisResult(
          analyzeLeadDataDeterministic(
            company,
            contact,
            lead || undefined,
            service,
            icps,
            undefined,
            history
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && company) {
      runAnalysis();
    }
  }, [isOpen, company?.id]);

  if (!company) return null;

  const destPhone = contact?.whatsapp || contact?.phone || company.companyWhatsApp || company.companyPhone || '';

  const handleApplyAndClose = () => {
    if (!analysisResult) return;
    if (lead) {
      updateLead(lead.id, {
        nextActionTitle: analysisResult.recommendedNextAction,
        score: analysisResult.opportunityScore,
        opportunityScore: analysisResult.opportunityScore,
        qualificationScore: analysisResult.qualificationScore,
        opportunityState: analysisResult.opportunityState,
      });

      addHistoryEvent({
        id: `hist_ai_${Date.now()}`,
        companyId: company.id,
        leadId: lead.id,
        type: 'note_added',
        title: 'Análise de IA Aplicada',
        description: `Score Oportunidade: ${analysisResult.opportunityScore} | Qualificação: ${analysisResult.qualificationScore} | Ação: ${analysisResult.recommendedNextAction}`,
        timestamp: new Date().toISOString(),
      });
    }

    if (onApplyNextAction) {
      onApplyNextAction(analysisResult.recommendedNextAction, analysisResult.recommendedScript);
    }

    success('Plano e recomendações da IA aplicados ao lead.');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Análise Inteligente do Lead (IA & Regras Auditáveis)"
      size="xl"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Banner de Cabeçalho da Empresa Analisada */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#202124] dark:text-[#E8EAED]">
                {company.name}
              </h3>
              <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                {company.niche} • {company.country} {company.city ? `(${company.city})` : ''} • Contato: {contact?.name || 'Não informado'}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={runAnalysis}
            disabled={isLoading}
            className="text-xs font-semibold self-start sm:self-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Recalcular Análise
          </Button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-[#202124] dark:text-[#E8EAED]">
              Analisando dados do lead, sinais e catálogo de serviços...
            </p>
            <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
              Processamento seguro estritamente sobre dados disponíveis (zero alucinações).
            </p>
          </div>
        ) : analysisResult ? (
          <div className="space-y-6">
            {/* Aviso de Confiança & Segurança */}
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                analysisResult.confidence === 'alta'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">
                  Confiança da Análise:{' '}
                  <span className="uppercase">{analysisResult.confidence}</span>
                </div>
                <p className="mt-0.5">{analysisResult.confidenceReason}</p>
              </div>
            </div>

            {/* Grid dos 8 Itens Estruturados de Análise */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Adequação ao ICP */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368] dark:text-[#9AA0A6] flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#3F6FB5]" />
                    1. Adequação ao ICP
                  </span>
                  <Badge variant="blue" size="sm">{analysisResult.icpScore}/100</Badge>
                </div>
                <p className="text-sm font-semibold text-[#202124] dark:text-[#E8EAED]">
                  {analysisResult.icpAdequacy}
                </p>
              </div>

              {/* 2. Problemas e Sinais */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368] dark:text-[#9AA0A6] flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  2. Problemas e Sinais Detectados
                </span>
                <ul className="space-y-1">
                  {analysisResult.problemsAndSignals.map((prob, idx) => (
                    <li key={idx} className="text-xs text-[#202124] dark:text-[#E8EAED] flex items-start gap-1.5">
                      <span className="text-orange-500 font-bold">•</span>
                      <span>{prob}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Potencial Comercial */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368] dark:text-[#9AA0A6] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-500" />
                  3. Potencial Comercial
                </span>
                <p className="text-xs text-[#202124] dark:text-[#E8EAED] leading-relaxed">
                  {analysisResult.commercialPotential}
                </p>
              </div>

              {/* 4. Estado da Oportunidade */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368] dark:text-[#9AA0A6] flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  4. Estado da Oportunidade
                </span>
                <div className="pt-1 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
                    {analysisResult.opportunityState.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* 5. Score Separado: Oportunidade vs Qualificação */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-2 md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368] dark:text-[#9AA0A6] flex items-center gap-1.5">
                  <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />
                  5. Separação de Scores Comerciais
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-[#F7F8FA] dark:bg-[#20242A] border border-[#E6E8EB] dark:border-[#2D3139] space-y-1">
                    <div className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">SCORE DE OPORTUNIDADE</div>
                    <div className="text-2xl font-black text-[#202124] dark:text-[#E8EAED]">
                      {analysisResult.opportunityScore}/100
                    </div>
                    <div className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">
                      Potencial da empresa, porte e demanda de mercado.
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F7F8FA] dark:bg-[#20242A] border border-[#E6E8EB] dark:border-[#2D3139] space-y-1">
                    <div className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">SCORE DE QUALIFICAÇÃO</div>
                    <div className="text-2xl font-black text-[#3F6FB5] dark:text-blue-400">
                      {analysisResult.qualificationScore}/100
                    </div>
                    <div className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">
                      Intenção demonstrada, canal direto e engajamento do decisor.
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Serviço Mais Compatível */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368] dark:text-[#9AA0A6] flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  6. Serviço Mais Compatível
                </span>
                <p className="text-sm font-bold text-[#202124] dark:text-[#E8EAED]">
                  {analysisResult.recommendedService}
                </p>
              </div>

              {/* 7. Riscos e Limitações da Análise */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368] dark:text-[#9AA0A6] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  7. Riscos / Limitações da Análise
                </span>
                <ul className="space-y-1">
                  {analysisResult.analysisRiskOrLimitations.map((risk, idx) => (
                    <li key={idx} className="text-xs text-[#5F6368] dark:text-[#9AA0A6] flex items-start gap-1.5">
                      <span>⚠️</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 8. Próxima Ação Recomendada & Script */}
            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                  8. Próxima Ação Recomendada: {analysisResult.recommendedNextAction}
                </span>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  Canal sugerido: {analysisResult.recommendedChannel}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#5F6368] dark:text-[#9AA0A6]">
                  Script contextual sugerido para envio:
                </label>
                <div className="p-3 bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] rounded-xl text-xs text-[#202124] dark:text-[#E8EAED] leading-relaxed whitespace-pre-line font-mono">
                  {analysisResult.recommendedScript}
                </div>
              </div>
            </div>

            {/* Fatos Confirmados vs Dados Ausentes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 space-y-1">
                <div className="font-bold text-emerald-800 dark:text-emerald-300">
                  Fatos Utilizados ({analysisResult.factsUsed.length}):
                </div>
                <ul className="space-y-0.5 text-emerald-700 dark:text-emerald-400">
                  {analysisResult.factsUsed.map((f, i) => (
                    <li key={i}>✓ {f}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#20242A] border border-[#E6E8EB] dark:border-[#2D3139] space-y-1">
                <div className="font-bold text-[#5F6368] dark:text-[#9AA0A6]">
                  Dados Ausentes ({analysisResult.missingData.length}):
                </div>
                <ul className="space-y-0.5 text-[#5F6368] dark:text-[#9AA0A6]">
                  {analysisResult.missingData.length > 0 ? (
                    analysisResult.missingData.map((m, i) => <li key={i}>— {m}</li>)
                  ) : (
                    <li>Nenhum dado crítico ausente.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        {/* Rodapé de Ações */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E6E8EB] dark:border-[#2D3139]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (analysisResult?.recommendedScript) {
                navigator.clipboard.writeText(analysisResult.recommendedScript);
                setCopiedScript(true);
                setTimeout(() => setCopiedScript(false), 2000);
                success('Script copiado!');
              }
            }}
            disabled={!analysisResult}
          >
            {copiedScript ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copiedScript ? 'Copiado' : 'Copiar Script'}
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {destPhone && analysisResult && (
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                onClick={() => {
                  const waLink = generateWhatsAppLink(destPhone, analysisResult.recommendedScript);
                  window.open(waLink, '_blank', 'noopener,noreferrer');
                  success('WhatsApp aberto com script sugerido!');
                }}
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                Abrir WhatsApp
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={handleApplyAndClose}
              disabled={!analysisResult}
            >
              Aplicar Recomendações & Fechar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

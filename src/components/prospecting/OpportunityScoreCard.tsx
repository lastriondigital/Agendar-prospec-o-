import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Flame,
  Globe,
  Palette,
  MapPin,
  Layers,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { OpportunityScoreExplanation, OpportunityState, ProspectingMode } from '../../types';

interface OpportunityScoreCardProps {
  explanation: OpportunityScoreExplanation;
  opportunityState?: OpportunityState;
  onUpdateState?: (newState: OpportunityState) => void;
  compact?: boolean;
}

export const OpportunityScoreCard: React.FC<OpportunityScoreCardProps> = ({
  explanation,
  opportunityState = explanation.mode === 'OPORTUNIDADE_LATENTE' ? 'HIPOTESE' : 'CONFIRMADO',
  onUpdateState,
  compact = false,
}) => {
  const isLatente = explanation.mode === 'OPORTUNIDADE_LATENTE';

  return (
    <div className="bg-[#FAFBFD] dark:bg-[#16191F] border border-[#E2E6EC] dark:border-[#272B33] rounded-xl p-4 sm:p-5 space-y-4">
      {/* Header do Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E6EC] dark:border-[#272B33]">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#64748B] dark:text-[#94A3B8]">
            {isLatente ? 'Investigação de Potencial' : 'Diagnóstico de Demanda'}
          </span>
          <h4 className="text-base sm:text-lg font-bold text-[#1E293B] dark:text-[#F1F5F9] flex items-center gap-2">
            POR QUE ESTE LEAD É PRIORITÁRIO?
          </h4>
        </div>

        <div className="flex items-center gap-3">
          {/* Badge do Score */}
          <div className="flex items-center gap-2 bg-white dark:bg-[#1E222A] px-3 py-1.5 rounded-lg border border-[#CBD5E1] dark:border-[#334155] shadow-xs">
            <TrendingUp className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
            <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Score de oportunidade:</span>
            <span className="text-sm font-bold text-[#1E293B] dark:text-white">
              {explanation.totalScore}/100
            </span>
          </div>

          {/* Classificação */}
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
              explanation.isHighPriority
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/40'
                : explanation.classification === 'media'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900/40'
                : 'bg-slate-100 dark:bg-[#252B35] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            {explanation.classificationLabel}
          </span>
        </div>
      </div>

      {/* Seletor do Estado da Oportunidade */}
      {onUpdateState && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-white dark:bg-[#1E222A] border border-[#E2E6EC] dark:border-[#272B33]">
          <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
            Estado da Oportunidade:
          </span>
          <div className="flex items-center gap-1.5">
            {(['HIPOTESE', 'PROVAVEL', 'CONFIRMADO'] as OpportunityState[]).map((st) => {
              const isActive = opportunityState === st;
              const labels: Record<OpportunityState, string> = {
                HIPOTESE: 'Hipótese',
                PROVAVEL: 'Provável',
                CONFIRMADO: 'Problema confirmado',
              };
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => onUpdateState(st)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-[#F1F5F9] dark:bg-[#252B35] text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-200'
                  }`}
                >
                  {labels[st]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Discriminador de Fatores da Pontuação */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block">
          Fatores que produziram a pontuação
        </span>

        {!isLatente ? (
          // FATORES DEMANDA IDENTIFICADA (Total 100: 30 + 30 + 25 + 15)
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* 1. ICP */}
            <div className="p-3 bg-white dark:bg-[#1E222A] rounded-lg border border-[#E2E6EC] dark:border-[#272B33] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1E293B] dark:text-[#E2E8F0]">Adequação ao ICP</span>
                <span className="font-bold text-[#2563EB] dark:text-blue-400">
                  {explanation.icpAdequacy?.score ?? 0}/30
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {explanation.icpAdequacy?.insufficientData
                  ? 'Dados insuficientes para avaliar este critério.'
                  : explanation.icpAdequacy?.details || 'Critério compatível.'}
              </p>
            </div>

            {/* 2. Intensidade do Problema */}
            <div className="p-3 bg-white dark:bg-[#1E222A] rounded-lg border border-[#E2E6EC] dark:border-[#272B33] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1E293B] dark:text-[#E2E8F0]">Intensidade do problema</span>
                <span className="font-bold text-[#2563EB] dark:text-blue-400">
                  {explanation.problemIntensity?.score ?? 0}/30
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {explanation.problemIntensity?.insufficientData
                  ? 'Dados insuficientes para avaliar este critério.'
                  : explanation.problemIntensity?.details || 'Sinais identificados.'}
              </p>
            </div>

            {/* 3. Potencial de Compra */}
            <div className="p-3 bg-white dark:bg-[#1E222A] rounded-lg border border-[#E2E6EC] dark:border-[#272B33] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1E293B] dark:text-[#E2E8F0]">Potencial de compra</span>
                <span className="font-bold text-[#2563EB] dark:text-blue-400">
                  {explanation.buyingPotential?.score ?? 0}/25
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {explanation.buyingPotential?.insufficientData
                  ? 'Dados insuficientes para avaliar este critério.'
                  : explanation.buyingPotential?.details || 'Capacidade avaliada.'}
              </p>
            </div>

            {/* 4. Intenção / Engajamento */}
            <div className="p-3 bg-white dark:bg-[#1E222A] rounded-lg border border-[#E2E6EC] dark:border-[#272B33] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1E293B] dark:text-[#E2E8F0]">Intenção / Engajamento</span>
                <span className="font-bold text-[#2563EB] dark:text-blue-400">
                  {explanation.engagementIntent?.score ?? 0}/15
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {explanation.engagementIntent?.insufficientData
                  ? 'Dados insuficientes para avaliar este critério.'
                  : explanation.engagementIntent?.details || 'Canais de contato.'}
              </p>
            </div>
          </div>
        ) : (
          // FATORES OPORTUNIDADE LATENTE (Total 100: 20 + 15 + 15 + 15 + 15 + 10 + 10)
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {/* 1. ICP */}
            <div className="p-3 bg-white dark:bg-[#1E222A] rounded-lg border border-[#E2E6EC] dark:border-[#272B33] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1E293B] dark:text-[#E2E8F0]">Adequação ao ICP</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {explanation.latentIcpAdequacy?.score ?? 0}/20
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {explanation.latentIcpAdequacy?.insufficientData
                  ? 'Dados insuficientes para avaliar este critério.'
                  : explanation.latentIcpAdequacy?.details}
              </p>
            </div>

            {/* 2. Escala */}
            <div className="p-3 bg-white dark:bg-[#1E222A] rounded-lg border border-[#E2E6EC] dark:border-[#272B33] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1E293B] dark:text-[#E2E8F0]">Escala da empresa</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {explanation.companyScale?.score ?? 0}/15
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {explanation.companyScale?.insufficientData
                  ? 'Dados insuficientes para avaliar este critério.'
                  : explanation.companyScale?.details}
              </p>
            </div>

            {/* 3. Complexidade */}
            <div className="p-3 bg-white dark:bg-[#1E222A] rounded-lg border border-[#E2E6EC] dark:border-[#272B33] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1E293B] dark:text-[#E2E8F0]">Complexidade operacional</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {explanation.operationalComplexity?.score ?? 0}/15
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {explanation.operationalComplexity?.insufficientData
                  ? 'Dados insuficientes para avaliar este critério.'
                  : explanation.operationalComplexity?.details}
              </p>
            </div>

            {/* 4. Processos Repetitivos */}
            <div className="p-3 bg-white dark:bg-[#1E222A] rounded-lg border border-[#E2E6EC] dark:border-[#272B33] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1E293B] dark:text-[#E2E8F0]">Processos repetitivos</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {explanation.repetitiveProcesses?.score ?? 0}/15
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {explanation.repetitiveProcesses?.insufficientData
                  ? 'Dados insuficientes para avaliar este critério.'
                  : explanation.repetitiveProcesses?.details}
              </p>
            </div>

            {/* 5. Digitalização */}
            <div className="p-3 bg-white dark:bg-[#1E222A] rounded-lg border border-[#E2E6EC] dark:border-[#272B33] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1E293B] dark:text-[#E2E8F0]">Potencial de digitalização</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {explanation.digitalizationPotential?.score ?? 0}/15
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {explanation.digitalizationPotential?.insufficientData
                  ? 'Dados insuficientes para avaliar este critério.'
                  : explanation.digitalizationPotential?.details}
              </p>
            </div>

            {/* 6 & 7. Frequência e Investimento */}
            <div className="p-3 bg-white dark:bg-[#1E222A] rounded-lg border border-[#E2E6EC] dark:border-[#272B33] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1E293B] dark:text-[#E2E8F0]">Frequência & Investimento</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {(explanation.problemFrequency?.score ?? 0) + (explanation.apparentInvestmentCapacity?.score ?? 0)}/20
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {explanation.problemFrequency?.insufficientData && explanation.apparentInvestmentCapacity?.insufficientData
                  ? 'Dados insuficientes para avaliar este critério.'
                  : 'Sinais de fluxo contínuo e infraestrutura.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sinais Encontrados (Sem inventar nada) */}
      <div className="space-y-2 pt-2 border-t border-[#E2E6EC] dark:border-[#272B33]">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block">
          Sinais encontrados ({explanation.detectedSignals.length + explanation.customSignals.length})
        </span>

        {explanation.detectedSignals.length === 0 && explanation.customSignals.length === 0 ? (
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] italic bg-white dark:bg-[#1E222A] p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#272B33]">
            Nenhum sinal registrado ainda. Clique em "Qualificar / Sinais" para mapear os problemas da empresa.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {explanation.detectedSignals.map((signal, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 rounded-md bg-white dark:bg-[#1E222A] border border-[#CBD5E1] dark:border-[#334155] text-[#334155] dark:text-[#CBD5E1] flex items-center gap-1.5 shadow-2xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] dark:bg-blue-400" />
                {signal}
              </span>
            ))}
            {explanation.customSignals.map((custom, idx) => (
              <span
                key={`custom-${idx}`}
                className="text-xs px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                {custom}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Nota de Orientação e Linguagem */}
      <div className="p-3 rounded-lg bg-[#F1F5F9] dark:bg-[#1E222A] border border-[#E2E6EC] dark:border-[#272B33] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] shrink-0 mt-0.5" />
        <div className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
          {isLatente ? (
            <span>
              <strong>Ciclo de Oportunidade:</strong> SINAIS → HIPÓTESE → INVESTIGAÇÃO → CONFIRMAÇÃO → SOLUÇÃO. Não afirme a necessidade de software antes da conversa de diagnóstico.
            </span>
          ) : (
            <span>
              <strong>Orientação de Abordagem:</strong> Utilize os problemas visuais e técnicos identificados como evidência objetiva na primeira mensagem para gerar curiosidade imediata.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { X, Flame, Target, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { DualLeadScoreResult } from '../../utils/leadScoring';
import { Company } from '../../types';
import { Button } from '../ui/Button';

interface DualScoreBreakdownModalProps {
  dualScore: DualLeadScoreResult;
  company?: Company;
  onClose: () => void;
}

export const DualScoreBreakdownModal: React.FC<DualScoreBreakdownModalProps> = ({
  dualScore,
  company,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#181B20] rounded-2xl border border-[#E6E8EB] dark:border-[#2D3139] shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E6E8EB] dark:border-[#2D3139] sticky top-0 bg-white dark:bg-[#181B20] z-10">
          <div>
            <div className="text-xs font-semibold text-[#5F6368] dark:text-[#9AA0A6] uppercase tracking-wider">
              Diagnóstico de Pontuação
            </div>
            <h2 className="text-lg font-bold text-[#202124] dark:text-[#E8EAED]">
              {company?.name || 'Lead'} — Score Duplo Explicável
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5F6368] hover:text-[#202124] dark:text-[#9AA0A6] dark:hover:text-[#E8EAED] rounded-lg hover:bg-[#F7F8FA] dark:hover:bg-[#20242A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* Resumo dos 2 Scores */}
          <div className="grid grid-cols-2 gap-4">
            {/* Score de Oportunidade */}
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Score de Oportunidade
                </span>
                <span className="text-lg font-black text-amber-900 dark:text-amber-200">
                  {dualScore.opportunityScore}<span className="text-xs font-normal">/100</span>
                </span>
              </div>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/70 leading-relaxed">
                Mede a urgência, dores visíveis no mercado (sem site, perfil incompleto) e facilidade de abordagem.
              </p>
            </div>

            {/* Score de Qualificação */}
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-[#3F6FB5] dark:text-blue-400" />
                  Score de Qualificação
                </span>
                <span className="text-lg font-black text-blue-900 dark:text-blue-200">
                  {dualScore.qualificationScore}<span className="text-xs font-normal">/100</span>
                </span>
              </div>
              <p className="text-[11px] text-blue-800/80 dark:text-blue-300/70 leading-relaxed">
                Mede o fit com o perfil de cliente ideal (porte, decisor mapeado, segmento e capacidade de investimento).
              </p>
            </div>
          </div>

          {/* Recomendação Estratégica */}
          <div className="p-3.5 rounded-xl bg-[#F7F8FA] dark:bg-[#20242A] border border-[#E6E8EB] dark:border-[#2D3139]">
            <div className="text-xs font-bold text-[#202124] dark:text-[#E8EAED] mb-1">
              Recomendação Comercial:
            </div>
            <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] leading-relaxed">
              {dualScore.recommendation}
            </p>
          </div>

          {/* Detalhamento: Oportunidade */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#202124] dark:text-[#E8EAED] uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              Critérios de Oportunidade Identificados ({dualScore.opportunityBreakdown.length})
            </h3>
            <div className="space-y-2">
              {dualScore.opportunityBreakdown.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-3 rounded-xl border border-[#E6E8EB] dark:border-[#2D3139] bg-white dark:bg-[#181B20]"
                >
                  <div className="space-y-0.5 pr-3">
                    <div className="text-xs font-semibold text-[#202124] dark:text-[#E8EAED]">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">
                      {item.reason}
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shrink-0">
                    +{item.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Detalhamento: Qualificação */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#202124] dark:text-[#E8EAED] uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-[#3F6FB5] dark:text-blue-400" />
              Critérios de Qualificação de ICP ({dualScore.qualificationBreakdown.length})
            </h3>
            <div className="space-y-2">
              {dualScore.qualificationBreakdown.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-3 rounded-xl border border-[#E6E8EB] dark:border-[#2D3139] bg-white dark:bg-[#181B20]"
                >
                  <div className="space-y-0.5 pr-3">
                    <div className="text-xs font-semibold text-[#202124] dark:text-[#E8EAED]">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">
                      {item.reason}
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 shrink-0">
                    +{item.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E6E8EB] dark:border-[#2D3139] flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};

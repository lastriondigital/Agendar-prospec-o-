import React from 'react';
import {
  CheckCircle2,
  Flame,
  Info,
  MinusCircle,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { LeadScoreResult } from '../../types';
import { getScoreClassificationLabel, getScoreColorTokens } from '../../utils/leadScoring';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ScoreBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  scoreResult: LeadScoreResult;
  companyName?: string;
}

export const ScoreBreakdownModal: React.FC<ScoreBreakdownModalProps> = ({
  isOpen,
  onClose,
  scoreResult,
  companyName,
}) => {
  const { score, classification, breakdown } = scoreResult;
  const tokens = getScoreColorTokens(score);
  const classLabel = getScoreClassificationLabel(classification);

  const positiveRules = breakdown.filter((b) => b.points > 0);
  const negativeRules = breakdown.filter((b) => b.points < 0);
  const neutralRules = breakdown.filter((b) => b.points === 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Auditoria & Explicação do Lead Score">
      <div className="space-y-6">
        {/* Header com Score e Classificação */}
        <div className={`p-5 rounded-2xl border ${tokens.bg} ${tokens.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-neutral-950/80 border border-neutral-800 shadow-inner">
              <span className={`text-2xl font-black font-mono ${tokens.text}`}>
                {score}
              </span>
              <span className="text-[10px] text-neutral-500 absolute bottom-1">/100</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${tokens.badgeBg} ${tokens.badgeText}`}>
                  {classLabel}
                </span>
                {score >= 85 && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <Flame className="w-3.5 h-3.5 fill-emerald-400" />
                    Top Oportunidade
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-neutral-200 mt-1">
                {companyName ? `Score de Qualificação: ${companyName}` : 'Score do Lead'}
              </h3>
              <p className="text-xs text-neutral-400">
                Pontuação calculada estritamente com base nos dados reais cadastrados.
              </p>
            </div>
          </div>

          {/* Faixas de Classificação */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/80 shrink-0">
            <div className={`px-2 py-1 rounded ${classification === 'prioridade_maxima' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'text-neutral-500'}`}>
              85–100: Máxima
            </div>
            <div className={`px-2 py-1 rounded ${classification === 'alta' ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30' : 'text-neutral-500'}`}>
              70–84: Alta
            </div>
            <div className={`px-2 py-1 rounded ${classification === 'média' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-neutral-500'}`}>
              40–69: Média
            </div>
            <div className={`px-2 py-1 rounded ${classification === 'baixa' ? 'bg-neutral-800 text-neutral-400 font-bold border border-neutral-700' : 'text-neutral-500'}`}>
              0–39: Baixa
            </div>
          </div>
        </div>

        {/* Breakdown de Critérios Positivos e Negativos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Por que este lead recebeu esta pontuação?</span>
            </h4>
            <span className="text-[11px] text-neutral-500 font-mono">
              {breakdown.length} critérios avaliados
            </span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {/* Pontos Positivos */}
            {positiveRules.map((rule) => (
              <div
                key={rule.ruleId}
                className="flex items-start justify-between gap-3 p-3 rounded-xl bg-neutral-900/80 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-200 truncate">
                      {rule.label}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {rule.reason}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 shrink-0">
                  +{rule.points} pts
                </span>
              </div>
            ))}

            {/* Penalidades / Pontos Negativos */}
            {negativeRules.map((rule) => (
              <div
                key={rule.ruleId}
                className="flex items-start justify-between gap-3 p-3 rounded-xl bg-neutral-900/80 border border-rose-500/20 hover:border-rose-500/40 transition-colors"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="p-1 rounded-md bg-rose-500/10 text-rose-400 shrink-0 mt-0.5">
                    <MinusCircle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-200 truncate">
                      {rule.label}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {rule.reason}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-black text-rose-400 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20 shrink-0">
                  {rule.points} pts
                </span>
              </div>
            ))}

            {/* Neutros / Avisos */}
            {neutralRules.map((rule) => (
              <div
                key={rule.ruleId}
                className="flex items-start justify-between gap-3 p-3 rounded-xl bg-neutral-900/40 border border-neutral-800"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="p-1 rounded-md bg-neutral-800 text-neutral-400 shrink-0 mt-0.5">
                    <Info className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-300">
                      {rule.label}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {rule.reason}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-medium text-neutral-500 px-2 py-1">
                  0 pts
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé Informativo */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Pesos configuráveis no menu de Qualificação / Configurações.</span>
          </div>

          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

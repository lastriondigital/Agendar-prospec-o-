import React, { useState } from 'react';
import { Flame, Target, Sparkles, ChevronRight, Info } from 'lucide-react';
import { DualLeadScoreResult, calculateDualLeadScore, getScoreColorTokens } from '../../utils/leadScoring';
import { Company, Contact, HistoryEvent, IdealCustomerProfile, Lead, Service } from '../../types';
import { DualScoreBreakdownModal } from './DualScoreBreakdownModal';

interface DualScoreBadgeProps {
  company?: Company;
  contact?: Contact;
  lead?: Lead;
  icps?: IdealCustomerProfile[];
  services?: Service[];
  history?: HistoryEvent[];
  compact?: boolean;
  showBreakdownOnClick?: boolean;
  className?: string;
}

export const DualScoreBadge: React.FC<DualScoreBadgeProps> = ({
  company,
  contact,
  lead,
  icps = [],
  services = [],
  history = [],
  compact = false,
  showBreakdownOnClick = true,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dualScore: DualLeadScoreResult = calculateDualLeadScore(
    company,
    contact,
    lead,
    icps,
    services,
    history
  );

  const priorityTokens = getScoreColorTokens(dualScore.priorityScore);

  const getBadgeColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/40';
    if (score >= 60) return 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800/40';
    if (score >= 40) return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/40';
    return 'text-neutral-700 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700';
  };

  if (compact) {
    return (
      <>
        <div
          onClick={(e) => {
            if (showBreakdownOnClick) {
              e.stopPropagation();
              setIsModalOpen(true);
            }
          }}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-all hover:scale-102 select-none ${priorityTokens.bg} ${priorityTokens.border} ${priorityTokens.text} ${className}`}
          title="Clique para ver o detalhamento do Score de Oportunidade e Qualificação"
        >
          <Flame className="w-3.5 h-3.5 fill-current text-amber-500" />
          <span className="font-bold">{dualScore.priorityScore}</span>
          <span className="text-[10px] opacity-75">/ 100</span>
        </div>

        {isModalOpen && (
          <DualScoreBreakdownModal
            dualScore={dualScore}
            company={company}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div
        onClick={(e) => {
          if (showBreakdownOnClick) {
            e.stopPropagation();
            setIsModalOpen(true);
          }
        }}
        className={`flex flex-wrap items-center gap-2 p-2 rounded-xl border bg-white dark:bg-[#181B20] border-[#E6E8EB] dark:border-[#2D3139] cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-all ${className}`}
      >
        {/* Score Principal Combinado */}
        <div className="flex items-center gap-2 pr-2 border-r border-[#E6E8EB] dark:border-[#2D3139]">
          <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs ${priorityTokens.badgeBg} ${priorityTokens.badgeText}`}>
            {dualScore.priorityScore}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-[#5F6368] dark:text-[#9AA0A6] leading-none">
              Prioridade
            </div>
            <div className={`text-xs font-bold leading-tight ${priorityTokens.text}`}>
              {dualScore.classification === 'prioridade_maxima' ? 'Máxima' : dualScore.classification}
            </div>
          </div>
        </div>

        {/* Score de Oportunidade */}
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs ${getBadgeColor(dualScore.opportunityScore)}`}>
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <div className="flex flex-col">
            <span className="text-[9px] font-medium opacity-80 leading-none">Oportunidade</span>
            <span className="font-bold leading-tight">{dualScore.opportunityScore}<span className="text-[10px] font-normal">/100</span></span>
          </div>
        </div>

        {/* Score de Qualificação */}
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs ${getBadgeColor(dualScore.qualificationScore)}`}>
          <Target className="w-3.5 h-3.5 text-[#3F6FB5] dark:text-blue-400" />
          <div className="flex flex-col">
            <span className="text-[9px] font-medium opacity-80 leading-none">Qualificação</span>
            <span className="font-bold leading-tight">{dualScore.qualificationScore}<span className="text-[10px] font-normal">/100</span></span>
          </div>
        </div>

        {showBreakdownOnClick && (
          <div className="ml-auto text-[#5F6368] dark:text-[#9AA0A6] p-1">
            <Info className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {isModalOpen && (
        <DualScoreBreakdownModal
          dualScore={dualScore}
          company={company}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

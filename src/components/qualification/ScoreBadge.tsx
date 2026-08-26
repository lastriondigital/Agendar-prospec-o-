import React, { useState } from 'react';
import { Flame, Info, Sparkles, Star } from 'lucide-react';
import { getScoreColorTokens } from '../../utils/leadScoring';
import { LeadScoreResult } from '../../types';
import { ScoreBreakdownModal } from './ScoreBreakdownModal';

interface ScoreBadgeProps {
  score?: number;
  showLabel?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  scoreResult?: LeadScoreResult;
  companyName?: string;
  className?: string;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  score = 50,
  showLabel = false,
  size = 'sm',
  interactive = false,
  scoreResult,
  companyName,
  className = '',
}) => {
  const tokens = getScoreColorTokens(score);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 font-bold',
    sm: 'text-xs px-2 py-0.5 font-bold',
    md: 'text-sm px-2.5 py-1 font-extrabold',
    lg: 'text-base px-3 py-1.5 font-black',
  };

  const handleClick = (e: React.MouseEvent) => {
    if (interactive && scoreResult) {
      e.stopPropagation();
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <span
        onClick={handleClick}
        title={interactive ? `Ver explicação do Score (${score}/100)` : undefined}
        className={`inline-flex items-center gap-1.5 rounded-lg border transition-all ${tokens.bg} ${tokens.text} ${tokens.border} ${sizeClasses[size]} ${
          interactive ? 'cursor-pointer hover:scale-105 active:scale-95 shadow-xs' : ''
        } ${className}`}
      >
        {score >= 85 ? (
          <Flame className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400 shrink-0 animate-pulse" />
        ) : score >= 70 ? (
          <Star className="w-3.5 h-3.5 fill-sky-400 text-sky-400 shrink-0" />
        ) : (
          <span className={`w-2 h-2 rounded-full ${tokens.dotColor} shrink-0`} />
        )}

        <span className="font-mono">{score}</span>

        {showLabel && (
          <span className="text-[10px] opacity-80 font-normal truncate">
            • {tokens.label}
          </span>
        )}

        {interactive && (
          <Info className="w-3 h-3 opacity-60 hover:opacity-100 shrink-0 ml-0.5" />
        )}
      </span>

      {isModalOpen && scoreResult && (
        <ScoreBreakdownModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          scoreResult={scoreResult}
          companyName={companyName}
        />
      )}
    </>
  );
};

import React from 'react';
import {
  AlertTriangle,
  Calendar,
  Clock,
  FileText,
  Flame,
  Layers,
  MessageSquare,
  RotateCcw,
  Sparkles,
  Users,
  Video,
} from 'lucide-react';

export type QuickFilterType =
  | 'all'
  | 'hoje'
  | 'atrasados'
  | 'prioridade_maxima'
  | 'quentes'
  | 'sem_resposta'
  | 'follow_up'
  | 'reativacao'
  | 'propostas'
  | 'reunioes';

interface QuickFilterOption {
  id: QuickFilterType;
  label: string;
  icon: React.ReactNode;
  count?: number;
  colorVariant?: 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo' | 'purple' | 'neutral';
}

interface QuickFilterBarProps {
  activeFilter: QuickFilterType;
  onSelectFilter: (filter: QuickFilterType) => void;
  counts?: Partial<Record<QuickFilterType, number>>;
  className?: string;
}

export const QuickFilterBar: React.FC<QuickFilterBarProps> = ({
  activeFilter,
  onSelectFilter,
  counts = {},
  className = '',
}) => {
  const options: QuickFilterOption[] = [
    {
      id: 'all',
      label: 'TODOS',
      icon: <Layers className="w-3.5 h-3.5" />,
      count: counts.all,
    },
    {
      id: 'hoje',
      label: 'HOJE',
      icon: <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
      count: counts.hoje,
      colorVariant: 'sky',
    },
    {
      id: 'atrasados',
      label: 'ATRASADOS',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />,
      count: counts.atrasados,
      colorVariant: 'rose',
    },
    {
      id: 'prioridade_maxima',
      label: 'PRIORIDADE MÁXIMA',
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
      count: counts.prioridade_maxima,
      colorVariant: 'amber',
    },
    {
      id: 'quentes',
      label: 'QUENTES',
      icon: <Flame className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 fill-current" />,
      count: counts.quentes,
      colorVariant: 'amber',
    },
    {
      id: 'sem_resposta',
      label: 'SEM RESPOSTA',
      icon: <Clock className="w-3.5 h-3.5 text-[#5F6368] dark:text-[#9AA0A6]" />,
      count: counts.sem_resposta,
    },
    {
      id: 'follow_up',
      label: 'FOLLOW-UP',
      icon: <MessageSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />,
      count: counts.follow_up,
      colorVariant: 'indigo',
    },
    {
      id: 'reativacao',
      label: 'REATIVAÇÃO (30d+)',
      icon: <RotateCcw className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />,
      count: counts.reativacao,
      colorVariant: 'emerald',
    },
    {
      id: 'propostas',
      label: 'PROPOSTAS',
      icon: <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />,
      count: counts.propostas,
      colorVariant: 'purple',
    },
    {
      id: 'reunioes',
      label: 'REUNIÕES',
      icon: <Video className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />,
      count: counts.reunioes,
      colorVariant: 'sky',
    },
  ];

  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs ${className}`}>
      {options.map((opt) => {
        const isActive = activeFilter === opt.id;
        const count = opt.count;

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelectFilter(opt.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 border text-xs ${
              isActive
                ? 'bg-blue-50 dark:bg-blue-950/50 text-[#3F6FB5] dark:text-blue-300 border-blue-200 dark:border-blue-800/60 shadow-xs'
                : 'bg-white dark:bg-[#1E2228] text-[#5F6368] dark:text-[#9AA0A6] border-[#E6E8EB] dark:border-[#2D3139] hover:text-[#202124] dark:hover:text-[#E8EAED] hover:bg-neutral-50 dark:hover:bg-[#252A32]'
            }`}
          >
            {opt.icon}
            <span>{opt.label}</span>
            {count !== undefined && count > 0 && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-semibold ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/60 text-[#3F6FB5] dark:text-blue-200'
                    : 'bg-[#F7F8FA] dark:bg-[#20242A] text-[#5F6368] dark:text-[#9AA0A6]'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

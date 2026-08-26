import React from 'react';
import {
  Sparkles,
  RefreshCw,
  MessageSquare,
  TrendingUp,
  Edit3,
  FileText,
  Zap,
} from 'lucide-react';
import { CopilotActionType } from '../../types';

interface CopilotActionButtonsProps {
  onSelectAction: (action: CopilotActionType) => void;
  className?: string;
  size?: 'sm' | 'xs';
}

export const CopilotActionButtons: React.FC<CopilotActionButtonsProps> = ({
  onSelectAction,
  className = '',
  size = 'xs',
}) => {
  const actions: Array<{ id: CopilotActionType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'PERSONALIZAR', label: 'Personalizar', icon: Sparkles },
    { id: 'GERAR_FOLLOWUP', label: 'Gerar Follow-up', icon: RefreshCw },
    { id: 'ANALISAR_RESPOSTA', label: 'Analisar Resposta', icon: MessageSquare },
    { id: 'SUGERIR_SERVICO', label: 'Sugerir Serviço', icon: TrendingUp },
    { id: 'MELHORAR', label: 'Melhorar', icon: Edit3 },
    { id: 'RESUMIR', label: 'Resumir', icon: FileText },
    { id: 'PROXIMA_ACAO', label: 'Próxima Ação', icon: Zap },
  ];

  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
      <span className="text-[11px] font-bold text-neutral-400 flex items-center gap-1 mr-1">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
        Copiloto:
      </span>
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <button
            key={act.id}
            type="button"
            onClick={() => onSelectAction(act.id)}
            className={`inline-flex items-center gap-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-emerald-400 font-medium transition-colors cursor-pointer ${
              size === 'xs' ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs'
            }`}
          >
            <Icon className="w-3 h-3 text-emerald-400" />
            <span>[{act.label}]</span>
          </button>
        );
      })}
    </div>
  );
};

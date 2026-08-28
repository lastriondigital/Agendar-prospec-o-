import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
} from 'lucide-react';
import { MessageAuditResult } from '../../types';
import { Badge } from '../ui/Badge';

interface MessageAuditCardProps {
  audit: MessageAuditResult;
  onEditLead?: () => void;
  compact?: boolean;
}

export const MessageAuditCard: React.FC<MessageAuditCardProps> = ({
  audit,
  onEditLead,
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact);

  const getStatusBadge = () => {
    switch (audit.status) {
      case 'approved':
        return (
          <Badge variant="emerald" size="sm" className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Auditada & Aprovada
          </Badge>
        );
      case 'has_warnings':
        return (
          <Badge variant="amber" size="sm" className="flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> {audit.score}% - Com Avisos
          </Badge>
        );
      case 'incomplete':
      default:
        return (
          <Badge variant="rose" size="sm" className="flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> {audit.score}% - Incompleta
          </Badge>
        );
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        audit.status === 'approved'
          ? 'bg-emerald-950/20 border-emerald-500/30'
          : audit.status === 'has_warnings'
          ? 'bg-amber-950/20 border-amber-500/30'
          : 'bg-rose-950/20 border-rose-500/30'
      }`}
    >
      {/* Header do Card de Auditoria */}
      <div
        className="p-3.5 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              audit.status === 'approved'
                ? 'bg-emerald-500/20 text-emerald-400'
                : audit.status === 'has_warnings'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-100 uppercase tracking-wide">
                Auditoria Pré-Envio
              </span>
              {getStatusBadge()}
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              {audit.status === 'approved'
                ? 'Mensagem pronta para envio: sem invenções e com dados confirmados.'
                : 'Verifique as informações ausentes antes de enviar para garantir máxima relevância.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="text-neutral-400 hover:text-neutral-200 p-1 rounded-lg hover:bg-neutral-800/60"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Alerta de Campos Faltantes */}
      {audit.missingFields.length > 0 && (
        <div className="px-3.5 pb-2">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-amber-200">
                Há informações insuficientes para personalizar completamente esta mensagem:
              </span>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {audit.missingFields.map((field) => (
                  <span
                    key={field}
                    className="bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-2 py-0.5 rounded"
                  >
                    Falta: {field}
                  </span>
                ))}
              </div>
            </div>
            {onEditLead && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditLead();
                }}
                className="text-[11px] font-semibold underline text-amber-400 hover:text-amber-300 shrink-0 self-center ml-2"
              >
                Completar Lead
              </button>
            )}
          </div>
        </div>
      )}

      {/* Checklist Detalhado Expansível */}
      {isExpanded && (
        <div className="px-3.5 pb-3.5 pt-1 border-t border-neutral-800/80 space-y-1.5 mt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {audit.items.map((item) => (
              <div
                key={item.id}
                className={`p-2 rounded-lg border flex items-start gap-2 ${
                  item.status === 'valid'
                    ? 'bg-neutral-900/40 border-neutral-800/80 text-neutral-300'
                    : item.status === 'warning'
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                    : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                }`}
              >
                {item.status === 'valid' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : item.status === 'warning' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[11px] flex items-center justify-between">
                    <span>{item.label}</span>
                    <span className="text-[10px] text-neutral-400">
                      {item.passed ? '✓ Validado' : '⚠️ Pendente'}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{item.message}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" /> Diretriz Anti-Invenção Ativa: Apenas dados confirmados
            </span>
            <span>Score: {audit.score}/100</span>
          </div>
        </div>
      )}
    </div>
  );
};

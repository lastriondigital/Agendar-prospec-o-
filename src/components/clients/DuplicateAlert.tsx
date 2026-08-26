import React from 'react';
import { AlertTriangle, ExternalLink, RefreshCw, PlusCircle } from 'lucide-react';
import { DuplicateMatch } from '../../types';
import { STAGES_CONFIG } from '../../utils/constants';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatPhoneNumber } from '../../utils/formatting';

interface DuplicateAlertProps {
  matches: DuplicateMatch[];
  onOpenExisting: (companyId: string) => void;
  onUpdateExisting: (companyId: string) => void;
  onProceedAnyway: () => void;
}

export const DuplicateAlert: React.FC<DuplicateAlertProps> = ({
  matches,
  onOpenExisting,
  onUpdateExisting,
  onProceedAnyway,
}) => {
  if (!matches || matches.length === 0) return null;

  const firstMatch = matches[0];
  const { company, contact, lead, reason, matchedField, matchedValue } = firstMatch;
  const stageDef = lead?.stage ? STAGES_CONFIG[lead.stage] : null;

  return (
    <div
      id="duplicate-warning-box"
      className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-slate-200 mb-5 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
            <h4 className="text-sm font-semibold text-amber-300">
              Aviso Anti-Duplicação: Este contacto já parece estar registrado.
            </h4>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
              {matchedField}: {matchedValue}
            </span>
          </div>

          <p className="text-xs text-slate-300 mb-3">{reason}</p>

          {/* Dados do cadastro existente encontrado */}
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700/60 space-y-2 mb-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block text-[11px]">Empresa:</span>
                <span className="font-medium text-slate-100">{company.name}</span>
                {company.tradeName && (
                  <span className="text-slate-400 text-[11px] block">({company.tradeName})</span>
                )}
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Nome do Contacto:</span>
                <span className="font-medium text-slate-100">
                  {contact?.name || 'Não especificado'}
                </span>
                {contact?.role && (
                  <span className="text-slate-400 text-[11px] block">{contact.role}</span>
                )}
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Telefone / WhatsApp:</span>
                <span className="font-mono text-slate-200">
                  {contact?.whatsapp ? formatPhoneNumber(contact.whatsapp) : contact?.phone ? formatPhoneNumber(contact.phone) : '—'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Último Contacto:</span>
                <span className="text-slate-200">
                  {lead?.lastContactDate || 'Nenhum contacto registrado'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">Estágio:</span>
                {stageDef ? (
                  <Badge variant={stageDef.badgeVariant} size="sm">
                    {stageDef.label}
                  </Badge>
                ) : (
                  <Badge variant="neutral" size="sm">
                    {lead?.stage || 'NOVO'}
                  </Badge>
                )}
              </div>

              {lead?.serviceName && (
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px]">Serviço:</span>
                  <span className="text-slate-200 font-medium">{lead.serviceName}</span>
                </div>
              )}
            </div>
          </div>

          {/* 3 Botões de Ação Exigidos */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenExisting(company.id)}
              className="border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Abrir existente
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onUpdateExisting(company.id)}
              className="border-slate-600 text-slate-200 hover:bg-slate-800"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Atualizar existente
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onProceedAnyway}
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            >
              Criar mesmo assim
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

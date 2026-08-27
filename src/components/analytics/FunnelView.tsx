import React from 'react';
import {
  Users,
  Send,
  MessageSquare,
  Flame,
  CalendarCheck,
  FileSpreadsheet,
  Trophy,
  ArrowDown,
  TrendingDown,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { FunnelStepData } from '../../types';
import { Card } from '../ui/Card';

interface FunnelViewProps {
  funnelSteps: FunnelStepData[];
}

export const FunnelView: React.FC<FunnelViewProps> = ({ funnelSteps }) => {
  const stepIcons: Record<string, React.ReactNode> = {
    leads: <Users className="w-4 h-4 text-[#3F6FB5]" />,
    contacted: <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
    responses: <MessageSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />,
    interested: <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
    meetings: <CalendarCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
    proposals: <FileSpreadsheet className="w-4 h-4 text-fuchsia-600 dark:text-fuchsia-400" />,
    clients: <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
  };

  const topCount = funnelSteps.length > 0 ? Math.max(1, funnelSteps[0].count) : 1;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#202124] dark:text-[#E8EAED] flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-[#3F6FB5] dark:text-blue-400" />
            Funil de Conversão Comercial (7 Estágios)
          </h3>
          <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] mt-0.5">
            Acompanhe o fluxo linear e a retenção de prospects desde a prospecção inicial até o fechamento contratual.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] px-3 py-1.5 rounded-lg text-xs shadow-xs">
          <span className="text-[#5F6368] dark:text-[#9AA0A6]">Eficiência Geral do Topo ao Fundo:</span>
          <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">
            {funnelSteps[funnelSteps.length - 1]?.conversionFromTop || 0}%
          </span>
        </div>
      </div>

      {/* Visual Funnel Stack */}
      <div className="space-y-2.5">
        {funnelSteps.map((step, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === funnelSteps.length - 1;
          const widthPercent = Math.max(12, Math.min(100, Math.round((step.count / topCount) * 100)));

          return (
            <React.Fragment key={step.id}>
              {/* Funnel Step Card */}
              <div
                id={`funnel-step-${step.id}`}
                className={`bg-white dark:bg-[#181B20] border ${
                  isLast
                    ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-[#E6E8EB] dark:border-[#2D3139]'
                } rounded-xl p-4 transition-colors shadow-xs hover:border-[#DADDE1]`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139]">
                      {stepIcons[step.id] || <Info className="w-4 h-4 text-[#80868B]" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#202124] dark:text-[#E8EAED]">{step.label}</span>
                        {isLast && (
                          <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                            Meta Final
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">{step.subDescription}</p>
                    </div>
                  </div>

                  {/* Numbers & Rates Badge Group */}
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-xl font-extrabold font-mono text-[#202124] dark:text-[#E8EAED]">
                        {step.count}
                      </span>
                      <span className="text-xs text-[#80868B] ml-1">prospects</span>
                    </div>

                    <div className="border-l border-[#ECEEF1] dark:border-[#2D3139] pl-3.5 space-y-0.5">
                      <div className="text-xs font-semibold text-[#202124] dark:text-[#E8EAED] flex items-center justify-end gap-1.5">
                        <span className="text-[#80868B] text-[11px]">Passagem:</span>
                        <span
                          className={`font-mono font-bold ${
                            isFirst
                              ? 'text-[#80868B]'
                              : step.conversionFromPrev >= 50
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : step.conversionFromPrev >= 25
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          {step.conversionFromPrev}%
                        </span>
                      </div>
                      <div className="text-[10px] text-[#80868B] font-mono">
                        {step.conversionFromTop}% do topo
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="space-y-1">
                  <div className="w-full h-2.5 bg-[#F7F8FA] dark:bg-[#1E2228] rounded-full overflow-hidden p-0.5 border border-[#E6E8EB] dark:border-[#2D3139] flex items-center">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLast ? 'bg-emerald-500' : 'bg-[#3F6FB5] dark:bg-blue-400'
                      }`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Inter-step Dropoff Indicator */}
              {!isLast && (
                <div className="flex items-center justify-center my-0.5">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] text-[11px] text-[#5F6368] dark:text-[#9AA0A6] shadow-xs">
                    <ArrowDown className="w-3 h-3 text-[#80868B]" />
                    <span>
                      Retenção:{' '}
                      <strong className="text-[#202124] dark:text-[#E8EAED] font-mono">
                        {funnelSteps[idx + 1]?.conversionFromPrev || 0}%
                      </strong>
                    </span>
                    {funnelSteps[idx + 1]?.dropOffCount > 0 && (
                      <span className="text-rose-700 dark:text-rose-400 font-mono">
                        ({funnelSteps[idx + 1].dropOffCount} perdas nesta etapa)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Diagnostic & Funnel Insights Card */}
      <Card padding="md" className="space-y-3">
        <h4 className="text-xs font-bold text-[#202124] dark:text-[#E8EAED] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Análise de Passagem e Retenção do Funil
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-1">
            <span className="text-[#5F6368] dark:text-[#9AA0A6] text-[11px]">Topo → Resposta</span>
            <div className="text-base font-bold font-mono text-teal-700 dark:text-teal-400">
              {funnelSteps[2]?.conversionFromTop || 0}%
            </div>
            <p className="text-[10px] text-[#80868B]">
              Percentual dos leads adicionados que geraram ao menos uma resposta.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-1">
            <span className="text-[#5F6368] dark:text-[#9AA0A6] text-[11px]">Resposta → Reunião</span>
            <div className="text-base font-bold font-mono text-purple-700 dark:text-purple-400">
              {funnelSteps[2]?.count > 0
                ? Math.round(((funnelSteps[4]?.count || 0) / funnelSteps[2].count) * 1000) / 10
                : 0}
              %
            </div>
            <p className="text-[10px] text-[#80868B]">
              Eficiência na qualificação e agendamento a partir de contatos responsivos.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-1">
            <span className="text-[#5F6368] dark:text-[#9AA0A6] text-[11px]">Reunião → Cliente</span>
            <div className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-400">
              {funnelSteps[4]?.count > 0
                ? Math.round(((funnelSteps[6]?.count || 0) / funnelSteps[4].count) * 1000) / 10
                : 0}
              %
            </div>
            <p className="text-[10px] text-[#80868B]">
              Conversão de fechamento para prospects que participaram de reuniões.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

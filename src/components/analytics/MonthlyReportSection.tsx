import React from 'react';
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { PeriodComparisonReport } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface MonthlyReportSectionProps {
  report: PeriodComparisonReport;
}

export const MonthlyReportSection: React.FC<MonthlyReportSectionProps> = ({ report }) => {
  const {
    currentPeriodLabel,
    previousPeriodLabel,
    improvementsList,
    worsenedList,
    recommendations,
    deltas,
  } = report;

  return (
    <div className="space-y-6">
      {/* Report Header Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              Relatório Comparativo de Performance ({currentPeriodLabel})
            </h3>
            <p className="text-xs text-neutral-400">
              Análise delta entre <strong>{currentPeriodLabel}</strong> e <strong>{previousPeriodLabel}</strong>, destacando métricas em evolução e constatações empíricas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="neutral" className="text-xs">
              Base: {previousPeriodLabel}
            </Badge>
            <Badge variant="emerald" className="text-xs">
              Atual: {currentPeriodLabel}
            </Badge>
          </div>
        </div>

        {/* Quick Delta Summary Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          {/* Adicionados Delta */}
          <div className="bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800 text-xs space-y-0.5">
            <span className="text-neutral-500 text-[11px]">Prospects Adicionados</span>
            <div className="flex items-baseline justify-between">
              <span className="font-bold text-neutral-200 font-mono">
                {deltas.prospectsAdicionados.currentValue}
              </span>
              <span
                className={`font-mono text-[11px] font-bold ${
                  deltas.prospectsAdicionados.percentChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {deltas.prospectsAdicionados.percentChange >= 0 ? '+' : ''}
                {deltas.prospectsAdicionados.percentChange}%
              </span>
            </div>
          </div>

          {/* Respostas Delta */}
          <div className="bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800 text-xs space-y-0.5">
            <span className="text-neutral-500 text-[11px]">Taxa de Resposta</span>
            <div className="flex items-baseline justify-between">
              <span className="font-bold text-cyan-400 font-mono">
                {deltas.taxaResposta.currentValue}%
              </span>
              <span
                className={`font-mono text-[11px] font-bold ${
                  deltas.taxaResposta.absoluteChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {deltas.taxaResposta.absoluteChange >= 0 ? '+' : ''}
                {deltas.taxaResposta.absoluteChange} pp
              </span>
            </div>
          </div>

          {/* Reuniões Delta */}
          <div className="bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800 text-xs space-y-0.5">
            <span className="text-neutral-500 text-[11px]">Reuniões Agendadas</span>
            <div className="flex items-baseline justify-between">
              <span className="font-bold text-purple-400 font-mono">
                {deltas.reunioes.currentValue}
              </span>
              <span
                className={`font-mono text-[11px] font-bold ${
                  deltas.reunioes.percentChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {deltas.reunioes.percentChange >= 0 ? '+' : ''}
                {deltas.reunioes.percentChange}%
              </span>
            </div>
          </div>

          {/* Clientes Delta */}
          <div className="bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800 text-xs space-y-0.5">
            <span className="text-neutral-500 text-[11px]">Clientes Fechados</span>
            <div className="flex items-baseline justify-between">
              <span className="font-bold text-emerald-400 font-mono">
                {deltas.clientes.currentValue}
              </span>
              <span
                className={`font-mono text-[11px] font-bold ${
                  deltas.clientes.percentChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {deltas.clientes.percentChange >= 0 ? '+' : ''}
                {deltas.clientes.percentChange}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column: O que Melhorou vs O que Piorou */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* O QUE MELHOROU */}
        <Card padding="md" className="bg-neutral-900 border-neutral-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-400 border-b border-neutral-800 pb-2.5">
            <TrendingUp className="w-4 h-4" />
            <span>O que Melhorou no Período</span>
          </div>

          {improvementsList.length === 0 ? (
            <div className="py-6 text-center text-xs text-neutral-500">
              Nenhuma métrica com avanço positivo registrado em relação ao período anterior.
            </div>
          ) : (
            <div className="space-y-2.5">
              {improvementsList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-neutral-950/70 border border-emerald-900/30 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-neutral-200">{item.metric}</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold text-[11px]">
                    {item.detail}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* O QUE PIOROU / ATENÇÃO */}
        <Card padding="md" className="bg-neutral-900 border-neutral-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-rose-400 border-b border-neutral-800 pb-2.5">
            <TrendingDown className="w-4 h-4" />
            <span>O que Piorou / Pontos de Atenção</span>
          </div>

          {worsenedList.length === 0 ? (
            <div className="py-6 text-center text-xs text-neutral-500">
              Nenhuma métrica com recuo relevante em relação ao período anterior.
            </div>
          ) : (
            <div className="space-y-2.5">
              {worsenedList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-neutral-950/70 border border-rose-900/30 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="font-semibold text-neutral-200">{item.metric}</span>
                  </div>
                  <span className="font-mono text-rose-400 font-bold text-[11px]">
                    {item.detail}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* RECOMENDAÇÕES BASEADAS SOMENTE NOS DADOS EXISTENTES */}
      <Card padding="md" className="bg-neutral-900 border-neutral-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-100">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Recomendações Baseadas SOMENTE nos Dados Existentes</span>
          </div>
          <span className="text-[11px] text-neutral-400 bg-neutral-950 px-2.5 py-1 rounded-full border border-neutral-800">
            Sem inferências causais não comprovadas
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div className="py-6 text-center text-xs text-neutral-500">
            Cadastre mais leads e interações para gerar fatos e recomendações empíricas automáticas.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                id={`recommendation-card-${rec.id}`}
                className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2 hover:border-neutral-700/80 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-200">{rec.title}</span>
                  <Badge
                    variant={
                      rec.impactLevel === 'alto'
                        ? 'amber'
                        : rec.impactLevel === 'medio'
                        ? 'blue'
                        : 'neutral'
                    }
                    className="text-[10px]"
                  >
                    {rec.badgeLabel}
                  </Badge>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">{rec.description}</p>

                <div className="p-2 rounded bg-neutral-900 border border-neutral-800/80 text-[11px] text-neutral-300 font-mono flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Fato dos Dados:</strong> {rec.dataFact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

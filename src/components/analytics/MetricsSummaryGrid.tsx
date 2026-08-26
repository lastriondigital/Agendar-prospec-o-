import React from 'react';
import {
  Users,
  Send,
  MessageSquare,
  ThumbsUp,
  Flame,
  CalendarCheck,
  FileSpreadsheet,
  Trophy,
  UserX,
  RotateCcw,
  Clock,
  Percent,
  TrendingUp,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { AnalyticsMetrics } from '../../types';
import { Card } from '../ui/Card';

interface MetricsSummaryGridProps {
  metrics: AnalyticsMetrics;
}

export const MetricsSummaryGrid: React.FC<MetricsSummaryGridProps> = ({ metrics }) => {
  return (
    <div className="space-y-6">
      {/* 1. Taxas Chave & Tempo Médio (Top Highlight Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Taxa de Contato */}
        <Card padding="md" className="bg-neutral-900 border-neutral-800 space-y-1.5 hover:border-neutral-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Taxa de Contacto</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Send className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-neutral-100 font-mono">
              {metrics.taxaContacto}%
            </span>
            <span className="text-[11px] text-neutral-500">dos adicionados</span>
          </div>
          <p className="text-[11px] text-neutral-400">
            {metrics.prospectsContactados} de {metrics.prospectsAdicionados} prospects
          </p>
        </Card>

        {/* Taxa de Resposta */}
        <Card padding="md" className="bg-neutral-900 border-neutral-800 space-y-1.5 hover:border-neutral-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Taxa de Resposta</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">
              {metrics.taxaResposta}%
            </span>
            <span className="text-[11px] text-neutral-500">dos contactados</span>
          </div>
          <p className="text-[11px] text-neutral-400">
            {metrics.respostas} respostas ({metrics.taxaRespostaPositiva}% positivas)
          </p>
        </Card>

        {/* Taxa de Conversão Final */}
        <Card padding="md" className="bg-neutral-900 border-neutral-800 space-y-1.5 hover:border-neutral-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Taxa de Conversão</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Trophy className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
              {metrics.taxaConversao}%
            </span>
            <span className="text-[11px] text-neutral-500">da base</span>
          </div>
          <p className="text-[11px] text-neutral-400">
            {metrics.clientes} clientes fechados
          </p>
        </Card>

        {/* Tempo Médio */}
        <Card padding="md" className="bg-neutral-900 border-neutral-800 space-y-1.5 hover:border-neutral-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Tempos Médios</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
              {metrics.tempoMedioAteRespostaFormatado}
            </span>
            <span className="text-[11px] text-neutral-500">até resposta</span>
          </div>
          <p className="text-[11px] text-neutral-400">
            {metrics.tempoMedioAteConversaoFormatado} até fechar cliente
          </p>
        </Card>
      </div>

      {/* 2. Grid com os 11 Contadores Brutos Oficiais */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Contadores Brutos do Período (11 Métricas)
          </h3>
          <span className="text-[11px] text-neutral-500">Dados empíricos locais</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Prospects Adicionados */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span className="font-medium">Adicionados</span>
              <Users className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-xl font-extrabold font-mono text-neutral-100">
              {metrics.prospectsAdicionados}
            </div>
            <div className="text-[10px] text-neutral-500 truncate">Leads novos na base</div>
          </div>

          {/* 2. Prospects Contactados */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span className="font-medium">Contactados</span>
              <Send className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-extrabold font-mono text-blue-400">
              {metrics.prospectsContactados}
            </div>
            <div className="text-[10px] text-neutral-500 truncate">{metrics.taxaContacto}% do total</div>
          </div>

          {/* 3. Mensagens Enviadas */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span className="font-medium">Mensagens</span>
              <Send className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-xl font-extrabold font-mono text-neutral-100">
              {metrics.mensagensEnviadas}
            </div>
            <div className="text-[10px] text-neutral-500 truncate">Total de disparos</div>
          </div>

          {/* 4. Respostas */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span className="font-medium">Respostas</span>
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-extrabold font-mono text-cyan-400">
              {metrics.respostas}
            </div>
            <div className="text-[10px] text-neutral-500 truncate">{metrics.taxaResposta}% de resposta</div>
          </div>

          {/* 5. Respostas Positivas */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span className="font-medium">Resp. Positivas</span>
              <ThumbsUp className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div className="text-xl font-extrabold font-mono text-teal-400">
              {metrics.respostasPositivas}
            </div>
            <div className="text-[10px] text-neutral-500 truncate">{metrics.taxaRespostaPositiva}% das respostas</div>
          </div>

          {/* 6. Interessados */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span className="font-medium">Interessados</span>
              <Flame className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-extrabold font-mono text-amber-400">
              {metrics.interessados}
            </div>
            <div className="text-[10px] text-neutral-500 truncate">Em qualificação ativa</div>
          </div>

          {/* 7. Reuniões */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span className="font-medium">Reuniões</span>
              <CalendarCheck className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl font-extrabold font-mono text-purple-400">
              {metrics.reunioes}
            </div>
            <div className="text-[10px] text-neutral-500 truncate">{metrics.taxaReuniao}% dos interessados</div>
          </div>

          {/* 8. Propostas */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span className="font-medium">Propostas</span>
              <FileSpreadsheet className="w-3.5 h-3.5 text-fuchsia-400" />
            </div>
            <div className="text-xl font-extrabold font-mono text-fuchsia-400">
              {metrics.propostas}
            </div>
            <div className="text-[10px] text-neutral-500 truncate">{metrics.taxaProposta}% das reuniões</div>
          </div>

          {/* 9. Clientes Fechados */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5 space-y-1 bg-emerald-950/20 border-emerald-900/40">
            <div className="flex items-center justify-between text-emerald-400 text-xs">
              <span className="font-bold">Clientes</span>
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-extrabold font-mono text-emerald-400">
              {metrics.clientes}
            </div>
            <div className="text-[10px] text-emerald-500/80 truncate">Ganhos / Faturados</div>
          </div>

          {/* 10. Perdidos */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span className="font-medium">Perdidos</span>
              <UserX className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-xl font-extrabold font-mono text-rose-400">
              {metrics.perdidos}
            </div>
            <div className="text-[10px] text-neutral-500 truncate">Sem fechamento</div>
          </div>

          {/* 11. Reativações */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span className="font-medium">Reativações</span>
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-xl font-extrabold font-mono text-indigo-400">
              {metrics.reativacoes}
            </div>
            <div className="text-[10px] text-neutral-500 truncate">Leads reengajados</div>
          </div>

          {/* Resumo de Eficiência Comercial */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span className="font-medium">Conversão/Cont.</span>
              <Percent className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-extrabold font-mono text-emerald-300">
              {metrics.taxaConversaoSobreContactados}%
            </div>
            <div className="text-[10px] text-neutral-500 truncate">Clientes/Contactados</div>
          </div>
        </div>
      </div>

      {/* 3. Tabela Resumo de Taxas Calculadas */}
      <Card padding="md" className="bg-neutral-900 border-neutral-800 space-y-3">
        <h4 className="text-xs font-bold text-neutral-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          Quadro Consolidado de Taxas de Conversão Intermediárias
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800 space-y-1">
            <span className="text-neutral-400 text-[11px]">Taxa de Contacto</span>
            <div className="text-lg font-bold font-mono text-neutral-200">{metrics.taxaContacto}%</div>
            <span className="text-[10px] text-neutral-500">Contactados / Adicionados</span>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800 space-y-1">
            <span className="text-neutral-400 text-[11px]">Taxa de Resposta</span>
            <div className="text-lg font-bold font-mono text-cyan-400">{metrics.taxaResposta}%</div>
            <span className="text-[10px] text-neutral-500">Respostas / Contactados</span>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800 space-y-1">
            <span className="text-neutral-400 text-[11px]">Resp. Positiva</span>
            <div className="text-lg font-bold font-mono text-teal-400">{metrics.taxaRespostaPositiva}%</div>
            <span className="text-[10px] text-neutral-500">Positivas / Respostas</span>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800 space-y-1">
            <span className="text-neutral-400 text-[11px]">Taxa de Reunião</span>
            <div className="text-lg font-bold font-mono text-purple-400">{metrics.taxaReuniao}%</div>
            <span className="text-[10px] text-neutral-500">Reuniões / Interessados</span>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800 space-y-1">
            <span className="text-neutral-400 text-[11px]">Taxa de Proposta</span>
            <div className="text-lg font-bold font-mono text-fuchsia-400">{metrics.taxaProposta}%</div>
            <span className="text-[10px] text-neutral-500">Propostas / Reuniões</span>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800 space-y-1">
            <span className="text-neutral-400 text-[11px]">Taxa de Conversão</span>
            <div className="text-lg font-bold font-mono text-emerald-400">{metrics.taxaConversao}%</div>
            <span className="text-[10px] text-neutral-500">Clientes / Adicionados</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

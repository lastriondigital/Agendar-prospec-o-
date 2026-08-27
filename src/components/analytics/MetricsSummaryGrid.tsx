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
        <Card padding="md" className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5F6368] dark:text-[#9AA0A6]">Taxa de Contacto</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#3F6FB5] dark:text-blue-300">
              <Send className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#202124] dark:text-[#E8EAED] font-mono">
              {metrics.taxaContacto}%
            </span>
            <span className="text-[11px] text-[#80868B]">dos adicionados</span>
          </div>
          <p className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">
            {metrics.prospectsContactados} de {metrics.prospectsAdicionados} prospects
          </p>
        </Card>

        {/* Taxa de Resposta */}
        <Card padding="md" className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5F6368] dark:text-[#9AA0A6]">Taxa de Resposta</span>
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-teal-700 dark:text-teal-400 font-mono">
              {metrics.taxaResposta}%
            </span>
            <span className="text-[11px] text-[#80868B]">dos contactados</span>
          </div>
          <p className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">
            {metrics.respostas} respostas ({metrics.taxaRespostaPositiva}% positivas)
          </p>
        </Card>

        {/* Taxa de Conversão Final */}
        <Card padding="md" className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5F6368] dark:text-[#9AA0A6]">Taxa de Conversão</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
              <Trophy className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
              {metrics.taxaConversao}%
            </span>
            <span className="text-[11px] text-[#80868B]">da base</span>
          </div>
          <p className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">
            {metrics.clientes} clientes fechados
          </p>
        </Card>

        {/* Tempo Médio */}
        <Card padding="md" className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5F6368] dark:text-[#9AA0A6]">Tempos Médios</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 dark:text-amber-400 font-mono">
              {metrics.tempoMedioAteRespostaFormatado}
            </span>
            <span className="text-[11px] text-[#80868B]">até resposta</span>
          </div>
          <p className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">
            {metrics.tempoMedioAteConversaoFormatado} até fechar cliente
          </p>
        </Card>
      </div>

      {/* 2. Grid com os 11 Contadores Brutos Oficiais */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#5F6368] dark:text-[#9AA0A6] flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#3F6FB5] dark:text-blue-400" />
            Contadores Brutos do Período (11 Métricas)
          </h3>
          <span className="text-[11px] text-[#80868B]">Dados empíricos locais</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Prospects Adicionados */}
          <div className="bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] rounded-xl p-3.5 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-[#5F6368] dark:text-[#9AA0A6] text-xs">
              <span className="font-medium">Adicionados</span>
              <Users className="w-3.5 h-3.5 text-[#3F6FB5]" />
            </div>
            <div className="text-xl font-extrabold font-mono text-[#202124] dark:text-[#E8EAED]">
              {metrics.prospectsAdicionados}
            </div>
            <div className="text-[10px] text-[#80868B] truncate">Leads novos na base</div>
          </div>

          {/* 2. Prospects Contactados */}
          <div className="bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] rounded-xl p-3.5 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-[#5F6368] dark:text-[#9AA0A6] text-xs">
              <span className="font-medium">Contactados</span>
              <Send className="w-3.5 h-3.5 text-[#3F6FB5]" />
            </div>
            <div className="text-xl font-extrabold font-mono text-[#3F6FB5] dark:text-blue-400">
              {metrics.prospectsContactados}
            </div>
            <div className="text-[10px] text-[#80868B] truncate">{metrics.taxaContacto}% do total</div>
          </div>

          {/* 3. Mensagens Enviadas */}
          <div className="bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] rounded-xl p-3.5 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-[#5F6368] dark:text-[#9AA0A6] text-xs">
              <span className="font-medium">Mensagens</span>
              <Send className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            </div>
            <div className="text-xl font-extrabold font-mono text-[#202124] dark:text-[#E8EAED]">
              {metrics.mensagensEnviadas}
            </div>
            <div className="text-[10px] text-[#80868B] truncate">Total de disparos</div>
          </div>

          {/* 4. Respostas */}
          <div className="bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] rounded-xl p-3.5 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-[#5F6368] dark:text-[#9AA0A6] text-xs">
              <span className="font-medium">Respostas</span>
              <MessageSquare className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="text-xl font-extrabold font-mono text-teal-700 dark:text-teal-400">
              {metrics.respostas}
            </div>
            <div className="text-[10px] text-[#80868B] truncate">{metrics.taxaResposta}% de resposta</div>
          </div>

          {/* 5. Respostas Positivas */}
          <div className="bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] rounded-xl p-3.5 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-[#5F6368] dark:text-[#9AA0A6] text-xs">
              <span className="font-medium">Resp. Positivas</span>
              <ThumbsUp className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="text-xl font-extrabold font-mono text-teal-700 dark:text-teal-400">
              {metrics.respostasPositivas}
            </div>
            <div className="text-[10px] text-[#80868B] truncate">{metrics.taxaRespostaPositiva}% das respostas</div>
          </div>

          {/* 6. Interessados */}
          <div className="bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] rounded-xl p-3.5 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-[#5F6368] dark:text-[#9AA0A6] text-xs">
              <span className="font-medium">Interessados</span>
              <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-xl font-extrabold font-mono text-amber-700 dark:text-amber-400">
              {metrics.interessados}
            </div>
            <div className="text-[10px] text-[#80868B] truncate">Em qualificação ativa</div>
          </div>

          {/* 7. Reuniões */}
          <div className="bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] rounded-xl p-3.5 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-[#5F6368] dark:text-[#9AA0A6] text-xs">
              <span className="font-medium">Reuniões</span>
              <CalendarCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-xl font-extrabold font-mono text-purple-700 dark:text-purple-400">
              {metrics.reunioes}
            </div>
            <div className="text-[10px] text-[#80868B] truncate">{metrics.taxaReuniao}% dos interessados</div>
          </div>

          {/* 8. Propostas */}
          <div className="bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] rounded-xl p-3.5 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-[#5F6368] dark:text-[#9AA0A6] text-xs">
              <span className="font-medium">Propostas</span>
              <FileSpreadsheet className="w-3.5 h-3.5 text-fuchsia-600 dark:text-fuchsia-400" />
            </div>
            <div className="text-xl font-extrabold font-mono text-fuchsia-700 dark:text-fuchsia-400">
              {metrics.propostas}
            </div>
            <div className="text-[10px] text-[#80868B] truncate">{metrics.taxaProposta}% das reuniões</div>
          </div>

          {/* 9. Clientes Fechados */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-3.5 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-xs">
              <span className="font-bold">Clientes</span>
              <Trophy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
              {metrics.clientes}
            </div>
            <div className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 truncate">Ganhos / Faturados</div>
          </div>

          {/* 10. Perdidos */}
          <div className="bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] rounded-xl p-3.5 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-[#5F6368] dark:text-[#9AA0A6] text-xs">
              <span className="font-medium">Perdidos</span>
              <UserX className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="text-xl font-extrabold font-mono text-rose-700 dark:text-rose-400">
              {metrics.perdidos}
            </div>
            <div className="text-[10px] text-[#80868B] truncate">Sem fechamento</div>
          </div>

          {/* 11. Reativações */}
          <div className="bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] rounded-xl p-3.5 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-[#5F6368] dark:text-[#9AA0A6] text-xs">
              <span className="font-medium">Reativações</span>
              <RotateCcw className="w-3.5 h-3.5 text-[#3F6FB5]" />
            </div>
            <div className="text-xl font-extrabold font-mono text-[#3F6FB5] dark:text-blue-400">
              {metrics.reativacoes}
            </div>
            <div className="text-[10px] text-[#80868B] truncate">Leads reengajados</div>
          </div>

          {/* Resumo de Eficiência Comercial */}
          <div className="bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] rounded-xl p-3.5 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-[#5F6368] dark:text-[#9AA0A6] text-xs">
              <span className="font-medium">Conversão/Cont.</span>
              <Percent className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
              {metrics.taxaConversaoSobreContactados}%
            </div>
            <div className="text-[10px] text-[#80868B] truncate">Clientes/Contactados</div>
          </div>
        </div>
      </div>

      {/* 3. Tabela Resumo de Taxas Calculadas */}
      <Card padding="md" className="space-y-3">
        <h4 className="text-xs font-bold text-[#202124] dark:text-[#E8EAED] flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Quadro Consolidado de Taxas de Conversão Intermediárias
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-1">
            <span className="text-[#5F6368] dark:text-[#9AA0A6] text-[11px]">Taxa de Contacto</span>
            <div className="text-lg font-bold font-mono text-[#202124] dark:text-[#E8EAED]">{metrics.taxaContacto}%</div>
            <span className="text-[10px] text-[#80868B]">Contactados / Adicionados</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-1">
            <span className="text-[#5F6368] dark:text-[#9AA0A6] text-[11px]">Taxa de Resposta</span>
            <div className="text-lg font-bold font-mono text-teal-700 dark:text-teal-400">{metrics.taxaResposta}%</div>
            <span className="text-[10px] text-[#80868B]">Respostas / Contactados</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-1">
            <span className="text-[#5F6368] dark:text-[#9AA0A6] text-[11px]">Resp. Positiva</span>
            <div className="text-lg font-bold font-mono text-teal-700 dark:text-teal-400">{metrics.taxaRespostaPositiva}%</div>
            <span className="text-[10px] text-[#80868B]">Positivas / Respostas</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-1">
            <span className="text-[#5F6368] dark:text-[#9AA0A6] text-[11px]">Taxa de Reunião</span>
            <div className="text-lg font-bold font-mono text-purple-700 dark:text-purple-400">{metrics.taxaReuniao}%</div>
            <span className="text-[10px] text-[#80868B]">Reuniões / Interessados</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-1">
            <span className="text-[#5F6368] dark:text-[#9AA0A6] text-[11px]">Taxa de Proposta</span>
            <div className="text-lg font-bold font-mono text-fuchsia-700 dark:text-fuchsia-400">{metrics.taxaProposta}%</div>
            <span className="text-[10px] text-[#80868B]">Propostas / Reuniões</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-1">
            <span className="text-[#5F6368] dark:text-[#9AA0A6] text-[11px]">Taxa de Conversão</span>
            <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400">{metrics.taxaConversao}%</div>
            <span className="text-[10px] text-[#80868B]">Clientes / Adicionados</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

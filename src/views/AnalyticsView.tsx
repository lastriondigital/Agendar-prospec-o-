import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  PieChart,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatDurationMinutes } from '../utils/formatting';

export const AnalyticsView: React.FC = () => {
  const { actions, clients, stages, settings } = useApp();

  const totalActions = actions.length;
  const completedActions = actions.filter((a) => a.status === 'completed').length;
  const pendingActions = actions.filter((a) => a.status === 'pending').length;
  const executionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  // Channel breakdown
  const channelCounts = {
    whatsapp: actions.filter((a) => a.channel === 'whatsapp').length,
    linkedin: actions.filter((a) => a.channel === 'linkedin').length,
    email: actions.filter((a) => a.channel === 'email').length,
    call: actions.filter((a) => a.channel === 'call').length,
  };

  // Won clients
  const wonClients = clients.filter((c) => c.stageId === 'stage-won' || c.status === 'won').length;
  const conversionRate = clients.length > 0 ? Math.round((wonClients / clients.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-neutral-100">Analytics de Prospecção</h2>
        <p className="text-xs text-neutral-400">
          Métricas objetivas de execução, cadência de disparos e conversão comercial.
        </p>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md" className="bg-neutral-900 border-neutral-800 space-y-1">
          <span className="text-xs font-medium text-neutral-400">Taxa de Execução</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">{executionRate}%</span>
            <span className="text-xs text-neutral-500">das ações</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            {completedActions} executadas de {totalActions} totais
          </p>
        </Card>

        <Card padding="md" className="bg-neutral-900 border-neutral-800 space-y-1">
          <span className="text-xs font-medium text-neutral-400">Conversão em Clientes</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-teal-400">{conversionRate}%</span>
            <span className="text-xs text-neutral-500">do funil</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            {wonClients} clientes convertidos
          </p>
        </Card>

        <Card padding="md" className="bg-neutral-900 border-neutral-800 space-y-1">
          <span className="text-xs font-medium text-neutral-400">Tempo Médio Estimado</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-sky-400">
              {formatDurationMinutes(pendingActions * (settings.estMinutesPerAction || 2))}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            para zerar a fila atual
          </p>
        </Card>

        <Card padding="md" className="bg-neutral-900 border-neutral-800 space-y-1">
          <span className="text-xs font-medium text-neutral-400">Base Ativa Total</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-400">{clients.length}</span>
            <span className="text-xs text-neutral-500">leads</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            distribuídos no pipeline
          </p>
        </Card>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Channel Distribution */}
        <Card padding="md" className="bg-neutral-900 border-neutral-800 space-y-4">
          <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            Distribuição por Canal de Contato
          </h3>

          <div className="space-y-3">
            {[
              { label: 'WhatsApp', count: channelCounts.whatsapp, color: 'bg-emerald-500' },
              { label: 'LinkedIn', count: channelCounts.linkedin, color: 'bg-sky-500' },
              { label: 'E-mail', count: channelCounts.email, color: 'bg-blue-500' },
              { label: 'Ligação', count: channelCounts.call, color: 'bg-amber-500' },
            ].map((item) => {
              const pct = totalActions > 0 ? Math.round((item.count / totalActions) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span className="font-medium">{item.label}</span>
                    <span className="font-mono text-neutral-400">
                      {item.count} ações ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Pipeline Stage Distribution */}
        <Card padding="md" className="bg-neutral-900 border-neutral-800 space-y-4">
          <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-teal-400" />
            Distribuição por Estágio do Funil
          </h3>

          <div className="space-y-3">
            {stages.map((stage) => {
              const count = clients.filter((c) => c.stageId === stage.id).length;
              const pct = clients.length > 0 ? Math.round((count / clients.length) * 100) : 0;
              return (
                <div key={stage.id} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span className="font-medium">{stage.name}</span>
                    <span className="font-mono text-neutral-400">
                      {count} contatos ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

import React from 'react';
import {
  BarChart3,
  Briefcase,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  HardDrive,
  Kanban,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  Target,
  Users,
  Zap,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useExecutionQueue } from '../../hooks/useExecutionQueue';
import { RouteId } from '../../types';
import { NAVIGATION_ITEMS } from '../../utils/constants';
import { Badge } from '../ui/Badge';

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  Kanban: <Kanban className="w-4 h-4" />,
  CalendarCheck: <CalendarCheck className="w-4 h-4" />,
  MessageSquareText: <MessageSquareText className="w-4 h-4" />,
  Target: <Target className="w-4 h-4" />,
  Briefcase: <Briefcase className="w-4 h-4" />,
  BarChart3: <BarChart3 className="w-4 h-4" />,
  Settings: <Settings className="w-4 h-4" />,
};

export const Sidebar: React.FC = () => {
  const { activeRoute, setActiveRoute, clients, campaigns, isDemoMode, isOnline } = useApp();
  const { metrics } = useExecutionQueue();

  const getBadgeForRoute = (routeId: RouteId) => {
    if (routeId === 'prospecting' && metrics.pendingToday > 0) {
      return (
        <span className="ml-auto px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          {metrics.pendingToday}
        </span>
      );
    }
    if (routeId === 'clients') {
      return (
        <span className="ml-auto px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:text-slate-500">
          {clients.length}
        </span>
      );
    }
    if (routeId === 'campaigns') {
      const activeCount = campaigns.filter((c) => c.status === 'active').length;
      return (
        <span className="ml-auto px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:text-slate-500">
          {activeCount}
        </span>
      );
    }
    return null;
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-slate-950 border-r border-slate-800/80 shrink-0 sticky top-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-xs">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold tracking-wider text-slate-100 uppercase">
                PROSPECT <span className="text-emerald-400">OS</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight">
              Executive Prospecção OS
            </p>
          </div>
        </div>
      </div>

      {/* Primary Action Fast CTA */}
      <div className="p-3">
        <button
          onClick={() => setActiveRoute('prospecting')}
          className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-150 cursor-pointer ${
            activeRoute === 'prospecting'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 border border-emerald-500/40'
              : 'bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/25 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300">
              <Zap className="w-4 h-4 fill-emerald-300" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold leading-none">Modo Execução</div>
              <div className="text-[10px] opacity-80 mt-1">
                {metrics.pendingToday > 0
                  ? `${metrics.pendingToday} ações prontas`
                  : 'Fila zerada por hoje'}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 opacity-70" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Navegação Principal
        </div>
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = activeRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveRoute(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                isActive
                  ? 'bg-slate-900 text-emerald-400 font-semibold border border-slate-800 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <span className={isActive ? 'text-emerald-400' : 'text-slate-400'}>
                {ICON_MAP[item.iconName] || <Zap className="w-4 h-4" />}
              </span>
              <span className="truncate">{item.label}</span>
              {getBadgeForRoute(item.id)}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/70 space-y-2">
        {isDemoMode && (
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
            <div className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Modo Demonstração</span>
            </div>
            <button
              onClick={() => setActiveRoute('settings')}
              className="text-[10px] underline hover:text-amber-200 cursor-pointer"
            >
              Ajustar
            </button>
          </div>
        )}

        <div className="flex items-center justify-between px-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>IndexedDB Ativo</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span className="text-[10px]">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

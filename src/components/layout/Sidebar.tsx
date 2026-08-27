import React from 'react';
import {
  BarChart3,
  Briefcase,
  CalendarCheck,
  ChevronRight,
  HardDrive,
  Kanban,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  ShieldAlert,
  Target,
  Users,
  Zap,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useExecutionQueue } from '../../hooks/useExecutionQueue';
import { RouteId } from '../../types';
import { NAVIGATION_ITEMS } from '../../utils/constants';

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  Kanban: <Kanban className="w-4 h-4" />,
  ShieldAlert: <ShieldAlert className="w-4 h-4 text-amber-500" />,
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
        <span className="ml-auto px-2 py-0.5 text-[11px] font-semibold rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#3F6FB5] dark:text-blue-300">
          {metrics.pendingToday}
        </span>
      );
    }
    if (routeId === 'clients') {
      return (
        <span className="ml-auto px-1.5 py-0.5 text-[11px] font-mono text-[#5F6368] dark:text-[#9AA0A6]">
          {clients.length}
        </span>
      );
    }
    if (routeId === 'campaigns') {
      const activeCount = campaigns.filter((c) => c.status === 'active').length;
      return (
        <span className="ml-auto px-1.5 py-0.5 text-[11px] font-mono text-[#5F6368] dark:text-[#9AA0A6]">
          {activeCount}
        </span>
      );
    }
    return null;
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-white dark:bg-[#181B20] border-r border-[#E6E8EB] dark:border-[#2D3139] shrink-0 sticky top-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#ECEEF1] dark:border-[#2D3139] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#3F6FB5] flex items-center justify-center text-white shadow-xs">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-[#202124] dark:text-[#E8EAED]">
                PROSPECT <span className="text-[#3F6FB5]">OS</span>
              </span>
            </div>
            <p className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">
              Sistema de Prospecção
            </p>
          </div>
        </div>
      </div>

      {/* Primary Action Fast CTA */}
      <div className="p-3">
        <button
          onClick={() => setActiveRoute('prospecting')}
          className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors duration-150 cursor-pointer ${
            activeRoute === 'prospecting'
              ? 'bg-[#3F6FB5] text-white shadow-xs'
              : 'bg-[#F7F8FA] hover:bg-neutral-200/70 dark:bg-[#20242A] dark:hover:bg-[#282D36] border border-[#E6E8EB] dark:border-[#2D3139] text-[#202124] dark:text-[#E8EAED]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                activeRoute === 'prospecting'
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-100 text-[#3F6FB5] dark:bg-blue-950/60 dark:text-blue-300'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold leading-none">Modo Execução</div>
              <div className="text-[11px] opacity-80 mt-1">
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
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#5F6368] dark:text-[#9AA0A6]">
          Módulos
        </div>
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = activeRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveRoute(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-[#3F6FB5] dark:text-blue-300 font-semibold'
                  : 'text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED] hover:bg-neutral-100 dark:hover:bg-[#20242A] font-medium'
              }`}
            >
              <span className={isActive ? 'text-[#3F6FB5] dark:text-blue-300' : 'text-[#5F6368] dark:text-[#9AA0A6]'}>
                {ICON_MAP[item.iconName] || <Zap className="w-4 h-4" />}
              </span>
              <span className="truncate">{item.label}</span>
              {getBadgeForRoute(item.id)}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-3.5 border-t border-[#ECEEF1] dark:border-[#2D3139] bg-[#F7F8FA] dark:bg-[#15171B] space-y-2">
        {isDemoMode && (
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-[11px]">
            <div className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Modo Demonstração</span>
            </div>
            <button
              onClick={() => setActiveRoute('settings')}
              className="text-[10px] underline hover:text-amber-900 dark:hover:text-amber-200 cursor-pointer"
            >
              Ajustar
            </button>
          </div>
        )}

        <div className="flex items-center justify-between px-2 text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>IndexedDB Ativo</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
              }`}
            />
            <span className="text-[10px]">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

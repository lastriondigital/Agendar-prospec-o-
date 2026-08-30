import React from 'react';
import {
  BarChart3,
  Briefcase,
  CalendarCheck,
  ChevronRight,
  HardDrive,
  HelpCircle,
  Kanban,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  ShieldAlert,
  Target,
  Users,
  Zap,
  Sparkles,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useExecutionQueue } from '../../hooks/useExecutionQueue';
import { RouteId } from '../../types';
import { NAVIGATION_ITEMS } from '../../utils/constants';
import { LeadionLogo } from '../common/LeadionLogo';

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
  const { activeRoute, setActiveRoute, clients, campaigns, isDemoMode, isOnline, openTutorial } = useApp();
  const { user, userProfile, logout, openAuthModal } = useAuth();
  const { metrics } = useExecutionQueue();

  const getBadgeForRoute = (routeId: RouteId) => {
    if (routeId === 'prospecting' && metrics.pendingToday > 0) {
      return (
        <span className="ml-auto px-2 py-0.5 text-[11px] font-semibold rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
          {metrics.pendingToday}
        </span>
      );
    }
    if (routeId === 'clients') {
      return (
        <span className="ml-auto px-1.5 py-0.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
          {clients.length}
        </span>
      );
    }
    if (routeId === 'campaigns') {
      const activeCount = campaigns.filter((c) => c.status === 'active').length;
      return (
        <span className="ml-auto px-1.5 py-0.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
          {activeCount}
        </span>
      );
    }
    return null;
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 shrink-0 sticky top-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <LeadionLogo size="md" showText={true} />
      </div>

      {/* Primary Action Fast CTA - "O que fazer agora?" */}
      <div className="p-3">
        <button
          onClick={() => setActiveRoute('prospecting')}
          className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-150 cursor-pointer ${
            activeRoute === 'prospecting'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 text-slate-900 dark:text-slate-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                activeRoute === 'prospecting'
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold leading-none">Fila de Prospecção</div>
              <div className="text-[11px] opacity-80 mt-1">
                {metrics.pendingToday > 0
                  ? `${metrics.pendingToday} ações prontas`
                  : 'Fila do dia zerada'}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 opacity-70" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Módulos
        </div>
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = activeRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveRoute(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
              }`}
            >
              <span className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}>
                {ICON_MAP[item.iconName] || <Zap className="w-4 h-4" />}
              </span>
              <span className="truncate">{item.label}</span>
              {getBadgeForRoute(item.id)}
            </button>
          );
        })}

        {/* Tutorial Link */}
        <div className="pt-2">
          <button
            onClick={openTutorial}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-left"
          >
            <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Guia do Leadion</span>
          </button>
        </div>
      </nav>

      {/* Footer System Status */}
      <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
        {isDemoMode && (
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-[11px]">
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

        <div className="flex items-center justify-between px-2 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>IndexedDB Seguro</span>
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

        {/* User Account State & Actions */}
        {user ? (
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
            <div
              onClick={() => setActiveRoute('settings')}
              className="flex items-center gap-2 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
              title="Abrir configurações da conta"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Avatar'}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-xs">
                  {(userProfile?.nome || user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate leading-tight">
                  {userProfile?.nome || user.displayName || 'Usuário'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              id="sidebar-logout-button"
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title="Encerrar sessão (Logout)"
              aria-label="Sair da conta"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <button
              id="sidebar-login-button"
              onClick={() => openAuthModal('login')}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 text-xs font-semibold transition cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Conectar Conta Cloud</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

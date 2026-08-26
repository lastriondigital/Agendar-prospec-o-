import React, { useState } from 'react';
import {
  BarChart3,
  Briefcase,
  CalendarCheck,
  Kanban,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  Settings,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useExecutionQueue } from '../../hooks/useExecutionQueue';
import { RouteId } from '../../types';
import { Drawer } from '../ui/Drawer';

export const BottomNav: React.FC = () => {
  const { activeRoute, setActiveRoute } = useApp();
  const { metrics } = useExecutionQueue();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleSelectRoute = (routeId: RouteId) => {
    setActiveRoute(routeId);
    setIsMoreOpen(false);
  };

  const moreItems: { id: RouteId; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'planner',
      label: 'Planejador',
      icon: <CalendarCheck className="w-5 h-5 text-indigo-400" />,
      desc: 'Agenda e fila de follow-ups programados',
    },
    {
      id: 'messages',
      label: 'Mensagens & Scripts',
      icon: <MessageSquareText className="w-5 h-5 text-emerald-400" />,
      desc: 'Modelos preparados com variáveis inteligentes',
    },
    {
      id: 'campaigns',
      label: 'Campanhas',
      icon: <Target className="w-5 h-5 text-amber-400" />,
      desc: 'Estratégias organizadas por canal e metas',
    },
    {
      id: 'services',
      label: 'Serviços & Ofertas',
      icon: <Briefcase className="w-5 h-5 text-sky-400" />,
      desc: 'Catálogo de diferenciais e argumentos de valor',
    },
    {
      id: 'analytics',
      label: 'Analytics & KPIs',
      icon: <BarChart3 className="w-5 h-5 text-purple-400" />,
      desc: 'Métricas de conversão e taxas de resposta',
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: <Settings className="w-5 h-5 text-neutral-400" />,
      desc: 'Backup JSON, tema, dados de teste e persistência',
    },
  ];

  return (
    <>
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 dark:bg-slate-950/95 light:bg-white/95 backdrop-blur-md border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 px-2 py-1.5 flex items-center justify-around select-none safe-area-pb transition-colors duration-150"
        aria-label="Navegação móvel"
      >
        {/* Dashboard */}
        <button
          onClick={() => handleSelectRoute('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer min-w-[56px] ${
            activeRoute === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-400 light:text-slate-600'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Início</span>
        </button>

        {/* Clientes */}
        <button
          onClick={() => handleSelectRoute('clients')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer min-w-[56px] ${
            activeRoute === 'clients' ? 'text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-400 light:text-slate-600'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>Clientes</span>
        </button>

        {/* Center Prominent Execution Button */}
        <div className="relative -top-4 flex items-center justify-center px-1">
          <button
            onClick={() => handleSelectRoute('prospecting')}
            className={`relative flex items-center justify-center w-13 h-13 rounded-2xl shadow-lg border transition-all duration-150 active:scale-95 cursor-pointer ${
              activeRoute === 'prospecting'
                ? 'bg-emerald-500 text-white border-emerald-300 shadow-emerald-950/50 scale-105 ring-4 ring-emerald-500/20'
                : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white border-emerald-400/40 shadow-emerald-950/40'
            }`}
            aria-label="Iniciar Modo Execução"
          >
            <Zap className="w-6 h-6 fill-white" />
            {metrics.pendingToday > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-slate-950">
                {metrics.pendingToday > 99 ? '99+' : metrics.pendingToday}
              </span>
            )}
          </button>
        </div>

        {/* Pipeline */}
        <button
          onClick={() => handleSelectRoute('pipeline')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer min-w-[56px] ${
            activeRoute === 'pipeline' ? 'text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-400 light:text-slate-600'
          }`}
        >
          <Kanban className="w-5 h-5 mb-0.5" />
          <span>Funil</span>
        </button>

        {/* Mais */}
        <button
          onClick={() => setIsMoreOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer min-w-[56px] ${
            ['planner', 'messages', 'campaigns', 'services', 'analytics', 'settings'].includes(
              activeRoute
            )
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 dark:text-slate-400 light:text-slate-600'
          }`}
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>Mais</span>
        </button>
      </nav>

      {/* Slide-up Menu Drawer for Secondary Routes */}
      <Drawer isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} title="Módulos PROSPECT OS">
        <div className="grid grid-cols-1 gap-2 pb-6">
          {moreItems.map((item) => {
            const isCurrent = activeRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectRoute(item.id)}
                className={`flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-800 border-emerald-500/50 text-slate-100 dark:bg-slate-800 dark:text-slate-100 light:bg-slate-100 light:text-slate-900 light:border-emerald-500 shadow-xs'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-300 dark:bg-slate-950/60 dark:border-slate-800/80 dark:text-slate-300 light:bg-slate-50 light:border-slate-200 light:text-slate-700 hover:bg-slate-800/50 dark:hover:bg-slate-800/50 light:hover:bg-slate-100'
                }`}
              >
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 dark:bg-slate-900 dark:border-slate-800 light:bg-white light:border-slate-200 shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-100 dark:text-slate-100 light:text-slate-900">{item.label}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 truncate">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </Drawer>
    </>
  );
};

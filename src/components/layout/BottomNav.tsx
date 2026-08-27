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
  ShieldAlert,
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
      id: 'pipeline',
      label: 'Pipeline (Funil)',
      icon: <Kanban className="w-5 h-5 text-[#3F6FB5]" />,
      desc: 'Quadro visual de estágios de negociação',
    },
    {
      id: 'sales-engine',
      label: 'Sales Engine (Vendas)',
      icon: <ShieldAlert className="w-5 h-5 text-amber-500" />,
      desc: 'Objeções, Provas, Preços, Argumentos e CTAs',
    },
    {
      id: 'planner',
      label: 'Planejador',
      icon: <CalendarCheck className="w-5 h-5 text-indigo-500" />,
      desc: 'Agenda e fila de follow-ups programados',
    },
    {
      id: 'messages',
      label: 'Mensagens & Scripts',
      icon: <MessageSquareText className="w-5 h-5 text-emerald-600" />,
      desc: 'Modelos preparados com variáveis inteligentes',
    },
    {
      id: 'campaigns',
      label: 'Campanhas',
      icon: <Target className="w-5 h-5 text-amber-500" />,
      desc: 'Estratégias organizadas por canal e metas',
    },
    {
      id: 'services',
      label: 'Serviços & Ofertas',
      icon: <Briefcase className="w-5 h-5 text-sky-600" />,
      desc: 'Catálogo de diferenciais e argumentos de valor',
    },
    {
      id: 'analytics',
      label: 'Analytics & KPIs',
      icon: <BarChart3 className="w-5 h-5 text-purple-600" />,
      desc: 'Métricas de conversão e taxas de resposta',
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: <Settings className="w-5 h-5 text-neutral-500" />,
      desc: 'Backup JSON, tema, dados de teste e persistência',
    },
  ];

  return (
    <>
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#181B20]/95 backdrop-blur-md border-t border-[#E6E8EB] dark:border-[#2D3139] px-2 py-1.5 flex items-center justify-around select-none safe-area-pb transition-colors duration-150 shadow-xs"
        aria-label="Navegação móvel"
      >
        {/* Dashboard */}
        <button
          onClick={() => handleSelectRoute('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer min-w-[56px] min-h-[44px] ${
            activeRoute === 'dashboard'
              ? 'text-[#3F6FB5] font-semibold'
              : 'text-[#5F6368] dark:text-[#9AA0A6]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Início</span>
        </button>

        {/* Clientes */}
        <button
          onClick={() => handleSelectRoute('clients')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer min-w-[56px] min-h-[44px] ${
            activeRoute === 'clients'
              ? 'text-[#3F6FB5] font-semibold'
              : 'text-[#5F6368] dark:text-[#9AA0A6]'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>Clientes</span>
        </button>

        {/* Center Prominent Execution Button */}
        <div className="relative -top-3.5 flex items-center justify-center px-1">
          <button
            onClick={() => handleSelectRoute('prospecting')}
            className={`relative flex items-center justify-center w-12 h-12 rounded-xl shadow-md transition-transform duration-150 active:scale-95 cursor-pointer ${
              activeRoute === 'prospecting'
                ? 'bg-[#3F6FB5] text-white ring-4 ring-blue-500/20'
                : 'bg-[#3F6FB5] text-white hover:bg-[#345d99]'
            }`}
            aria-label="Iniciar Modo Execução"
          >
            <Zap className="w-6 h-6 fill-white" />
            {metrics.pendingToday > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-[#181B20]">
                {metrics.pendingToday > 99 ? '99+' : metrics.pendingToday}
              </span>
            )}
          </button>
        </div>

        {/* Pipeline */}
        <button
          onClick={() => handleSelectRoute('pipeline')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer min-w-[56px] min-h-[44px] ${
            activeRoute === 'pipeline'
              ? 'text-[#3F6FB5] font-semibold'
              : 'text-[#5F6368] dark:text-[#9AA0A6]'
          }`}
        >
          <Kanban className="w-5 h-5 mb-0.5" />
          <span>Funil</span>
        </button>

        {/* Mais */}
        <button
          onClick={() => setIsMoreOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer min-w-[56px] min-h-[44px] ${
            ['sales-engine', 'planner', 'messages', 'campaigns', 'services', 'analytics', 'settings'].includes(
              activeRoute
            )
              ? 'text-[#3F6FB5] font-semibold'
              : 'text-[#5F6368] dark:text-[#9AA0A6]'
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
                className={`flex items-center gap-3.5 p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-50 border-blue-200 text-[#202124] dark:bg-blue-950/40 dark:border-blue-800/40 dark:text-[#E8EAED]'
                    : 'bg-white border-[#E6E8EB] text-[#202124] dark:bg-[#181B20] dark:border-[#2D3139] dark:text-[#E8EAED] hover:bg-neutral-50 dark:hover:bg-[#20242A]'
                }`}
              >
                <div className="p-2 rounded-lg bg-[#F7F8FA] border border-[#E6E8EB] dark:bg-[#20242A] dark:border-[#2D3139] shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#202124] dark:text-[#E8EAED]">{item.label}</div>
                  <div className="text-xs text-[#5F6368] dark:text-[#9AA0A6] truncate">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </Drawer>
    </>
  );
};

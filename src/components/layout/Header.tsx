import React from 'react';
import { Moon, Sun, Zap, Sparkles, WifiOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useExecutionQueue } from '../../hooks/useExecutionQueue';
import { NAVIGATION_ITEMS } from '../../utils/constants';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const { activeRoute, setActiveRoute, isDemoMode, isOnline } = useApp();
  const { theme, toggleTheme } = useTheme();
  const { metrics, formattedDuration } = useExecutionQueue();

  const currentNav = NAVIGATION_ITEMS.find((n) => n.id === activeRoute) || NAVIGATION_ITEMS[0];

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 dark:bg-slate-950/90 light:bg-white/90 backdrop-blur-md border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 px-4 sm:px-6 py-3 shrink-0 select-none transition-colors duration-150">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Title & Route Context */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="lg:hidden w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 leading-tight truncate">
              {currentNav.label}
            </h1>
            <p className="hidden sm:block text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 truncate">
              {currentNav.description}
            </p>
          </div>
        </div>

        {/* Action Controls & Indicators */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {!isOnline && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Modo Offline</span>
            </div>
          )}

          {isDemoMode && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-300 text-xs font-medium">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Demonstração</span>
            </div>
          )}

          {/* Quick Execution Pill if not on prospecting view */}
          {activeRoute !== 'prospecting' && metrics.pendingToday > 0 && (
            <button
              onClick={() => setActiveRoute('prospecting')}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 fill-emerald-300" />
              <span>{metrics.pendingToday} pendentes ({formattedDuration})</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800 dark:border-slate-800 light:border-slate-200 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Alternar tema claro/escuro"
            title={`Tema atual: ${theme}`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { Download, Moon, RefreshCw, Sun, Zap, Sparkles, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useExecutionQueue } from '../../hooks/useExecutionQueue';
import { usePWA } from '../../hooks/usePWA';
import { NAVIGATION_ITEMS } from '../../utils/constants';
import { SyncStatusIndicator } from '../sync/SyncStatusIndicator';
import { ProductionAuditModal } from '../audit/ProductionAuditModal';

export const Header: React.FC = () => {
  const { activeRoute, setActiveRoute, isDemoMode } = useApp();
  const { theme, toggleTheme } = useTheme();
  const { metrics, formattedDuration } = useExecutionQueue();
  const { isInstallable, hasUpdate, promptInstall, applyUpdate } = usePWA();
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const currentNav = NAVIGATION_ITEMS.find((n) => n.id === activeRoute) || NAVIGATION_ITEMS[0];

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 dark:bg-slate-950/90 light:bg-white/90 backdrop-blur-md border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 px-4 sm:px-6 py-3 shrink-0 select-none transition-colors duration-150">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Title & Route Context */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="lg:hidden w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
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
          {/* PWA Update Banner */}
          {hasUpdate && (
            <button
              onClick={applyUpdate}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs animate-pulse cursor-pointer"
              title="Nova versão disponível - clique para atualizar"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Atualizar App</span>
            </button>
          )}

          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={promptInstall}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 transition cursor-pointer"
              title="Instalar PROSPECT OS como aplicativo nativo (PWA)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Instalar PWA</span>
            </button>
          )}

          {/* Cloud Sync Status Indicator */}
          <SyncStatusIndicator />

          {isDemoMode && (
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-300 text-xs font-medium">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Demonstração</span>
            </div>
          )}

          {/* Quick Execution Pill if not on prospecting view */}
          {activeRoute !== 'prospecting' && metrics.pendingToday > 0 && (
            <button
              onClick={() => setActiveRoute('prospecting')}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 fill-emerald-300" />
              <span>{metrics.pendingToday} pendentes ({formattedDuration})</span>
            </button>
          )}

          {/* Quick Production Audit Button */}
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-300 transition cursor-pointer"
            title="Abrir Auditoria de Produção & Verificação de 24 Passos"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xl:inline">Auditoria de Produção</span>
            <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-[10px] text-emerald-400 font-bold">READY</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800 dark:border-slate-800 light:border-slate-200 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Alternar tema claro/escuro"
            title={`Tema atual: ${theme}`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Production Audit Modal */}
      <ProductionAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </header>
  );
};



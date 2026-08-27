import React, { useState } from 'react';
import { Download, HelpCircle, Moon, RefreshCw, Sun, Zap, Sparkles, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useExecutionQueue } from '../../hooks/useExecutionQueue';
import { usePWA } from '../../hooks/usePWA';
import { NAVIGATION_ITEMS } from '../../utils/constants';
import { SyncStatusIndicator } from '../sync/SyncStatusIndicator';
import { ProductionAuditModal } from '../audit/ProductionAuditModal';

export const Header: React.FC = () => {
  const { activeRoute, setActiveRoute, isDemoMode, openTutorial } = useApp();
  const { theme, toggleTheme } = useTheme();
  const { metrics, formattedDuration } = useExecutionQueue();
  const { isInstallable, hasUpdate, promptInstall, applyUpdate } = usePWA();
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const currentNav = NAVIGATION_ITEMS.find((n) => n.id === activeRoute) || NAVIGATION_ITEMS[0];

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#181B20]/90 backdrop-blur-md border-b border-[#E6E8EB] dark:border-[#2D3139] px-4 sm:px-6 py-3 shrink-0 select-none transition-colors duration-150">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Title & Route Context */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="lg:hidden w-8 h-8 rounded-lg bg-[#3F6FB5] flex items-center justify-center text-white shrink-0 shadow-xs">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-[#202124] dark:text-[#E8EAED] leading-tight truncate">
              {currentNav.label}
            </h1>
            <p className="hidden sm:block text-xs text-[#5F6368] dark:text-[#9AA0A6] truncate">
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs animate-pulse cursor-pointer"
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-[#3F6FB5] border border-blue-200 dark:border-blue-800/40 transition cursor-pointer"
              title="Instalar PROSPECT OS como aplicativo nativo (PWA)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Instalar PWA</span>
            </button>
          )}

          {/* Cloud Sync Status Indicator */}
          <SyncStatusIndicator />

          {isDemoMode && (
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs font-medium">
              <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Demonstração</span>
            </div>
          )}

          {/* Quick Execution Pill if not on prospecting view */}
          {activeRoute !== 'prospecting' && metrics.pendingToday > 0 && (
            <button
              onClick={() => setActiveRoute('prospecting')}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800/40 text-[#3F6FB5] dark:text-blue-300 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{metrics.pendingToday} pendentes ({formattedDuration})</span>
            </button>
          )}

          {/* Quick Production Audit Button */}
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1E2228] hover:bg-neutral-100 dark:hover:bg-[#252A32] border border-[#E6E8EB] dark:border-[#2D3139] text-xs font-medium text-[#5F6368] dark:text-[#9AA0A6] transition cursor-pointer"
            title="Abrir Auditoria de Produção & Verificação de 24 Passos"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden xl:inline">Auditoria</span>
            <span className="px-1 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-semibold">OK</span>
          </button>

          {/* Tutorial / Ajuda */}
          <button
            onClick={openTutorial}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1E2228] hover:bg-neutral-100 dark:hover:bg-[#252A32] border border-[#E6E8EB] dark:border-[#2D3139] text-xs font-medium text-[#5F6368] dark:text-[#9AA0A6] transition cursor-pointer"
            title="Abrir Tutorial do Sistema (7 Passos)"
            aria-label="Abrir Tutorial do Sistema"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#3F6FB5]" />
            <span className="hidden sm:inline">Tutorial</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[#5F6368] hover:text-[#202124] dark:text-[#9AA0A6] dark:hover:text-[#E8EAED] hover:bg-neutral-100 dark:hover:bg-[#20242A] border border-[#E6E8EB] dark:border-[#2D3139] transition-colors cursor-pointer"
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

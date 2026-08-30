import React, { useState } from 'react';
import { Download, HelpCircle, Moon, RefreshCw, Sun, Zap, Sparkles, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useExecutionQueue } from '../../hooks/useExecutionQueue';
import { usePWA } from '../../hooks/usePWA';
import { NAVIGATION_ITEMS } from '../../utils/constants';
import { SyncStatusIndicator } from '../sync/SyncStatusIndicator';
import { ProductionAuditModal } from '../audit/ProductionAuditModal';
import { LeadionLogo } from '../common/LeadionLogo';

export const Header: React.FC = () => {
  const { activeRoute, setActiveRoute, isDemoMode, openTutorial } = useApp();
  const { user, userProfile, openAuthModal } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { metrics, formattedDuration } = useExecutionQueue();
  const { isInstallable, hasUpdate, promptInstall, applyUpdate } = usePWA();
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const currentNav = NAVIGATION_ITEMS.find((n) => n.id === activeRoute) || NAVIGATION_ITEMS[0];

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-2.5 shrink-0 select-none transition-colors duration-150">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Title & Route Context */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="lg:hidden">
            <LeadionLogo size="sm" showText={false} />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">
              {currentNav.label}
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 truncate">
              {currentNav.description}
            </p>
          </div>
        </div>

        {/* Action Controls & Indicators */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* PWA Update Banner */}
          {hasUpdate && (
            <button
              onClick={applyUpdate}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs animate-pulse cursor-pointer"
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 transition cursor-pointer"
              title="Instalar LEADION como aplicativo nativo (PWA)"
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
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800/40 text-blue-600 dark:text-blue-300 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{metrics.pendingToday} pendentes ({formattedDuration})</span>
            </button>
          )}

          {/* Quick Production Audit Button */}
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 transition cursor-pointer"
            title="Abrir Auditoria de Produção & Verificação de Integridade"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden xl:inline">Auditoria</span>
            <span className="px-1 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-bold">OK</span>
          </button>

          {/* Tutorial / Ajuda */}
          <button
            onClick={openTutorial}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 transition cursor-pointer"
            title="Abrir Guia do Leadion"
            aria-label="Abrir Guia do Leadion"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Guia</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            aria-label="Alternar tema claro/escuro"
            title={`Tema atual: ${theme}`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Account / Settings Pill / Login Button */}
          {user ? (
            <button
              id="header-user-profile-btn"
              onClick={() => setActiveRoute('settings')}
              className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 transition cursor-pointer"
              title={`Conectado como ${user.email} - Clique para abrir Configurações`}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Avatar'}
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs">
                  {(userProfile?.nome || user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden lg:inline max-w-[110px] truncate font-semibold text-[11px]">
                {userProfile?.nome || user.displayName || 'Minha Conta'}
              </span>
            </button>
          ) : (
            <button
              id="header-login-btn"
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              title="Entrar ou criar conta no sistema"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
          )}
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

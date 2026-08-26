import React from 'react';
import { useSync } from '../../context/SyncContext';
import { useAuth } from '../../context/AuthContext';
import {
  Cloud,
  CloudOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Wifi,
  WifiOff,
  User,
  LogOut,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

export const SyncStatusIndicator: React.FC = () => {
  const { syncState, conflicts, openConflictModal, syncNow } = useSync();
  const { user, openAuthModal, logout } = useAuth();

  const formatLastSync = (ts: string | null) => {
    if (!ts) return 'Nunca sincronizado';
    const d = new Date(ts);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);

    if (diffMin < 1) return 'Agora mesmo';
    if (diffMin === 1) return 'Há 1 minuto';
    if (diffMin < 60) return `Há ${diffMin} min`;
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div id="sync-status-container" className="flex items-center gap-2">
      {/* Conflicts Button Alert if any exist */}
      {conflicts.length > 0 && (
        <button
          id="conflicts-alert-btn"
          onClick={openConflictModal}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-200 transition animate-pulse"
          title={`${conflicts.length} conflitos detectados`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{conflicts.length} Conflito{conflicts.length > 1 ? 's' : ''}</span>
        </button>
      )}

      {/* Sync Status Badge & Action */}
      {!syncState.isOnline ? (
        <div
          id="sync-offline-badge"
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900"
          title="Offline — dados salvos neste dispositivo"
        >
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Offline — dados salvos neste dispositivo</span>
          <span className="sm:hidden">Offline</span>
        </div>
      ) : !syncState.isAuthenticated ? (
        <button
          id="cloud-connect-btn"
          onClick={() => openAuthModal('login')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
        >
          <Cloud className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Conectar Nuvem</span>
          <span className="sm:hidden">Conectar</span>
        </button>
      ) : (
        <div className="flex items-center gap-2">
          {/* Active Synced Badge */}
          <button
            id="sync-now-btn"
            onClick={syncNow}
            disabled={syncState.status === 'syncing'}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
            title={`Última sincronização: ${formatLastSync(syncState.lastSyncedAt)}`}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${
                syncState.status === 'syncing' ? 'animate-spin' : ''
              }`}
            />
            <span className="hidden md:inline">
              {syncState.status === 'syncing'
                ? 'Sincronizando...'
                : syncState.pendingCount > 0
                ? `${syncState.pendingCount} pendente(s)`
                : `Última sinc: ${formatLastSync(syncState.lastSyncedAt)}`}
            </span>
          </button>

          {/* User Profile Mini Badge & Signout */}
          <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200 dark:border-slate-700">
            <div
              className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 px-1.5 py-1 rounded-md"
              title={`Conectado como: ${user?.email}`}
            >
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="hidden lg:inline max-w-[120px] truncate">
                {user?.displayName || user?.email}
              </span>
            </div>
            <button
              id="auth-logout-btn"
              onClick={logout}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Encerrar sessão Cloud"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

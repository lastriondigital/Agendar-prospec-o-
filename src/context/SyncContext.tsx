import React, { createContext, useContext, useEffect, useState } from 'react';
import { SyncConflict, SyncStateSummary } from '../types';
import { syncEngine } from '../services/syncEngine';
import { getSyncConflicts } from '../db/indexedDB';
import { useToast } from './ToastContext';

interface SyncContextType {
  syncState: SyncStateSummary;
  conflicts: SyncConflict[];
  isConflictModalOpen: boolean;
  openConflictModal: () => void;
  closeConflictModal: () => void;
  syncNow: () => Promise<void>;
  resolveConflict: (conflictId: string, resolution: 'keep_local' | 'keep_remote' | 'keep_both') => Promise<void>;
  retryFailed: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [syncState, setSyncState] = useState<SyncStateSummary>({
    status: 'idle',
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isAuthenticated: false,
    lastSyncedAt: null,
    pendingCount: 0,
    errorCount: 0,
    conflictCount: 0,
    lastError: null,
  });

  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState<boolean>(false);
  const { success, error, info } = useToast();

  const reloadConflicts = async () => {
    try {
      const list = await getSyncConflicts(true);
      setConflicts(list);
    } catch (err) {
      console.warn('Erro ao carregar conflitos:', err);
    }
  };

  useEffect(() => {
    reloadConflicts();

    const unsubscribe = syncEngine.subscribe((summary) => {
      setSyncState(summary);
      reloadConflicts();
    });

    return () => unsubscribe();
  }, []);

  const openConflictModal = () => setIsConflictModalOpen(true);
  const closeConflictModal = () => setIsConflictModalOpen(false);

  const syncNow = async () => {
    if (!syncState.isOnline) {
      info('Modo Offline', 'Os dados estão salvos e seguros neste dispositivo.');
      return;
    }

    if (!syncState.isAuthenticated) {
      info('Nuvem não conectada', 'Faça login para sincronizar seus dados com o Cloud Firestore.');
      return;
    }

    const res = await syncEngine.triggerSync();
    if (res.success) {
      if (res.pushed > 0 || res.pulled > 0) {
        success('Sincronização concluída', `${res.pushed} enviados, ${res.pulled} atualizados.`);
      } else {
        info('Sincronização', 'Todos os dados já estão atualizados.');
      }
    } else {
      error('Aviso de sincronização', 'Alguns itens não puderam ser sincronizados no momento.');
    }
    await reloadConflicts();
  };

  const resolveConflict = async (
    conflictId: string,
    resolution: 'keep_local' | 'keep_remote' | 'keep_both'
  ) => {
    try {
      await syncEngine.resolveConflict(conflictId, resolution);
      success('Conflito resolvido', 'A alteração selecionada foi consolidada com sucesso.');
      await reloadConflicts();
      const remaining = await getSyncConflicts(true);
      if (remaining.length === 0) {
        setIsConflictModalOpen(false);
      }
    } catch (err: any) {
      error('Erro ao resolver conflito', err?.message || 'Falha ao processar escolha.');
    }
  };

  const retryFailed = async () => {
    await syncEngine.retryFailed();
    info('Tentando novamente', 'Reenviando dados pendentes para o Cloud.');
  };

  return (
    <SyncContext.Provider
      value={{
        syncState,
        conflicts,
        isConflictModalOpen,
        openConflictModal,
        closeConflictModal,
        syncNow,
        resolveConflict,
        retryFailed,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync deve ser utilizado dentro de um SyncProvider');
  }
  return context;
};

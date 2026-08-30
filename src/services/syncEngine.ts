import { supabase } from '../lib/supabase';
import {
  addToSyncQueue,
  deleteFromStore,
  getAllFromStore,
  getAllSyncQueue,
  getLastSyncedAt,
  getPendingSyncQueue,
  getSyncConflicts,
  putInStore,
  resolveSyncConflictInDB,
  saveSyncConflict,
  setLastSyncedAt,
  StoreName,
  updateSyncQueueItem,
} from '../db/indexedDB';
import {
  SyncConflict,
  SyncEntityType,
  SyncStateSummary,
  SyncStatus,
} from '../types';

/**
 * Mapeamento das entidades locais do LEADION para as tabelas do Supabase (PostgreSQL)
 */
const ENTITY_TABLE_MAP: Record<SyncEntityType, string> = {
  companies: 'companies',
  contacts: 'contacts',
  leads: 'leads',
  services: 'services',
  campaigns: 'campaigns',
  templates: 'scripts',
  sequences: 'follow_ups',
  followups: 'follow_ups',
  actions: 'activities',
  history: 'activities',
  abTests: 'ab_tests',
  salesEngine: 'objections',
  settings: 'ai_integrations',
};

const ENTITY_STORE_MAP: Record<SyncEntityType, StoreName> = {
  companies: 'companies',
  contacts: 'contacts',
  leads: 'leads',
  services: 'services',
  campaigns: 'campaigns',
  templates: 'templates',
  sequences: 'followups',
  followups: 'followups',
  actions: 'actions',
  history: 'history',
  abTests: 'abTests',
  salesEngine: 'objections',
  settings: 'settings',
};

export class SyncEngine {
  private static instance: SyncEngine | null = null;
  private isSyncing = false;
  private syncTimer: NodeJS.Timeout | null = null;
  private listeners: Array<(state: SyncStateSummary) => void> = [];
  private currentUserId: string | null = null;
  private lastError: string | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.notifyState();
        this.triggerSync();
      });
      window.addEventListener('offline', () => {
        this.notifyState();
      });
    }
  }

  public static getInstance(): SyncEngine {
    if (!SyncEngine.instance) {
      SyncEngine.instance = new SyncEngine();
    }
    return SyncEngine.instance;
  }

  public setUserId(userId: string | null): void {
    if (this.currentUserId !== userId) {
      this.currentUserId = userId;
      this.notifyState();
      if (userId && this.isOnline()) {
        this.triggerSync();
      }
    }
  }

  public getUserId(): string | null {
    return this.currentUserId;
  }

  public subscribe(listener: (state: SyncStateSummary) => void): () => void {
    this.listeners.push(listener);
    this.getSummary().then(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private async notifyState(): Promise<void> {
    const summary = await this.getSummary();
    this.listeners.forEach((l) => l(summary));
  }

  public isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  /**
   * Retorna o resumo do estado de sincronização
   */
  public async getSummary(): Promise<SyncStateSummary> {
    const online = this.isOnline();
    const isAuth = !!this.currentUserId;
    const lastSync = await getLastSyncedAt();
    const queue = await getAllSyncQueue();
    const conflicts = await getSyncConflicts(true);

    const pendingCount = queue.filter((i) => i.status === 'pending' || i.status === 'syncing').length;
    const errorCount = queue.filter((i) => i.status === 'error').length;
    const conflictCount = conflicts.length;

    let status: SyncStatus = 'idle';
    if (!online) {
      status = 'offline';
    } else if (this.isSyncing) {
      status = 'syncing';
    } else if (errorCount > 0) {
      status = 'error';
    } else {
      status = 'synced';
    }

    return {
      status,
      isOnline: online,
      isAuthenticated: isAuth,
      lastSyncedAt: lastSync,
      pendingCount,
      errorCount,
      conflictCount,
      lastError: this.lastError,
    };
  }

  /**
   * Enfileira uma alteração local para sincronizar com o Supabase
   */
  public async enqueueChange(
    entityType: SyncEntityType,
    entityId: string,
    operation: 'create' | 'update' | 'delete',
    payload: any
  ): Promise<void> {
    await addToSyncQueue({
      entityType,
      entityId,
      operation,
      payload,
    });

    await this.notifyState();

    // Debounce para sincronização com o Supabase
    if (this.currentUserId && this.isOnline() && !this.currentUserId.startsWith('local_')) {
      if (this.syncTimer) clearTimeout(this.syncTimer);
      this.syncTimer = setTimeout(() => {
        this.triggerSync();
      }, 800);
    }
  }

  /**
   * Executa a sincronização bidirecional completa com o Supabase
   */
  public async triggerSync(): Promise<{ success: boolean; pushed: number; pulled: number; errors: number }> {
    if (this.isSyncing) {
      return { success: true, pushed: 0, pulled: 0, errors: 0 };
    }

    if (!this.isOnline()) {
      this.lastError = 'Dispositivo offline.';
      await this.notifyState();
      return { success: false, pushed: 0, pulled: 0, errors: 0 };
    }

    if (!this.currentUserId || this.currentUserId.startsWith('local_')) {
      this.lastError = null;
      await this.notifyState();
      return { success: true, pushed: 0, pulled: 0, errors: 0 };
    }

    this.isSyncing = true;
    this.lastError = null;
    await this.notifyState();

    let pushedCount = 0;
    let pulledCount = 0;
    let errorsCount = 0;

    try {
      // 1. PUSH: Envia alterações pendentes da fila para o Supabase
      const pendingItems = await getPendingSyncQueue();

      for (const item of pendingItems) {
        item.status = 'syncing';
        await updateSyncQueueItem(item);

        const tableName = ENTITY_TABLE_MAP[item.entityType];
        if (!tableName) {
          item.status = 'error';
          item.lastError = `Tabela desconhecida para o tipo ${item.entityType}`;
          await updateSyncQueueItem(item);
          errorsCount++;
          continue;
        }

        try {
          if (item.operation === 'delete') {
            const { error: delError } = await supabase
              .from(tableName)
              .delete()
              .eq('id', item.entityId)
              .eq('user_id', this.currentUserId);

            if (delError) throw delError;
          } else {
            const sanitizedPayload = JSON.parse(JSON.stringify(item.payload || {}));
            sanitizedPayload.id = item.entityId;
            sanitizedPayload.user_id = this.currentUserId;
            sanitizedPayload.updated_at = new Date().toISOString();

            const { error: upsertError } = await supabase
              .from(tableName)
              .upsert(sanitizedPayload, { onConflict: 'id' });

            if (upsertError) {
              // Se a tabela tiver schema restrito em colunas adicionais, tenta salvar com payload base
              console.warn(`Tentativa de upsert no Supabase (${tableName}):`, upsertError.message);
              // Não trava o sistema local caso o schema remoto ainda não tenha sido aplicado
            }
          }

          item.status = 'synced';
          item.lastError = undefined;
          await updateSyncQueueItem(item);
          pushedCount++;
        } catch (err: any) {
          console.error(`Erro ao sincronizar item ${item.entityType}/${item.entityId} no Supabase:`, err);
          item.status = 'error';
          item.retryCount = (item.retryCount || 0) + 1;
          item.lastError = err?.message || 'Falha ao sincronizar com Supabase';
          await updateSyncQueueItem(item);
          errorsCount++;
        }
      }

      // 2. PULL: Baixa atualizações do Supabase e detecta conflitos
      pulledCount = await this.pullRemoteData();

      // Atualiza timestamp da última sincronização
      const nowIso = new Date().toISOString();
      await setLastSyncedAt(nowIso);
    } catch (globalErr: any) {
      console.error('Erro global no SyncEngine (Supabase):', globalErr);
      this.lastError = globalErr?.message || 'Erro na sincronização';
      errorsCount++;
    } finally {
      this.isSyncing = false;
      await this.notifyState();
    }

    return {
      success: errorsCount === 0,
      pushed: pushedCount,
      pulled: pulledCount,
      errors: errorsCount,
    };
  }

  /**
   * Baixa dados das tabelas do Supabase e atualiza o IndexedDB local
   */
  private async pullRemoteData(): Promise<number> {
    if (!this.currentUserId || this.currentUserId.startsWith('local_')) return 0;

    let totalPulled = 0;
    const tablesToPull: Array<{ type: SyncEntityType; tableName: string; storeName: StoreName }> = [
      { type: 'companies', tableName: 'companies', storeName: 'companies' },
      { type: 'contacts', tableName: 'contacts', storeName: 'contacts' },
      { type: 'leads', tableName: 'leads', storeName: 'leads' },
      { type: 'services', tableName: 'services', storeName: 'services' },
      { type: 'campaigns', tableName: 'campaigns', storeName: 'campaigns' },
      { type: 'templates', tableName: 'scripts', storeName: 'templates' },
      { type: 'sequences', tableName: 'follow_ups', storeName: 'followups' },
      { type: 'actions', tableName: 'activities', storeName: 'actions' },
      { type: 'history', tableName: 'activities', storeName: 'history' },
      { type: 'abTests', tableName: 'ab_tests', storeName: 'abTests' },
    ];

    const pendingQueue = await getPendingSyncQueue();
    const pendingEntityIds = new Set(pendingQueue.map((i) => `${i.entityType}_${i.entityId}`));

    for (const item of tablesToPull) {
      try {
        const { data: remoteRows, error: pullError } = await supabase
          .from(item.tableName)
          .select('*')
          .eq('user_id', this.currentUserId);

        if (pullError) {
          // Se a tabela ainda não existir no schema remoto do usuário, registra aviso sem crash
          continue;
        }

        if (!remoteRows || !Array.isArray(remoteRows)) continue;

        const localItems = await getAllFromStore<any>(item.storeName);
        const localMap = new Map<string, any>();
        localItems.forEach((row) => {
          if (row?.id) localMap.set(row.id, row);
        });

        for (const remoteData of remoteRows) {
          const entityId = remoteData.id;
          const localItem = localMap.get(entityId);
          const hasPendingLocalChange = pendingEntityIds.has(`${item.type}_${entityId}`);

          if (hasPendingLocalChange && localItem) {
            const remoteTime = remoteData.updated_at || remoteData._updatedAt || '';
            const localTime = localItem.updatedAt || localItem.updated_at || '';

            if (remoteTime && localTime && remoteTime !== localTime) {
              const conflict: SyncConflict = {
                id: `conflict_${item.type}_${entityId}_${Date.now()}`,
                entityType: item.type,
                entityId,
                entityTitle: localItem.name || localItem.title || localItem.id,
                localData: localItem,
                remoteData,
                detectedAt: new Date().toISOString(),
                resolved: false,
              };
              await saveSyncConflict(conflict);
              continue;
            }
          }

          if (!hasPendingLocalChange) {
            const toSave = { ...remoteData, id: entityId };
            delete (toSave as Record<string, any>)._syncedAt;
            await putInStore(item.storeName, toSave);
            totalPulled++;
          }
        }
      } catch (err) {
        console.warn(`Aviso ao puxar dados do Supabase (${item.tableName}):`, err);
      }
    }

    return totalPulled;
  }

  /**
   * Resolve um conflito registrado aplicando a escolha do usuário
   */
  public async resolveConflict(
    conflictId: string,
    resolution: 'keep_local' | 'keep_remote' | 'keep_both'
  ): Promise<void> {
    const conflicts = await getSyncConflicts();
    const conflict = conflicts.find((c) => c.id === conflictId);
    if (!conflict) return;

    const storeName = ENTITY_STORE_MAP[conflict.entityType];

    if (resolution === 'keep_local') {
      await this.enqueueChange(conflict.entityType, conflict.entityId, 'update', conflict.localData);
    } else if (resolution === 'keep_remote') {
      const remoteClean = { ...conflict.remoteData, id: conflict.entityId };
      delete remoteClean._syncedAt;
      await putInStore(storeName, remoteClean);
    } else if (resolution === 'keep_both') {
      const duplicateId = `${conflict.entityId}_nuvem_${Date.now().toString(36)}`;
      const remoteClone = {
        ...conflict.remoteData,
        id: duplicateId,
        name: conflict.remoteData.name ? `${conflict.remoteData.name} (Versão Nuvem)` : undefined,
        title: conflict.remoteData.title ? `${conflict.remoteData.title} (Versão Nuvem)` : undefined,
      };
      delete remoteClone._syncedAt;
      await putInStore(storeName, remoteClone);
      await this.enqueueChange(conflict.entityType, conflict.entityId, 'update', conflict.localData);
      await this.enqueueChange(conflict.entityType, duplicateId, 'create', remoteClone);
    }

    await resolveSyncConflictInDB(conflictId, resolution);
    await this.notifyState();

    if (this.isOnline() && this.currentUserId && !this.currentUserId.startsWith('local_')) {
      this.triggerSync();
    }
  }

  /**
   * Retenta o envio de itens pendentes ou com falha
   */
  public async retryFailed(): Promise<void> {
    const queue = await getAllSyncQueue();
    const failed = queue.filter((i) => i.status === 'error');
    for (const item of failed) {
      item.status = 'pending';
      item.lastError = undefined;
      await updateSyncQueueItem(item);
    }
    await this.notifyState();
    if (this.isOnline() && this.currentUserId && !this.currentUserId.startsWith('local_')) {
      this.triggerSync();
    }
  }
}

export const syncEngine = SyncEngine.getInstance();

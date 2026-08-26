import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  addToSyncQueue,
  deleteFromStore,
  getAllFromStore,
  getAllSyncQueue,
  getDB,
  getLastSyncedAt,
  getPendingSyncQueue,
  getSyncConflicts,
  putInStore,
  putManyInStore,
  resolveSyncConflictInDB,
  saveSyncConflict,
  setLastSyncedAt,
  StoreName,
  updateSyncQueueItem,
} from '../db/indexedDB';
import {
  ABTestExperiment,
  AppSettings,
  Campaign,
  Company,
  Contact,
  CtaItem,
  FollowUpStrategyItem,
  HistoryEvent,
  IdealCustomerProfile,
  Lead,
  MessageTemplate,
  ObjectionItem,
  PainPointItem,
  PricingItem,
  ProofItem,
  ProspectAction,
  Service,
  SyncConflict,
  SyncEntityType,
  SyncQueueItem,
  SyncStateSummary,
  SyncStatus,
  ValueArgumentItem,
} from '../types';

/**
 * Mapping from local SyncEntityType to Firestore collection name under /users/{userId}/{collectionName}
 */
const ENTITY_COLLECTION_MAP: Record<SyncEntityType, string> = {
  companies: 'companies',
  contacts: 'contacts',
  leads: 'leads',
  services: 'services',
  campaigns: 'campaigns',
  templates: 'messages',
  sequences: 'sequences',
  followups: 'sequences',
  actions: 'tasks',
  history: 'interactions',
  abTests: 'ab_tests',
  salesEngine: 'sales_engine',
  settings: 'settings',
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
   * Retrieves high-level state of synchronization
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
   * Records a local modification to the sync queue and queues a sync
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

    // Debounce triggering cloud sync
    if (this.currentUserId && this.isOnline()) {
      if (this.syncTimer) clearTimeout(this.syncTimer);
      this.syncTimer = setTimeout(() => {
        this.triggerSync();
      }, 1000);
    }
  }

  /**
   * Performs full two-way synchronization:
   * 1. Push pending local changes to Firestore
   * 2. Pull remote updates from Firestore with conflict detection
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

    if (!this.currentUserId) {
      this.lastError = 'Usuário não autenticado no Cloud.';
      await this.notifyState();
      return { success: false, pushed: 0, pulled: 0, errors: 0 };
    }

    this.isSyncing = true;
    this.lastError = null;
    await this.notifyState();

    let pushedCount = 0;
    let pulledCount = 0;
    let errorsCount = 0;

    try {
      // Step 1: PUSH pending queue items
      const pendingItems = await getPendingSyncQueue();

      for (const item of pendingItems) {
        item.status = 'syncing';
        await updateSyncQueueItem(item);

        const collectionName = ENTITY_COLLECTION_MAP[item.entityType];
        if (!collectionName) {
          item.status = 'error';
          item.lastError = `Coleção desconhecida para o tipo ${item.entityType}`;
          await updateSyncQueueItem(item);
          errorsCount++;
          continue;
        }

        try {
          const docRef = doc(db, 'users', this.currentUserId, collectionName, item.entityId);

          if (item.operation === 'delete') {
            await deleteDoc(docRef);
          } else {
            // Strip any undefined or functions
            const sanitizedPayload = JSON.parse(JSON.stringify(item.payload || {}));
            sanitizedPayload._syncedAt = new Date().toISOString();
            sanitizedPayload._updatedAt = item.payload.updatedAt || new Date().toISOString();
            await setDoc(docRef, sanitizedPayload, { merge: true });
          }

          item.status = 'synced';
          item.lastError = undefined;
          await updateSyncQueueItem(item);
          pushedCount++;
        } catch (err: any) {
          console.error(`Erro ao sincronizar item ${item.entityType}/${item.entityId}:`, err);
          item.status = 'error';
          item.retryCount = (item.retryCount || 0) + 1;
          item.lastError = err?.message || 'Falha ao sincronizar com Firestore';
          await updateSyncQueueItem(item);
          errorsCount++;
        }
      }

      // Step 2: PULL remote data for each collection & detect conflicts
      pulledCount = await this.pullRemoteData();

      // Update last sync timestamp
      const nowIso = new Date().toISOString();
      await setLastSyncedAt(nowIso);
    } catch (globalErr: any) {
      console.error('Erro global no SyncEngine:', globalErr);
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
   * Pulls documents from Firestore and safely syncs to local IndexedDB
   */
  private async pullRemoteData(): Promise<number> {
    if (!this.currentUserId) return 0;

    let totalPulled = 0;
    const collectionsToPull: Array<{ type: SyncEntityType; collectionName: string; storeName: StoreName }> = [
      { type: 'companies', collectionName: 'companies', storeName: 'companies' },
      { type: 'contacts', collectionName: 'contacts', storeName: 'contacts' },
      { type: 'leads', collectionName: 'leads', storeName: 'leads' },
      { type: 'services', collectionName: 'services', storeName: 'services' },
      { type: 'campaigns', collectionName: 'campaigns', storeName: 'campaigns' },
      { type: 'templates', collectionName: 'messages', storeName: 'templates' },
      { type: 'sequences', collectionName: 'sequences', storeName: 'followups' },
      { type: 'actions', collectionName: 'tasks', storeName: 'actions' },
      { type: 'history', collectionName: 'interactions', storeName: 'history' },
      { type: 'abTests', collectionName: 'ab_tests', storeName: 'abTests' },
    ];

    const pendingQueue = await getPendingSyncQueue();
    const pendingEntityIds = new Set(pendingQueue.map((i) => `${i.entityType}_${i.entityId}`));

    for (const col of collectionsToPull) {
      try {
        const colRef = collection(db, 'users', this.currentUserId, col.collectionName);
        const snapshot = await getDocs(colRef);

        const localItems = await getAllFromStore<any>(col.storeName);
        const localMap = new Map<string, any>();
        localItems.forEach((item) => {
          if (item?.id) localMap.set(item.id, item);
        });

        for (const docSnap of snapshot.docs) {
          const remoteData = docSnap.data();
          const entityId = docSnap.id;
          const localItem = localMap.get(entityId);

          const hasPendingLocalChange = pendingEntityIds.has(`${col.type}_${entityId}`);

          if (hasPendingLocalChange && localItem) {
            // Check if remote data differs from local data
            const remoteTime = remoteData._updatedAt || remoteData.updatedAt || '';
            const localTime = localItem.updatedAt || '';

            if (remoteTime && localTime && remoteTime !== localTime) {
              // Register conflict without silently destroying local data
              const conflict: SyncConflict = {
                id: `conflict_${col.type}_${entityId}_${Date.now()}`,
                entityType: col.type,
                entityId,
                entityTitle: localItem.name || localItem.title || localItem.id,
                localData: localItem,
                remoteData,
                detectedAt: new Date().toISOString(),
                resolved: false,
              };
              await saveSyncConflict(conflict);
              continue; // Do not overwrite local item
            }
          }

          // If no conflict or local is clean, update local database
          if (!hasPendingLocalChange) {
            // Clean internal firestore meta before storing locally
            const toSave = { ...remoteData, id: entityId };
            delete (toSave as Record<string, any>)._syncedAt;
            await putInStore(col.storeName, toSave);
            totalPulled++;
          }
        }
      } catch (err) {
        console.warn(`Aviso ao puxar coleção ${col.collectionName}:`, err);
      }
    }

    return totalPulled;
  }

  /**
   * Resolves a recorded conflict by applying user choice
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
      // Re-enqueue local data to push over remote
      await this.enqueueChange(conflict.entityType, conflict.entityId, 'update', conflict.localData);
    } else if (resolution === 'keep_remote') {
      // Overwrite local with remote data
      const remoteClean = { ...conflict.remoteData, id: conflict.entityId };
      delete remoteClean._syncedAt;
      await putInStore(storeName, remoteClean);
    } else if (resolution === 'keep_both') {
      // Keep local with original ID, create clone with remote data
      const duplicateId = `${conflict.entityId}_nuvem_${Date.now().toString(36)}`;
      const remoteClone = {
        ...conflict.remoteData,
        id: duplicateId,
        name: conflict.remoteData.name ? `${conflict.remoteData.name} (Versão Nuvem)` : undefined,
        title: conflict.remoteData.title ? `${conflict.remoteData.title} (Versão Nuvem)` : undefined,
      };
      delete remoteClone._syncedAt;
      await putInStore(storeName, remoteClone);
      // Also re-enqueue the local data to sync safely
      await this.enqueueChange(conflict.entityType, conflict.entityId, 'update', conflict.localData);
      await this.enqueueChange(conflict.entityType, duplicateId, 'create', remoteClone);
    }

    await resolveSyncConflictInDB(conflictId, resolution);
    await this.notifyState();

    if (this.isOnline() && this.currentUserId) {
      this.triggerSync();
    }
  }

  /**
   * Retries all failed queue items
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
    if (this.isOnline() && this.currentUserId) {
      this.triggerSync();
    }
  }
}

export const syncEngine = SyncEngine.getInstance();

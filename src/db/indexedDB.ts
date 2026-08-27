import {
  ABTestExperiment,
  AppSettings,
  Campaign,
  Client,
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
  PipelineStage,
  PricingItem,
  ProofItem,
  ProspectAction,
  Service,
  SyncConflict,
  SyncEntityType,
  SyncOperationType,
  SyncQueueItem,
  ValueArgumentItem,
} from '../types';
import { DB_NAME, DB_VERSION, DEFAULT_PIPELINE_STAGES } from '../utils/constants';
import {
  INITIAL_SETTINGS,
  SEED_ACTIONS,
  SEED_CAMPAIGNS,
  SEED_CLIENTS,
  SEED_COMPANIES,
  SEED_CONTACTS,
  SEED_HISTORY,
  SEED_ICPS,
  SEED_LEADS,
  SEED_SERVICES,
  SEED_TEMPLATES,
} from './seedData';
import {
  SEED_ARGUMENTS,
  SEED_CTAS,
  SEED_FOLLOWUPS,
  SEED_OBJECTIONS,
  SEED_PAIN_POINTS,
  SEED_PRICING,
  SEED_PROOFS,
} from './salesEngineSeed';
import { SEED_AB_TESTS } from './abTestSeed';

export type StoreName =
  | 'clients'
  | 'companies'
  | 'contacts'
  | 'leads'
  | 'history'
  | 'campaigns'
  | 'services'
  | 'icps'
  | 'templates'
  | 'actions'
  | 'stages'
  | 'settings'
  | 'objections'
  | 'pricing'
  | 'proofs'
  | 'painPoints'
  | 'arguments'
  | 'ctas'
  | 'followups'
  | 'abTests'
  | 'sync_queue'
  | 'sync_conflicts'
  | 'sync_meta';

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Opens and initializes the IndexedDB database instance
 */
export async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB não é suportado neste ambiente.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Companies store
      if (!db.objectStoreNames.contains('companies')) {
        const compStore = db.createObjectStore('companies', { keyPath: 'id' });
        compStore.createIndex('status', 'status', { unique: false });
        compStore.createIndex('niche', 'niche', { unique: false });
        compStore.createIndex('category', 'category', { unique: false });
        compStore.createIndex('city', 'city', { unique: false });
        compStore.createIndex('country', 'country', { unique: false });
        compStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Contacts store
      if (!db.objectStoreNames.contains('contacts')) {
        const contactStore = db.createObjectStore('contacts', { keyPath: 'id' });
        contactStore.createIndex('companyId', 'companyId', { unique: false });
        contactStore.createIndex('phone', 'phone', { unique: false });
        contactStore.createIndex('whatsapp', 'whatsapp', { unique: false });
        contactStore.createIndex('email', 'email', { unique: false });
        contactStore.createIndex('name', 'name', { unique: false });
      }

      // Leads store
      if (!db.objectStoreNames.contains('leads')) {
        const leadStore = db.createObjectStore('leads', { keyPath: 'id' });
        leadStore.createIndex('companyId', 'companyId', { unique: false });
        leadStore.createIndex('contactId', 'contactId', { unique: false });
        leadStore.createIndex('stage', 'stage', { unique: false });
        leadStore.createIndex('status', 'status', { unique: false });
        leadStore.createIndex('priority', 'priority', { unique: false });
        leadStore.createIndex('temperature', 'temperature', { unique: false });
        leadStore.createIndex('nextActionDate', 'nextActionDate', { unique: false });
      }

      // History store
      if (!db.objectStoreNames.contains('history')) {
        const histStore = db.createObjectStore('history', { keyPath: 'id' });
        histStore.createIndex('companyId', 'companyId', { unique: false });
        histStore.createIndex('leadId', 'leadId', { unique: false });
        histStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Clients store (retrocompatibilidade)
      if (!db.objectStoreNames.contains('clients')) {
        const clientStore = db.createObjectStore('clients', { keyPath: 'id' });
        clientStore.createIndex('status', 'status', { unique: false });
        clientStore.createIndex('stageId', 'stageId', { unique: false });
        clientStore.createIndex('campaignId', 'campaignId', { unique: false });
        clientStore.createIndex('nextFollowUpDate', 'nextFollowUpDate', { unique: false });
      }

      // Campaigns store
      if (!db.objectStoreNames.contains('campaigns')) {
        const campaignStore = db.createObjectStore('campaigns', { keyPath: 'id' });
        campaignStore.createIndex('status', 'status', { unique: false });
      }

      // Services store
      if (!db.objectStoreNames.contains('services')) {
        const serviceStore = db.createObjectStore('services', { keyPath: 'id' });
        serviceStore.createIndex('active', 'active', { unique: false });
      }

      // ICPs store
      if (!db.objectStoreNames.contains('icps')) {
        const icpStore = db.createObjectStore('icps', { keyPath: 'id' });
        icpStore.createIndex('active', 'active', { unique: false });
      }

      // Templates store
      if (!db.objectStoreNames.contains('templates')) {
        const templateStore = db.createObjectStore('templates', { keyPath: 'id' });
        templateStore.createIndex('channel', 'channel', { unique: false });
        templateStore.createIndex('type', 'type', { unique: false });
      }

      // Actions store (prospecting execution queue)
      if (!db.objectStoreNames.contains('actions')) {
        const actionStore = db.createObjectStore('actions', { keyPath: 'id' });
        actionStore.createIndex('status', 'status', { unique: false });
        actionStore.createIndex('scheduledDate', 'scheduledDate', { unique: false });
        actionStore.createIndex('clientId', 'clientId', { unique: false });
      }

      // Stages store
      if (!db.objectStoreNames.contains('stages')) {
        db.createObjectStore('stages', { keyPath: 'id' });
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }

      // Sales Engine stores
      if (!db.objectStoreNames.contains('objections')) {
        const objStore = db.createObjectStore('objections', { keyPath: 'id' });
        objStore.createIndex('name', 'name', { unique: false });
        objStore.createIndex('serviceId', 'serviceId', { unique: false });
        objStore.createIndex('stage', 'stage', { unique: false });
      }

      if (!db.objectStoreNames.contains('pricing')) {
        const priceStore = db.createObjectStore('pricing', { keyPath: 'id' });
        priceStore.createIndex('serviceId', 'serviceId', { unique: false });
      }

      if (!db.objectStoreNames.contains('proofs')) {
        const proofStore = db.createObjectStore('proofs', { keyPath: 'id' });
        proofStore.createIndex('serviceId', 'serviceId', { unique: false });
        proofStore.createIndex('niche', 'niche', { unique: false });
      }

      if (!db.objectStoreNames.contains('painPoints')) {
        const painStore = db.createObjectStore('painPoints', { keyPath: 'id' });
        painStore.createIndex('niche', 'niche', { unique: false });
        painStore.createIndex('type', 'type', { unique: false });
      }

      if (!db.objectStoreNames.contains('arguments')) {
        const argStore = db.createObjectStore('arguments', { keyPath: 'id' });
        argStore.createIndex('serviceId', 'serviceId', { unique: false });
      }

      if (!db.objectStoreNames.contains('ctas')) {
        const ctaStore = db.createObjectStore('ctas', { keyPath: 'id' });
        ctaStore.createIndex('category', 'category', { unique: false });
      }

      if (!db.objectStoreNames.contains('followups')) {
        db.createObjectStore('followups', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('abTests')) {
        const abStore = db.createObjectStore('abTests', { keyPath: 'id' });
        abStore.createIndex('channel', 'channel', { unique: false });
        abStore.createIndex('status', 'status', { unique: false });
      }

      // Offline-First Sync Queue Store
      if (!db.objectStoreNames.contains('sync_queue')) {
        const queueStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
        queueStore.createIndex('status', 'status', { unique: false });
        queueStore.createIndex('createdAt', 'createdAt', { unique: false });
        queueStore.createIndex('entityType', 'entityType', { unique: false });
      }

      // Conflict Resolution Store
      if (!db.objectStoreNames.contains('sync_conflicts')) {
        const conflictStore = db.createObjectStore('sync_conflicts', { keyPath: 'id' });
        conflictStore.createIndex('resolved', 'resolved', { unique: false });
        conflictStore.createIndex('detectedAt', 'detectedAt', { unique: false });
      }

      // Sync Metadata Store (lastSyncedAt, user state)
      if (!db.objectStoreNames.contains('sync_meta')) {
        db.createObjectStore('sync_meta');
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error || new Error('Falha ao abrir IndexedDB.'));
    };
  });

  return dbPromise;
}

/**
 * Generic fetch all items from a store
 */
export async function getAllFromStore<T>(storeName: StoreName): Promise<T[]> {
  const db = await getDB();
  return new Promise<T[]>((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();

      req.onsuccess = () => resolve((req.result as T[]) || []);
      req.onerror = () => reject(req.error);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generic fetch single item by ID
 */
export async function getByIdFromStore<T>(storeName: StoreName, id: string): Promise<T | null> {
  const db = await getDB();
  return new Promise<T | null>((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(id);

      req.onsuccess = () => resolve((req.result as T) || null);
      req.onerror = () => reject(req.error);
    } catch (err) {
      reject(err);
    }
  });
}

export const getFromStore = getByIdFromStore;

/**
 * Generic put/upsert item into a store
 */
export async function putInStore<T>(storeName: StoreName, item: T, key?: IDBValidKey): Promise<void> {
  const db = await getDB();
  return new Promise<void>((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = key !== undefined ? store.put(item, key) : store.put(item);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Bulk put items into a store
 */
export async function putManyInStore<T>(storeName: StoreName, items: T[]): Promise<void> {
  const db = await getDB();
  return new Promise<void>((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      items.forEach((item) => store.put(item));

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Delete single item from a store
 */
export async function deleteFromStore(storeName: StoreName, key: IDBValidKey): Promise<void> {
  const db = await getDB();
  return new Promise<void>((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Clear entire store
 */
export async function clearStore(storeName: StoreName): Promise<void> {
  const db = await getDB();
  return new Promise<void>((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.clear();

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Loads or gets app settings from IndexedDB
 */
export async function getStoredSettings(): Promise<AppSettings> {
  const db = await getDB();
  return new Promise<AppSettings>((resolve) => {
    try {
      const tx = db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const req = store.get('app_settings');

      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result as AppSettings);
        } else {
          resolve(INITIAL_SETTINGS);
        }
      };
      req.onerror = () => resolve(INITIAL_SETTINGS);
    } catch {
      resolve(INITIAL_SETTINGS);
    }
  });
}

/**
 * Saves app settings to IndexedDB
 */
export async function saveStoredSettings(settings: AppSettings): Promise<void> {
  await putInStore('settings', settings, 'app_settings');
}

/**
 * Seeds initial base configuration (Pipeline stages, Base Scripts, Services, ICPs, Sales Engine, Settings)
 * WITHOUT any companies, contacts, leads, history, or actions.
 */
export async function seedBaseConfiguration(force = false): Promise<boolean> {
  const existingStages = await getAllFromStore<PipelineStage>('stages');
  if (existingStages.length > 0 && !force) {
    return false;
  }

  await putManyInStore<PipelineStage>('stages', DEFAULT_PIPELINE_STAGES);
  await putManyInStore<Service>('services', SEED_SERVICES);
  await putManyInStore<IdealCustomerProfile>('icps', SEED_ICPS);
  await putManyInStore<MessageTemplate>('templates', SEED_TEMPLATES);

  // Seed Sales Engine libraries
  await putManyInStore<ObjectionItem>('objections', SEED_OBJECTIONS);
  await putManyInStore<PricingItem>('pricing', SEED_PRICING);
  await putManyInStore<ProofItem>('proofs', SEED_PROOFS);
  await putManyInStore<PainPointItem>('painPoints', SEED_PAIN_POINTS);
  await putManyInStore<ValueArgumentItem>('arguments', SEED_ARGUMENTS);
  await putManyInStore<CtaItem>('ctas', SEED_CTAS);
  await putManyInStore<FollowUpStrategyItem>('followups', SEED_FOLLOWUPS);

  const existingSettings = await getAllFromStore<AppSettings>('settings');
  if (existingSettings.length === 0 || force) {
    await saveStoredSettings(INITIAL_SETTINGS);
  }

  return true;
}

/**
 * Seeds initial demo data (companies, contacts, leads, mock history) upon explicit user request
 */
export async function seedDemoData(force = false): Promise<boolean> {
  const existingCompanies = await getAllFromStore<Company>('companies');
  const existingClients = await getAllFromStore<Client>('clients');
  if ((existingCompanies.length > 0 || existingClients.length > 0) && !force) {
    return false;
  }

  // Ensure base configuration is present
  await seedBaseConfiguration(force);

  // Seed Mock Entities
  await putManyInStore<Campaign>('campaigns', SEED_CAMPAIGNS);
  await putManyInStore<Company>('companies', SEED_COMPANIES);
  await putManyInStore<Contact>('contacts', SEED_CONTACTS);
  await putManyInStore<Lead>('leads', SEED_LEADS);
  await putManyInStore<HistoryEvent>('history', SEED_HISTORY);
  await putManyInStore<Client>('clients', SEED_CLIENTS);
  await putManyInStore<ProspectAction>('actions', SEED_ACTIONS);
  await putManyInStore<ABTestExperiment>('abTests', SEED_AB_TESTS);

  return true;
}

/**
 * Checks if current database contains initial seeded mock data
 */
export async function isDemoDataLoaded(): Promise<boolean> {
  const companies = await getAllFromStore<Company>('companies');
  const clients = await getAllFromStore<Client>('clients');
  return companies.some((c) => c.id.startsWith('comp-')) || clients.some((c) => c.id.startsWith('cli-'));
}

/**
 * Clears all user database tables to start completely clean (keeps base configuration)
 */
export async function resetAllDataToEmpty(): Promise<void> {
  const userStores: StoreName[] = [
    'companies',
    'contacts',
    'leads',
    'history',
    'clients',
    'campaigns',
    'actions',
    'abTests',
  ];
  for (const s of userStores) {
    await clearStore(s);
  }
  // Ensure base configuration is preserved and ready
  await seedBaseConfiguration(false);
}

/**
 * Exports full IndexedDB state as JSON string for backup & migration
 */
export async function exportDatabaseToJSON(): Promise<string> {
  const [
    companies,
    contacts,
    leads,
    history,
    clients,
    campaigns,
    services,
    icps,
    templates,
    actions,
    stages,
    objections,
    pricing,
    proofs,
    painPoints,
    args,
    ctas,
    followups,
    abTests,
    settings,
  ] = await Promise.all([
    getAllFromStore<Company>('companies'),
    getAllFromStore<Contact>('contacts'),
    getAllFromStore<Lead>('leads'),
    getAllFromStore<HistoryEvent>('history'),
    getAllFromStore<Client>('clients'),
    getAllFromStore<Campaign>('campaigns'),
    getAllFromStore<Service>('services'),
    getAllFromStore<IdealCustomerProfile>('icps'),
    getAllFromStore<MessageTemplate>('templates'),
    getAllFromStore<ProspectAction>('actions'),
    getAllFromStore<PipelineStage>('stages'),
    getAllFromStore<ObjectionItem>('objections'),
    getAllFromStore<PricingItem>('pricing'),
    getAllFromStore<ProofItem>('proofs'),
    getAllFromStore<PainPointItem>('painPoints'),
    getAllFromStore<ValueArgumentItem>('arguments'),
    getAllFromStore<CtaItem>('ctas'),
    getAllFromStore<FollowUpStrategyItem>('followups'),
    getAllFromStore<ABTestExperiment>('abTests'),
    getStoredSettings(),
  ]);

  const payload = {
    version: '5.0.0',
    exportDate: new Date().toISOString(),
    appName: 'PROSPECT OS',
    data: {
      companies,
      contacts,
      leads,
      history,
      clients,
      campaigns,
      services,
      icps,
      templates,
      actions,
      stages,
      objections,
      pricing,
      proofs,
      painPoints,
      arguments: args,
      ctas,
      followups,
      abTests,
      settings,
    },
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Imports JSON string backup into IndexedDB with validation, sanitization, and merge/overwrite modes
 */
export async function importDatabaseFromJSON(
  jsonStr: string,
  options: { mode?: 'overwrite' | 'merge' } = { mode: 'overwrite' }
): Promise<{ success: boolean; message: string; details?: string }> {
  try {
    const { validateBackupJSON } = await import('../services/backupService');
    const validation = validateBackupJSON(jsonStr);

    if (!validation.valid || !validation.sanitizedPayload) {
      return {
        success: false,
        message: 'Arquivo de backup inválido ou corrompido.',
        details: validation.errors.join(' | '),
      };
    }

    const {
      companies,
      contacts,
      leads,
      history,
      clients,
      campaigns,
      services,
      icps,
      templates,
      actions,
      stages,
      objections,
      pricing,
      proofs,
      painPoints,
      arguments: args,
      ctas,
      followups,
      abTests,
      settings,
    } = validation.sanitizedPayload.data;

    // In overwrite mode, clean stores first
    if (options.mode === 'overwrite') {
      const storesToClear: StoreName[] = [
        'companies',
        'contacts',
        'leads',
        'history',
        'clients',
        'campaigns',
        'services',
        'icps',
        'templates',
        'actions',
        'objections',
        'pricing',
        'proofs',
        'painPoints',
        'arguments',
        'ctas',
        'followups',
        'abTests',
      ];
      for (const s of storesToClear) {
        await clearStore(s);
      }
    }

    if (Array.isArray(companies) && companies.length > 0) await putManyInStore('companies', companies);
    if (Array.isArray(contacts) && contacts.length > 0) await putManyInStore('contacts', contacts);
    if (Array.isArray(leads) && leads.length > 0) await putManyInStore('leads', leads);
    if (Array.isArray(history) && history.length > 0) await putManyInStore('history', history);
    if (Array.isArray(clients) && clients.length > 0) await putManyInStore('clients', clients);
    if (Array.isArray(campaigns) && campaigns.length > 0) await putManyInStore('campaigns', campaigns);
    if (Array.isArray(services) && services.length > 0) await putManyInStore('services', services);
    if (Array.isArray(icps) && icps.length > 0) await putManyInStore('icps', icps);
    if (Array.isArray(templates) && templates.length > 0) await putManyInStore('templates', templates);
    if (Array.isArray(actions) && actions.length > 0) await putManyInStore('actions', actions);
    if (Array.isArray(stages) && stages.length > 0) await putManyInStore('stages', stages);
    if (Array.isArray(objections) && objections.length > 0) await putManyInStore('objections', objections);
    if (Array.isArray(pricing) && pricing.length > 0) await putManyInStore('pricing', pricing);
    if (Array.isArray(proofs) && proofs.length > 0) await putManyInStore('proofs', proofs);
    if (Array.isArray(painPoints) && painPoints.length > 0) await putManyInStore('painPoints', painPoints);
    if (Array.isArray(args) && args.length > 0) await putManyInStore('arguments', args);
    if (Array.isArray(ctas) && ctas.length > 0) await putManyInStore('ctas', ctas);
    if (Array.isArray(followups) && followups.length > 0) await putManyInStore('followups', followups);
    if (Array.isArray(abTests) && abTests.length > 0) await putManyInStore('abTests', abTests);
    if (settings) await saveStoredSettings(settings);

    const totalImported =
      (companies?.length || 0) +
      (leads?.length || 0) +
      (contacts?.length || 0) +
      (actions?.length || 0) +
      (templates?.length || 0);

    return {
      success: true,
      message: `Backup restaurado com sucesso (${totalImported} registros importados)!`,
    };
  } catch (err) {
    return {
      success: false,
      message: `Erro ao importar: ${(err as Error).message}`,
    };
  }
}

// ----------------------------------------------------
// SYNC ENGINE LOCAL QUEUE & CONFLICT STORAGE HELPERS
// ----------------------------------------------------

/**
 * Adds an operation to the persistent local sync queue
 */
export async function addToSyncQueue(
  item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'status' | 'retryCount'> & { id?: string }
): Promise<SyncQueueItem> {
  const queueItem: SyncQueueItem = {
    id: item.id || `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    entityType: item.entityType,
    entityId: item.entityId,
    operation: item.operation,
    payload: item.payload,
    createdAt: new Date().toISOString(),
    status: 'pending',
    retryCount: 0,
  };

  await putInStore('sync_queue', queueItem);
  return queueItem;
}

/**
 * Gets all pending or failed items from the sync queue
 */
export async function getPendingSyncQueue(): Promise<SyncQueueItem[]> {
  const all = await getAllFromStore<SyncQueueItem>('sync_queue');
  return all.filter((item) => item.status === 'pending' || item.status === 'error');
}

/**
 * Gets all sync queue items
 */
export async function getAllSyncQueue(): Promise<SyncQueueItem[]> {
  return getAllFromStore<SyncQueueItem>('sync_queue');
}

/**
 * Updates a sync queue item
 */
export async function updateSyncQueueItem(item: SyncQueueItem): Promise<void> {
  await putInStore('sync_queue', item);
}

/**
 * Removes an item from the sync queue
 */
export async function removeSyncQueueItem(id: string): Promise<void> {
  await deleteFromStore('sync_queue', id);
}

/**
 * Clears items from the sync queue (all or only synced)
 */
export async function clearSyncQueue(onlySynced = false): Promise<void> {
  if (!onlySynced) {
    await clearStore('sync_queue');
    return;
  }
  const all = await getAllFromStore<SyncQueueItem>('sync_queue');
  const toDelete = all.filter((item) => item.status === 'synced');
  for (const item of toDelete) {
    await deleteFromStore('sync_queue', item.id);
  }
}

/**
 * Saves a sync conflict for user review
 */
export async function saveSyncConflict(conflict: SyncConflict): Promise<void> {
  await putInStore('sync_conflicts', conflict);
}

/**
 * Retrieves sync conflicts
 */
export async function getSyncConflicts(unresolvedOnly = false): Promise<SyncConflict[]> {
  const all = await getAllFromStore<SyncConflict>('sync_conflicts');
  if (unresolvedOnly) {
    return all.filter((c) => !c.resolved);
  }
  return all;
}

/**
 * Resolves a sync conflict in IndexedDB
 */
export async function resolveSyncConflictInDB(
  id: string,
  resolution: 'keep_local' | 'keep_remote' | 'keep_both'
): Promise<void> {
  const all = await getAllFromStore<SyncConflict>('sync_conflicts');
  const conflict = all.find((c) => c.id === id);
  if (!conflict) return;

  conflict.resolved = true;
  conflict.resolutionChoice = resolution;
  conflict.resolvedAt = new Date().toISOString();
  await putInStore('sync_conflicts', conflict);
}

/**
 * Deletes a sync conflict
 */
export async function deleteSyncConflict(id: string): Promise<void> {
  await deleteFromStore('sync_conflicts', id);
}

/**
 * Gets the last synced timestamp
 */
export async function getLastSyncedAt(): Promise<string | null> {
  const db = await getDB();
  return new Promise((resolve) => {
    try {
      const tx = db.transaction('sync_meta', 'readonly');
      const store = tx.objectStore('sync_meta');
      const req = store.get('lastSyncedAt');
      req.onsuccess = () => resolve((req.result as string) || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Sets the last synced timestamp
 */
export async function setLastSyncedAt(timestamp: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction('sync_meta', 'readwrite');
      const store = tx.objectStore('sync_meta');
      const req = store.put(timestamp, 'lastSyncedAt');
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    } catch (err) {
      reject(err);
    }
  });
}


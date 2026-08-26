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
  | 'abTests';

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
 * Seeds initial demo data if database is empty or upon user request
 */
export async function seedDemoData(force = false): Promise<boolean> {
  const existingCompanies = await getAllFromStore<Company>('companies');
  const existingClients = await getAllFromStore<Client>('clients');
  if ((existingCompanies.length > 0 || existingClients.length > 0) && !force) {
    return false;
  }

  await putManyInStore<PipelineStage>('stages', DEFAULT_PIPELINE_STAGES);
  await putManyInStore<Service>('services', SEED_SERVICES);
  await putManyInStore<IdealCustomerProfile>('icps', SEED_ICPS);
  await putManyInStore<MessageTemplate>('templates', SEED_TEMPLATES);
  await putManyInStore<Campaign>('campaigns', SEED_CAMPAIGNS);
  await putManyInStore<Company>('companies', SEED_COMPANIES);
  await putManyInStore<Contact>('contacts', SEED_CONTACTS);
  await putManyInStore<Lead>('leads', SEED_LEADS);
  await putManyInStore<HistoryEvent>('history', SEED_HISTORY);
  await putManyInStore<Client>('clients', SEED_CLIENTS);
  await putManyInStore<ProspectAction>('actions', SEED_ACTIONS);

  // Seed Sales Engine libraries
  await putManyInStore<ObjectionItem>('objections', SEED_OBJECTIONS);
  await putManyInStore<PricingItem>('pricing', SEED_PRICING);
  await putManyInStore<ProofItem>('proofs', SEED_PROOFS);
  await putManyInStore<PainPointItem>('painPoints', SEED_PAIN_POINTS);
  await putManyInStore<ValueArgumentItem>('arguments', SEED_ARGUMENTS);
  await putManyInStore<CtaItem>('ctas', SEED_CTAS);
  await putManyInStore<FollowUpStrategyItem>('followups', SEED_FOLLOWUPS);
  await putManyInStore<ABTestExperiment>('abTests', SEED_AB_TESTS);

  await saveStoredSettings(INITIAL_SETTINGS);

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
 * Clears all user database tables to start completely blank
 */
export async function resetAllDataToEmpty(): Promise<void> {
  const stores: StoreName[] = [
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
    'stages',
    'objections',
    'pricing',
    'proofs',
    'painPoints',
    'arguments',
    'ctas',
    'followups',
    'abTests',
  ];
  for (const s of stores) {
    await clearStore(s);
  }
  // Restore basic pipeline stages
  await putManyInStore<PipelineStage>('stages', DEFAULT_PIPELINE_STAGES);
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
 * Imports JSON string backup into IndexedDB
 */
export async function importDatabaseFromJSON(jsonStr: string): Promise<{ success: boolean; message: string }> {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed.data) {
      return { success: false, message: 'Arquivo de backup inválido.' };
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
    } = parsed.data;

    if (Array.isArray(companies)) await putManyInStore('companies', companies);
    if (Array.isArray(contacts)) await putManyInStore('contacts', contacts);
    if (Array.isArray(leads)) await putManyInStore('leads', leads);
    if (Array.isArray(history)) await putManyInStore('history', history);
    if (Array.isArray(clients)) await putManyInStore('clients', clients);
    if (Array.isArray(campaigns)) await putManyInStore('campaigns', campaigns);
    if (Array.isArray(services)) await putManyInStore('services', services);
    if (Array.isArray(icps)) await putManyInStore('icps', icps);
    if (Array.isArray(templates)) await putManyInStore('templates', templates);
    if (Array.isArray(actions)) await putManyInStore('actions', actions);
    if (Array.isArray(stages)) await putManyInStore('stages', stages);
    if (Array.isArray(objections)) await putManyInStore('objections', objections);
    if (Array.isArray(pricing)) await putManyInStore('pricing', pricing);
    if (Array.isArray(proofs)) await putManyInStore('proofs', proofs);
    if (Array.isArray(painPoints)) await putManyInStore('painPoints', painPoints);
    if (Array.isArray(args)) await putManyInStore('arguments', args);
    if (Array.isArray(ctas)) await putManyInStore('ctas', ctas);
    if (Array.isArray(followups)) await putManyInStore('followups', followups);
    if (Array.isArray(abTests)) await putManyInStore('abTests', abTests);
    if (settings) await saveStoredSettings(settings);

    return { success: true, message: 'Dados restaurados com sucesso!' };
  } catch (err) {
    return { success: false, message: `Erro ao importar: ${(err as Error).message}` };
  }
}

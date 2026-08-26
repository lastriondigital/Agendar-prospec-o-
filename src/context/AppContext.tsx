import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  clearStore,
  deleteFromStore,
  exportDatabaseToJSON,
  getAllFromStore,
  getStoredSettings,
  importDatabaseFromJSON,
  isDemoDataLoaded,
  putInStore,
  putManyInStore,
  resetAllDataToEmpty,
  saveStoredSettings,
  seedDemoData,
} from '../db/indexedDB';
import {
  ABTestExperiment,
  AppSettings,
  Campaign,
  Client,
  Company,
  Contact,
  ContactChannel,
  CtaItem,
  DuplicateMatch,
  FollowUpStrategyItem,
  HistoryEvent,
  IdealCustomerProfile,
  Lead,
  LeadPriority,
  LeadStage,
  LeadTemperature,
  MessageTemplate,
  ObjectionItem,
  PainPointItem,
  PipelineStage,
  PricingItem,
  ProofItem,
  ProspectAction,
  RouteId,
  Service,
  ValueArgumentItem,
} from '../types';
import { DEFAULT_PIPELINE_STAGES } from '../utils/constants';
import { CreateCompanyPayload, leadService } from '../services/leadService';
import { syncEngine } from '../services/syncEngine';
import { useToast } from './ToastContext';

interface AppContextType {
  activeRoute: RouteId;
  setActiveRoute: (route: RouteId) => void;
  clients: Client[];
  companies: Company[];
  contacts: Contact[];
  leads: Lead[];
  history: HistoryEvent[];
  campaigns: Campaign[];
  services: Service[];
  icps: IdealCustomerProfile[];
  templates: MessageTemplate[];
  actions: ProspectAction[];
  stages: PipelineStage[];
  settings: AppSettings;
  isLoading: boolean;
  isDemoMode: boolean;
  isOnline: boolean;
  
  // Refresh
  refreshData: () => Promise<void>;

  // Full Company, Contact & Lead operations (Módulo Completo)
  createCompanyWithLead: (payload: CreateCompanyPayload) => Promise<{ company: Company; contact: Contact; lead: Lead }>;
  updateCompany: (company: Company) => Promise<void>;
  archiveCompany: (id: string) => Promise<void>;
  unarchiveCompany: (id: string) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  addContactToCompany: (companyId: string, contact: Omit<Contact, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<Contact>;
  updateContact: (contact: Contact) => Promise<void>;
  deleteContact: (contactId: string, companyId: string) => Promise<void>;
  advanceLeadStage: (leadId: string, newStage: LeadStage, note?: string) => Promise<void>;
  scheduleNextAction: (leadId: string, title: string, date: string, channel?: ContactChannel) => Promise<void>;
  addHistoryEvent: (event: Omit<HistoryEvent, 'id' | 'timestamp'>) => Promise<HistoryEvent>;
  logInteractionAndAdvance: (params: {
    companyId: string;
    contactId?: string;
    leadId?: string;
    channel: ContactChannel;
    messageSent?: string;
    notes?: string;
    newStage?: LeadStage;
    nextActionTitle?: string;
    nextActionDate?: string;
    nextActionChannel?: ContactChannel;
  }) => Promise<void>;
  validateDuplicates: (params: {
    contactName?: string;
    companyName?: string;
    tradeName?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    excludeCompanyId?: string;
    excludeContactId?: string;
  }) => Promise<DuplicateMatch[]>;

  // Client operations (retrocompatibilidade)
  upsertClient: (client: Client) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  // Campaign operations
  upsertCampaign: (campaign: Campaign) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;

  // Service operations
  upsertService: (service: Service) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  // ICP operations (Ideal Customer Profile)
  upsertIcp: (icp: IdealCustomerProfile) => Promise<void>;
  deleteIcp: (id: string) => Promise<void>;

  // Template operations
  upsertTemplate: (template: MessageTemplate) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  updateLead: (lead: Lead) => Promise<void>;

  // Action / Execution operations
  upsertAction: (action: ProspectAction) => Promise<void>;
  completeAction: (actionId: string, outcomeNotes?: string, moveStageId?: string) => Promise<void>;
  skipAction: (actionId: string, reason?: string) => Promise<void>;
  rescheduleAction: (actionId: string, newDate: string) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
  createActionBatchForCampaign: (campaignId: string, clientIds: string[], templateId: string, scheduledDate?: string) => Promise<number>;

  // Sales Engine Operations
  objections: ObjectionItem[];
  pricing: PricingItem[];
  proofs: ProofItem[];
  painPoints: PainPointItem[];
  arguments: ValueArgumentItem[];
  ctas: CtaItem[];
  followups: FollowUpStrategyItem[];
  upsertObjection: (objection: ObjectionItem) => Promise<void>;
  deleteObjection: (id: string) => Promise<void>;
  upsertPricing: (pricing: PricingItem) => Promise<void>;
  deletePricing: (id: string) => Promise<void>;
  upsertProof: (proof: ProofItem) => Promise<void>;
  deleteProof: (id: string) => Promise<void>;
  upsertPainPoint: (painPoint: PainPointItem) => Promise<void>;
  deletePainPoint: (id: string) => Promise<void>;
  upsertArgument: (arg: ValueArgumentItem) => Promise<void>;
  deleteArgument: (id: string) => Promise<void>;
  upsertCta: (cta: CtaItem) => Promise<void>;
  deleteCta: (id: string) => Promise<void>;
  upsertFollowUp: (followUp: FollowUpStrategyItem) => Promise<void>;
  deleteFollowUp: (id: string) => Promise<void>;

  // A/B Testing Operations
  abTests: ABTestExperiment[];
  upsertAbTest: (test: ABTestExperiment) => Promise<void>;
  deleteAbTest: (id: string) => Promise<void>;
  logAbTestEvent: (params: {
    testId: string;
    variant: 'A' | 'B';
    eventType: 'send' | 'reply' | 'positive_reply' | 'conversion';
  }) => Promise<void>;

  // Settings & DB Management
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  loadDemoData: (force?: boolean) => Promise<void>;
  clearAllData: () => Promise<void>;
  exportJSON: () => Promise<string>;
  importJSON: (
    jsonStr: string,
    options?: { mode?: 'overwrite' | 'merge' }
  ) => Promise<{ success: boolean; message: string; details?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { success, error, info } = useToast();

  const [activeRoute, setActiveRoute] = useState<RouteId>('dashboard');
  const [clients, setClients] = useState<Client[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [icps, setIcps] = useState<IdealCustomerProfile[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [actions, setActions] = useState<ProspectAction[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>(DEFAULT_PIPELINE_STAGES);
  const [objections, setObjections] = useState<ObjectionItem[]>([]);
  const [pricing, setPricing] = useState<PricingItem[]>([]);
  const [proofs, setProofs] = useState<ProofItem[]>([]);
  const [painPoints, setPainPoints] = useState<PainPointItem[]>([]);
  const [argumentsList, setArgumentsList] = useState<ValueArgumentItem[]>([]);
  const [ctas, setCtas] = useState<CtaItem[]>([]);
  const [followups, setFollowups] = useState<FollowUpStrategyItem[]>([]);
  const [abTests, setAbTests] = useState<ABTestExperiment[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    dailyGoal: 15,
    estMinutesPerAction: 2,
    autoAdvanceOnDone: true,
    soundEnabled: false,
    showTips: true,
    dataStorageType: 'indexeddb_local',
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      info('Conexão restabelecida', 'Aplicação online e pronta para sincronização.');
    };
    const handleOffline = () => {
      setIsOnline(false);
      info('Modo Offline', 'Todas as alterações são salvas localmente com segurança no IndexedDB.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [info]);

  // Load all initial data from IndexedDB
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check if DB needs initial seeding
      const storedCompanies = await getAllFromStore<Company>('companies');
      const storedClients = await getAllFromStore<Client>('clients');
      if (storedCompanies.length === 0 && storedClients.length === 0) {
        await seedDemoData(false);
      }

      const [
        fetchedCompanies,
        fetchedContacts,
        fetchedLeads,
        fetchedHistory,
        fetchedClients,
        fetchedCampaigns,
        fetchedServices,
        fetchedIcps,
        fetchedTemplates,
        fetchedActions,
        fetchedStages,
        fetchedObjections,
        fetchedPricing,
        fetchedProofs,
        fetchedPainPoints,
        fetchedArguments,
        fetchedCtas,
        fetchedFollowups,
        fetchedAbTests,
        fetchedSettings,
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

      setCompanies(fetchedCompanies.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')));
      setContacts(fetchedContacts);
      setLeads(fetchedLeads);
      setHistory(fetchedHistory.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || '')));
      setClients(fetchedClients);
      setCampaigns(fetchedCampaigns);
      setServices(fetchedServices);
      setIcps(fetchedIcps);
      setTemplates(fetchedTemplates);
      setActions(fetchedActions);
      if (fetchedStages.length > 0) {
        setStages(fetchedStages.sort((a, b) => a.order - b.order));
      }
      setObjections(fetchedObjections);
      setPricing(fetchedPricing);
      setProofs(fetchedProofs);
      setPainPoints(fetchedPainPoints);
      setArgumentsList(fetchedArguments);
      setCtas(fetchedCtas);
      setFollowups(fetchedFollowups);
      setAbTests(fetchedAbTests);
      setSettings(fetchedSettings);

      const demoLoaded = await isDemoDataLoaded();
      setIsDemoMode(demoLoaded);
    } catch (err) {
      console.error('Falha ao carregar dados do IndexedDB:', err);
      error('Erro ao acessar banco de dados local', (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Company / Contact / Lead operations
  const createCompanyWithLead = useCallback(
    async (payload: CreateCompanyPayload) => {
      try {
        const res = await leadService.createCompanyWithLead(payload);
        await refreshData();
        success('Empresa e lead cadastrados com sucesso!');
        return res;
      } catch (err) {
        error('Erro ao cadastrar empresa', (err as Error).message);
        throw err;
      }
    },
    [error, refreshData, success]
  );

  const updateCompany = useCallback(
    async (company: Company) => {
      try {
        await leadService.updateCompany(company);
        await refreshData();
        success('Empresa atualizada com sucesso');
      } catch (err) {
        error('Erro ao atualizar empresa', (err as Error).message);
      }
    },
    [error, refreshData, success]
  );

  const archiveCompany = useCallback(
    async (id: string) => {
      try {
        await leadService.archiveCompany(id);
        await refreshData();
        success('Empresa arquivada com sucesso');
      } catch (err) {
        error('Erro ao arquivar empresa', (err as Error).message);
      }
    },
    [error, refreshData, success]
  );

  const unarchiveCompany = useCallback(
    async (id: string) => {
      try {
        await leadService.unarchiveCompany(id);
        await refreshData();
        success('Empresa restaurada para a lista de leads');
      } catch (err) {
        error('Erro ao desarquivar empresa', (err as Error).message);
      }
    },
    [error, refreshData, success]
  );

  const deleteCompany = useCallback(
    async (id: string) => {
      try {
        await leadService.deleteCompany(id);
        await refreshData();
        success('Empresa, contatos e histórico removidos com segurança');
      } catch (err) {
        error('Erro ao excluir empresa', (err as Error).message);
      }
    },
    [error, refreshData, success]
  );

  const addContactToCompany = useCallback(
    async (companyId: string, contactData: Omit<Contact, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => {
      try {
        const contact = await leadService.addContactToCompany(companyId, contactData);
        await refreshData();
        success('Contacto adicionado à empresa');
        return contact;
      } catch (err) {
        error('Erro ao adicionar contacto', (err as Error).message);
        throw err;
      }
    },
    [error, refreshData, success]
  );

  const updateContact = useCallback(
    async (contact: Contact) => {
      try {
        await leadService.updateContact(contact);
        await refreshData();
        success('Contacto atualizado');
      } catch (err) {
        error('Erro ao atualizar contacto', (err as Error).message);
      }
    },
    [error, refreshData, success]
  );

  const deleteContact = useCallback(
    async (contactId: string, companyId: string) => {
      try {
        await leadService.deleteContact(contactId, companyId);
        await refreshData();
        success('Contacto removido');
      } catch (err) {
        error('Erro ao remover contacto', (err as Error).message);
      }
    },
    [error, refreshData, success]
  );

  const advanceLeadStage = useCallback(
    async (leadId: string, newStage: LeadStage, note?: string) => {
      try {
        await leadService.advanceStage(leadId, newStage, note);
        await refreshData();
        success(`Estágio alterado para "${newStage}"!`);
      } catch (err) {
        error('Erro ao avançar estágio', (err as Error).message);
      }
    },
    [error, refreshData, success]
  );

  const updateLead = useCallback(
    async (lead: Lead) => {
      try {
        await leadService.updateLead(lead);
        await refreshData();
      } catch (err) {
        error('Erro ao atualizar lead', (err as Error).message);
      }
    },
    [error, refreshData]
  );

  const scheduleNextAction = useCallback(
    async (leadId: string, title: string, date: string, channel: ContactChannel = 'whatsapp') => {
      try {
        await leadService.scheduleNextAction(leadId, title, date, channel);
        await refreshData();
        success('Próxima ação agendada com sucesso!');
      } catch (err) {
        error('Erro ao agendar ação', (err as Error).message);
      }
    },
    [error, refreshData, success]
  );

  const addHistoryEvent = useCallback(
    async (event: Omit<HistoryEvent, 'id' | 'timestamp'>) => {
      try {
        const added = await leadService.addHistoryEvent(event);
        await refreshData();
        success('Interação registrada no histórico');
        return added;
      } catch (err) {
        error('Erro ao registrar histórico', (err as Error).message);
        throw err;
      }
    },
    [error, refreshData, success]
  );

  const logInteractionAndAdvance = useCallback(
    async (params: {
      companyId: string;
      contactId?: string;
      leadId?: string;
      channel: ContactChannel;
      messageSent?: string;
      notes?: string;
      newStage?: LeadStage;
      nextActionTitle?: string;
      nextActionDate?: string;
      nextActionChannel?: ContactChannel;
    }) => {
      try {
        await leadService.logInteractionAndAdvance(params);
        await refreshData();
        success('Ação concluída e registrada com sucesso!');
      } catch (err) {
        error('Erro ao registrar contato', (err as Error).message);
      }
    },
    [error, refreshData, success]
  );

  const validateDuplicates = useCallback(
    async (params: {
      contactName?: string;
      companyName?: string;
      tradeName?: string;
      phone?: string;
      whatsapp?: string;
      email?: string;
      excludeCompanyId?: string;
      excludeContactId?: string;
    }) => {
      return leadService.validateDuplicates(params);
    },
    []
  );

  // Client operations (retrocompatibilidade)
  const upsertClient = useCallback(
    async (client: Client) => {
      const now = new Date().toISOString();
      const updated: Client = {
        ...client,
        updatedAt: now,
        createdAt: client.createdAt || now,
      };

      await putInStore('clients', updated);
      await refreshData();
      success('Cliente salvo com sucesso');
    },
    [refreshData, success]
  );

  const deleteClient = useCallback(
    async (id: string) => {
      await deleteFromStore('clients', id);
      const linkedActions = actions.filter((a) => a.clientId === id);
      for (const a of linkedActions) {
        await deleteFromStore('actions', a.id);
      }
      await refreshData();
      success('Cliente removido');
    },
    [actions, refreshData, success]
  );

  // Campaign operations
  const upsertCampaign = useCallback(
    async (campaign: Campaign) => {
      const now = new Date().toISOString();
      const updated: Campaign = {
        ...campaign,
        updatedAt: now,
        createdAt: campaign.createdAt || now,
      };

      await putInStore('campaigns', updated);
      await syncEngine.enqueueChange('campaigns', updated.id, 'update', updated);
      await refreshData();
      success('Campanha salva');
    },
    [refreshData, success]
  );

  const deleteCampaign = useCallback(
    async (id: string) => {
      await deleteFromStore('campaigns', id);
      await syncEngine.enqueueChange('campaigns', id, 'delete', { id });
      await refreshData();
      success('Campanha removida');
    },
    [refreshData, success]
  );

  // Service operations
  const upsertService = useCallback(
    async (service: Service) => {
      const now = new Date().toISOString();
      const updated: Service = {
        ...service,
        updatedAt: now,
        createdAt: service.createdAt || now,
      };

      await putInStore('services', updated);
      await syncEngine.enqueueChange('services', updated.id, 'update', updated);
      await refreshData();
      success('Serviço salvo');
    },
    [refreshData, success]
  );

  const deleteService = useCallback(
    async (id: string) => {
      await deleteFromStore('services', id);
      await syncEngine.enqueueChange('services', id, 'delete', { id });
      await refreshData();
      success('Serviço removido');
    },
    [refreshData, success]
  );

  // ICP operations (Ideal Customer Profile)
  const upsertIcp = useCallback(
    async (icp: IdealCustomerProfile) => {
      const now = new Date().toISOString();
      const updated: IdealCustomerProfile = {
        ...icp,
        updatedAt: now,
        createdAt: icp.createdAt || now,
      };

      await putInStore('icps', updated);
      await refreshData();
      success('Perfil de Cliente Ideal (ICP) salvo!');
    },
    [refreshData, success]
  );

  const deleteIcp = useCallback(
    async (id: string) => {
      await deleteFromStore('icps', id);
      await refreshData();
      success('Perfil ICP removido');
    },
    [refreshData, success]
  );

  // Template operations
  const upsertTemplate = useCallback(
    async (template: MessageTemplate) => {
      const now = new Date().toISOString();
      const updated: MessageTemplate = {
        ...template,
        updatedAt: now,
        createdAt: template.createdAt || now,
      };

      await putInStore('templates', updated);
      await syncEngine.enqueueChange('templates', updated.id, 'update', updated);
      await refreshData();
      success('Modelo de mensagem salvo');
    },
    [refreshData, success]
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      await deleteFromStore('templates', id);
      await syncEngine.enqueueChange('templates', id, 'delete', { id });
      await refreshData();
      success('Modelo removido');
    },
    [refreshData, success]
  );

  // Action operations
  const upsertAction = useCallback(
    async (action: ProspectAction) => {
      const now = new Date().toISOString();
      const updated: ProspectAction = {
        ...action,
        updatedAt: now,
        createdAt: action.createdAt || now,
      };

      await putInStore('actions', updated);
      await syncEngine.enqueueChange('actions', updated.id, 'update', updated);
      await refreshData();
      success('Ação atualizada');
    },
    [refreshData, success]
  );

  const completeAction = useCallback(
    async (actionId: string, outcomeNotes?: string, moveStageId?: string) => {
      const action = actions.find((a) => a.id === actionId);
      if (!action) return;

      const now = new Date().toISOString();
      const updatedAction: ProspectAction = {
        ...action,
        status: 'completed',
        outcomeNotes,
        executedAt: now,
        updatedAt: now,
      };

      await putInStore('actions', updatedAction);
      await syncEngine.enqueueChange('actions', updatedAction.id, 'update', updatedAction);

      // Update client last contacted date and stage if requested
      const client = clients.find((c) => c.id === action.clientId);
      if (client) {
        const updatedClient: Client = {
          ...client,
          lastContactedAt: now,
          stageId: moveStageId || client.stageId,
          updatedAt: now,
        };
        await putInStore('clients', updatedClient);
      }

      // Se a ação pertencia a uma campanha com sequência, calcular a próxima ação automaticamente
      if (action.campaignId) {
        const campaign = campaigns.find((c) => c.id === action.campaignId);
        if (campaign && campaign.sequence && campaign.sequence.length > 0) {
          const currentStepIndex = campaign.sequence.findIndex(
            (s) => s.title.toLowerCase() === (action.customMessage || '').toLowerCase()
          );
          const nextStepIndex = currentStepIndex >= 0 ? currentStepIndex + 1 : 1;
          if (nextStepIndex < campaign.sequence.length) {
            const nextStep = campaign.sequence[nextStepIndex];
            const currentOffset = currentStepIndex >= 0 ? campaign.sequence[currentStepIndex].dayOffset : 0;
            const deltaDays = nextStep.dayOffset - currentOffset;

            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + (deltaDays > 0 ? deltaDays : 2));
            const nextDateStr = nextDate.toISOString().slice(0, 10);

            const nextAction: ProspectAction = {
              id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              clientId: action.clientId,
              campaignId: campaign.id,
              templateId: nextStep.templateId,
              channel: nextStep.channel || campaign.channel,
              scheduledDate: nextDateStr,
              status: 'pending',
              priority: 'medium',
              estMinutes: 2,
              customMessage: nextStep.title,
              createdAt: now,
              updatedAt: now,
            };
            await putInStore('actions', nextAction);
            await syncEngine.enqueueChange('actions', nextAction.id, 'create', nextAction);
          }
        }
      }

      await refreshData();
      success('Ação concluída e próxima etapa calculada com sucesso!');
    },
    [actions, clients, campaigns, refreshData, success]
  );

  const skipAction = useCallback(
    async (actionId: string, reason?: string) => {
      const action = actions.find((a) => a.id === actionId);
      if (!action) return;

      const now = new Date().toISOString();
      const updatedAction: ProspectAction = {
        ...action,
        status: 'skipped',
        outcomeNotes: reason ? `Ignorada: ${reason}` : 'Ignorada na fila',
        updatedAt: now,
      };

      await putInStore('actions', updatedAction);
      await syncEngine.enqueueChange('actions', updatedAction.id, 'update', updatedAction);
      await refreshData();
      info('Ação ignorada');
    },
    [actions, info, refreshData]
  );

  const rescheduleAction = useCallback(
    async (actionId: string, newDate: string) => {
      const action = actions.find((a) => a.id === actionId);
      if (!action) return;

      const now = new Date().toISOString();
      const updatedAction: ProspectAction = {
        ...action,
        scheduledDate: newDate,
        status: 'rescheduled',
        updatedAt: now,
      };

      await putInStore('actions', updatedAction);
      await syncEngine.enqueueChange('actions', updatedAction.id, 'update', updatedAction);
      await refreshData();
      success(`Reagendada para ${newDate}`);
    },
    [actions, refreshData, success]
  );

  const deleteAction = useCallback(
    async (id: string) => {
      await deleteFromStore('actions', id);
      await syncEngine.enqueueChange('actions', id, 'delete', { id });
      await refreshData();
      success('Ação removida da fila');
    },
    [refreshData, success]
  );

  const createActionBatchForCampaign = useCallback(
    async (
      campaignId: string,
      clientIds: string[],
      templateId: string,
      scheduledDate?: string
    ) => {
      const campaign = campaigns.find((c) => c.id === campaignId);
      const channel = campaign?.channel || 'whatsapp';
      const targetDate = scheduledDate || new Date().toISOString().slice(0, 10);

      const newActions: ProspectAction[] = clientIds.map((cId, index) => ({
        id: `act-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 5)}`,
        clientId: cId,
        campaignId,
        templateId,
        channel,
        scheduledDate: targetDate,
        status: 'pending',
        priority: 'medium',
        estMinutes: settings.estMinutesPerAction || 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      await putManyInStore('actions', newActions);
      await refreshData();
      success(`${newActions.length} ações geradas para ${targetDate}!`);
      return newActions.length;
    },
    [campaigns, refreshData, settings.estMinutesPerAction, success]
  );

  // Sales Engine operations
  const upsertObjection = useCallback(
    async (objection: ObjectionItem) => {
      await putInStore('objections', objection);
      await refreshData();
      success('Objeção salva na biblioteca!');
    },
    [refreshData, success]
  );

  const deleteObjection = useCallback(
    async (id: string) => {
      await deleteFromStore('objections', id);
      await refreshData();
      success('Objeção removida.');
    },
    [refreshData, success]
  );

  const upsertPricing = useCallback(
    async (priceItem: PricingItem) => {
      await putInStore('pricing', priceItem);
      await refreshData();
      success('Tabela de preços salva com sucesso!');
    },
    [refreshData, success]
  );

  const deletePricing = useCallback(
    async (id: string) => {
      await deleteFromStore('pricing', id);
      await refreshData();
      success('Configuração de preço removida.');
    },
    [refreshData, success]
  );

  const upsertProof = useCallback(
    async (proof: ProofItem) => {
      await putInStore('proofs', proof);
      await refreshData();
      success('Prova social salva na biblioteca!');
    },
    [refreshData, success]
  );

  const deleteProof = useCallback(
    async (id: string) => {
      await deleteFromStore('proofs', id);
      await refreshData();
      success('Prova social removida.');
    },
    [refreshData, success]
  );

  const upsertPainPoint = useCallback(
    async (painPoint: PainPointItem) => {
      await putInStore('painPoints', painPoint);
      await refreshData();
      success('Problema / Dor salvo na biblioteca!');
    },
    [refreshData, success]
  );

  const deletePainPoint = useCallback(
    async (id: string) => {
      await deleteFromStore('painPoints', id);
      await refreshData();
      success('Item de dor removido.');
    },
    [refreshData, success]
  );

  const upsertArgument = useCallback(
    async (arg: ValueArgumentItem) => {
      await putInStore('arguments', arg);
      await refreshData();
      success('Argumento de valor salvo!');
    },
    [refreshData, success]
  );

  const deleteArgument = useCallback(
    async (id: string) => {
      await deleteFromStore('arguments', id);
      await refreshData();
      success('Argumento removido.');
    },
    [refreshData, success]
  );

  const upsertCta = useCallback(
    async (cta: CtaItem) => {
      await putInStore('ctas', cta);
      await refreshData();
      success('CTA salvo na biblioteca!');
    },
    [refreshData, success]
  );

  const deleteCta = useCallback(
    async (id: string) => {
      await deleteFromStore('ctas', id);
      await refreshData();
      success('CTA removido.');
    },
    [refreshData, success]
  );

  const upsertFollowUp = useCallback(
    async (followUp: FollowUpStrategyItem) => {
      await putInStore('followups', followUp);
      await syncEngine.enqueueChange('followups', followUp.id, 'update', followUp);
      await refreshData();
      success('Estratégia de Follow-up salva!');
    },
    [refreshData, success]
  );

  const deleteFollowUp = useCallback(
    async (id: string) => {
      await deleteFromStore('followups', id);
      await syncEngine.enqueueChange('followups', id, 'delete', { id });
      await refreshData();
      success('Estratégia removida.');
    },
    [refreshData, success]
  );

  // A/B Testing Operations
  const upsertAbTest = useCallback(
    async (test: ABTestExperiment) => {
      // Re-calculate rates and winner automatically based on empirical numbers
      const varA = { ...test.variantA };
      const varB = { ...test.variantB };

      varA.replyRate = varA.sentCount > 0 ? Math.round((varA.replyCount / varA.sentCount) * 1000) / 10 : 0;
      varA.positiveReplyRate = varA.sentCount > 0 ? Math.round((varA.positiveReplyCount / varA.sentCount) * 1000) / 10 : 0;
      varA.conversionRate = varA.sentCount > 0 ? Math.round((varA.conversionCount / varA.sentCount) * 1000) / 10 : 0;

      varB.replyRate = varB.sentCount > 0 ? Math.round((varB.replyCount / varB.sentCount) * 1000) / 10 : 0;
      varB.positiveReplyRate = varB.sentCount > 0 ? Math.round((varB.positiveReplyCount / varB.sentCount) * 1000) / 10 : 0;
      varB.conversionRate = varB.sentCount > 0 ? Math.round((varB.conversionCount / varB.sentCount) * 1000) / 10 : 0;

      let winnerVariant: 'A' | 'B' | 'empate' | 'dados_insuficientes' = 'dados_insuficientes';
      let insightSummary = 'Aguardando mais envios para consolidar comparação estatística.';

      if (varA.sentCount >= 10 && varB.sentCount >= 10) {
        if (varA.replyRate > varB.replyRate) {
          winnerVariant = 'A';
          insightSummary = `Variante A obteve maior taxa de resposta (${varA.replyRate}% vs ${varB.replyRate}%).`;
        } else if (varB.replyRate > varA.replyRate) {
          winnerVariant = 'B';
          insightSummary = `Variante B obteve maior taxa de resposta (${varB.replyRate}% vs ${varA.replyRate}%).`;
        } else {
          winnerVariant = 'empate';
          insightSummary = `Ambas as variantes registraram a mesma taxa de resposta (${varA.replyRate}%).`;
        }
      }

      const updatedTest: ABTestExperiment = {
        ...test,
        variantA: varA,
        variantB: varB,
        winnerVariant,
        insightSummary,
        updatedAt: new Date().toISOString(),
      };

      await putInStore('abTests', updatedTest);
      await syncEngine.enqueueChange('abTests', updatedTest.id, 'update', updatedTest);
      await refreshData();
      success('Teste A/B salvo!');
    },
    [refreshData, success]
  );

  const deleteAbTest = useCallback(
    async (id: string) => {
      await deleteFromStore('abTests', id);
      await syncEngine.enqueueChange('abTests', id, 'delete', { id });
      await refreshData();
      success('Teste A/B removido.');
    },
    [refreshData, success]
  );

  const logAbTestEvent = useCallback(
    async (params: {
      testId: string;
      variant: 'A' | 'B';
      eventType: 'send' | 'reply' | 'positive_reply' | 'conversion';
    }) => {
      const existing = abTests.find((t) => t.id === params.testId);
      if (!existing) return;

      const target = params.variant === 'A' ? { ...existing.variantA } : { ...existing.variantB };

      if (params.eventType === 'send') target.sentCount += 1;
      if (params.eventType === 'reply') target.replyCount += 1;
      if (params.eventType === 'positive_reply') {
        target.positiveReplyCount += 1;
        target.replyCount = Math.max(target.replyCount, target.positiveReplyCount);
      }
      if (params.eventType === 'conversion') {
        target.conversionCount += 1;
        target.positiveReplyCount = Math.max(target.positiveReplyCount, target.conversionCount);
        target.replyCount = Math.max(target.replyCount, target.positiveReplyCount);
      }

      const updated: ABTestExperiment = {
        ...existing,
        variantA: params.variant === 'A' ? target : existing.variantA,
        variantB: params.variant === 'B' ? target : existing.variantB,
      };

      await upsertAbTest(updated);
    },
    [abTests, upsertAbTest]
  );

  // Settings & DB Management
  const updateSettings = useCallback(
    async (newSettings: Partial<AppSettings>) => {
      const merged: AppSettings = { ...settings, ...newSettings };
      await saveStoredSettings(merged);
      setSettings(merged);
      success('Configurações salvas');
    },
    [settings, success]
  );

  const loadDemoData = useCallback(
    async (force = true) => {
      setIsLoading(true);
      await seedDemoData(force);
      await refreshData();
      setIsDemoMode(true);
      success('Dados de demonstração carregados!', 'Você pode testar a prospecção imediatamente.');
    },
    [refreshData, success]
  );

  const clearAllData = useCallback(async () => {
    setIsLoading(true);
    await resetAllDataToEmpty();
    await refreshData();
    setIsDemoMode(false);
    success('Banco de dados local limpo', 'Pronto para você cadastrar seus dados reais.');
  }, [refreshData, success]);

  const exportJSON = useCallback(async () => {
    return await exportDatabaseToJSON();
  }, []);

  const importJSON = useCallback(
    async (jsonStr: string, options?: { mode?: 'overwrite' | 'merge' }) => {
      setIsLoading(true);
      const res = await importDatabaseFromJSON(jsonStr, options);
      await refreshData();
      if (res.success) {
        success(res.message);
      } else {
        error(res.message, res.details);
      }
      return res;
    },
    [error, refreshData, success]
  );

  return (
    <AppContext.Provider
      value={{
        activeRoute,
        setActiveRoute,
        clients,
        companies,
        contacts,
        leads,
        history,
        campaigns,
        services,
        icps,
        templates,
        actions,
        stages,
        settings,
        objections,
        pricing,
        proofs,
        painPoints,
        arguments: argumentsList,
        ctas,
        followups,
        isLoading,
        isDemoMode,
        isOnline,
        refreshData,
        createCompanyWithLead,
        updateCompany,
        archiveCompany,
        unarchiveCompany,
        deleteCompany,
        addContactToCompany,
        updateContact,
        deleteContact,
        advanceLeadStage,
        updateLead,
        scheduleNextAction,
        addHistoryEvent,
        logInteractionAndAdvance,
        validateDuplicates,
        upsertClient,
        deleteClient,
        upsertCampaign,
        deleteCampaign,
        upsertService,
        deleteService,
        upsertIcp,
        deleteIcp,
        upsertTemplate,
        deleteTemplate,
        upsertAction,
        completeAction,
        skipAction,
        rescheduleAction,
        deleteAction,
        createActionBatchForCampaign,
        upsertObjection,
        deleteObjection,
        upsertPricing,
        deletePricing,
        upsertProof,
        deleteProof,
        upsertPainPoint,
        deletePainPoint,
        upsertArgument,
        deleteArgument,
        upsertCta,
        deleteCta,
        upsertFollowUp,
        deleteFollowUp,
        abTests,
        upsertAbTest,
        deleteAbTest,
        logAbTestEvent,
        updateSettings,
        loadDemoData,
        clearAllData,
        exportJSON,
        importJSON,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

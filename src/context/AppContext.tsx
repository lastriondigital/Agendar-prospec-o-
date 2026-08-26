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
  AppSettings,
  Campaign,
  Client,
  Company,
  Contact,
  ContactChannel,
  DuplicateMatch,
  HistoryEvent,
  IdealCustomerProfile,
  Lead,
  LeadPriority,
  LeadStage,
  LeadTemperature,
  MessageTemplate,
  PipelineStage,
  ProspectAction,
  RouteId,
  Service,
} from '../types';
import { DEFAULT_PIPELINE_STAGES } from '../utils/constants';
import { CreateCompanyPayload, leadService } from '../services/leadService';
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

  // Action / Execution operations
  upsertAction: (action: ProspectAction) => Promise<void>;
  completeAction: (actionId: string, outcomeNotes?: string, moveStageId?: string) => Promise<void>;
  skipAction: (actionId: string, reason?: string) => Promise<void>;
  rescheduleAction: (actionId: string, newDate: string) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
  createActionBatchForCampaign: (campaignId: string, clientIds: string[], templateId: string, scheduledDate?: string) => Promise<number>;

  // Settings & DB Management
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  loadDemoData: (force?: boolean) => Promise<void>;
  clearAllData: () => Promise<void>;
  exportJSON: () => Promise<string>;
  importJSON: (jsonStr: string) => Promise<{ success: boolean; message: string }>;
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
      await refreshData();
      success('Campanha salva');
    },
    [refreshData, success]
  );

  const deleteCampaign = useCallback(
    async (id: string) => {
      await deleteFromStore('campaigns', id);
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
      await refreshData();
      success('Serviço salvo');
    },
    [refreshData, success]
  );

  const deleteService = useCallback(
    async (id: string) => {
      await deleteFromStore('services', id);
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
      await refreshData();
      success('Modelo de mensagem salvo');
    },
    [refreshData, success]
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      await deleteFromStore('templates', id);
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

      await refreshData();
      success('Ação concluída com sucesso!');
    },
    [actions, clients, refreshData, success]
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
      await refreshData();
      success(`Reagendada para ${newDate}`);
    },
    [actions, refreshData, success]
  );

  const deleteAction = useCallback(
    async (id: string) => {
      await deleteFromStore('actions', id);
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
    async (jsonStr: string) => {
      setIsLoading(true);
      const res = await importDatabaseFromJSON(jsonStr);
      await refreshData();
      if (res.success) {
        success(res.message);
      } else {
        error(res.message);
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

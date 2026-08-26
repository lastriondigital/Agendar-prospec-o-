import { Campaign, Client, MessageTemplate, PipelineStage, ProspectAction, Service } from '../types';

/**
 * StorageAdapter interface provides clean decoupling between UI and storage backend.
 * Currently backed by IndexedDB for instant offline-first operation,
 * with direct compatibility for future Firebase Firestore sync adapter.
 */
export interface IStorageAdapter {
  // Clients
  getClients(): Promise<Client[]>;
  getClientById(id: string): Promise<Client | null>;
  saveClient(client: Client): Promise<void>;
  deleteClient(id: string): Promise<void>;

  // Campaigns
  getCampaigns(): Promise<Campaign[]>;
  saveCampaign(campaign: Campaign): Promise<void>;
  deleteCampaign(id: string): Promise<void>;

  // Services
  getServices(): Promise<Service[]>;
  saveService(service: Service): Promise<void>;
  deleteService(id: string): Promise<void>;

  // Message Templates
  getTemplates(): Promise<MessageTemplate[]>;
  saveTemplate(template: MessageTemplate): Promise<void>;
  deleteTemplate(id: string): Promise<void>;

  // Prospect Actions (Execution Queue)
  getActions(): Promise<ProspectAction[]>;
  saveAction(action: ProspectAction): Promise<void>;
  deleteAction(id: string): Promise<void>;

  // Pipeline Stages
  getStages(): Promise<PipelineStage[]>;
  saveStage(stage: PipelineStage): Promise<void>;
}

export type RouteId = 
  | 'dashboard'
  | 'prospecting'
  | 'clients'
  | 'pipeline'
  | 'planner'
  | 'messages'
  | 'campaigns'
  | 'services'
  | 'analytics'
  | 'settings';

export type ContactChannel = 'whatsapp' | 'linkedin' | 'email' | 'call' | 'instagram';

export type LeadStatus = 'new' | 'in_contact' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost' | 'archived';

export type ActionStatus = 'pending' | 'completed' | 'skipped' | 'rescheduled';

export type ActionPriority = 'high' | 'medium' | 'low';

export type TemplateType = 'first_contact' | 'follow_up' | 'break_up' | 'value_nudge' | 'custom';

// Os 14 Estágios do PROSPECT OS
export type LeadStage =
  | 'NOVO'
  | 'QUALIFICADO'
  | 'PRIMEIRO_CONTACTO'
  | 'RESPONDEU'
  | 'INTERESSADO'
  | 'REUNIÃO'
  | 'PROPOSTA'
  | 'NEGOCIAÇÃO'
  | 'CLIENTE'
  | 'SEM_RESPOSTA'
  | 'OBJEÇÃO'
  | 'ADIADO'
  | 'PERDIDO'
  | 'REATIVAÇÃO';

export type LeadPriority = 'alta' | 'média' | 'baixa' | 'high' | 'medium' | 'low';
export type LeadTemperature = 'quente' | 'morno' | 'frio' | 'hot' | 'warm' | 'cold';
export type CompanyStatus = 'active' | 'archived' | 'lead' | 'client';

/**
 * Modelo completo de Empresa
 */
export interface Company {
  id: string;
  name: string; // nome
  tradeName?: string; // nome fantasia
  category: string; // categoria
  niche: string; // nicho
  country: string; // país
  city: string; // cidade
  address?: string; // endereço
  website?: string; // website
  instagram?: string; // Instagram
  facebook?: string; // Facebook
  linkedin?: string; // LinkedIn
  googleBusiness?: string; // Google Business
  unitsCount?: number; // número de unidades
  notes?: string; // observações
  createdAt: string; // data de criação
  updatedAt: string; // data de atualização
  status: CompanyStatus; // status
}

/**
 * Modelo completo de Contacto
 */
export interface Contact {
  id: string;
  companyId: string;
  name: string; // nome
  role?: string; // cargo
  phone?: string; // telefone
  whatsapp?: string; // WhatsApp
  email?: string; // email
  notes?: string; // observações
  isPrimary?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Modelo completo de Lead
 */
export interface Lead {
  id: string;
  companyId: string;
  contactId?: string;
  serviceId?: string;
  serviceName?: string; // serviço
  source?: string; // origem (Google Maps, Instagram, Indicação, etc)
  score?: number; // score (0-100)
  priority: LeadPriority; // prioridade
  temperature: LeadTemperature; // temperatura
  stage: LeadStage; // estágio (os 14 estágios)
  status: 'active' | 'won' | 'lost' | 'archived' | 'paused';
  entryDate: string; // data de entrada
  lastContactDate?: string; // último contacto
  nextActionTitle?: string; // próxima ação
  nextActionDate?: string; // próxima ação em
  nextActionChannel?: ContactChannel;
  notes?: string; // observações
  createdAt: string;
  updatedAt: string;
}

export type HistoryEventType =
  | 'stage_change'
  | 'action_completed'
  | 'contact_made'
  | 'message_sent'
  | 'response_received'
  | 'proposal_sent'
  | 'meeting_scheduled'
  | 'meeting_held'
  | 'note_added'
  | 'follow_up'
  | 'created'
  | 'archived'
  | 'unarchived'
  | 'updated';

/**
 * Histórico de Interações / Timeline de Lead & Empresa
 */
export interface HistoryEvent {
  id: string;
  companyId: string;
  contactId?: string;
  leadId?: string;
  type: HistoryEventType;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Resultado de validação Anti-Duplicação
 */
export interface DuplicateMatch {
  type: 'phone' | 'whatsapp' | 'email' | 'name_company';
  reason: string;
  company: Company;
  contact?: Contact;
  lead?: Lead;
  matchedField: string;
  matchedValue: string;
}

/**
 * Visão consolidada para compatibilidade e listagem
 */
export interface Client {
  id: string;
  name: string;
  company: string;
  role?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  linkedinUrl?: string;
  website?: string;
  segment?: string;
  status: LeadStatus;
  stageId: string;
  campaignId?: string;
  serviceIds: string[];
  notes?: string;
  tags: string[];
  lastContactedAt?: string;
  nextFollowUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  targetAudience?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  serviceId?: string;
  defaultTemplateId?: string;
  channel: ContactChannel;
  dailyGoal: number;
  totalTarget: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCommonObjection {
  objection: string;
  counterArgument: string;
}

/**
 * Módulo Serviços do PROSPECT OS
 */
export interface Service {
  id: string;
  name: string; // nome
  description: string; // descrição
  basePrice: number; // preço base
  currency: string; // moeda (ex: BRL, EUR, USD)
  anchorPrice?: number; // preço âncora
  benefits: string[]; // benefícios
  targetAudience: string[]; // público ideal
  problemsSolved: string[]; // problemas resolvidos
  commonObjections: ServiceCommonObjection[]; // objeções comuns
  arguments: string[]; // argumentos
  proofs: string[]; // provas associadas
  defaultCta: string; // CTA padrão
  active: boolean; // ativo/inativo

  // Campos de retrocompatibilidade
  code?: string;
  category?: string;
  ticketValue?: number; // alias para basePrice
  valueProposition?: string; // alias para primeiro benefício ou descrição
  keyDifferentiators?: string[]; // alias para arguments
  idealCustomerProfile?: string; // alias textual
  createdAt: string;
  updatedAt: string;
}

/**
 * Módulo ICP — Ideal Customer Profile
 */
export interface IdealCustomerProfile {
  id: string;
  name: string; // nome do perfil
  niches: string[]; // nichos atendidos
  countries: string[]; // países
  cities: string[]; // cidades
  size: string[]; // tamanho (ex: Micro, Pequena, Média, Grande)
  unitsRange?: string; // número de unidades (ex: "1 a 3 unidades", "Redes 5+")
  priceRange: {
    min: number;
    max: number;
  }; // faixa de preço / ticket ideal
  problems: string[]; // problemas típicos
  suitableServiceIds: string[]; // serviços adequados
  positiveCriteria: string[]; // critérios positivos (sinais verdes)
  negativeCriteria: string[]; // critérios negativos (red flags)
  active?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Classificação de Lead Scoring
 * 0–39 = baixa
 * 40–69 = média
 * 70–84 = alta
 * 85–100 = prioridade máxima
 */
export type LeadScoreClassification = 'baixa' | 'média' | 'alta' | 'prioridade_maxima';

export interface ScoringBreakdownItem {
  ruleId: string;
  label: string;
  points: number;
  matched: boolean;
  reason: string;
}

export interface LeadScoreResult {
  score: number;
  classification: LeadScoreClassification;
  breakdown: ScoringBreakdownItem[];
}

/**
 * Configuração dos pesos de pontuação (Score 0-100)
 */
export interface ScoringWeightConfig {
  hasWebsite: number; // possui website
  outdatedWebsite: number; // website desatualizado/oportunidade
  noWebsite: number; // sem website
  hasGoogleBusiness: number; // presença no Google
  hasInstagram: number; // Instagram ativo
  hasDirectWhatsapp: number; // contato com WhatsApp disponível
  hasPhone: number; // contato com telefone
  noContactPhonePenalty: number; // sem telefone cadastrado
  hasDecisionMakerRole: number; // cargo de decisor identificado (CEO/Diretor/Sócio)
  singleUnit: number; // 1 unidade física
  multipleUnits: number; // 2 a 5 unidades
  largeChainUnits: number; // 6+ unidades
  matchesIcpNiche: number; // nicho compatível com ICP
  matchesStrategicLocation: number; // localização estratégica
  apparentNeedIdentified: number; // necessidade aparente identificada nas notas
  hotTemperatureBonus: number; // temperatura quente
  recentActivityBonus: number; // atividade recente (< 7 dias)
}

export interface MessageTemplate {
  id: string;
  title: string;
  channel: ContactChannel;
  type: TemplateType;
  content: string;
  variables: string[]; // e.g. ['nome', 'empresa', 'cargo', 'servico']
  notes?: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProspectAction {
  id: string;
  clientId: string;
  campaignId?: string;
  templateId?: string;
  channel: ContactChannel;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:mm
  status: ActionStatus;
  priority: ActionPriority;
  estMinutes: number; // default 1-3 min per quick execution
  customMessage?: string;
  outcomeNotes?: string;
  executedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color: string;
  statusMapping: LeadStatus;
}

export interface ExecutionMetrics {
  totalActionsToday: number;
  completedToday: number;
  pendingToday: number;
  estimatedMinutesLeft: number;
  nextAction: {
    action: ProspectAction;
    client: Client;
    template?: MessageTemplate;
  } | null;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  dailyGoal: number;
  estMinutesPerAction: number;
  autoAdvanceOnDone: boolean;
  soundEnabled: boolean;
  showTips: boolean;
  dataStorageType: 'indexeddb_local' | 'cloud_sync_ready';
  lastBackupDate?: string;
  scoringWeights?: ScoringWeightConfig;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void | Promise<void>;
}

export interface ExecutionQueueItem {
  action: ProspectAction;
  client: Client;
  company?: Company;
  contact?: Contact;
  lead?: Lead;
  campaign?: Campaign;
  service?: Service;
  template?: MessageTemplate;
  interpolatedMessage: string;
  objective?: string;
  recentHistory?: HistoryEvent[];
}

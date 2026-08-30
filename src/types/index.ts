export type RouteId = 
  | 'dashboard'
  | 'prospecting'
  | 'clients'
  | 'pipeline'
  | 'sales-engine'
  | 'planner'
  | 'messages'
  | 'campaigns'
  | 'services'
  | 'analytics'
  | 'settings';

export type ContactChannel =
  | 'whatsapp'
  | 'whatsapp_business'
  | 'instagram'
  | 'email'
  | 'linkedin'
  | 'call'
  | string;

export type CampaignType =
  | 'prospeccao'
  | 'follow_up'
  | 'reativacao'
  | 'pos_venda'
  | 'nutricao'
  | 'oferta'
  | 'personalizada'
  | string;

export type LeadStatus = 'new' | 'in_contact' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost' | 'archived';

export type ActionStatus =
  | 'pending'
  | 'scheduled'
  | 'completed'
  | 'skipped'
  | 'rescheduled'
  | 'cancelled'
  | 'failed'
  | 'agendada'
  | 'pendente'
  | 'concluida'
  | 'concluído'
  | 'cancelada';

export type ScheduledMessageStatus = ActionStatus;

export type ActionPriority = 'high' | 'medium' | 'low';

export type TemplateCategory =
  | 'primeiro_contacto'
  | 'follow_up'
  | 'diagnóstico'
  | 'prova'
  | 'proposta'
  | 'objeção'
  | 'fechamento'
  | 'pós_venda'
  | 'reativação'
  | 'custom';

export type TemplateType = TemplateCategory;

// Os 14+ Estágios do PROSPECT OS
export type LeadStage =
  | 'NOVO'
  | 'QUALIFICADO'
  | 'PRIMEIRO_CONTACTO'
  | 'SEM_RESPOSTA_2'
  | 'SEM_RESPOSTA_3'
  | 'SEM_RESPOSTA_OUTRO_HORARIO'
  | 'SEM_RESPOSTA_OUTRO_DIA'
  | 'RESPOSTA_RECEBIDA'
  | 'RESPONDEU'
  | 'RESPOSTA_POSITIVA'
  | 'RESPOSTA_NEGATIVA'
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

export type LeadPriority = 'alta' | 'média' | 'media' | 'baixa' | 'high' | 'medium' | 'low';
export type LeadTemperature = 'quente' | 'morno' | 'frio' | 'hot' | 'warm' | 'cold';
export type CompanyStatus = 'active' | 'archived' | 'lead' | 'client';

export type LostReasonType =
  | 'sem_orcamento'
  | 'concorrente'
  | 'nao_interessado'
  | 'sem_resposta'
  | 'servico_inadequado'
  | 'outro';

export type ResponseOutcomeType =
  | 'interessado'
  | 'nao_interessado'
  | 'pediu_informacoes'
  | 'pediu_orcamento'
  | 'pediu_falar_depois'
  | 'reuniao'
  | 'outro';

export type WhatsAppScriptType =
  | 'primeiro_contacto'
  | 'follow_up'
  | 'follow_up_2'
  | 'follow_up_3'
  | 'outro_horario'
  | 'outro_dia'
  | 'diagnostico'
  | 'proposta'
  | 'reativacao'
  | 'outro';

/**
 * Perfil do Usuário Autenticado
 */
export interface UserProfile {
  uid: string;
  nome: string;
  email: string;
  foto?: string | null;
  provider: 'password' | 'google' | 'anonymous';
  createdAt: string;
  updatedAt: string;
  onboardingCompleted: boolean;
}

/**
 * Modelo completo de Empresa
 */
export interface Company {
  id: string;
  name: string; // nome
  tradeName?: string; // nome fantasia
  category?: string; // categoria
  niche: string; // nicho
  country: string; // país
  state?: string; // estado/província
  city: string; // cidade
  address?: string; // endereço
  website?: string; // website
  websiteQuality?: 'modern' | 'outdated' | 'slow' | 'broken' | 'good' | 'poor' | 'boa' | 'media' | 'ruim' | 'nenhuma' | string;
  companyWhatsApp?: string; // WhatsApp da empresa
  companyPhone?: string; // Telefone da empresa
  companyEmail?: string; // Email da empresa
  companyWhatsAppVerified?: boolean; // WhatsApp verificado
  googleRating?: number;
  googleReviewsCount?: number;
  googleBusiness?: string; // Google Business
  instagram?: string; // Instagram
  instagramActive?: boolean;
  facebook?: string; // Facebook
  linkedin?: string; // LinkedIn
  unitsCount?: number; // número de unidades
  numberOfUnits?: number; // alias
  apparentNeed?: string;
  notes?: string; // observações
  isFavorite?: boolean; // favorito
  serviceQualifications?: Record<string, QualificationResult>; // Score e diagnósticos calculados por serviço (ex: Website: 87, Design: 54, Google: 92)
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
  department?: string; // departamento
  phone?: string; // telefone
  whatsapp?: string; // WhatsApp
  email?: string; // email
  instagram?: string; // Instagram
  linkedin?: string; // LinkedIn
  notes?: string; // observações
  isPrimary?: boolean; // principal: boolean
  status?: 'active' | 'archived'; // status
  referredByContactId?: string; // indicado por (ID do contacto)
  referredByName?: string; // indicado por (Nome do contacto)
  attemptCount?: number; // contador de tentativas
  lastInteractionAt?: string; // última interação
  isFavorite?: boolean; // prospect prioritário
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Estrutura de Perguntas de Qualificação por Serviço
 */
export interface QualificationQuestion {
  id: string;
  question: string;
  type: 'SIM_NAO';
  weightYes: number;
  weightNo: number;
  positiveCriterionIf?: 'SIM' | 'NAO';
  negativeCriterionIf?: 'SIM' | 'NAO';
  positiveLabel?: string;
  negativeLabel?: string;
  active?: boolean;
  order?: number;
}

export interface ServiceQualificationConfig {
  id: string;
  serviceId: string;
  serviceName: string;
  questions: QualificationQuestion[];
  updatedAt?: string;
}

export interface QualificationAnswer {
  questionId: string;
  questionText: string;
  answer: 'SIM' | 'NÃO' | 'NAO';
  pointsAwarded: number;
}

export interface QualificationBreakdownItem {
  questionText: string;
  points: number;
  matched: boolean;
  reason: string;
}

export interface QualificationResult {
  score: number; // 0 a 100 normalizado
  rawScore: number;
  maxPossibleScore: number;
  classification: 'baixa' | 'media' | 'alta' | 'prioridade_maxima';
  classificationLabel: string;
  positivePoints: string[];
  negativePoints: string[];
  missingData?: string[];
  breakdown?: QualificationBreakdownItem[];
  recommendation: string;
  answers: QualificationAnswer[];
  serviceId?: string;
  serviceName?: string;
  answeredAt: string;
}

/**
 * Meta de Prospecção
 */
export interface ProspectingGoals {
  daily: number; // ex: 10
  weekly: number; // ex: 50
  monthly: number; // ex: 200
  annual: number; // ex: 2400
  workingDaysPerMonth?: number; // ex: 20
  maxDailyCap?: number; // ex: 20
  lastCalculatedAt?: string;
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
  score?: number; // score combinado (0-100)
  opportunityScore?: number; // Score de Oportunidade (0-100)
  qualificationScore?: number; // Score de Qualificação (0-100)
  demandType?: 'demanda_identificada' | 'oportunidade_latente' | 'qualificado_icp' | 'reativacao';
  icpFit?: 'A' | 'B' | 'C' | 'D';
  aiDiagnosis?: {
    analyzedAt: string;
    icpFit?: string;
    opportunityScore?: number;
    qualificationScore?: number;
    potential?: string;
    identifiedProblems?: string[];
    pitchAngle?: string;
    recommendedService?: string;
    recommendedNextAction?: string;
    recommendedChannel?: string;
    suggestedScript?: string;
    factsUsed?: string[];
    inferences?: string[];
    missingData?: string[];
  };
  priority: LeadPriority; // prioridade
  temperature: LeadTemperature; // temperatura
  stage: LeadStage; // estágio (os estágios do funil)
  status: 'active' | 'won' | 'lost' | 'archived' | 'paused';
  entryDate: string; // data de entrada
  lastContactDate?: string; // último contacto
  nextActionTitle?: string; // próxima ação
  nextActionDate?: string; // próxima ação em
  nextActionChannel?: ContactChannel;
  attemptCount?: number; // Contador de tentativas (ex: 2/5)
  plannedAttemptsToday?: number; // Tentativas planejadas para hoje
  plannedAttemptHours?: string[]; // Horários no mesmo dia ex: ['09:00', '13:00', '18:00']
  isFollowUpPaused?: boolean; // Sequência pausada quando respondeu
  followUpPauseReason?: string;
  responseOutcome?: ResponseOutcomeType;
  lostReason?: LostReasonType;
  isFavorite?: boolean;
  qualificationResult?: QualificationResult;
  serviceQualifications?: Record<string, QualificationResult>; // Diagnósticos salvos por serviço
  notes?: string; // observações
  preparedMessages?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export type HistoryEventType =
  | 'stage_change'
  | 'action_completed'
  | 'contact_made'
  | 'whatsapp_opened'
  | 'message_prepared'
  | 'message_sent'
  | 'response_received'
  | 'proposal_sent'
  | 'meeting_scheduled'
  | 'meeting_held'
  | 'note_added'
  | 'follow_up'
  | 'contact_created'
  | 'contact_updated'
  | 'contact_archived'
  | 'contact_unarchived'
  | 'contact_deleted'
  | 'referral_recorded'
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

export interface CadenceStep {
  id: string;
  order?: number;
  stepNumber?: number; // 1, 2, 3...
  actionType: string; // e.g. "Primeiro contato", "Apresentação", "Follow-up 1", "Follow-up 2", "Follow-up 3", "Quebra de objeção", "Oferta", "Reativação", "Encerramento", "Pós-venda"
  scriptId?: string; // ID do MessageTemplate / Script
  scriptTitle?: string; // Snapshot do nome do Script
  channel: ContactChannel;
  delayDays?: number; // ex: 0, 1, 2, 3
  delayHours?: number; // ex: 0, 2, 4, 6, 12
  delayMinutes?: number; // ex: 0, 15, 30
  waitDays?: number;
  waitHours?: number;
  waitMinutes?: number;
  totalDelayMinutes?: number; // delayDays * 1440 + delayHours * 60 + delayMinutes
  notes?: string;
  // Retrocompatibilidade
  dayOffset?: number;
  title?: string;
  templateId?: string;
}

export interface CampaignSequenceStep extends CadenceStep {}

export interface Campaign {
  id: string;
  name: string;
  type?: CampaignType;
  campaignType?: CampaignType;
  description?: string;
  targetAudience?: string; // ICP
  icpId?: string;
  objective?: string; // e.g. "Gerar Reuniões", "Venda Direta"
  status: 'draft' | 'active' | 'paused' | 'completed' | 'inactive';
  serviceId?: string;
  defaultTemplateId?: string;
  channel: ContactChannel;
  dailyGoal: number; // limite diário
  totalTarget: number; // meta total
  startDate?: string;
  endDate?: string;
  startTime?: string;
  criteria?: string;
  sequence?: CampaignSequenceStep[];
  cadence?: CadenceStep[];
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
  basePrice?: number; // preço base
  currency: string; // moeda (ex: BRL, EUR, USD)
  anchorPrice?: number; // preço âncora
  benefits: string[]; // benefícios
  targetAudience?: string[]; // público ideal
  problemsSolved?: string[]; // problemas resolvidos
  commonObjections?: ServiceCommonObjection[]; // objeções comuns
  arguments?: string[]; // argumentos
  proofs?: string[]; // provas associadas
  defaultCta?: string; // CTA padrão
  active: boolean; // ativo/inativo

  // Campos de retrocompatibilidade
  code?: string;
  category?: string;
  ticketValue?: number; // alias para basePrice
  valueProposition?: string; // alias para primeiro benefício ou descrição
  keyDifferentiators?: string[]; // alias para arguments
  idealCustomerProfile?: string; // alias textual
  standardCTA?: string; // alias para defaultCta
  associatedProofs?: string[]; // alias para proofs
  createdAt: string;
  updatedAt: string;
}

/**
 * Módulo ICP — Ideal Customer Profile
 */
export interface IdealCustomerProfile {
  id: string;
  name: string; // nome do perfil
  description?: string; // descrição resumida do perfil
  niches: string[]; // nichos atendidos
  countries: string[]; // países
  cities: string[]; // cidades
  size?: string[]; // tamanho (ex: Micro, Pequena, Média, Grande)
  companySize?: string; // alias textual de porte
  unitsRange?: string; // número de unidades (ex: "1 a 3 unidades", "Redes 5+")
  minUnits?: number;
  maxUnits?: number;
  priceRange?: {
    min: number;
    max: number;
    currency?: string;
  }; // faixa de preço / ticket ideal
  problems?: string[]; // problemas típicos
  commonProblems?: string[]; // alias
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
  summaryReason?: string;
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
  title: string; // Nome do script
  actionType?: string; // Tipo de ação associado (ex: "Primeiro contato", "Follow-up 1", "Apresentação")
  channel: ContactChannel; // Canal principal
  channels?: ContactChannel[]; // Canais compatíveis
  category?: TemplateCategory;
  type?: TemplateType;
  campaignType?: string;
  content: string; // Conteúdo com {{variaveis}}
  variables: string[]; // Variáveis disponíveis/detectadas
  version: string; // e.g. "v1.0"
  serviceId?: string; // mensagens por serviço
  niche?: string; // mensagens por nicho
  pipelineStage?: LeadStage; // mensagens por etapa do pipeline
  isFavorite?: boolean;
  isArchived?: boolean;
  status?: 'active' | 'archived';
  notes?: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProspectAction {
  id: string;
  clientId: string; // ID da Empresa ou Cliente
  companyId?: string; // alias
  leadId?: string;
  contactId?: string;
  campaignId?: string;
  campaignName?: string;
  campaignType?: string;
  cadenceId?: string;
  cadenceStepId?: string;
  cadenceStepTitle?: string;
  cadenceStepIndex?: number;
  templateId?: string;
  scriptId?: string;
  scriptName?: string;
  scriptTitle?: string;
  actionType?: string; // Tipo de ação
  channel: ContactChannel;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:mm
  status: ActionStatus;
  priority: ActionPriority;
  estMinutes: number; // default 1-3 min per quick execution
  customMessage?: string; // Snapshot do texto formatado com variáveis
  originalScriptContent?: string;
  notes?: string; // Observações
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
  goals?: ProspectingGoals;
  estMinutesPerAction: number;
  actionEstimatedMinutes?: {
    firstContact: number; // ex: 3 min
    followUp: number; // ex: 2 min
    proposal: number; // ex: 15 min
    meeting: number; // ex: 30 min
    reactivation: number; // ex: 3 min
  };
  autoAdvanceOnDone: boolean;
  soundEnabled: boolean;
  showTips: boolean;
  dataStorageType: 'indexeddb_local' | 'cloud_sync_ready';
  lastBackupDate?: string;
  scoringWeights?: ScoringWeightConfig;
  qualificationConfigs?: ServiceQualificationConfig[];
  reactivationDaysThreshold?: number; // padrão 30 dias
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

/**
 * Tipos do Copiloto de Prospecção (Gemini)
 */
export type CopilotActionType =
  | 'ANALISAR_LEAD_COMPLETO'
  | 'PERSONALIZAR'
  | 'GERAR_FOLLOWUP'
  | 'ANALISAR_RESPOSTA'
  | 'SUGERIR_SERVICO'
  | 'MELHORAR'
  | 'RESUMIR'
  | 'PROXIMA_ACAO';

export type CopilotTone = 'consultivo' | 'direto' | 'persuasivo' | 'conciso' | 'amigavel' | 'urgente';

export interface CopilotLeadContext {
  companyName: string;
  niche?: string;
  city?: string;
  country?: string;
  website?: string;
  websiteQuality?: string;
  unitsCount?: number;
  apparentNeed?: string;
  notes?: string;
  contactName?: string;
  contactRole?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  contactEmail?: string;
  stage?: LeadStage;
  temperature?: LeadTemperature;
  priority?: LeadPriority;
  score?: number;
  serviceName?: string;
  serviceDescription?: string;
  serviceBenefits?: string[];
  serviceProblemsSolved?: string[];
  campaignName?: string;
  campaignObjective?: string;
  recentInteractions?: Array<{
    type: string;
    title: string;
    description?: string;
    timestamp: string;
  }>;
}

export interface CopilotResult {
  resultText: string;
  alternatives?: string[];
  factsUsed: string[];
  inferences: string[];
  missingData: string[];
  intentClassification?: string;
  sentiment?: string;
  identifiedProblems?: string[];
  recommendedService?: string;
  nextActionSuggestion?: string;
  recommendedChannel?: string;
  icpFit?: string;
  opportunityScore?: number;
  qualificationScore?: number;
  potential?: string;
  pitchAngle?: string;
  suggestedScript?: string;
  isOfflineFallback?: boolean;
}

export interface CopilotRequest {
  actionType: CopilotActionType;
  leadContext: CopilotLeadContext;
  inputMessage?: string;
  tone?: string;
  options?: {
    instructions?: string;
    lastContactInfo?: string;
    prospectResponse?: string;
    availableServices?: Array<{ id: string; name: string; description: string; benefits?: string[]; problemsSolved?: string[] }>;
  };
}

/**
 * ============================================================================
 * SALES ENGINE — Biblioteca de Vendas & Motor de Abordagem
 * ============================================================================
 */

export interface ObjectionItem {
  id: string;
  name: string; // ex: "caro", "vou pensar", "já tenho alguém", "não preciso", "mande orçamento", "sem dinheiro", "fale depois", "preciso consultar sócio"
  context: string; // contexto e gatilho da objeção
  response: string; // script principal de resposta
  alternativas: string[]; // respostas alternativas
  serviceId?: string; // serviço associado
  serviceName?: string;
  stage?: LeadStage; // etapa do funil (ex: QUALIFICADO, PROPOSTA, OBJEÇÃO)
  observacoes: string; // observações e notas táticas
  category?: 'preco' | 'timing' | 'concorrencia' | 'necessidade' | 'decisor' | 'orcamento' | 'outros';
  createdAt?: string;
  updatedAt?: string;
}

export interface PricingItem {
  id: string;
  name: string; // ex: "Landing Page de Alta Conversão", "Website Corporativo", "Consultoria Mensal"
  serviceId?: string;
  serviceName?: string;
  regularPrice: number; // preço normal
  anchorPrice?: number; // preço âncora
  specialOffer?: string; // oferta especial / condição
  packageDetails?: string; // detalhes do pacote / escopo incluso
  alternativeOption?: string; // alternativa / plano B (ex: parcelamento, escopo reduzido)
  currency: string; // BRL, EUR, USD, AOA, etc.
  notes?: string;
  autoDiscountApplied?: boolean; // sempre false por padrão (Não aplicar desconto automaticamente)
  createdAt?: string;
  updatedAt?: string;
}

export interface ProofItem {
  id: string;
  title: string; // ex: "Aumento de 240% em agendamentos"
  description: string;
  imageUrl?: string; // imagem / print / mockup
  url?: string; // link do case ou projeto
  serviceId?: string; // serviço associado
  serviceName?: string;
  niche: string; // nicho associado
  result: string; // métrica de resultado (ex: "ROAS 6.2x e +85 clientes")
  beforeAfter?: {
    beforeText?: string;
    afterText?: string;
    beforeImage?: string;
    afterImage?: string;
  };
  clientName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PainPointItem {
  id: string;
  title: string;
  description?: string;
  type: 'problema' | 'dor';
  niche?: string;
  serviceId?: string;
  severity?: 'alta' | 'media' | 'baixa';
}

export interface ValueArgumentItem {
  id: string;
  title: string;
  argumentText: string;
  benefit: string;
  niche?: string;
  serviceId?: string;
  category?: 'diferencial' | 'roi' | 'velocidade' | 'seguranca' | 'autoridade';
}

export interface CtaItem {
  id: string;
  title: string;
  ctaText: string;
  category: 'ligacao' | 'reuniao' | 'whatsapp' | 'diagnostico' | 'proposta';
  serviceId?: string;
  funnelStage?: LeadStage;
}

export interface FollowUpStrategyItem {
  id: string;
  name: string;
  dayOffset: number; // ex: 2, 5, 10, 20, 45 dias
  objective: string;
  angle: string;
  script: string;
  serviceId?: string;
}

/**
 * Recomendação de Abordagem Estruturada
 * Contém os 7 pilares fundamentais de vendas
 */
export interface SalesApproachRecommendation {
  serviceId?: string;
  serviceName: string; // SERVIÇO RECOMENDADO
  identifiedProblem: string; // PROBLEMA IDENTIFICADO
  argument: string; // ARGUMENTO
  recommendedProof: string; // PROVA RECOMENDADA
  message: string; // MENSAGEM
  cta: string; // CTA
  nextAction: string; // PRÓXIMA AÇÃO
  proofItem?: ProofItem;
  objectionMatch?: ObjectionItem;
  pricingItem?: PricingItem;
  isAiGenerated?: boolean;
}

/**
 * =========================================================
 * TIPOS DE ANALYTICS, FUNIL, TESTES A/B E RELATÓRIO MENSAL
 * =========================================================
 */

export type AnalyticsPeriod =
  | 'today'
  | '7days'
  | '30days'
  | 'this_month'
  | 'last_month'
  | 'all'
  | 'custom';

export interface AnalyticsFilterState {
  period: AnalyticsPeriod;
  customStartDate?: string;
  customEndDate?: string;
  serviceId: string; // 'all' ou ID específico
  niche: string; // 'all' ou nicho específico
  country: string; // 'all' ou país específico
  campaignId: string; // 'all' ou ID específico
  stage: string; // 'all' ou LeadStage específico
}

export interface AnalyticsMetrics {
  // Contadores Brutos
  prospectsAdicionados: number;
  prospectsContactados: number;
  mensagensEnviadas: number;
  respostas: number;
  respostasPositivas: number;
  interessados: number;
  reunioes: number;
  propostas: number;
  clientes: number;
  perdidos: number;
  reativacoes: number;

  // Taxas Calculadas (%)
  taxaContacto: number; // contactados / adicionados
  taxaResposta: number; // respostas / contactados
  taxaRespostaPositiva: number; // respostas positivas / respostas
  taxaReuniao: number; // reunioes / interessados (e vs contactados)
  taxaReuniaoSobreContactados: number;
  taxaProposta: number; // propostas / reunioes (e vs contactados)
  taxaPropostaSobreContactados: number;
  taxaConversao: number; // clientes / adicionados
  taxaConversaoSobreContactados: number; // clientes / contactados

  // Métricas de Tempo
  tempoMedioAteRespostaHoras: number; // em horas
  tempoMedioAteRespostaFormatado: string; // ex: "4.2h" ou "1.8 dias"
  tempoMedioAteConversaoDias: number; // em dias
  tempoMedioAteConversaoFormatado: string; // ex: "5.4 dias"
}

export interface FunnelStepData {
  id: 'leads' | 'contacted' | 'responses' | 'interested' | 'meetings' | 'proposals' | 'clients';
  label: string;
  count: number;
  conversionFromPrev: number; // % sobre o degrau imediatamente anterior
  conversionFromTop: number; // % sobre o topo do funil (Leads adicionados)
  dropOffCount: number; // quantos caíram neste degrau
  color: string;
  subDescription?: string;
}

export interface ABTestVariant {
  id: string; // 'A' ou 'B'
  label: string; // ex: "Mensagem A (Abordagem Direta)"
  templateId?: string;
  content: string;
  sentCount: number;
  replyCount: number;
  positiveReplyCount: number;
  conversionCount: number;
  // Taxas calculadas
  replyRate: number; // %
  positiveReplyRate: number; // %
  conversionRate: number; // %
}

export interface ABTestExperiment {
  id: string;
  title: string;
  description?: string;
  channel: ContactChannel;
  status: 'active' | 'completed' | 'draft';
  serviceId?: string;
  niche?: string;
  variantA: ABTestVariant;
  variantB: ABTestVariant;
  winnerVariant?: 'A' | 'B' | 'empate' | 'dados_insuficientes';
  winnerMetric?: 'replyRate' | 'positiveReplyRate' | 'conversionRate';
  insightSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MetricDelta {
  currentValue: number;
  previousValue: number;
  absoluteChange: number;
  percentChange: number; // % de variação
  status: 'improved' | 'worsened' | 'neutral';
  isPercentage?: boolean;
}

export interface DataFactRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'message' | 'channel' | 'niche' | 'timing' | 'conversion' | 'service';
  badgeLabel: string;
  dataFact: string; // Fato objetivo comprovado pelos dados (sem alucinações nem falsas causalidades)
  impactLevel: 'alto' | 'medio' | 'informativo';
}

export interface PeriodComparisonReport {
  currentPeriodLabel: string;
  previousPeriodLabel: string;
  metricsCurrent: AnalyticsMetrics;
  metricsPrevious: AnalyticsMetrics;
  deltas: {
    prospectsAdicionados: MetricDelta;
    prospectsContactados: MetricDelta;
    mensagensEnviadas: MetricDelta;
    respostas: MetricDelta;
    respostasPositivas: MetricDelta;
    interessados: MetricDelta;
    reunioes: MetricDelta;
    propostas: MetricDelta;
    clientes: MetricDelta;
    perdidos: MetricDelta;
    reativacoes: MetricDelta;
    taxaContacto: MetricDelta;
    taxaResposta: MetricDelta;
    taxaRespostaPositiva: MetricDelta;
    taxaReuniao: MetricDelta;
    taxaProposta: MetricDelta;
    taxaConversao: MetricDelta;
  };
  improvementsList: { metric: string; detail: string; percent: number }[];
  worsenedList: { metric: string; detail: string; percent: number }[];
  recommendations: DataFactRecommendation[];
}

// ----------------------------------------------------
// CLOUD & SYNC TYPES (Offline-First Architecture)
// ----------------------------------------------------

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

export type SyncOperationType = 'create' | 'update' | 'delete';

export type SyncEntityType =
  | 'companies'
  | 'contacts'
  | 'leads'
  | 'services'
  | 'campaigns'
  | 'templates'
  | 'sequences'
  | 'actions'
  | 'history'
  | 'abTests'
  | 'salesEngine'
  | 'settings'
  | 'followups';

export interface SyncQueueItem {
  id: string;
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperationType;
  payload: any;
  createdAt: string;
  updatedAt?: string;
  status: 'pending' | 'syncing' | 'synced' | 'error';
  retryCount: number;
  lastError?: string;
}

export interface SyncConflict {
  id: string;
  entityType: SyncEntityType;
  entityId: string;
  entityTitle?: string;
  localData: any;
  remoteData: any;
  detectedAt: string;
  resolved: boolean;
  resolutionChoice?: 'keep_local' | 'keep_remote' | 'keep_both';
  resolvedAt?: string;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isAnonymous?: boolean;
}

export interface SyncStateSummary {
  status: SyncStatus;
  isOnline: boolean;
  isAuthenticated: boolean;
  lastSyncedAt: string | null;
  pendingCount: number;
  errorCount: number;
  conflictCount: number;
  lastError: string | null;
}




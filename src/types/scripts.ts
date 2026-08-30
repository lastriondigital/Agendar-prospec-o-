import { ContactChannel, LeadStage, LeadStatus } from './index';

export type ProspectingFlowType =
  | 'problema_identificado'
  | 'oportunidade_latente'
  | 'reativacao'
  | 'custom';

export type CountryCode = 'BR' | 'PT' | 'MZ' | 'OTHER';

export type CommunicationStyle =
  | 'profissional'
  | 'consultivo'
  | 'casual'
  | 'direto'
  | 'formal';

export type ContactRoleType = 'decisor' | 'funcionario' | 'indeterminado';

export type FollowUpStatus =
  | 'aguardando_resposta'
  | 'followup_recomendado'
  | 'followup_atrasado'
  | 'sem_resposta'
  | 'reativacao'
  | 'encerrado'
  | 'do_not_contact';

export interface FollowUpItem {
  number: number; // 1 a 6 (ou 8)
  intervalRecommended: string; // ex: "4–8 horas", "1 dia", "2 dias", "4 dias", "7 dias", "14 dias"
  intervalHours: number; // número de horas para cálculo de agendamento
  message: string;
  objective: string;
  tone: CommunicationStyle;
  condition: string; // quando utilizar
  whenNotToUse: string; // quando NÃO utilizar
}

export interface ScriptStepDefinition {
  id: string;
  stepNumber: number;
  title: string;
  flowType: ProspectingFlowType;
  category: string;
  objective: string;
  purposeDescription: string;
  isInitialContact?: boolean;
  requiresResponse?: boolean;
  roleTarget?: ContactRoleType;
  scriptTemplate: string;
  alternativeTemplates?: {
    consultivo?: string;
    direto?: string;
    casual?: string;
    formal?: string;
  };
  countryVariations?: {
    BR?: string;
    PT?: string;
    MZ?: string;
  };
  diagnosticPoints?: {
    pointA: string; // situação atual
    pointB: string; // situação desejada
    pointC: string; // consequência
  };
  followUps?: FollowUpItem[]; // 6 a 8 follow-ups se requiresResponse === true
  dosAndDonts?: {
    do: string[];
    dont: string[];
  };
}

export type ObjectionCategory =
  | 'preco'
  | 'timing'
  | 'concorrencia'
  | 'necessidade'
  | 'decisor'
  | 'orcamento'
  | 'confianca'
  | 'tecnica'
  | 'outros';

export interface ObjectionComprehensive {
  id: string;
  number: number;
  title: string;
  category: ObjectionCategory;
  clientPhrase: string; // 1. O que o cliente disse
  underlyingMeaning: string; // 2. O possível significado
  whatNotToSay: string; // 3. O que NÃO responder
  diagnosticQuestion: string; // 4. Pergunta de diagnóstico
  shortResponse: string; // 5. Resposta curta
  consultativeResponse: string; // 6. Resposta consultiva
  whatsappResponse: string; // 7. Resposta para WhatsApp
  callResponse: string; // 8. Resposta para ligação
  nextStep: string; // 9. Próximo passo
  followUps: FollowUpItem[]; // 10-15. Follow-ups 1 a 6
}

export interface ContextualFollowUpScenario {
  id: string;
  number: number;
  title: string;
  description: string;
  triggerCondition: string;
  followUps: FollowUpItem[]; // 6 follow-ups
}

export interface ScriptRecommendationResult {
  stepId: string;
  stepNumber: number;
  stepTitle: string;
  flowType: ProspectingFlowType;
  rationale: string;
  message: string;
  rawTemplate: string;
  alternatives: {
    consultivo: string;
    direto: string;
    casual: string;
  };
  variablesUsed: Record<string, string>;
  followUps: FollowUpItem[];
  currentFollowUpIndex: number;
  isFollowUp: boolean;
  isDnc: boolean;
  isStopped: boolean;
  stopReason?: string;
  contactRoleDetected: ContactRoleType;
  channel: ContactChannel;
  whatsappUrl?: string;
  country: CountryCode;
  currency: string;
  pricingAnchor?: {
    regularPrice: number;
    anchorPrice: number;
    currency: string;
    justification: string;
  };
}

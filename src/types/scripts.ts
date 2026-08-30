export type ScriptProspectingType = 'identified_demand' | 'latent_opportunity' | 'identified_problem';

export type ProspectingType = ScriptProspectingType;

export type CommunicationStyle = 'consultivo' | 'profissional' | 'casual' | 'direto' | 'formal';

export type ScriptTargetRole = 'responsavel' | 'funcionario' | 'desconhecido';

export type ScriptFollowUpState =
  | 'aguardando_resposta'
  | 'followup_recomendado'
  | 'followup_atrasado'
  | 'sem_resposta'
  | 'reativacao'
  | 'encerrado'
  | 'do_not_contact';

export interface FollowUpItem {
  id: string;
  stepNumber: number; // 1 to 8
  title?: string;
  message: string;
  intervalHours: number;
  intervalText: string; // "4–8 horas", "1 dia", "2 dias", "4 dias", "7 dias", "14 dias"
  objective: string;
  tone: string;
  condition: string; // Condição de utilização
  whenNotToUse: string; // Quando NÃO utilizar
}

export interface DetailedObjection {
  id: string;
  code: string;
  title: string; // O que o cliente disse (ex: "Está caro")
  keywords: string[];
  category: 'preco' | 'timing' | 'confianca' | 'necessidade' | 'autoridade' | 'concorrencia' | 'processo';
  possibleMeaning: string; // O possível significado
  whatNotToSay: string; // O que NÃO responder
  diagnosticQuestion: string; // Pergunta de diagnóstico
  shortResponse: string; // Resposta curta
  consultativeResponse: string; // Resposta consultiva
  whatsAppResponse: string; // Resposta para WhatsApp
  callResponse: string; // Resposta para ligação
  nextStep: string; // Próximo passo
  followUps: FollowUpItem[]; // Follow-up 1 a 6 dedicados
}

export interface ScriptStepDefinition {
  id: string;
  prospectingType: ScriptProspectingType;
  stepNumber: number;
  code: string;
  stepName: string;
  phase:
    | 'ATENCAO'
    | 'INTERACAO'
    | 'QUALIFICACAO'
    | 'DIAGNOSTICO'
    | 'VALIDACAO'
    | 'DEMONSTRACAO'
    | 'PROPOSTA'
    | 'NEGOCIACAO'
    | 'FECHAMENTO'
    | 'POS_VENDA'
    | 'RECOMENDACAO';
  objective: string;
  structure: string;
  requiresClientResponse: boolean;
  defaultScript: string;
  variationsByStyle?: Partial<Record<CommunicationStyle, string>>;
  variationsByCountry?: Partial<Record<string, string>>;
  followUps: FollowUpItem[]; // 6 to 8 follow-ups
  diagnosticPoints?: {
    pointA: string; // Situação atual
    pointB: string; // Situação desejada
    pointC: string; // Consequência de permanecer no estado atual
  };
  diagnosticQuestions?: string[];
}

export interface CommercialAnchorConfig {
  id: string;
  serviceId: string;
  serviceName: string;
  country: string;
  currency: string;
  currencySymbol: string;
  anchorPrice: number; // Preço âncora de mercado (ex: R$ 2500)
  finalPrice: number; // Preço proposto (ex: R$ 597)
  marketRange: string; // Faixa de referência (ex: "R$ 2.000 a R$ 3.000")
  justification: string; // Justificativa comercial (ex: "Condição especial de lançamento/portfólio")
  paymentTerms: string; // Ex: "Aprovação primeiro, pagamento após aprovação"
}

export interface ScriptRecommendationResult {
  prospectingType: ScriptProspectingType;
  step?: ScriptStepDefinition;
  stageName: string;
  stepNumber: number;
  phaseName: string;
  nextBestAction: string;
  recommendedScript: string;
  interpolatedScript: string;
  reasoning: string;
  isFollowUp: boolean;
  followUpNumber?: number;
  followUpSequence: FollowUpItem[];
  matchedObjection?: DetailedObjection;
  anchorConfig?: CommercialAnchorConfig;
  diagnosticQuestions?: string[];
  diagnosticPoints?: {
    pointA: string;
    pointB: string;
    pointC: string;
  };
  isDecisionMakerConfirmed: boolean;
  isEmployeeRoute: boolean;
  doNotContact: boolean;
  stopRuleTriggered: boolean;
  stopRuleReason?: string;
  recommendedIntervalText?: string;
}

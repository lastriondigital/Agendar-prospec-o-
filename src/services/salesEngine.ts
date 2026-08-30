import {
  Company,
  Contact,
  CtaItem,
  FollowUpStrategyItem,
  Lead,
  ObjectionItem,
  PainPointItem,
  PricingItem,
  ProofItem,
  SalesApproachRecommendation,
  Service,
  ValueArgumentItem,
} from '../types';
import {
  DetailedObjection,
  FollowUpItem,
  ProspectingType,
  ScriptRecommendationResult,
  ScriptStepDefinition,
} from '../types/scripts';
import {
  SEED_ARGUMENTS,
  SEED_CTAS,
  SEED_FOLLOWUPS,
  SEED_OBJECTIONS,
  SEED_PAIN_POINTS,
  SEED_PRICING,
  SEED_PROOFS,
} from '../db/salesEngineSeed';
import { IDENTIFIED_PROBLEM_STEPS } from '../db/prospectingScriptsData';
import { LATENT_OPPORTUNITY_STEPS } from '../db/prospectingLatentData';
import { DETAILED_OBJECTIONS } from '../db/objectionsData';

/**
 * Retorna a lista de etapas de acordo com o tipo de prospecção
 */
export function getProspectingSteps(type: ProspectingType): ScriptStepDefinition[] {
  return type === 'identified_problem' ? IDENTIFIED_PROBLEM_STEPS : LATENT_OPPORTUNITY_STEPS;
}

/**
 * Obtém uma etapa específica pelo número
 */
export function getStepByNumber(type: ProspectingType, stepNumber: number): ScriptStepDefinition | null {
  const steps = getProspectingSteps(type);
  return steps.find((s) => s.stepNumber === stepNumber) || null;
}

/**
 * Realiza a substituição de todas as variáveis do roteiro
 */
export function fillScriptVariables(
  template: string,
  data: {
    nome?: string;
    empresa?: string;
    niche?: string;
    servico?: string;
    problema?: string;
    preco?: string;
    preco_ancora?: string;
    dias_sem_resposta?: number;
    dia_semana?: string;
    cidade?: string;
  }
): string {
  if (!template) return '';

  const replacements: Record<string, string> = {
    nome: data.nome || 'Gestor(a)',
    empresa: data.empresa || 'sua empresa',
    niche: data.niche || 'seu segmento',
    servico: data.servico || 'solução digital',
    problema: data.problema || 'perda de contatos qualificados',
    preco: data.preco || 'R$ 1.500,00',
    preco_ancora: data.preco_ancora || 'R$ 2.800,00',
    dias_sem_resposta: String(data.dias_sem_resposta || 2),
    dia_semana: data.dia_semana || 'quinta-feira',
    cidade: data.cidade || 'sua região',
  };

  let result = template;
  for (const [key, val] of Object.entries(replacements)) {
    const regex = new RegExp(`{{${key}}}`, 'gi');
    result = result.replace(regex, val);
  }

  // Substituições secundárias com colchetes [PRAZO], [LINK_DO_PROTOTIPO], etc.
  result = result
    .replace(/\[NOME_DO_CLIENTE\]/gi, replacements.nome)
    .replace(/\[NOME_DA_EMPRESA\]/gi, replacements.empresa)
    .replace(/\[NICHO\]/gi, replacements.niche)
    .replace(/\[NOME_DO_SERVICO\]/gi, replacements.servico)
    .replace(/\[PRECO\]/gi, replacements.preco)
    .replace(/\[PRAZO\]/gi, '5 a 7 dias úteis')
    .replace(/\[PRAZO_DIAS\]/gi, '5')
    .replace(/\[TEMPO_ESTIMADO\]/gi, '2 a 3')
    .replace(/\[LINK_DO_PROTOTIPO\]/gi, 'https://preview.leadion.app/demo')
    .replace(/\[DATA_HORA\]/gi, 'amanhã às 14h')
    .replace(/\[DIA_SUGERIDO\]/gi, replacements.dia_semana);

  return result;
}

/**
 * Busca objeção detalhada com todos os campos e follow-ups
 */
export function findDetailedObjection(
  input: string,
  objections: DetailedObjection[] = DETAILED_OBJECTIONS
): DetailedObjection | null {
  if (!input) return null;
  const norm = input.toLowerCase().trim();

  return (
    objections.find((obj) => {
      const matchTitle = obj.title.toLowerCase().includes(norm) || norm.includes(obj.title.toLowerCase());
      const matchCode = obj.code.toLowerCase().includes(norm) || norm.includes(obj.code.toLowerCase());
      const matchKeyword = obj.keywords.some((kw) => norm.includes(kw.toLowerCase()) || kw.toLowerCase().includes(norm));
      return matchTitle || matchCode || matchKeyword;
    }) || null
  );
}

/**
 * Gera recomendação completa de Roteiro e Próximo Passo para Prospecção
 */
export interface ScriptFlowRecommendationResult {
  step: ScriptStepDefinition;
  scriptText: string;
  nextFollowUp?: FollowUpItem;
  nextStepRecommendation: string;
  diagnosticQuestions?: string[];
  variablesUsed: Record<string, any>;
}

export function generateScriptRecommendation(params: {
  lead?: Lead | null;
  company?: Company | null;
  contact?: Contact | null;
  service?: Service | null;
  prospectingType?: ProspectingType;
  currentStepNumber?: number;
  currentFollowUpIndex?: number;
  stylePreference?: 'consultivo' | 'direto' | 'casual' | 'formal';
}): ScriptFlowRecommendationResult {
  const {
    lead,
    company,
    contact,
    service,
    prospectingType = (company?.apparentNeed?.toLowerCase().includes('app') || company?.apparentNeed?.toLowerCase().includes('sistema')
      ? 'latent_opportunity'
      : 'identified_problem'),
    currentStepNumber = 1,
    currentFollowUpIndex = 0,
    stylePreference = 'consultivo',
  } = params;

  const steps = getProspectingSteps(prospectingType);
  const step = steps.find((s) => s.stepNumber === currentStepNumber) || steps[0];

  const variableData = {
    nome: contact?.name || company?.name || 'Gestor(a)',
    empresa: company?.name || 'sua empresa',
    niche: company?.niche || 'seu segmento',
    servico: service?.name || 'Landing Page de Alta Conversão',
    problema: company?.apparentNeed || 'perda de contatos no WhatsApp por falta de página rápida',
    preco: service?.basePrice ? formatCurrencyValue(service.basePrice, service.currency || 'BRL') : 'R$ 1.500,00',
    preco_ancora: service?.basePrice ? formatCurrencyValue(service.basePrice * 1.6, service.currency || 'BRL') : 'R$ 2.400,00',
    cidade: company?.city || 'sua região',
  };

  // Obter texto padrão ou variação de estilo
  let rawText = step.defaultScript;
  if (step.variationsByStyle && step.variationsByStyle[stylePreference]) {
    rawText = step.variationsByStyle[stylePreference] || rawText;
  }

  const scriptText = fillScriptVariables(rawText, variableData);

  // Follow-up correspondente
  let nextFollowUp: FollowUpItem | undefined = undefined;
  if (step.followUps && step.followUps.length > 0) {
    const fu = step.followUps[Math.min(currentFollowUpIndex, step.followUps.length - 1)];
    if (fu) {
      nextFollowUp = {
        ...fu,
        message: fillScriptVariables(fu.message, variableData),
      };
    }
  }

  // Próximo passo sugerido
  const nextStepDef = steps.find((s) => s.stepNumber === currentStepNumber + 1);
  const nextStepRecommendation = nextStepDef
    ? `Avançar para Etapa ${nextStepDef.stepNumber}: ${nextStepDef.stepName}`
    : 'Etapa final do fluxo atingida';

  return {
    step,
    scriptText,
    nextFollowUp,
    nextStepRecommendation,
    diagnosticQuestions: step.diagnosticQuestions,
    variablesUsed: variableData,
  };
}


/**
 * Gera a Recomendação de Abordagem estruturada nos 7 Pilares:
 * 1. SERVIÇO RECOMENDADO
 * 2. PROBLEMA IDENTIFICADO
 * 3. ARGUMENTO
 * 4. PROVA RECOMENDADA
 * 5. MENSAGEM
 * 6. CTA
 * 7. PRÓXIMA AÇÃO
 */
export function generateApproachRecommendation(params: {
  company?: Company | null;
  contact?: Contact | null;
  lead?: Lead | null;
  service?: Service | null;
  availableServices?: Service[];
  availableObjections?: ObjectionItem[];
  availableProofs?: ProofItem[];
  availablePricing?: PricingItem[];
  availableArguments?: ValueArgumentItem[];
  availablePainPoints?: PainPointItem[];
  availableCtas?: CtaItem[];
}): SalesApproachRecommendation {
  const {
    company,
    contact,
    lead,
    service: providedService,
    availableServices = [],
    availableProofs = SEED_PROOFS,
    availablePricing = SEED_PRICING,
    availableArguments = SEED_ARGUMENTS,
    availablePainPoints = SEED_PAIN_POINTS,
    availableCtas = SEED_CTAS,
  } = params;

  const niche = company?.niche || 'Geral';
  const companyName = company?.name || 'sua empresa';
  const contactName = contact?.name || 'Gestor(a)';
  const contactRole = contact?.role || 'Decisor';

  // 1. SERVIÇO RECOMENDADO
  let targetService = providedService;
  if (!targetService && lead?.serviceId && availableServices.length > 0) {
    targetService = availableServices.find((s) => s.id === lead.serviceId);
  }
  if (!targetService && availableServices.length > 0) {
    // Escolhe com base no nicho ou necessidade
    if (company?.apparentNeed?.toLowerCase().includes('site') || company?.websiteQuality === 'outdated') {
      targetService = availableServices.find((s) => s.id === 'srv-website' || s.name.includes('Website')) || availableServices[0];
    } else {
      targetService = availableServices[0];
    }
  }

  const serviceName = targetService?.name || 'Landing Page de Alta Conversão';
  const serviceId = targetService?.id || 'srv-lp';

  // 2. PROBLEMA IDENTIFICADO
  let matchedProblem = availablePainPoints.find((p) => p.niche === niche && p.serviceId === serviceId);
  if (!matchedProblem) {
    matchedProblem = availablePainPoints.find((p) => p.niche === niche) || availablePainPoints[0];
  }
  const identifiedProblem =
    company?.apparentNeed ||
    matchedProblem?.title ||
    'Perda de clientes potenciais que buscam no digital por falta de posicionamento estratégico.';

  // 3. ARGUMENTO
  let matchedArgument = availableArguments.find((a) => a.serviceId === serviceId);
  if (!matchedArgument) {
    matchedArgument = availableArguments[0];
  }
  const argument =
    matchedArgument?.argumentText ||
    'Estrutura com carregamento em menos de 1.2s e copy persuasiva focada em transformar visitantes em contatos diretos.';

  // 4. PROVA RECOMENDADA
  let matchedProof = availableProofs.find((p) => p.niche === niche && p.serviceId === serviceId);
  if (!matchedProof) {
    matchedProof = availableProofs.find((p) => p.niche === niche) || availableProofs[0];
  }
  const recommendedProof = matchedProof
    ? `${matchedProof.title}: ${matchedProof.result}`
    : 'Case comprovado com +240% em conversões de novos agendamentos no primeiro mês.';

  // 5. CTA
  let matchedCta = availableCtas.find((c) => c.funnelStage === lead?.stage);
  if (!matchedCta) {
    matchedCta = availableCtas[0];
  }
  const cta = matchedCta
    ? matchedCta.ctaText.replace(/\[Empresa\]/g, companyName).replace(/\[Nome\]/g, contactName)
    : `Podemos agendar um bate-papo de 10 minutos nesta semana para te mostrar a estrutura ideal para a ${companyName}?`;

  // 6. MENSAGEM PREPARADA (Integração dos elementos)
  const message = `Olá, ${contactName}! Notei que a ${companyName} tem um excelente trabalho em ${niche}. 

Muitas empresas do seu segmento enfrentam ${identifiedProblem.toLowerCase().replace(/\.$/, '')}. 

Aqui na nossa operação, implementamos ${serviceName} onde ${argument.toLowerCase().replace(/\.$/, '')}. 

Inclusive, tivemos um resultado recente de destaque: ${recommendedProof}

${cta}`;

  // 7. PRÓXIMA AÇÃO RECOMENDADA
  const nextAction =
    lead?.stage === 'PROPOSTA'
      ? 'Apresentar tabela de preços com âncora de valor e confirmar reunião de fechamento'
      : lead?.stage === 'RESPONDEU'
      ? 'Enviar prova social com métrica e convidar para diagnóstico de 10 minutos'
      : 'Disparar mensagem inicial personalizada no WhatsApp e registrar interação';

  // Informações de Preço correspondentes
  const pricingItem = availablePricing.find((p) => p.serviceId === serviceId) || availablePricing[0];

  return {
    serviceId,
    serviceName,
    identifiedProblem,
    argument,
    recommendedProof,
    message,
    cta,
    nextAction,
    proofItem: matchedProof,
    pricingItem,
    isAiGenerated: false,
  };
}

/**
 * Busca respostas estratégicas para objeções clássicas
 */
export function findObjectionResponse(
  objectionInput: string,
  objections: ObjectionItem[] = SEED_OBJECTIONS
): ObjectionItem | null {
  const normalized = objectionInput.toLowerCase().trim();

  // Match por nome ou categoria
  return (
    objections.find((obj) => {
      const objName = obj.name.toLowerCase();
      const objCategory = (obj.category || '').toLowerCase();
      return (
        objName.includes(normalized) ||
        normalized.includes(objName) ||
        (normalized.includes('caro') && obj.id.includes('caro')) ||
        (normalized.includes('pensar') && obj.id.includes('pensar')) ||
        (normalized.includes('alguem') && obj.id.includes('ja-tenho')) ||
        (normalized.includes('alguém') && obj.id.includes('ja-tenho')) ||
        (normalized.includes('preciso') && obj.id.includes('nao-preciso')) ||
        (normalized.includes('orçamento') && obj.id.includes('orcamento')) ||
        (normalized.includes('orcamento') && obj.id.includes('orcamento')) ||
        (normalized.includes('dinheiro') && obj.id.includes('sem-dinheiro')) ||
        (normalized.includes('depois') && obj.id.includes('fale-depois')) ||
        (normalized.includes('sócio') && obj.id.includes('socio')) ||
        (normalized.includes('socio') && obj.id.includes('socio')) ||
        objCategory === normalized
      );
    }) || null
  );
}

/**
 * Formata um valor monetário de forma segura sem desconto automático
 */
export function formatCurrencyValue(amount: number, currency = 'BRL'): string {
  const symbols: Record<string, string> = {
    BRL: 'R$',
    EUR: '€',
    USD: '$',
    AOA: 'Kz',
  };
  const sym = symbols[currency] || currency;
  return `${sym} ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

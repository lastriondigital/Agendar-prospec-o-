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
  SEED_ARGUMENTS,
  SEED_CTAS,
  SEED_FOLLOWUPS,
  SEED_OBJECTIONS,
  SEED_PAIN_POINTS,
  SEED_PRICING,
  SEED_PROOFS,
} from '../db/salesEngineSeed';

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

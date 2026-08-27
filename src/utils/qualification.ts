export type {
  QualificationAnswer,
  QualificationQuestion,
  QualificationResult,
  ServiceQualificationConfig,
  QualificationBreakdownItem,
} from '../types';

import {
  Company,
  Contact,
  Lead,
  QualificationAnswer,
  QualificationBreakdownItem,
  QualificationQuestion,
  QualificationResult,
  ServiceQualificationConfig,
} from '../types';

/**
 * Questionários Padrão por Serviço (Baseados nos requisitos do PROSPECT OS)
 */
export const DEFAULT_SERVICE_QUALIFICATIONS: Record<string, QualificationQuestion[]> = {
  // 1. Criação de Website & Reformulação
  website: [
    {
      id: 'q-web-1',
      question: 'A empresa possui website próprio ativo?',
      type: 'SIM_NAO',
      weightYes: 0,
      weightNo: 20,
      positiveCriterionIf: 'NAO',
      positiveLabel: 'Não possui website (alta oportunidade)',
      negativeLabel: 'Já possui website',
      active: true,
      order: 1,
    },
    {
      id: 'q-web-2',
      question: 'O website funciona bem no celular (responsivo)?',
      type: 'SIM_NAO',
      weightYes: 0,
      weightNo: 20,
      positiveCriterionIf: 'NAO',
      positiveLabel: 'Website não funciona bem no celular (gargalo mobile)',
      negativeLabel: 'Website responsivo no celular',
      active: true,
      order: 2,
    },
    {
      id: 'q-web-3',
      question: 'O website está atualizado e moderno?',
      type: 'SIM_NAO',
      weightYes: 0,
      weightNo: 15,
      positiveCriterionIf: 'NAO',
      positiveLabel: 'Website desatualizado e com design antigo',
      negativeLabel: 'Website atualizado e moderno',
      active: true,
      order: 3,
    },
    {
      id: 'q-web-4',
      question: 'Possui formas claras de contacto no site (botão WhatsApp, formulário)?',
      type: 'SIM_NAO',
      weightYes: 0,
      weightNo: 10,
      positiveCriterionIf: 'NAO',
      positiveLabel: 'Falta de canais diretos de conversão no site',
      negativeLabel: 'Canais de contacto visíveis',
      active: true,
      order: 4,
    },
    {
      id: 'q-web-5',
      question: 'Tem presença ativa nas redes sociais (Instagram/Facebook com posts recentes)?',
      type: 'SIM_NAO',
      weightYes: 10,
      weightNo: 0,
      positiveCriterionIf: 'SIM',
      positiveLabel: 'Presença ativa no Instagram/redes sociais',
      negativeLabel: 'Pouca atividade em redes sociais',
      active: true,
      order: 5,
    },
    {
      id: 'q-web-6',
      question: 'Identificou o contacto direto do tomador de decisão (Sócio, Dono ou Diretor)?',
      type: 'SIM_NAO',
      weightYes: 15,
      weightNo: 0,
      positiveCriterionIf: 'SIM',
      positiveLabel: 'Contacto direto com o decisor identificado',
      negativeLabel: 'Apenas contacto institucional genérico',
      active: true,
      order: 6,
    },
    {
      id: 'q-web-7',
      question: 'Possui WhatsApp comercial ativo e verificado?',
      type: 'SIM_NAO',
      weightYes: 10,
      weightNo: 0,
      positiveCriterionIf: 'SIM',
      positiveLabel: 'WhatsApp ativo para fechamento rápido',
      negativeLabel: 'Sem WhatsApp verificado',
      active: true,
      order: 7,
    },
  ],

  // 2. Landing Page de Alta Conversão
  landing_page: [
    {
      id: 'q-lp-1',
      question: 'A empresa vende um serviço ou produto de alto ticket com oferta específica?',
      type: 'SIM_NAO',
      weightYes: 25,
      weightNo: 0,
      positiveCriterionIf: 'SIM',
      positiveLabel: 'Produto/serviço com oferta de alto valor para página dedicada',
      negativeLabel: 'Mix de produtos disperso',
      active: true,
      order: 1,
    },
    {
      id: 'q-lp-2',
      question: 'A empresa investe ou planeja investir em anúncios (Meta Ads ou Google Ads)?',
      type: 'SIM_NAO',
      weightYes: 25,
      weightNo: 0,
      positiveCriterionIf: 'SIM',
      positiveLabel: 'Investimento em tráfego necessitando de página de conversão',
      negativeLabel: 'Sem previsão de investimento em tráfego pago',
      active: true,
      order: 2,
    },
    {
      id: 'q-lp-3',
      question: 'O link atual na bio ou anúncios cai em página genérica ou número solto?',
      type: 'SIM_NAO',
      weightYes: 25,
      weightNo: 0,
      positiveCriterionIf: 'SIM',
      positiveLabel: 'Desperdício de tráfego atual com link genérico na bio',
      negativeLabel: 'Funil já direcionado',
      active: true,
      order: 3,
    },
    {
      id: 'q-lp-4',
      question: 'Possui atendimento ágil via WhatsApp para fechar os leads captados?',
      type: 'SIM_NAO',
      weightYes: 25,
      weightNo: 0,
      positiveCriterionIf: 'SIM',
      positiveLabel: 'Equipe de atendimento pronta para receber volume de leads',
      negativeLabel: 'Atendimento via WhatsApp lento',
      active: true,
      order: 4,
    },
  ],

  // 3. Google Perfil da Empresa (Google Business / SEO Local)
  google_business: [
    {
      id: 'q-gb-1',
      question: 'A empresa NÃO possui perfil no Google Maps ou o perfil não foi reivindicado?',
      type: 'SIM_NAO',
      weightYes: 30,
      weightNo: 0,
      positiveCriterionIf: 'SIM',
      positiveLabel: 'Perfil não reivindicado no Google Maps (oportunidade imediata)',
      negativeLabel: 'Perfil verificado e ativo',
      active: true,
      order: 1,
    },
    {
      id: 'q-gb-2',
      question: 'O perfil atual tem fotos desatualizadas, poucas avaliações ou nota inferior a 4.5?',
      type: 'SIM_NAO',
      weightYes: 25,
      weightNo: 0,
      positiveCriterionIf: 'SIM',
      positiveLabel: 'Avaliações baixas ou perfil desatualizado no Google',
      negativeLabel: 'Perfil com boas avaliações e fotos recentes',
      active: true,
      order: 2,
    },
    {
      id: 'q-gb-3',
      question: 'O negócio depende fortemente de clientes locais da cidade/região?',
      type: 'SIM_NAO',
      weightYes: 25,
      weightNo: 0,
      positiveCriterionIf: 'SIM',
      positiveLabel: 'Forte dependência de busca local na região',
      negativeLabel: 'Negócio 100% digital ou sem foco local',
      active: true,
      order: 3,
    },
    {
      id: 'q-gb-4',
      question: 'Concorrentes diretos na mesma região estão melhor posicionados no Google?',
      type: 'SIM_NAO',
      weightYes: 20,
      weightNo: 0,
      positiveCriterionIf: 'SIM',
      positiveLabel: 'Concorrentes locais dominando o topo das buscas',
      negativeLabel: 'Líder de posicionamento local',
      active: true,
      order: 4,
    },
  ],

  // 4. Automação de Processos & Sistemas / CRM
  automacao: [
    {
      id: 'q-auto-1',
      question: 'A empresa realiza controle operacional manual (papel ou planilhas soltas)?',
      type: 'SIM_NAO',
      weightYes: 30,
      weightNo: 0,
      positiveCriterionIf: 'SIM',
      positiveLabel: 'Controle manual com perda de tempo e retrabalho',
      negativeLabel: 'Utiliza sistema integrado',
      active: true,
      order: 1,
    },
    {
      id: 'q-auto-2',
      question: 'A empresa possui equipe com mais de 3 pessoas ou múltiplas unidades?',
      type: 'SIM_NAO',
      weightYes: 25,
      weightNo: 0,
      positiveCriterionIf: 'SIM',
      positiveLabel: 'Estrutura operacional que justifica investimento em automação',
      negativeLabel: 'Estrutura muito reduzida',
      active: true,
      order: 2,
    },
    {
      id: 'q-auto-3',
      question: 'Há perda recorrente de clientes por demora no primeiro atendimento?',
      type: 'SIM_NAO',
      weightYes: 25,
      weightNo: 0,
      positiveCriterionIf: 'SIM',
      positiveLabel: 'Perda mensurável de vendas por demora no WhatsApp',
      negativeLabel: 'Atendimento ágil',
      active: true,
      order: 3,
    },
    {
      id: 'q-auto-4',
      question: 'O decisor valoriza dados de vendas, relatórios e métricas de desempenho?',
      type: 'SIM_NAO',
      weightYes: 20,
      weightNo: 0,
      positiveCriterionIf: 'SIM',
      positiveLabel: 'Fit cultural com tecnologia e gestão orientada a dados',
      negativeLabel: 'Perfil resistente à tecnologia',
      active: true,
      order: 4,
    },
  ],

  // 5. Genérico / Outros Serviços
  default: [
    {
      id: 'q-def-1',
      question: 'A empresa possui necessidade clara que o seu serviço resolve diretamente?',
      type: 'SIM_NAO',
      weightYes: 30,
      weightNo: 0,
      positiveCriterionIf: 'SIM',
      positiveLabel: 'Necessidade aparente e dor latente identificada',
      negativeLabel: 'Sem dor evidente no momento',
      active: true,
      order: 1,
    },
    {
      id: 'q-def-2',
      question: 'O contacto identificado possui autonomia para aprovação da proposta?',
      type: 'SIM_NAO',
      weightYes: 25,
      weightNo: 0,
      positiveCriterionIf: 'SIM',
      positiveLabel: 'Acesso ao tomador de decisão final',
      negativeLabel: 'Contato intermediário sem poder decisório',
      active: true,
      order: 2,
    },
    {
      id: 'q-def-3',
      question: 'A empresa tem porte e faturamento compatíveis com o ticket da solução?',
      type: 'SIM_NAO',
      weightYes: 25,
      weightNo: 0,
      positiveCriterionIf: 'SIM',
      positiveLabel: 'Capacidade financeira adequada ao serviço',
      negativeLabel: 'Orçamento restrito',
      active: true,
      order: 3,
    },
    {
      id: 'q-def-4',
      question: 'Possui canal direto de comunicação validado (WhatsApp ou telefone)?',
      type: 'SIM_NAO',
      weightYes: 20,
      weightNo: 0,
      positiveCriterionIf: 'SIM',
      positiveLabel: 'Canal de prospecção direto e ágil',
      negativeLabel: 'Apenas canais lentos ou burocráticos',
      active: true,
      order: 4,
    },
  ],
};

/**
 * Retorna as perguntas de qualificação para um serviço específico
 */
export function getQuestionsForService(
  serviceName?: string,
  serviceId?: string,
  customConfigs?: ServiceQualificationConfig[]
): QualificationQuestion[] {
  // 1. Verifica configurações personalizadas salvas pelo usuário
  if (customConfigs && customConfigs.length > 0) {
    if (serviceId) {
      const byId = customConfigs.find((c) => c.serviceId === serviceId);
      if (byId && byId.questions && byId.questions.length > 0) {
        return byId.questions.filter((q) => q.active !== false);
      }
    }

    if (serviceName) {
      const normalizedName = serviceName.trim().toLowerCase();
      const byName = customConfigs.find(
        (c) =>
          c.serviceName.toLowerCase() === normalizedName ||
          normalizedName.includes(c.serviceName.toLowerCase()) ||
          c.serviceName.toLowerCase().includes(normalizedName)
      );
      if (byName && byName.questions && byName.questions.length > 0) {
        return byName.questions.filter((q) => q.active !== false);
      }
    }
  }

  if (!serviceName) return DEFAULT_SERVICE_QUALIFICATIONS.default;

  const normalized = serviceName.toLowerCase();

  if (normalized.includes('web') || normalized.includes('site') || normalized.includes('portal')) {
    return DEFAULT_SERVICE_QUALIFICATIONS.website;
  }
  if (normalized.includes('landing') || normalized.includes('página') || normalized.includes('captura')) {
    return DEFAULT_SERVICE_QUALIFICATIONS.landing_page;
  }
  if (normalized.includes('google') || normalized.includes('maps') || normalized.includes('seo') || normalized.includes('local') || normalized.includes('negócio')) {
    return DEFAULT_SERVICE_QUALIFICATIONS.google_business;
  }
  if (normalized.includes('auto') || normalized.includes('sistema') || normalized.includes('app') || normalized.includes('crm') || normalized.includes('software') || normalized.includes('gestão')) {
    return DEFAULT_SERVICE_QUALIFICATIONS.automacao;
  }

  return DEFAULT_SERVICE_QUALIFICATIONS.default;
}

/**
 * Detecta dados ausentes no cadastro de forma estrita e objetiva
 */
export function detectMissingData(company?: Company | null, contact?: Contact | null, lead?: Lead | null): string[] {
  const missing: string[] = [];

  if (!company) {
    return ['Dados da empresa não cadastrados'];
  }

  if (!contact?.name) {
    missing.push('Nome do contacto decisor');
  }

  if (!contact?.whatsapp && !company.companyWhatsApp && !contact?.phone && !company.companyPhone) {
    missing.push('WhatsApp ou Telefone para contato');
  }

  if (!contact?.role) {
    missing.push('Cargo do decisor identificado');
  }

  if (!company.website && company.websiteQuality === 'nenhuma') {
    missing.push('Website corporativo');
  }

  if (!company.instagram) {
    missing.push('Perfil no Instagram da empresa');
  }

  if (!company.city) {
    missing.push('Cidade / Localização');
  }

  if (!company.apparentNeed && !lead?.notes) {
    missing.push('Diagnóstico da dor / necessidade');
  }

  return missing;
}

/**
 * Calcula o resultado da qualificação a partir das respostas dadas
 * Sistema de 0 a 100 com explicabilidade matemática e faixas de score
 */
export function calculateQualificationResult(
  questions: QualificationQuestion[],
  answersMap: Record<string, 'SIM' | 'NÃO' | 'NAO'>,
  context?: {
    company?: Company | null;
    contact?: Contact | null;
    lead?: Lead | null;
    serviceId?: string;
    serviceName?: string;
  }
): QualificationResult {
  let rawScore = 0;
  let maxPossibleScore = 0;
  const positivePoints: string[] = [];
  const negativePoints: string[] = [];
  const breakdown: QualificationBreakdownItem[] = [];
  const answers: QualificationAnswer[] = [];

  questions.forEach((q) => {
    const ans = answersMap[q.id] || 'NÃO';
    const isYes = ans === 'SIM';
    const pointsAwarded = isYes ? q.weightYes : q.weightNo;
    const maxQuestionPoints = Math.max(q.weightYes, q.weightNo);

    rawScore += pointsAwarded;
    maxPossibleScore += maxQuestionPoints;

    answers.push({
      questionId: q.id,
      questionText: q.question,
      answer: ans,
      pointsAwarded,
    });

    // Breakdown item
    if (pointsAwarded > 0) {
      const reasonLabel = isYes
        ? (q.positiveLabel || `Resposta SIM na pergunta`)
        : (q.positiveLabel || `Resposta NÃO na pergunta`);
      breakdown.push({
        questionText: q.question,
        points: pointsAwarded,
        matched: true,
        reason: reasonLabel,
      });
    }

    if (q.positiveCriterionIf === 'SIM' && isYes && q.positiveLabel) {
      positivePoints.push(q.positiveLabel);
    } else if (q.positiveCriterionIf === 'NAO' && !isYes && q.positiveLabel) {
      positivePoints.push(q.positiveLabel);
    }

    if (q.negativeCriterionIf === 'SIM' && isYes && q.negativeLabel) {
      negativePoints.push(q.negativeLabel);
    } else if (q.negativeCriterionIf === 'NAO' && !isYes && q.negativeLabel) {
      negativePoints.push(q.negativeLabel);
    } else if (q.positiveCriterionIf === 'SIM' && !isYes && q.negativeLabel) {
      negativePoints.push(q.negativeLabel);
    }
  });

  // Normalização estrita 0 a 100
  const normalizedScore = maxPossibleScore > 0
    ? Math.min(100, Math.max(0, Math.round((rawScore / maxPossibleScore) * 100)))
    : 50;

  // Faixas oficiais de pontuação do PROSPECT OS:
  // 0–39: BAIXA PRIORIDADE
  // 40–59: MÉDIA
  // 60–79: ALTA
  // 80–100: PRIORIDADE MÁXIMA
  let classification: 'baixa' | 'media' | 'alta' | 'prioridade_maxima' = 'baixa';
  let classificationLabel = 'BAIXA PRIORIDADE';
  let recommendation = 'Baixa prioridade. Lead com poucos gatilhos imediatos. Manter na base ou agendar contato futuro.';

  if (normalizedScore >= 80) {
    classification = 'prioridade_maxima';
    classificationLabel = 'PRIORIDADE MÁXIMA';
    recommendation = 'Priorizar contacto imediato. Excelente fit com dores agudas identificadas e canal direto ativo.';
  } else if (normalizedScore >= 60) {
    classification = 'alta';
    classificationLabel = 'ALTA';
    recommendation = 'Prioridade alta. Abordar oferecendo diagnóstico consultivo e destacando os problemas identificados.';
  } else if (normalizedScore >= 40) {
    classification = 'media';
    classificationLabel = 'MÉDIA';
    recommendation = 'Prioridade média. Enviar material de conscientização antes de agendar proposta.';
  }

  // Detectar dados ausentes reais
  const missingData = detectMissingData(context?.company, context?.contact, context?.lead);

  return {
    score: normalizedScore,
    rawScore,
    maxPossibleScore,
    classification,
    classificationLabel,
    positivePoints,
    negativePoints,
    missingData,
    breakdown,
    recommendation,
    answers,
    serviceId: context?.serviceId,
    serviceName: context?.serviceName,
    answeredAt: new Date().toISOString(),
  };
}

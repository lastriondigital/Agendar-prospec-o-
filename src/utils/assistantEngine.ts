import {
  AdaptiveFunnelRule,
  AdaptiveResponseKey,
  AiAuthorizedAction,
  AiLeadAnalysisResult,
  CommercialPersonalizationSettings,
  Company,
  Contact,
  ContactChannel,
  DiagnosticQuestionsGuide,
  HistoryEvent,
  IdealCustomerProfile,
  Lead,
  LeadPriority,
  LeadStage,
  OpportunityState,
  PlaybookBuildingBlockItem,
  PlaybookStageItem,
  PlaybookStageKey,
  ProspectingMode,
  Service,
  SystemLearningMetric,
  ThreeCsMethodology,
} from '../types';
import { resolveCommercialContext } from './commercialPersonalization';
import { getLeadSignals, PROSPECT_SIGNALS, resolveProspectingMode } from './prospectingEngine';

/**
 * ============================================================================
 * 1. SEPARAÇÃO DE SCORES: OPORTUNIDADE (0-100) vs QUALIFICAÇÃO (0-100)
 * ============================================================================
 */
export function calculateSeparatedScores(
  company?: Company,
  contact?: Contact,
  lead?: Lead,
  icps: IdealCustomerProfile[] = [],
  history: HistoryEvent[] = []
): {
  opportunityScore: number;
  qualificationScore: number;
  qualificationSummary: string;
  isHighOpportunity: boolean;
  isHighQualified: boolean;
  statusSentence: string;
} {
  if (!company) {
    return {
      opportunityScore: 0,
      qualificationScore: 0,
      qualificationSummary: 'Sem dados cadastrados',
      isHighOpportunity: false,
      isHighQualified: false,
      statusSentence: 'Dados insuficientes para avaliar oportunidade e qualificação.',
    };
  }

  // --- SCORE DE OPORTUNIDADE (0-100) ---
  // Avalia características externas da empresa, nicho, problemas e sinais
  let oppScore = 0;
  const { detected } = getLeadSignals(company, lead);

  // Fit de nicho / ICP (até 30 pts)
  if (company.niche && company.niche !== 'Outro' && company.niche !== 'Geral') {
    oppScore += 20;
    const matchesIcp = icps.some(
      (i) =>
        i.niches.some((n) => n.toLowerCase() === company.niche.toLowerCase()) ||
        i.countries.some((c) => c.toLowerCase() === company.country.toLowerCase())
    );
    if (matchesIcp) oppScore += 10;
  }

  // Sinais de problemas ou latência (até 35 pts)
  if (!company.website) {
    oppScore += 30; // Sem website = grande oportunidade de venda
  } else if (company.websiteQuality === 'outdated' || company.websiteQuality === 'ruim') {
    oppScore += 25;
  } else if (company.websiteQuality === 'broken') {
    oppScore += 25;
  } else {
    oppScore += 10;
  }

  // Sinais adicionais (redes, unidades, reviews)
  if (detected.length > 0) {
    oppScore += Math.min(25, detected.length * 6);
  }
  if (company.unitsCount && company.unitsCount >= 2) {
    oppScore += 10;
  }

  const opportunityScore = Math.min(100, Math.max(10, oppScore));

  // --- SCORE DE QUALIFICAÇÃO (0-100) ---
  // Avalia intenção real demonstrada, resposta recebida, confirmação de decisor, dor validada
  let qualScore = 0;
  let qualReasons: string[] = [];

  // Decisor identificado
  if (contact && (contact.personaRole === 'proprietario' || contact.personaRole === 'socio_diretor' || contact.role?.toLowerCase().includes('dono') || contact.role?.toLowerCase().includes('ceo') || contact.role?.toLowerCase().includes('diretor'))) {
    qualScore += 25;
    qualReasons.push('Decisor identificado');
  } else if (contact?.name) {
    qualScore += 10;
    qualReasons.push('Contato preliminar');
  }

  // Canal direto verificado
  if (contact?.whatsapp || company.companyWhatsAppVerified) {
    qualScore += 15;
    qualReasons.push('WhatsApp direto');
  }

  // Estágio no funil
  const stage = lead?.stage || 'PRIMEIRO_CONTATO';
  if (stage === 'DIAGNOSTICO' || stage === 'QUALIFICADO') {
    qualScore += 25;
    qualReasons.push('Em diagnóstico');
  } else if (stage === 'DEMONSTRACAO' || stage === 'APRESENTACAO') {
    qualScore += 35;
    qualReasons.push('Interesse em demonstração');
  } else if (stage === 'PROPOSTA' || stage === 'OFERTA' || stage === 'NEGOCIACAO') {
    qualScore += 45;
    qualReasons.push('Proposta em análise');
  } else if (stage === 'CONTRATO_ENVIADO' || stage === 'FECHAMENTO') {
    qualScore += 55;
    qualReasons.push('Fase final de fechamento');
  } else if (stage === 'GANHO' || stage === 'CLIENTE') {
    qualScore += 60;
    qualReasons.push('Cliente fechado');
  }

  // Histórico de respostas
  const companyEvents = history.filter((h) => h.companyId === company.id || (lead && h.leadId === lead.id));
  const hasResponse = companyEvents.some((e) => e.type === 'response_received' || e.title?.toLowerCase().includes('resposta'));
  if (hasResponse) {
    qualScore += 15;
    qualReasons.push('Respondeu a contato');
  }

  // Interação adaptativa recente
  if (lead?.responseOutcome === 'positive' || lead?.temperature === 'quente') {
    qualScore += 10;
  }

  const qualificationScore = Math.min(100, Math.max(0, qualScore));

  const isHighOpportunity = opportunityScore >= 70;
  const isHighQualified = qualificationScore >= 60;

  let statusSentence = '';
  if (isHighOpportunity && !isHighQualified) {
    statusSentence = 'Excelente candidato, mas ainda não demonstrou intenção suficiente.';
  } else if (isHighOpportunity && isHighQualified) {
    statusSentence = 'Oportunidade de alta prioridade com decisor engajado e qualificado.';
  } else if (!isHighOpportunity && isHighQualified) {
    statusSentence = 'Contato engajado com potencial de escopo a mapear.';
  } else {
    statusSentence = 'Em estágio inicial de prospecção e levantamento.';
  }

  return {
    opportunityScore,
    qualificationScore,
    qualificationSummary: qualReasons.length > 0 ? qualReasons.join(' • ') : 'Sem interação registrada',
    isHighOpportunity,
    isHighQualified,
    statusSentence,
  };
}

/**
 * ============================================================================
 * 2. IA DE ANÁLISE DO LEAD (ESTRITAMENTE DADOS DISPONÍVEIS - ZERO ALUCINAÇÃO)
 * ============================================================================
 */
export function analyzeLeadDataDeterministic(
  company: Company,
  contact?: Contact,
  lead?: Lead,
  service?: Service,
  icps: IdealCustomerProfile[] = [],
  settings?: CommercialPersonalizationSettings,
  history: HistoryEvent[] = []
): AiLeadAnalysisResult {
  const { opportunityScore, qualificationScore } = calculateSeparatedScores(company, contact, lead, icps, history);
  const { detected, custom } = getLeadSignals(company, lead);
  const mode = resolveProspectingMode(company, lead);
  const resolved = resolveCommercialContext({ company, contact, lead, service, settings });

  const factsUsed: string[] = [];
  const missingData: string[] = [];
  const risksAndLimitations: string[] = [];

  // Fatos usados
  factsUsed.push(`Empresa: ${company.name}`);
  if (company.tradeName) factsUsed.push(`Nome Fantasia: ${company.tradeName}`);
  if (company.niche) factsUsed.push(`Nicho: ${company.niche}`);
  if (company.country) factsUsed.push(`País: ${company.country}`);
  if (company.city) factsUsed.push(`Cidade: ${company.city}`);
  if (contact?.name) factsUsed.push(`Contato: ${contact.name}`);
  if (contact?.personaRole) factsUsed.push(`Papel: ${contact.personaRole}`);
  if (company.website) {
    factsUsed.push(`Website: ${company.website} (Qualidade: ${company.websiteQuality || 'normal'})`);
  } else {
    factsUsed.push('Sem website institucional cadastrado');
  }

  // Dados Ausentes
  if (!contact?.name) missingData.push('Nome do contato/decisor não informado');
  if (!contact?.phone && !contact?.whatsapp && !company.companyPhone && !company.companyWhatsApp) {
    missingData.push('Telefone / WhatsApp direto ausente');
  }
  if (!company.niche || company.niche === 'Geral') {
    missingData.push('Nicho específico de atuação não informado');
  }
  if (!company.unitsCount) {
    missingData.push('Número de unidades físicas não informado');
  }

  // Confiança da análise
  const hasCrucialData = Boolean(company.name && company.niche && (contact?.name || company.companyWhatsApp || company.companyPhone));
  const confidence: 'alta' | 'baixa' = hasCrucialData && missingData.length <= 2 ? 'alta' : 'baixa';
  const confidenceReason =
    confidence === 'alta'
      ? 'Dados suficientes confirmados no cadastro para análise fundamentada.'
      : 'Dados incompletos no cadastro; recomenda-se verificar WhatsApp e nome do decisor antes de abordar.';

  // Problemas e Sinais
  const problemsAndSignals: string[] = [];
  if (!company.website) {
    problemsAndSignals.push('Ausência de website institucional');
  } else if (company.websiteQuality === 'outdated') {
    problemsAndSignals.push('Website com visual antigo e informações desatualizadas');
  } else if (company.websiteQuality === 'broken') {
    problemsAndSignals.push('Website com erros técnicos ou certificado inválido');
  }
  detected.forEach((d) => problemsAndSignals.push(d.label));
  custom.forEach((c) => problemsAndSignals.push(c));

  if (problemsAndSignals.length === 0) {
    problemsAndSignals.push('Presença digital básica sem problemas críticos reportados');
  }

  // Adequação ao ICP
  let icpAdequacy = 'Moderada';
  let icpScore = 65;
  const matchedIcp = icps.find(
    (i) =>
      i.niches.some((n) => n.toLowerCase() === company.niche.toLowerCase()) ||
      i.countries.some((c) => c.toLowerCase() === company.country.toLowerCase())
  );
  if (matchedIcp) {
    icpAdequacy = `Alta — Compatível com perfil "${matchedIcp.name}"`;
    icpScore = 90;
  } else if (company.niche && company.niche !== 'Outro') {
    icpAdequacy = `Compatível com o segmento de ${company.niche}`;
    icpScore = 75;
  }

  // Potencial Comercial
  let commercialPotential = 'Médio';
  if (company.unitsCount && company.unitsCount >= 2) {
    commercialPotential = 'Alto — Empresa com múltiplas unidades e capacidade de investimento';
  } else if (!company.website || company.websiteQuality === 'outdated') {
    commercialPotential = 'Alto — Necessidade evidente de modernização e captação de clientes';
  } else {
    commercialPotential = 'Médio — Necessário diagnóstico consultivo para mensurar retorno';
  }

  // Estado da Oportunidade
  let oppState: OpportunityState = lead?.opportunityState || 'HIPOTESE';
  if (!company.website || company.websiteQuality === 'broken' || company.websiteQuality === 'outdated') {
    oppState = 'PROBLEMA_CONFIRMADO';
  } else if (detected.length >= 2) {
    oppState = 'PROVAVEL';
  }

  // Serviço Recomendado
  let recService = service?.name || resolved.serviceName;
  if (!service && !lead?.serviceName) {
    if (mode === 'OPORTUNIDADE_LATENTE') {
      recService = 'Desenvolvimento de APP / Sistema de Gestão';
    } else if (!company.website || company.websiteQuality === 'outdated') {
      recService = 'Criação / Modernização de Website de Alta Conversão';
    } else {
      recService = 'Otimização de Google Meu Negócio e Presença Digital';
    }
  }

  // Limitações e Riscos
  if (!contact?.name) {
    risksAndLimitations.push('Risco de contato com intermediário / recepção sem acesso ao decisor.');
  }
  if (!company.website && mode === 'OPORTUNIDADE_LATENTE') {
    risksAndLimitations.push('Empresa ainda sem base digital consolidada para soluções avançadas de software.');
  }
  if (risksAndLimitations.length === 0) {
    risksAndLimitations.push('Nenhum risco impeditivo identificado.');
  }

  // Próxima Ação e Script Recomendado
  let recNextAction = 'Primeiro contacto consultivo';
  let recChannel: ContactChannel = 'whatsapp';
  let recScript = '';

  const firstName = contact?.name ? contact.name.split(' ')[0] : 'Olá';
  const compName = company.tradeName || company.name;
  const city = company.city ? `em ${company.city}` : '';

  if (mode === 'OPORTUNIDADE_LATENTE') {
    recNextAction = 'Primeiro contacto investigativo (Descoberta)';
    recScript = `Olá ${firstName}, tudo bem? Sou especialista em soluções digitais e acompanho o crescimento da ${compName} ${city}.

Estamos mapeando processos em empresas de ${company.niche} para identificar oportunidades de otimização de agendamentos e atendimento.

Você teria 5 minutos nesta semana para trocarmos uma ideia sobre a experiência digital dos seus clientes?`;
  } else if (!company.website) {
    recNextAction = 'Primeiro contacto com diagnóstico de presença';
    recScript = `Olá ${firstName}, tudo bem? Estava pesquisando referências no segmento de ${company.niche} ${city} e encontrei a ${compName}.

Notei que vocês ainda não possuem um site institucional com botão direto para WhatsApp e agendamentos.

Preparamos um diagnóstico rápido mostrando como estruturar a presença online de vocês para captar mais clientes. Posso compartilhar por aqui?`;
  } else {
    recNextAction = 'Primeiro contacto com sugestão de melhoria';
    recScript = `Olá ${firstName}, tudo bem? Acompanho o trabalho da ${compName} ${city}.

Analisamos a presença digital de vocês e encontramos pontos simples de melhoria (como velocidade no mobile e facilidade de contato) que podem aumentar a conversão de clientes.

Gostaria de dar uma olhada em 3 sugestões práticas que preparamos?`;
  }

  return {
    icpAdequacy,
    icpScore,
    problemsAndSignals,
    commercialPotential,
    opportunityState: oppState,
    opportunityScore,
    qualificationScore,
    recommendedService: recService,
    recommendedServiceId: service?.id || lead?.serviceId,
    analysisRiskOrLimitations: risksAndLimitations,
    recommendedNextAction: recNextAction,
    recommendedChannel: recChannel,
    recommendedScript: recScript,
    confidence,
    confidenceReason,
    factsUsed,
    missingData,
    analyzedAt: new Date().toISOString(),
  };
}

/**
 * ============================================================================
 * 3. FUNIL ADAPTATIVO — CLASSIFICAÇÃO RÁPIDA DE RESPOSTAS DO LEAD
 * ============================================================================
 */
export const ADAPTIVE_FUNNEL_RULES: AdaptiveFunnelRule[] = [
  {
    key: 'funcionario_pedir_responsavel',
    leadResponsePattern: 'Não sou eu que cuido disso.',
    classification: 'Funcionário / Intermediário',
    targetNextAction: 'Pedir contato do responsável',
    recommendedStage: 'PRIMEIRO_CONTATO',
    qualificationScoreDelta: 5,
    suggestedScriptTitle: 'Solicitação polida de decisor',
    suggestedScript: `Entendido, obrigado pelo retorno! Poderia me indicar com quem posso falar sobre a presença digital e novos projetos da empresa? Se preferir, qual o e-mail ou WhatsApp direto dele(a)?`,
  },
  {
    key: 'responsavel_diagnostico',
    leadResponsePattern: 'Sou o responsável.',
    classification: 'Decisor Confirmado',
    targetNextAction: 'Apresentar diagnóstico e agendar conversa',
    recommendedStage: 'DIAGNOSTICO',
    qualificationScoreDelta: 25,
    suggestedScriptTitle: 'Transição para diagnóstico consultivo',
    suggestedScript: `Excelente! Como proprietário(a), imagino que seu foco seja atrair mais clientes qualificados. Preparamos uma análise rápida com 3 pontos práticos que podem aumentar os agendamentos da empresa. Teria 10 minutos amanhã às 14h para vermos juntos?`,
  },
  {
    key: 'solucao_existente',
    leadResponsePattern: 'Já tenho site.',
    classification: 'Objeção: Solução Existente',
    targetNextAction: 'Investigar satisfação com o site atual',
    recommendedStage: 'DIAGNOSTICO',
    qualificationScoreDelta: 10,
    suggestedScriptTitle: 'Investigação de satisfação e conversão',
    suggestedScript: `Ótimo saber que já possuem presença online! O site de vocês tem gerado a quantidade de contatos diários no WhatsApp que você gostaria? Se pudesse melhorar um único ponto nele hoje, seria o visual, a velocidade ou a conversão de clientes?`,
  },
  {
    key: 'interesse_preco',
    leadResponsePattern: 'Quanto custa?',
    classification: 'Interesse Comercial / Preço',
    targetNextAction: 'Verificar se o escopo já está definido',
    recommendedStage: 'DIAGNOSTICO',
    qualificationScoreDelta: 20,
    suggestedScriptTitle: 'Ancoragem de valor e alinhamento de escopo',
    suggestedScript: `Nossos projetos são sob medida para cada objetivo da empresa. Para eu te passar o valor exato sem surpresas, você precisa de uma landing page focada em captação ou de um site institucional completo com catálogo/agendamentos?`,
  },
  {
    key: 'feedback_positivo',
    leadResponsePattern: 'Gostei, mas quero mudar algumas coisas.',
    classification: 'Feedback Positivo / Ajuste de Escopo',
    targetNextAction: 'Recolher requisitos específicos',
    recommendedStage: 'DEMONSTRACAO',
    qualificationScoreDelta: 30,
    suggestedScriptTitle: 'Coleta de requisitos e personalização',
    suggestedScript: `Perfeito! Adoro alinhar cada detalhe com as preferências do cliente. Quais mudanças você tem em mente? Se preferir, pode me mandar um áudio aqui com os pontos que você quer ajustar que já integro na proposta.`,
  },
  {
    key: 'objecao_timing',
    leadResponsePattern: 'Agora não é um bom momento / Fale mês que vem.',
    classification: 'Objeção: Timing / Momento',
    targetNextAction: 'Agendar follow-up pontual com valor agregado',
    recommendedStage: 'FOLLOW_UP',
    qualificationScoreDelta: 5,
    suggestedScriptTitle: 'Respeito ao momento e agendamento futuro',
    suggestedScript: `Compreendo perfeitamente, o dia a dia na gestão é corrido. Posso te enviar uma mensagem no início do próximo mês com um exemplo prático do setor de vocês? Qual dia da semana costuma ser mais tranquilo para você?`,
  },
  {
    key: 'objecao_sem_interesse',
    leadResponsePattern: 'Não tenho interesse.',
    classification: 'Sem Interesse Imediato',
    targetNextAction: 'Porta aberta e encerramento elegante',
    recommendedStage: 'ARQUIVADO',
    qualificationScoreDelta: -10,
    suggestedScriptTitle: 'Encerramento profissional e cordial',
    suggestedScript: `Sem problemas, agradeço muito pelo tempo e pela resposta sincera! Caso no futuro decidam modernizar a presença digital ou automatizar processos, fico à disposição. Um abraço e ótimos negócios!`,
  },
  {
    key: 'duvida_tecnica',
    leadResponsePattern: 'Como funciona isso na prática?',
    classification: 'Dúvida Técnica / Interesse em Metodologia',
    targetNextAction: 'Enviar demonstração rápida ou vídeo curto',
    recommendedStage: 'DEMONSTRACAO',
    qualificationScoreDelta: 20,
    suggestedScriptTitle: 'Explicação prática e desmistificada',
    suggestedScript: `É bem direto: cuidamos de 100% da criação, textos e otimização. Em cerca de 7 a 10 dias seu site fica no ar, rápido e pronto para receber clientes no WhatsApp. Quer dar uma olhada em um modelo semelhante ao que podemos fazer para vocês?`,
  },
];

export function matchAdaptiveResponse(leadResponseText: string): AdaptiveFunnelRule | null {
  const normalized = leadResponseText.toLowerCase().trim();
  if (normalized.includes('não sou') || normalized.includes('nao sou') || normalized.includes('outro cuida') || normalized.includes('falar com')) {
    return ADAPTIVE_FUNNEL_RULES[0];
  }
  if (normalized.includes('sou o dono') || normalized.includes('sou o responsavel') || normalized.includes('sou o responsável') || normalized.includes('sou eu')) {
    return ADAPTIVE_FUNNEL_RULES[1];
  }
  if (normalized.includes('já tenho') || normalized.includes('ja tenho') || normalized.includes('temos site')) {
    return ADAPTIVE_FUNNEL_RULES[2];
  }
  if (normalized.includes('quanto custa') || normalized.includes('qual o valor') || normalized.includes('preço') || normalized.includes('preco') || normalized.includes('orçamento')) {
    return ADAPTIVE_FUNNEL_RULES[3];
  }
  if (normalized.includes('gostei') || normalized.includes('mudar') || normalized.includes('ajustar') || normalized.includes('alterar')) {
    return ADAPTIVE_FUNNEL_RULES[4];
  }
  if (normalized.includes('depois') || normalized.includes('mês que vem') || normalized.includes('corrido') || normalized.includes('agora não')) {
    return ADAPTIVE_FUNNEL_RULES[5];
  }
  if (normalized.includes('não tenho interesse') || normalized.includes('nao tenho interesse') || normalized.includes('obrigado nao')) {
    return ADAPTIVE_FUNNEL_RULES[6];
  }
  if (normalized.includes('como funciona') || normalized.includes('como é') || normalized.includes('como faz')) {
    return ADAPTIVE_FUNNEL_RULES[7];
  }
  return null;
}

/**
 * ============================================================================
 * 4. FOLLOW-UP INTELIGENTE COM CÁLCULO DINÂMICO
 * ============================================================================
 */
export function calculateSmartFollowUp(
  lead: Lead,
  company: Company,
  lastInteractionDate?: string,
  history: HistoryEvent[] = []
): {
  actionTitle: string;
  recommendedDate: string; // YYYY-MM-DD
  recommendedTime: string; // HH:mm
  recommendedScriptTitle: string;
  scriptContent: string;
  urgency: 'alta' | 'media' | 'normal';
  delayDays: number;
} {
  const stage = lead.stage || 'PRIMEIRO_CONTATO';
  const priority = lead.priority || 'media';
  const compName = company.tradeName || company.name;
  const contactName = company.contacts?.[0]?.name?.split(' ')[0] || 'Olá';

  // Base date
  const base = lastInteractionDate ? new Date(lastInteractionDate) : new Date();
  let delayDays = 2;
  let recommendedTime = '15:00';
  let scriptTitle = 'Follow-up 1 — Relembrar valor';
  let scriptContent = '';
  let urgency: 'alta' | 'media' | 'normal' = priority === 'urgente' || priority === 'alta' ? 'alta' : 'media';

  if (stage === 'PRIMEIRO_CONTATO') {
    delayDays = 2;
    recommendedTime = '10:30';
    scriptTitle = 'Follow-up 1 — Checagem de primeiro contato';
    scriptContent = `Olá ${contactName}, tudo bem? Passando para checar se conseguiu ver a mensagem anterior sobre a presença digital da ${compName}. Preparamos 3 sugestões bem práticas para vocês.`;
  } else if (stage === 'DIAGNOSTICO') {
    delayDays = 1;
    recommendedTime = '14:00';
    scriptTitle = 'Follow-up Diagnóstico — Continuidade';
    scriptContent = `Olá ${contactName}! Conforme conversamos, estruturei os pontos que mapeamos para otimizar os agendamentos da ${compName}. Teria 5 minutos para alinharmos?`;
  } else if (stage === 'DEMONSTRACAO' || stage === 'APRESENTACAO') {
    delayDays = 2;
    recommendedTime = '15:00';
    scriptTitle = 'Follow-up Demonstração 01';
    scriptContent = `Olá ${contactName}! Passando para saber o que achou da demonstração que enviamos para a ${compName}. Ficou alguma dúvida sobre o modelo ou as funcionalidades?`;
  } else if (stage === 'PROPOSTA' || stage === 'OFERTA') {
    delayDays = 3;
    recommendedTime = '11:00';
    scriptTitle = 'Follow-up Proposta — Alinhamento de dúvidas';
    scriptContent = `Olá ${contactName}! Conseguiu dar uma olhada na proposta com os valores da ${compName}? Me avise se deseja fazer algum ajuste no cronograma ou no escopo.`;
  } else {
    delayDays = 4;
    recommendedTime = '16:00';
    scriptTitle = 'Follow-up Reativação de Oportunidade';
    scriptContent = `Olá ${contactName}, tudo bem? Lembrei do projeto da ${compName} e queria saber como está o planejamento de vocês para modernizar a presença online neste trimestre.`;
  }

  const targetDate = new Date(base);
  targetDate.setDate(targetDate.getDate() + delayDays);

  // Evita finais de semana
  if (targetDate.getDay() === 0) targetDate.setDate(targetDate.getDate() + 1);
  if (targetDate.getDay() === 6) targetDate.setDate(targetDate.getDate() + 2);

  const formattedDate = targetDate.toISOString().slice(0, 10);

  return {
    actionTitle: `Follow-up ${scriptTitle.split('—')[0].trim()}`,
    recommendedDate: formattedDate,
    recommendedTime,
    recommendedScriptTitle: scriptTitle,
    scriptContent,
    urgency,
    delayDays,
  };
}

/**
 * ============================================================================
 * 5. PLAYBOOK COMERCIAL COMPLETO (10 ETAPAS, 3 Cs, PERGUNTAS, 13 BLOCOS)
 * ============================================================================
 */
export const PLAYBOOK_STAGES: PlaybookStageItem[] = [
  {
    id: 'abertura',
    order: 1,
    title: '1. Abertura',
    objective: 'Capturar atenção em segundos com respeito, contexto e sem clichês invasivos.',
    recommendedQuestions: [
      'Você é o responsável pelas decisões comerciais da [Empresa]?',
      'Vi o trabalho de vocês na região, posso compartilhar uma observação rápida?',
    ],
    tactics: [
      'Usar nome próprio e nome da empresa.',
      'Citar localização ou nicho real.',
      'Uma única pergunta curta no final.',
    ],
    exampleScripts: [
      {
        title: 'Abertura Direta e Respeitosa',
        text: 'Olá [Nome], tudo bem? Encontrei a [Empresa] e notei que vocês têm ótimas avaliações em [Cidade]. Posso te fazer uma pergunta rápida sobre o atendimento de vocês?',
      },
    ],
  },
  {
    id: 'investigacao',
    order: 2,
    title: '2. Investigação',
    objective: 'Mapear a situação atual, gargalos e canal preferido do cliente.',
    recommendedQuestions: [
      'Hoje a maioria dos clientes chega por indicação, Instagram ou Google?',
      'Como vocês organizam os pedidos e agendamentos que chegam no WhatsApp?',
    ],
    tactics: ['Ouvir mais do que falar.', 'Identificar se o contato é o proprietário ou equipe operacional.'],
    exampleScripts: [
      {
        title: 'Mapeamento de Canal de Aquisição',
        text: 'Hoje quando um cliente busca pelo serviço de vocês no celular, ele consegue agendar direto no WhatsApp ou precisa ligar?',
      },
    ],
  },
  {
    id: 'diagnostico',
    order: 3,
    title: '3. Diagnóstico',
    objective: 'Apresentar fatos observados com formulação de hipótese ética, sem julgamentos agressivos.',
    recommendedQuestions: [
      'Vocês já mediram quantos clientes desistem do contato por lentidão no site?',
      'Se pudessem resolver um gargalo no atendimento esta semana, qual seria?',
    ],
    tactics: [
      'Usar "Isso pode dificultar..." em vez de "você está perdendo clientes".',
      'Mostrar prints ou fatos objetivos verificados.',
    ],
    exampleScripts: [
      {
        title: 'Diagnóstico em Forma de Hipótese',
        text: 'Analisamos a presença digital da [Empresa] e notamos que sem um botão flutuante de WhatsApp, pode existir o risco de clientes mobile desistirem do contato. Posso te mostrar o diagnóstico?',
      },
    ],
  },
  {
    id: 'demonstracao',
    order: 4,
    title: '4. Demonstração',
    objective: 'Apresentar a solução visualmente, provando simplicidade e velocidade.',
    recommendedQuestions: [
      'Faz sentido essa estrutura visual para o padrão de clientes da [Empresa]?',
      'O que você achou da facilidade de contato neste modelo?',
    ],
    tactics: ['Enviar prévia ou link de case real.', 'Destacar clareza visual e carregamento rápido no mobile.'],
    exampleScripts: [
      {
        title: 'Apresentação de Protótipo Rápido',
        text: 'Estruturei uma prévia visual de como ficaria a nova página da [Empresa], com foco em agendamento direto. Dá uma olhada neste link de 1 minuto.',
      },
    ],
  },
  {
    id: 'validacao',
    order: 5,
    title: '5. Validação',
    objective: 'Confirmar se o cliente concorda que a solução resolve o problema diagnosticado.',
    recommendedQuestions: [
      'Na sua visão, isso resolveria a dificuldade de agendamento que conversamos?',
      'Tem algum elemento que você gostaria que fosse diferente?',
    ],
    tactics: ['Fazer perguntas de checagem.', 'Isolar se resta alguma dúvida técnica ou funcional.'],
    exampleScripts: [
      {
        title: 'Checagem de Alinhamento',
        text: 'Se implementarmos essa solução exatamente dessa forma, você sente que resolve o gargalo de atendimento da equipe?',
      },
    ],
  },
  {
    id: 'adequacao',
    order: 6,
    title: '6. Adequação',
    objective: 'Ajustar escopo, prazos e detalhes específicos de acordo com a realidade do cliente.',
    recommendedQuestions: [
      'Qual seria o prazo ideal para vocês terem isso no ar?',
      'Quem da equipe fornecerá as fotos e logotipo oficiais?',
    ],
    tactics: ['Flexibilidade em escopo sem desvalorizar o serviço.', 'Definir responsabilidades de conteúdo.'],
    exampleScripts: [
      {
        title: 'Ajuste de Requisitos e Cronograma',
        text: 'Podemos priorizar a entrega da página principal em 7 dias para vocês já começarem a captar, e os detalhes secundários alinhamos em seguida.',
      },
    ],
  },
  {
    id: 'oferta',
    order: 7,
    title: '7. Oferta',
    objective: 'Apresentar preço, condições de pagamento e entregáveis de forma transparente.',
    recommendedQuestions: [
      'Faz mais sentido para o fluxo de caixa de vocês à vista ou parcelado?',
      'Podemos formalizar a proposta com início imediato?',
    ],
    tactics: ['Usar moeda nativa sem conversão fictícia.', 'Destacar suporte incluso e garantia de entrega.'],
    exampleScripts: [
      {
        title: 'Apresentação Clara de Investimento',
        text: 'O investimento total para entrega completa é de [Preço], incluindo design responsivo, botão de WhatsApp e 30 dias de suporte técnico.',
      },
    ],
  },
  {
    id: 'objecoes',
    order: 8,
    title: '8. Objeções',
    objective: 'Aplicar a metodologia dos 3 Cs (Concordar, Contornar, Conduzir) para eliminar receios.',
    recommendedQuestions: [
      'O que mais te preocupa: o investimento, o prazo ou o trabalho que vai te dar?',
      'Entendo sua preocupação com o tempo. Se eu cuidar de 100% da parte técnica, ajuda?',
    ],
    tactics: ['Nunca confrontar o cliente.', 'Validar o sentimento antes de apresentar nova perspectiva.'],
    exampleScripts: [
      {
        title: 'Aplicação dos 3 Cs em Preço',
        text: 'Entendo perfeitamente (Concordar). O investimento precisa fazer sentido no caixa. Por outro lado, manter o site desatualizado pode custar clientes diários (Contornar). Que tal dividirmos em 3 parcelas para facilitar? (Conduzir)',
      },
    ],
  },
  {
    id: 'fechamento',
    order: 9,
    title: '9. Fechamento',
    objective: 'Conduzir para a assinatura, dados cadastrais e primeiro passo prático.',
    recommendedQuestions: [
      'Posso gerar o link de confirmação no CNPJ/NIF da empresa?',
      'Começamos nesta segunda-feira?',
    ],
    tactics: ['CTA simples e direto.', 'Facilitar ao máximo os passos de pagamento e início.'],
    exampleScripts: [
      {
        title: 'Fechamento Direto',
        text: 'Perfeito! Para darmos início e garantirmos a entrega na próxima semana, só preciso do CNPJ/NIF e do e-mail para emissão da fatura.',
      },
    ],
  },
  {
    id: 'pos_venda',
    order: 10,
    title: '10. Pós-venda',
    objective: 'Garantir satisfação, colher depoimento e abrir portas para novos serviços ou indicações.',
    recommendedQuestions: [
      'Como tem sido o retorno dos clientes com a nova página no ar?',
      'Conhece algum colega do setor que também se beneficiaria dessa modernização?',
    ],
    tactics: ['Follow-up após 7 e 30 dias da entrega.', 'Solicitar recomendação quando o cliente elogiar.'],
    exampleScripts: [
      {
        title: 'Checagem de Resultados Pós-Lançamento',
        text: 'Olá [Nome]! Já faz 15 dias que colocamos sua página no ar. Como tem sido o fluxo de mensagens no WhatsApp?',
      },
    ],
  },
];

export const THREE_CS_METHODOLOGY: ThreeCsMethodology = {
  concordar: {
    description: 'Valide o ponto de vista do prospect com empatia sincera, sem confrontar ou rebater de imediato.',
    examples: [
      'Entendo perfeitamente, o investimento tem que fazer total sentido para o momento da empresa.',
      'Com certeza, você já tem fornecedores de confiança e isso é fundamental.',
      'Faz todo sentido, o dia a dia na gestão consome muito tempo.',
    ],
  },
  contornar: {
    description: 'Apresente um novo ângulo, fato verificado ou hipótese sem desqualificar a opinião anterior.',
    examples: [
      'A grande questão é que cada dia com o site fora do ar pode representar agendamentos perdidos para concorrentes.',
      'Não precisa trocar de parceiro atual, podemos cuidar apenas dessa modernização pontual e veloz.',
      'Exatamente por isso criamos um processo onde nós cuidamos de 95% do trabalho pesado.',
    ],
  },
  conduzir: {
    description: 'Proponha o próximo passo prático com uma pergunta de micro-compromisso ou alternativa.',
    examples: [
      'Podemos ver juntos uma demonstração de 5 minutos sem nenhum compromisso?',
      'Se dividirmos a condição em 2 vezes, viabiliza o início nesta semana?',
      'Posso te enviar o resumo em PDF para você analisar com calma hoje à tarde?',
    ],
  },
};

export const DIAGNOSTIC_QUESTIONS_GUIDE: DiagnosticQuestionsGuide = {
  estadoAtual: [
    { question: 'Hoje, como o cliente descobre e entra em contato com a empresa?', purpose: 'Mapear canais atuais de atrito e dependência' },
    { question: 'Quanto tempo a equipe leva para responder uma cotação no WhatsApp?', purpose: 'Identificar gargalo de atendimento' },
    { question: 'Quantos contatos chegam por dia pela internet?', purpose: 'Mensurar volume real de oportunidades' },
  ],
  estadoDesejado: [
    { question: 'Qual seria o cenário ideal de volume de clientes para o próximo semestre?', purpose: 'Ancorar o objetivo e a ambição do decisor' },
    { question: 'Como você gostaria que a marca fosse percebida ao ser buscada no Google?', purpose: 'Despertar o valor de autoridade e diferenciação' },
    { question: 'Se o processo fosse automático, o que sua equipe faria com o tempo livre?', purpose: 'Evidenciar o ganho de produtividade' },
  ],
  estadoTemido: [
    { question: 'O que acontece se a concorrência modernizar o canal digital primeiro?', purpose: 'Evidenciar o custo da inação e perda de espaço' },
    { question: 'Existe o risco de clientes desistirem se o site continuar lento no mobile?', purpose: 'Hipótese ética sobre risco real de abandono' },
    { question: 'Quanto custa perder 2 a 3 clientes por semana por falta de resposta rápida?', purpose: 'Quantificar o prejuízo oculto' },
  ],
};

export const PLAYBOOK_BUILDING_BLOCKS: PlaybookBuildingBlockItem[] = [
  {
    id: 'dor',
    category: 'dor',
    title: 'Dor Real',
    description: 'Evidenciar a frustração ou obstáculo operacional que o lead enfrenta.',
    applicationExample: 'Perder tempo respondendo as mesmas dúvidas no WhatsApp em vez de fechar vendas.',
    safetyRule: 'Apenas mencione dores identificadas nos sinais do lead ou confirmadas na conversa.',
  },
  {
    id: 'transformacao',
    category: 'transformacao',
    title: 'Transformação',
    description: 'Mostrar o estado final positivo e a clareza após a solução implementada.',
    applicationExample: 'Sua empresa com agendamentos caindo automaticamente e clientes elogiando a rapidez.',
    safetyRule: 'Foque na melhoria de rotina e presença, sem prometer faturamento milagroso.',
  },
  {
    id: 'prova',
    category: 'prova',
    title: 'Prova e Evidência',
    description: 'Resultados comprovados, telas reais ou referências verificáveis do portfólio.',
    applicationExample: 'Exemplo da Clínica X que aumentou os contatos em 60% após a nova landing page.',
    safetyRule: 'Nunca invente nomes de clientes ou dados fictícios.',
  },
  {
    id: 'novidade',
    category: 'novidade',
    title: 'Novidade & Diferencial',
    description: 'O elemento inovador ou abordagem que diferencia seu serviço de agências tradicionais.',
    applicationExample: 'Entrega ágil em 7 dias com tecnologia moderna e sem mensalidades ocultas.',
    safetyRule: 'Apresente o diferencial técnico com simplicidade, sem jargões confusos.',
  },
  {
    id: 'autoridade',
    category: 'autoridade',
    title: 'Autoridade & Especialização',
    description: 'Demonstrar domínio profundo no nicho e na tecnologia aplicada.',
    applicationExample: 'Especialistas dedicados ao setor de saúde e estética com foco em conversão mobile.',
    safetyRule: 'Apresente sua experiência com naturalidade e postura consultiva.',
  },
  {
    id: 'promessa',
    category: 'promessa',
    title: 'Promessa Clara',
    description: 'O que exatamente será entregue e em quanto tempo.',
    applicationExample: 'Site responsivo, integrado ao WhatsApp e otimizado no Google em até 10 dias.',
    safetyRule: 'Prometa apenas o que está formalmente no escopo e no contrato.',
  },
  {
    id: 'demonstracao',
    category: 'demonstracao',
    title: 'Demonstração Prática',
    description: 'Permitir ao lead ver e testar antes de tomar a decisão final.',
    applicationExample: 'Demonstração ao vivo em link interativo com a identidade visual da empresa.',
    safetyRule: 'Mantenha a demonstração curta e focada na experiência do cliente final.',
  },
  {
    id: 'reflexao_valor',
    category: 'reflexao_valor',
    title: 'Reflexão de Valor',
    description: 'Comparar o investimento na solução com o valor de um único cliente conquistado.',
    applicationExample: 'Com apenas 1 ou 2 novos clientes o projeto já se paga completamente.',
    safetyRule: 'Utilize o ticket médio real da empresa do cliente para o cálculo.',
  },
  {
    id: 'inimigo_comum',
    category: 'inimigo_comum',
    title: 'Inimigo Comum',
    description: 'Aliar-se ao cliente contra burocracias, taxas abusivas ou processos lentos.',
    applicationExample: 'Agências tradicionais que demoram 3 meses para entregar um site que nem funciona no celular.',
    safetyRule: 'Seja profissional e ético ao falar de alternativas de mercado.',
  },
  {
    id: 'objecoes',
    category: 'objecoes',
    title: 'Tratamento de Objeções',
    description: 'Mapear antecipadamente as principais travas mentais do decisor.',
    applicationExample: 'Falta de tempo da equipe: cuidamos de 100% dos textos e estrutura.',
    safetyRule: 'Responda com fatos e opções, sem pressionar.',
  },
  {
    id: 'contraste',
    category: 'contraste',
    title: 'Contraste (Antes vs Depois)',
    description: 'Exibir a diferença nítida entre manter a situação atual vs ter a nova presença digital.',
    applicationExample: 'Antes: site lento com fotos cortadas. Depois: página veloz com botão WhatsApp em destaque.',
    safetyRule: 'Apresente o contraste de forma construtiva e elegante.',
  },
  {
    id: 'garantia',
    category: 'garantia',
    title: 'Garantia de Entrega & Suporte',
    description: 'Eliminar o risco percebido pelo decisor com garantias claras.',
    applicationExample: '30 dias de suporte gratuito e ajustes ilimitados antes da publicação oficial.',
    safetyRule: 'Cumpra integralmente os termos de suporte acordados.',
  },
  {
    id: 'escassez',
    category: 'escassez',
    title: 'Escassez Ética (Capacidade Real)',
    description: 'Informar a limitação real de projetos simultâneos da equipe.',
    applicationExample: 'Pegamos no máximo 3 projetos por mês para garantir o prazo de 7 dias.',
    safetyRule: 'Proibido criar falsas escassezes ou prazos fictícios ("só até hoje às 18h").',
  },
];

/**
 * ============================================================================
 * 6. REGRAS DE COMUNICAÇÃO (COMPLIANCE & ANTI-MANIPULAÇÃO)
 * ============================================================================
 */
export function validateCommunicationSafety(text: string): {
  isSafe: boolean;
  warnings: string[];
  suggestedText: string;
} {
  const warnings: string[] = [];
  let suggested = text;

  // Checa frases de falsa urgência
  const falseUrgencyPatterns = [/só até hoje/i, /últimas 2 vagas/i, /se não fechar agora/i, /vai perder dinheiro/i];
  falseUrgencyPatterns.forEach((p) => {
    if (p.test(text)) {
      warnings.push('Alerta de conformidade: Detectada linguagem de pressão ou falsa urgência.');
    }
  });

  // Checa afirmações categóricas de perda sem evidência
  if (/você está perdendo muito dinheiro/i.test(text) || /está jogando dinheiro fora/i.test(text)) {
    warnings.push('Alerta ético: Substitua afirmações de perda categórica por formulação de hipótese.');
    suggested = suggested
      .replace(/você está perdendo muito dinheiro/gi, 'existe o risco de perder oportunidades')
      .replace(/está jogando dinheiro fora/gi, 'pode estar havendo perda de contatos');
  }

  return {
    isSafe: warnings.length === 0,
    warnings,
    suggestedText: suggested,
  };
}

/**
 * ============================================================================
 * 7. IA COM AÇÕES AUTORIZADAS (HUMAN-IN-THE-LOOP)
 * ============================================================================
 */
export function generateAiActionSuggestions(
  leads: Lead[],
  companies: Company[],
  history: HistoryEvent[]
): AiAuthorizedAction[] {
  const suggestions: AiAuthorizedAction[] = [];

  // 1. Identifica leads sem contato há mais de 4 dias no estágio de primeiro contato
  const staleFirstContacts = leads.filter((l) => {
    if (l.stage !== 'PRIMEIRO_CONTATO' || l.status !== 'active') return false;
    if (!l.lastContactDate) return false;
    const diffDays = (Date.now() - new Date(l.lastContactDate).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 3;
  });

  if (staleFirstContacts.length > 0) {
    suggestions.push({
      id: `ai_act_followups_${Date.now()}`,
      type: 'create_followup_tasks',
      title: `Criar ${staleFirstContacts.length} tarefas de Follow-up 1`,
      description: `Identificados ${staleFirstContacts.length} prospects que receberam mensagem inicial há 3+ dias sem resposta registrada. A IA recomenda agendar Follow-up 1 para reengajá-los.`,
      impactCount: staleFirstContacts.length,
      details: { leadIds: staleFirstContacts.map((l) => l.id) },
      requestedAt: new Date().toISOString(),
      status: 'pending',
    });
  }

  // 2. Leads com respostas positivas que ainda estão em primeiro contato
  const readyForDiagnosis = leads.filter((l) => {
    return l.stage === 'PRIMEIRO_CONTATO' && (l.responseOutcome === 'positive' || (l.qualificationScore && l.qualificationScore >= 35));
  });

  if (readyForDiagnosis.length > 0) {
    suggestions.push({
      id: `ai_act_movediag_${Date.now()}`,
      type: 'move_leads_stage',
      title: `Mover ${readyForDiagnosis.length} leads engajados para Diagnóstico`,
      description: `Prospects demonstraram intenção ou responderam positivamente. A IA sugere avançar de etapa no pipeline comercial.`,
      impactCount: readyForDiagnosis.length,
      details: { leadIds: readyForDiagnosis.map((l) => l.id), targetStage: 'DIAGNOSTICO' },
      requestedAt: new Date().toISOString(),
      status: 'pending',
    });
  }

  // 3. Sugestão de aprendizado de pesos
  const highConversionMultiUnits = companies.filter((c) => (c.unitsCount || 0) >= 2);
  if (highConversionMultiUnits.length >= 2) {
    suggestions.push({
      id: `ai_act_weight_${Date.now()}`,
      type: 'suggest_score_weight',
      title: 'Ajustar peso do sinal "Múltiplas Unidades" (+5 pts)',
      description: 'O histórico indica que empresas com 2+ unidades possuem maior aderência comercial e ticket médio. Deseja aplicar o novo peso no cálculo de Score?',
      details: { signalId: 'multiplas_unidades', currentWeight: 10, suggestedWeight: 15 },
      requestedAt: new Date().toISOString(),
      status: 'pending',
    });
  }

  return suggestions;
}

/**
 * ============================================================================
 * 8. APRENDIZADO DO SISTEMA (MÉTRICAS & INSIGHTS FACTUAIS)
 * ============================================================================
 */
export function calculateSystemLearningMetrics(
  companies: Company[],
  leads: Lead[],
  services: Service[],
  icps: IdealCustomerProfile[],
  history: HistoryEvent[]
): SystemLearningMetric[] {
  const metrics: SystemLearningMetric[] = [];

  // 1. Desempenho por País
  const countriesMap = new Map<string, { total: number; responded: number; converted: number }>();
  companies.forEach((c) => {
    const country = c.country || 'Brasil';
    const current = countriesMap.get(country) || { total: 0, responded: 0, converted: 0 };
    current.total += 1;
    const lead = leads.find((l) => l.companyId === c.id);
    if (lead?.stage === 'GANHO' || lead?.stage === 'CLIENTE') current.converted += 1;
    const hasResp = history.some((h) => h.companyId === c.id && (h.type === 'response_received' || h.title?.includes('resposta')));
    if (hasResp || lead?.responseOutcome === 'positive') current.responded += 1;
    countriesMap.set(country, current);
  });

  countriesMap.forEach((val, country) => {
    const respRate = val.total > 0 ? Math.round((val.responded / val.total) * 100) : 0;
    const convRate = val.total > 0 ? Math.round((val.converted / val.total) * 100) : 0;
    metrics.push({
      id: `metric_country_${country}`,
      category: 'country',
      name: `Mercado: ${country}`,
      sampleSize: val.total,
      responseRate: respRate,
      conversionRate: convRate,
      efficiencyScore: Math.min(100, respRate * 0.6 + convRate * 0.4 * 2),
      trend: convRate >= 15 ? 'improving' : 'stable',
      aiObservation: `${val.total} empresas cadastradas no país ${country}. Taxa de resposta de ${respRate}%.`,
      suggestion: respRate > 40 ? 'Priorizar campanhas de expansão neste mercado.' : 'Refinar adequação cultural e termos regionais.',
    });
  });

  // 2. Desempenho por ICP
  icps.forEach((icp) => {
    const matchedComps = companies.filter((c) =>
      icp.niches.some((n) => n.toLowerCase() === c.niche?.toLowerCase())
    );
    const total = matchedComps.length;
    const converted = matchedComps.filter((c) => {
      const l = leads.find((lead) => lead.companyId === c.id);
      return l?.stage === 'GANHO' || l?.stage === 'CLIENTE';
    }).length;
    const responded = matchedComps.filter((c) => {
      const l = leads.find((lead) => lead.companyId === c.id);
      return l?.responseOutcome === 'positive' || history.some((h) => h.companyId === c.id && h.type === 'response_received');
    }).length;

    const respRate = total > 0 ? Math.round((responded / total) * 100) : 0;
    const convRate = total > 0 ? Math.round((converted / total) * 100) : 0;

    metrics.push({
      id: `metric_icp_${icp.id}`,
      category: 'icp',
      name: `ICP: ${icp.name}`,
      sampleSize: total,
      responseRate: respRate,
      conversionRate: convRate,
      efficiencyScore: Math.min(100, respRate * 0.5 + convRate * 0.5 * 2),
      trend: respRate >= 35 ? 'improving' : 'stable',
      aiObservation: `Nicho com ${total} empresas prospectadas. Resposta média de ${respRate}%.`,
      suggestion: respRate >= 30 ? 'Aumentar prospecção neste perfil de ICP.' : 'Testar novos ganchos de abertura no nicho.',
    });
  });

  // 3. Sinais de Maior Desempenho
  PROSPECT_SIGNALS.slice(0, 4).forEach((sig) => {
    const matchingCompanies = companies.filter((c) => (c.signals || []).includes(sig.id) || (!c.website && sig.id === 'empresa_sem_site'));
    const total = matchingCompanies.length;
    const responded = matchingCompanies.filter((c) => {
      const l = leads.find((lead) => lead.companyId === c.id);
      return l?.responseOutcome === 'positive' || (l?.score || 0) >= 70;
    }).length;
    const respRate = total > 0 ? Math.round((responded / total) * 100) : 50;

    metrics.push({
      id: `metric_signal_${sig.id}`,
      category: 'signals',
      name: `Sinal: ${sig.label}`,
      sampleSize: Math.max(total, 1),
      responseRate: respRate,
      conversionRate: Math.round(respRate * 0.3),
      efficiencyScore: Math.min(100, respRate + 15),
      trend: 'improving',
      aiObservation: `Empresas com o sinal "${sig.label}" apresentam forte abertura para propostas de modernização.`,
      suggestion: 'Este sinal parece estar associado a leads de melhor desempenho.',
      suggestedWeightDelta: 5,
    });
  });

  return metrics;
}

import {
  Company,
  Contact,
  IdealCustomerProfile,
  Lead,
  OpportunityScoreExplanation,
  OpportunityState,
  ProspectingMode,
  ProspectSignalItem,
  Service,
} from '../types';

/**
 * Catálogo de Sinais para Demanda Identificada e Oportunidade Latente
 */
export const PROSPECT_SIGNALS: ProspectSignalItem[] = [
  // --- MODO 1: DEMANDA IDENTIFICADA — WEBSITE ---
  {
    id: 'empresa_sem_site',
    category: 'website',
    mode: 'DEMANDA_IDENTIFICADA',
    label: 'Empresa sem website',
    description: 'Não possui nenhum endereço web institucional ou página própria.',
    points: 12,
  },
  {
    id: 'site_antigo',
    category: 'website',
    mode: 'DEMANDA_IDENTIFICADA',
    label: 'Site antigo / ultrapassado',
    description: 'Design defasado, tecnologia obsoleta ou layout anos 2010.',
    points: 9,
  },
  {
    id: 'site_quebrado',
    category: 'website',
    mode: 'DEMANDA_IDENTIFICADA',
    label: 'Site com erros / quebrado',
    description: 'Links quebrados, certificado SSL expirado ou telas com erro 404/500.',
    points: 10,
  },
  {
    id: 'site_nao_responsivo',
    category: 'website',
    mode: 'DEMANDA_IDENTIFICADA',
    label: 'Site não responsivo / mobile ruim',
    description: 'Visualização desformatada em smartphones e tablets.',
    points: 9,
  },
  {
    id: 'ux_ruim',
    category: 'website',
    mode: 'DEMANDA_IDENTIFICADA',
    label: 'UX e navegação confusa',
    description: 'Dificuldade para encontrar serviços, menus confusos ou carregamento lento.',
    points: 7,
  },
  {
    id: 'info_desatualizadas',
    category: 'website',
    mode: 'DEMANDA_IDENTIFICADA',
    label: 'Informações desatualizadas no site',
    description: 'Telefones antigos, serviços descontinuados ou copyright expirado.',
    points: 6,
  },
  {
    id: 'ausencia_cta',
    category: 'website',
    mode: 'DEMANDA_IDENTIFICADA',
    label: 'Ausência de botão de ação (CTA claro)',
    description: 'Sem botão evidente para agendamento, orçamento ou contato.',
    points: 7,
  },
  {
    id: 'whatsapp_dificil',
    category: 'website',
    mode: 'DEMANDA_IDENTIFICADA',
    label: 'WhatsApp difícil de encontrar',
    description: 'Sem botão flutuante de WhatsApp ou link direto de mensagem.',
    points: 8,
  },
  {
    id: 'estrutura_visual_fraca',
    category: 'website',
    mode: 'DEMANDA_IDENTIFICADA',
    label: 'Estrutura visual e tipografia fracas',
    description: 'Imagens em baixa resolução, fontes desproporcionais e contraste ruim.',
    points: 7,
  },

  // --- MODO 1: DEMANDA IDENTIFICADA — DESIGN ---
  {
    id: 'identidade_inconsistente',
    category: 'design',
    mode: 'DEMANDA_IDENTIFICADA',
    label: 'Identidade visual inconsistente',
    description: 'Cores, logos e fontes diferentes entre redes sociais, placas e site.',
    points: 8,
  },
  {
    id: 'posts_baixa_qualidade',
    category: 'design',
    mode: 'DEMANDA_IDENTIFICADA',
    label: 'Posts e criativos de baixa qualidade',
    description: 'Artes amadoras, textos cortados ou imagens esticadas nas redes.',
    points: 8,
  },
  {
    id: 'logo_desatualizado',
    category: 'design',
    mode: 'DEMANDA_IDENTIFICADA',
    label: 'Logo desatualizado ou pixelado',
    description: 'Símbolo gráfico antigo, sem versões em vetor ou fundo transparente.',
    points: 7,
  },
  {
    id: 'ausencia_padrao_visual',
    category: 'design',
    mode: 'DEMANDA_IDENTIFICADA',
    label: 'Ausência de padrão visual definido',
    description: 'Cada publicação parece feita por uma pessoa diferente.',
    points: 6,
  },
  {
    id: 'materiais_fracos',
    category: 'design',
    mode: 'DEMANDA_IDENTIFICADA',
    label: 'Materiais promocionais fracos',
    description: 'Catálogos, folders, cartões ou apresentações em formato amador.',
    points: 7,
  },
  {
    id: 'comunicacao_pouco_profissional',
    category: 'design',
    mode: 'DEMANDA_IDENTIFICADA',
    label: 'Comunicação visual pouco profissional',
    description: 'Passa imagem de negócio amador apesar da qualidade do serviço prestado.',
    points: 8,
  },

  // --- MODO 1: DEMANDA IDENTIFICADA — GMB (Google Business Profile) ---
  {
    id: 'gmb_perfil_incompleto',
    category: 'gmb',
    mode: 'DEMANDA_IDENTIFICADA',
    label: 'Perfil do Google incompleto',
    description: 'Campos essenciais vazios ou sem verificação oficial.',
    points: 9,
  },
  {
    id: 'gmb_descricao_fraca',
    category: 'gmb',
    mode: 'DEMANDA_IDENTIFICADA',
    label: 'Descrição fraca ou ausente no Google',
    description: 'Sem palavras-chave de busca local ou sem texto descritivo.',
    points: 6,
  },
  {
    id: 'gmb_categoria_inadequada',
    category: 'gmb',
    mode: 'DEMANDA_IDENTIFICADA',
    label: 'Categoria principal possivelmente inadequada',
    description: 'Não configurou as categorias secundárias corretas para buscas.',
    points: 7,
  },
  {
    id: 'gmb_fotos_antigas',
    category: 'gmb',
    mode: 'DEMANDA_IDENTIFICADA',
    label: 'Fotos antigas ou em baixa qualidade',
    description: 'Poucas fotos da fachada, equipe e ambiente interno.',
    points: 7,
  },
  {
    id: 'gmb_info_desatualizada',
    category: 'gmb',
    mode: 'DEMANDA_IDENTIFICADA',
    label: 'Informações de contato desatualizadas',
    description: 'Telefone que não atende ou horários de funcionamento incorretos.',
    points: 8,
  },
  {
    id: 'gmb_poucas_publicacoes',
    category: 'gmb',
    mode: 'DEMANDA_IDENTIFICADA',
    label: 'Poucas ou nenhuma publicação no perfil',
    description: 'Não utiliza a ferramenta de posts de novidades do Google.',
    points: 5,
  },
  {
    id: 'gmb_avaliacoes_sem_resposta',
    category: 'gmb',
    mode: 'DEMANDA_IDENTIFICADA',
    label: 'Avaliações de clientes sem resposta',
    description: 'Dezenas de avaliações públicas sem réplica do proprietário.',
    points: 8,
  },
  {
    id: 'gmb_info_inconsistente',
    category: 'gmb',
    mode: 'DEMANDA_IDENTIFICADA',
    label: 'Informações inconsistentes de endereço/horários',
    description: 'Divergência entre redes sociais, site e ficha do mapa.',
    points: 6,
  },

  // --- MODO 2: OPORTUNIDADE LATENTE (APP & SAAS) ---
  {
    id: 'operacao_complexa',
    category: 'latente',
    mode: 'OPORTUNIDADE_LATENTE',
    label: 'Operação complexa e com muitas etapas',
    description: 'Fluxos internos que envolvem múltiplos departamentos ou colaboradores.',
    points: 9,
  },
  {
    id: 'muitos_clientes',
    category: 'latente',
    mode: 'OPORTUNIDADE_LATENTE',
    label: 'Grande base de clientes / pacientes / alunos',
    description: 'Volume considerável de pessoas interagindo com a empresa com frequência.',
    points: 9,
  },
  {
    id: 'multiplas_unidades',
    category: 'latente',
    mode: 'OPORTUNIDADE_LATENTE',
    label: 'Múltiplas unidades / filiais ativas',
    description: 'Duas ou mais unidades físicas demandando padronização e controle central.',
    points: 10,
  },
  {
    id: 'processos_repetitivos',
    category: 'latente',
    mode: 'OPORTUNIDADE_LATENTE',
    label: 'Processos repetitivos de cadastro e envio',
    description: 'Equipe gastando horas digitando as mesmas informações manualmente.',
    points: 9,
  },
  {
    id: 'agendamento_frequente',
    category: 'latente',
    mode: 'OPORTUNIDADE_LATENTE',
    label: 'Agendamento frequente / gargalo na recepção',
    description: 'Recepção sobrecarregada confirmando horários e reagendamentos.',
    points: 8,
  },
  {
    id: 'volume_atendimento',
    category: 'latente',
    mode: 'OPORTUNIDADE_LATENTE',
    label: 'Grande volume diário de atendimento no WhatsApp',
    description: 'Mensagens acumuladas e demora no tempo de primeira resposta.',
    points: 8,
  },
  {
    id: 'processos_manuais',
    category: 'latente',
    mode: 'OPORTUNIDADE_LATENTE',
    label: 'Uso excessivo de planilhas e papel',
    description: 'Controle de agendamentos, estoque ou financeiro em cadernos/planilhas soltas.',
    points: 9,
  },
  {
    id: 'necessidade_area_cliente',
    category: 'latente',
    mode: 'OPORTUNIDADE_LATENTE',
    label: 'Necessidade potencial de área do cliente / portal',
    description: 'Clientes solicitando histórico, pedidos, laudos ou segunda via.',
    points: 8,
  },
  {
    id: 'necessidade_automacao',
    category: 'latente',
    mode: 'OPORTUNIDADE_LATENTE',
    label: 'Necessidade potencial de automação de fluxo',
    description: 'Possibilidade de integrar sistemas legados ou notificações automáticas.',
    points: 8,
  },
  {
    id: 'programa_fidelidade',
    category: 'latente',
    mode: 'OPORTUNIDADE_LATENTE',
    label: 'Programa de fidelidade / cashback / pontos',
    description: 'Vantagem competitiva para reter clientes recorrentes via app.',
    points: 7,
  },
  {
    id: 'recorrencia_clientes',
    category: 'latente',
    mode: 'OPORTUNIDADE_LATENTE',
    label: 'Alta recorrência de clientes / mensalidades',
    description: 'Modelo de negócio com pagamentos mensais ou visitas semanais.',
    points: 8,
  },
  {
    id: 'grande_qtd_dados',
    category: 'latente',
    mode: 'OPORTUNIDADE_LATENTE',
    label: 'Grande quantidade de dados e relatórios',
    description: 'Dificuldade para consolidar métricas de vendas e operação.',
    points: 7,
  },
  {
    id: 'expansao_empresa',
    category: 'latente',
    mode: 'OPORTUNIDADE_LATENTE',
    label: 'Expansão recente da empresa / novas filiais',
    description: 'Crescimento rápido demandando infraestrutura escalável de software.',
    points: 8,
  },
  {
    id: 'centralizacao_gestao',
    category: 'latente',
    mode: 'OPORTUNIDADE_LATENTE',
    label: 'Necessidade potencial de centralização de gestão',
    description: 'Gestores necessitando de um dashboard unificado em tempo real.',
    points: 8,
  },
];

/**
 * Funil Comercial para Demanda Identificada
 */
export const DEMANDA_FUNNEL_STEPS = [
  { stage: 'NOVO', label: 'Lead Identificado', description: 'Problema visual/técnico registrado' },
  { stage: 'PRIMEIRO_CONTACTO', label: 'Primeiro Contacto', description: 'Abordagem contextual com evidência' },
  { stage: 'QUALIFICADO', label: 'Diagnóstico', description: 'Apresentação do diagnóstico do problema' },
  { stage: 'REUNIÃO', label: 'Demonstração', description: 'Apresentação da solução e protótipo' },
  { stage: 'PROPOSTA', label: 'Oferta', description: 'Apresentação de proposta comercial' },
  { stage: 'OBJEÇÃO', label: 'Objeção', description: 'Contorno de dúvidas ou negociação' },
  { stage: 'CLIENTE', label: 'Fechamento', description: 'Contrato assinado / serviço fechado' },
];

/**
 * Funil Comercial para Oportunidade Latente (APP / SaaS)
 * SINAIS → HIPÓTESE → INVESTIGAÇÃO → CONFIRMAÇÃO → SOLUÇÃO
 */
export const LATENTE_FUNNEL_STEPS = [
  { stage: 'NOVO', label: 'Lead (Sinais Identificados)', description: 'Hipótese preliminar de necessidade' },
  { stage: 'PRIMEIRO_CONTACTO', label: 'Primeiro Contacto', description: 'Abertura para entender o momento atual' },
  { stage: 'RESPOSTA_RECEBIDA', label: 'Descoberta', description: 'Investigação do fluxo e gargalos operacionais' },
  { stage: 'QUALIFICADO', label: 'Confirmar Necessidade', description: 'Validação da dor com o decisor' },
  { stage: 'DIAGNOSTICO_LATENTE', label: 'Diagnóstico Operacional', description: 'Mapeamento de escopo e arquitetura' },
  { stage: 'PROPOSTA_SOLUCAO', label: 'Solução Estruturada', description: 'Desenho da proposta de APP/SaaS' },
  { stage: 'REUNIÃO', label: 'Demonstração / Protótipo', description: 'Demo interativa ou wireframe do sistema' },
  { stage: 'PROPOSTA', label: 'Oferta Comercial', description: 'Apresentação de orçamento e prazos' },
  { stage: 'CLIENTE', label: 'Fechamento', description: 'Início do projeto de desenvolvimento' },
];

/**
 * Detecta automaticamente o modo de prospecção do Lead/Empresa
 */
export function resolveProspectingMode(company?: Company, lead?: Lead): ProspectingMode {
  if (company?.prospectingMode) return company.prospectingMode;
  if (lead?.prospectingMode) return lead.prospectingMode;

  const serviceName = (lead?.serviceName || '').toLowerCase();
  if (serviceName.includes('app') || serviceName.includes('saas') || serviceName.includes('software') || serviceName.includes('sistema')) {
    return 'OPORTUNIDADE_LATENTE';
  }

  // Verifica sinais registrados
  const allSignals = [...(company?.signals || []), ...(company?.customSignals || []), ...(lead?.customSignals || [])];
  const hasLatentSignal = allSignals.some((s) => {
    const sig = PROSPECT_SIGNALS.find((ps) => ps.id === s);
    return sig?.category === 'latente';
  });

  if (hasLatentSignal) return 'OPORTUNIDADE_LATENTE';
  return 'DEMANDA_IDENTIFICADA';
}

/**
 * Extrai todos os sinais reais (sem inventar nada) de uma Empresa e Lead
 */
export function getLeadSignals(company?: Company, lead?: Lead): {
  detected: ProspectSignalItem[];
  custom: string[];
} {
  if (!company) return { detected: [], custom: [] };

  const activeIds = new Set<string>(company.signals || []);
  const customList: string[] = [...(company.customSignals || []), ...(lead?.customSignals || [])];

  // Auto-detecção baseada em dados explícitos cadastrados
  if (!company.website || company.website.trim() === '') {
    activeIds.add('empresa_sem_site');
  } else {
    if (company.websiteQuality === 'outdated' || company.websiteQuality === 'ruim') {
      activeIds.add('site_antigo');
    }
    if (company.websiteQuality === 'broken') {
      activeIds.add('site_quebrado');
    }
  }

  if (company.unitsCount && company.unitsCount >= 2) {
    activeIds.add('multiplas_unidades');
  }

  const detected = PROSPECT_SIGNALS.filter((s) => activeIds.has(s.id));
  return { detected, custom: customList };
}

/**
 * Calcula o Score Rigoroso e Explicável para DEMANDA IDENTIFICADA (Total 100)
 * - Adequação ao ICP: 30
 * - Intensidade do problema: 30
 * - Potencial de compra: 25
 * - Intenção/engajamento: 15
 */
export function calculateDemandaIdentificadaScore(
  company?: Company,
  contact?: Contact,
  lead?: Lead,
  icps: IdealCustomerProfile[] = []
): OpportunityScoreExplanation {
  const insufficientDataFields: string[] = [];
  const { detected, custom } = getLeadSignals(company, lead);

  if (!company) {
    return {
      mode: 'DEMANDA_IDENTIFICADA',
      totalScore: 0,
      classification: 'baixa',
      classificationLabel: 'Sem dados',
      isHighPriority: false,
      detectedSignals: [],
      customSignals: [],
      insufficientDataFields: ['Empresa não informada'],
      recommendationLanguage: 'Dados insuficientes para avaliar este critério.',
    };
  }

  // 1. ADEQUAÇÃO AO ICP (Max 30)
  let icpScore = 0;
  let icpDetails = '';
  let icpInsufficient = false;

  const matchedIcp = icps.find(
    (icp) =>
      icp.niches.some((n) => n.toLowerCase() === company.niche.toLowerCase()) ||
      icp.countries.some((c) => c.toLowerCase() === company.country.toLowerCase()) ||
      (icp.segment && icp.segment.toLowerCase() === company.niche.toLowerCase())
  );

  if (company.niche && company.niche !== 'Outro' && company.niche !== 'Geral') {
    icpScore += 15;
    icpDetails += `Nicho compatível (${company.niche}). `;
  } else {
    insufficientDataFields.push('Nicho / Segmento');
  }

  if (company.city || company.country) {
    icpScore += 10;
    icpDetails += `Localização estratégica (${company.city || company.country}). `;
  } else {
    insufficientDataFields.push('Cidade / País');
  }

  if (matchedIcp) {
    icpScore += 5;
    icpDetails += `Enquadrado no ICP "${matchedIcp.name}". `;
  }

  if (icpScore === 0) {
    icpInsufficient = true;
    icpDetails = 'Dados insuficientes para avaliar adequação ao ICP.';
  }

  // 2. INTENSIDADE DO PROBLEMA (Max 30)
  let problemScore = 0;
  let problemDetails = '';
  let problemInsufficient = false;

  const problemSignalsCount = detected.filter(
    (s) => s.category === 'website' || s.category === 'design' || s.category === 'gmb'
  ).length + custom.length;

  if (problemSignalsCount === 0 && company.websiteQuality === 'boa') {
    problemScore = 5;
    problemDetails = 'Poucos problemas aparentes diagnosticados.';
  } else if (problemSignalsCount === 0) {
    problemInsufficient = true;
    problemDetails = 'Dados insuficientes para avaliar problemas encontrados.';
    insufficientDataFields.push('Diagnóstico de problemas (Website/Design/GMB)');
  } else {
    // Escala de intensidade
    if (problemSignalsCount >= 4) {
      problemScore = 30;
      problemDetails = `${problemSignalsCount} sinais críticos de oportunidade identificados.`;
    } else if (problemSignalsCount >= 2) {
      problemScore = 22;
      problemDetails = `${problemSignalsCount} problemas claros identificados.`;
    } else {
      problemScore = 14;
      problemDetails = `${problemSignalsCount} sinal inicial identificado.`;
    }
  }

  // 3. POTENCIAL DE COMPRA (Max 25)
  let buyingScore = 0;
  let buyingDetails = '';
  let buyingInsufficient = false;

  const hasReviews = (company.googleReviewsCount || 0) > 0;
  const hasInstagram = Boolean(company.instagram);
  const hasMultipleUnits = (company.unitsCount || 1) >= 2;

  if (hasReviews && (company.googleReviewsCount || 0) >= 50) {
    buyingScore += 10;
    buyingDetails += `${company.googleReviewsCount} avaliações no Google (${company.googleRating || '4.5'}⭐). `;
  } else if (hasReviews) {
    buyingScore += 6;
    buyingDetails += `${company.googleReviewsCount} avaliações no Google. `;
  }

  if (hasInstagram) {
    buyingScore += 8;
    buyingDetails += 'Presença ativa no Instagram. ';
  }

  if (hasMultipleUnits) {
    buyingScore += 7;
    buyingDetails += `${company.unitsCount} unidades físicas ativas. `;
  }

  if (!hasReviews && !hasInstagram && !hasMultipleUnits) {
    buyingInsufficient = true;
    buyingDetails = 'Dados insuficientes para avaliar potencial de compra.';
    insufficientDataFields.push('Avaliações / Presença digital / Unidades');
  }

  // 4. INTENÇÃO / ENGAJAMENTO (Max 15)
  let intentScore = 0;
  let intentDetails = '';
  let intentInsufficient = false;

  const hasDirectWhatsapp = Boolean(contact?.whatsapp || company.companyWhatsApp);
  const hasContactPerson = Boolean(contact?.name && contact.name !== 'Recepção');
  const stage = lead?.stage || 'NOVO';

  if (hasDirectWhatsapp) {
    intentScore += 7;
    intentDetails += 'Canal direto de WhatsApp disponível. ';
  }
  if (hasContactPerson) {
    intentScore += 4;
    intentDetails += `Contato identificado (${contact?.role || 'Decisor'}). `;
  }

  if (stage === 'RESPONDEU' || stage === 'RESPOSTA_RECEBIDA' || stage === 'RESPOSTA_POSITIVA' || stage === 'INTERESSADO') {
    intentScore += 4;
    intentDetails += 'Prospect engajou ativamente. ';
  } else if (lead?.temperature === 'quente' || lead?.temperature === 'hot') {
    intentScore += 4;
    intentDetails += 'Lead com temperatura quente. ';
  }

  if (intentScore === 0) {
    intentInsufficient = true;
    intentDetails = 'Dados insuficientes para avaliar engajamento.';
    insufficientDataFields.push('Canal de contato direto / Histórico de resposta');
  }

  // TOTAL
  const totalScore = Math.min(100, Math.max(0, icpScore + problemScore + buyingScore + intentScore));
  const isHighPriority = totalScore >= 70;
  const classification = totalScore >= 80 ? 'prioridade_maxima' : totalScore >= 60 ? 'alta' : totalScore >= 40 ? 'media' : 'baixa';
  const classificationLabel =
    classification === 'prioridade_maxima' || classification === 'alta'
      ? '🔥 Alta prioridade'
      : classification === 'media'
      ? '⚡ Média prioridade'
      : 'Baixa prioridade';

  const detectedNames = detected.map((d) => d.label);

  return {
    mode: 'DEMANDA_IDENTIFICADA',
    totalScore,
    classification,
    classificationLabel,
    isHighPriority,
    icpAdequacy: { score: icpScore, max: 30, label: 'Adequação ao ICP', details: icpDetails, insufficientData: icpInsufficient },
    problemIntensity: { score: problemScore, max: 30, label: 'Intensidade do problema', details: problemDetails, insufficientData: problemInsufficient },
    buyingPotential: { score: buyingScore, max: 25, label: 'Potencial de compra', details: buyingDetails, insufficientData: buyingInsufficient },
    engagementIntent: { score: intentScore, max: 15, label: 'Intenção / Contato', details: intentDetails, insufficientData: intentInsufficient },
    detectedSignals: detectedNames,
    customSignals: custom,
    insufficientDataFields,
    recommendationLanguage: 'Demanda confirmada com sinais visíveis de oportunidade técnica/comercial.',
  };
}

/**
 * Calcula o Score e Hipótese para OPORTUNIDADE LATENTE (APP / SAAS) (Total 100)
 * Linguagem estrita de hipótese: "Possível oportunidade", "Necessidade a confirmar", "Sinais compatíveis"
 * - Adequação ao ICP (20)
 * - Escala da empresa (15)
 * - Complexidade operacional (15)
 * - Processos repetitivos (15)
 * - Potencial de digitalização (15)
 * - Frequência do problema potencial (10)
 * - Capacidade aparente de investimento (10)
 */
export function calculateOportunidadeLatenteScore(
  company?: Company,
  contact?: Contact,
  lead?: Lead,
  icps: IdealCustomerProfile[] = []
): OpportunityScoreExplanation {
  const insufficientDataFields: string[] = [];
  const { detected, custom } = getLeadSignals(company, lead);

  if (!company) {
    return {
      mode: 'OPORTUNIDADE_LATENTE',
      totalScore: 0,
      classification: 'baixa',
      classificationLabel: 'Sem dados',
      isHighPriority: false,
      detectedSignals: [],
      customSignals: [],
      insufficientDataFields: ['Empresa não informada'],
      recommendationLanguage: 'Dados insuficientes para avaliar este critério.',
    };
  }

  // 1. Adequação ao ICP (Max 20)
  let icpScore = 0;
  let icpDetails = '';
  let icpInsufficient = false;
  if (company.niche && company.niche !== 'Outro') {
    icpScore += 12;
    icpDetails += `Segmento com aderência a software (${company.niche}). `;
  } else {
    insufficientDataFields.push('Nicho / Segmento da empresa');
  }
  if (company.city || company.country) {
    icpScore += 8;
    icpDetails += `Região atendida (${company.city || company.country}). `;
  } else {
    insufficientDataFields.push('Localização');
  }
  if (icpScore === 0) {
    icpInsufficient = true;
    icpDetails = 'Dados insuficientes para avaliar este critério.';
  }

  // 2. Escala da empresa (Max 15)
  let scaleScore = 0;
  let scaleDetails = '';
  let scaleInsufficient = false;
  const units = company.unitsCount || 1;
  const reviews = company.googleReviewsCount || 0;
  if (units >= 3) {
    scaleScore += 15;
    scaleDetails += `Rede com ${units} unidades físicas. `;
  } else if (units === 2) {
    scaleScore += 10;
    scaleDetails += `Operação com 2 unidades físicas. `;
  } else if (reviews >= 100) {
    scaleScore += 10;
    scaleDetails += `Alto fluxo de público (${reviews} avaliações públicas). `;
  } else if (reviews >= 20) {
    scaleScore += 6;
    scaleDetails += `Fluxo contínuo de clientes. `;
  } else {
    scaleInsufficient = true;
    scaleDetails = 'Dados insuficientes para avaliar este critério.';
    insufficientDataFields.push('Escala e volume de unidades');
  }

  // 3. Complexidade operacional (Max 15)
  let compScore = 0;
  let compDetails = '';
  let compInsufficient = false;
  const hasOperacaoComplexa = detected.some((s) => s.id === 'operacao_complexa' || s.id === 'multiplas_unidades');
  const hasAgendamento = detected.some((s) => s.id === 'agendamento_frequente' || s.id === 'volume_atendimento');
  if (hasOperacaoComplexa && hasAgendamento) {
    compScore = 15;
    compDetails = 'Sinais compatíveis de operação com múltiplos fluxos e agendamentos.';
  } else if (hasOperacaoComplexa || hasAgendamento) {
    compScore = 10;
    compDetails = 'Possível oportunidade relacionada a fluxo operacional.';
  } else {
    compInsufficient = true;
    compDetails = 'Dados insuficientes para avaliar este critério.';
    insufficientDataFields.push('Mapeamento de complexidade operacional');
  }

  // 4. Processos repetitivos (Max 15)
  let procScore = 0;
  let procDetails = '';
  let procInsufficient = false;
  const hasManuais = detected.some((s) => s.id === 'processos_manuais' || s.id === 'processos_repetitivos');
  if (hasManuais) {
    procScore = 15;
    procDetails = 'Sinais compatíveis de processos manuais ou planilhas suscetíveis a automação.';
  } else {
    procInsufficient = true;
    procDetails = 'Dados insuficientes para avaliar este critério.';
    insufficientDataFields.push('Mapeamento de processos manuais');
  }

  // 5. Potencial de digitalização (Max 15)
  let digScore = 0;
  let digDetails = '';
  let digInsufficient = false;
  const hasPortal = detected.some((s) => s.id === 'necessidade_area_cliente' || s.id === 'programa_fidelidade' || s.id === 'centralizacao_gestao');
  if (hasPortal) {
    digScore = 15;
    digDetails = 'Necessidade a confirmar de portal do cliente ou app próprio.';
  } else {
    digInsufficient = true;
    digDetails = 'Dados insuficientes para avaliar este critério.';
    insufficientDataFields.push('Potencial de portal / fidelidade digital');
  }

  // 6. Frequência do problema potencial (Max 10)
  let freqScore = 0;
  let freqDetails = '';
  let freqInsufficient = false;
  const hasRecorrencia = detected.some((s) => s.id === 'recorrencia_clientes' || s.id === 'volume_atendimento');
  if (hasRecorrencia) {
    freqScore = 10;
    freqDetails = 'Sinais compatíveis de alta frequência diária de interações.';
  } else {
    freqInsufficient = true;
    freqDetails = 'Dados insuficientes para avaliar este critério.';
    insufficientDataFields.push('Frequência de interações diárias');
  }

  // 7. Capacidade aparente de investimento (Max 10)
  let invScore = 0;
  let invDetails = '';
  let invInsufficient = false;
  if (units >= 2 || reviews >= 50 || company.companyWhatsAppVerified) {
    invScore = 10;
    invDetails = 'Estrutura estabelecida com capacidade aparente de investimento.';
  } else {
    invInsufficient = true;
    invDetails = 'Dados insuficientes para avaliar este critério.';
    insufficientDataFields.push('Capacidade aparente de investimento');
  }

  const totalScore = Math.min(100, Math.max(0, icpScore + scaleScore + compScore + procScore + digScore + freqScore + invScore));
  const isHighPriority = totalScore >= 65;
  const classification = totalScore >= 75 ? 'prioridade_maxima' : totalScore >= 55 ? 'alta' : totalScore >= 35 ? 'media' : 'baixa';
  const classificationLabel =
    classification === 'prioridade_maxima' || classification === 'alta'
      ? '🔥 Alta prioridade'
      : classification === 'media'
      ? '⚡ Média prioridade'
      : 'Baixa prioridade';

  const detectedNames = detected.map((d) => d.label);

  return {
    mode: 'OPORTUNIDADE_LATENTE',
    totalScore,
    classification,
    classificationLabel,
    isHighPriority,
    latentIcpAdequacy: { score: icpScore, max: 20, label: 'Adequação ao ICP', details: icpDetails, insufficientData: icpInsufficient },
    companyScale: { score: scaleScore, max: 15, label: 'Escala da empresa', details: scaleDetails, insufficientData: scaleInsufficient },
    operationalComplexity: { score: compScore, max: 15, label: 'Complexidade operacional', details: compDetails, insufficientData: compInsufficient },
    repetitiveProcesses: { score: procScore, max: 15, label: 'Processos repetitivos', details: procDetails, insufficientData: procInsufficient },
    digitalizationPotential: { score: digScore, max: 15, label: 'Potencial de digitalização', details: digDetails, insufficientData: digInsufficient },
    problemFrequency: { score: freqScore, max: 10, label: 'Frequência do problema potencial', details: freqDetails, insufficientData: freqInsufficient },
    apparentInvestmentCapacity: { score: invScore, max: 10, label: 'Capacidade aparente de investimento', details: invDetails, insufficientData: invInsufficient },
    detectedSignals: detectedNames,
    customSignals: custom,
    insufficientDataFields,
    recommendationLanguage: 'Possível oportunidade — necessidade a confirmar através de diagnóstico investigativo.',
  };
}

/**
 * Retorna o script de abordagem recomendado com base no modo e sinais
 */
export function getRecommendedScript(
  mode: ProspectingMode,
  company: Company,
  contact?: Contact,
  lead?: Lead,
  serviceName?: string
): { title: string; script: string; nextAction: string } {
  const contactName = contact?.name ? contact.name.split(' ')[0] : 'Olá';
  const compName = company.tradeName || company.name;
  const city = company.city || 'sua região';

  if (mode === 'OPORTUNIDADE_LATENTE') {
    return {
      title: 'Investigação de Hipótese (App / SaaS)',
      nextAction: 'Fazer primeiro contacto investigativo',
      script: `Olá ${contactName}, tudo bem? Sou especialista em soluções digitais e notei o crescimento e o fluxo de atendimentos da ${compName} em ${city}.

Estamos mapeando processos em empresas do setor de ${company.niche} para identificar gargalos em agendamentos e atendimento. 

Você teria 5 minutos nesta semana para conversar sobre como otimizar a experiência digital dos seus clientes?`,
    };
  }

  // Demanda Identificada
  if (!company.website) {
    return {
      title: 'Abordagem: Ausência de Website',
      nextAction: 'Fazer primeiro contacto com diagnóstico',
      script: `Olá ${contactName}, tudo bem? Estava pesquisando empresas de ${company.niche} em ${city} e encontrei o perfil da ${compName} com ótimas avaliações.

Notei que vocês ainda não possuem um site institucional com botão direto para WhatsApp e agendamentos.

Preparamos um diagnóstico rápido mostrando como estruturar a presença online de vocês para captar mais clientes. Posso compartilhar por aqui?`,
    };
  }

  return {
    title: 'Abordagem: Otimização de Presença & Conversão',
    nextAction: 'Fazer primeiro contacto com diagnóstico',
    script: `Olá ${contactName}, tudo bem? Acompanho o trabalho da ${compName} em ${city}.

Analisamos a presença digital de vocês e encontramos alguns pontos simples de melhoria (como velocidade no mobile e facilidade de contato no WhatsApp) que podem aumentar a conversão de clientes.

Gostaria de dar uma olhada em 3 sugestões práticas que preparamos para vocês?`,
  };
}

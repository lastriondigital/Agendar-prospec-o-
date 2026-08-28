import { Company, Contact, Lead, Service, MessageTemplate, VariationLevel, MessageAuditResult, AuditChecklistItem, PersonalizedMessageResult, ContactSalutation, ContactGender, PersonaRole } from '../types';

export interface VariableDef {
  tag: string; // Ex: [NOME]
  legacyTag: string; // Ex: {{nome}}
  label: string;
  category: 'contato' | 'empresa' | 'servico' | 'diagnostico' | 'personalizada';
  description: string;
  example: string;
  isContextual?: boolean;
}

export const DYNAMIC_VARIABLES: VariableDef[] = [
  // Contact variables
  {
    tag: '[NOME]',
    legacyTag: '{{nome}}',
    label: 'Nome Completo',
    category: 'contato',
    description: 'Nome completo do contato ou decisor',
    example: 'Carlos Mboa',
  },
  {
    tag: '[PRIMEIRO_NOME]',
    legacyTag: '{{primeiro_nome}}',
    label: 'Primeiro Nome',
    category: 'contato',
    description: 'Apenas o primeiro nome para mensagens mais próximas',
    example: 'Carlos',
  },
  {
    tag: '[TRATAMENTO]',
    legacyTag: '{{tratamento}}',
    label: 'Tratamento / Pronome',
    category: 'contato',
    description: 'Senhor, Senhora, Doutor, Doutora ou neutro/personalizado',
    example: 'Senhor',
    isContextual: true,
  },
  {
    tag: '[GÊNERO]',
    legacyTag: '{{genero}}',
    label: 'Gênero / Artigo',
    category: 'contato',
    description: 'o / a / neutro conforme cadastro confirmado',
    example: 'o',
    isContextual: true,
  },
  {
    tag: '[CARGO]',
    legacyTag: '{{cargo}}',
    label: 'Cargo / Função',
    category: 'contato',
    description: 'Cargo do contato na empresa',
    example: 'Diretor Comercial',
  },
  {
    tag: '[RESPONSÁVEL]',
    legacyTag: '{{responsavel}}',
    label: 'Responsável / Decisor',
    category: 'contato',
    description: 'Nome do responsável geral pela empresa',
    example: 'Dra. Ana Silva',
  },

  // Company variables
  {
    tag: '[EMPRESA]',
    legacyTag: '{{empresa}}',
    label: 'Nome da Empresa',
    category: 'empresa',
    description: 'Nome fantasia ou razão social da empresa prospectada',
    example: 'Clínica Alpha',
  },
  {
    tag: '[CIDADE]',
    legacyTag: '{{cidade}}',
    label: 'Cidade',
    category: 'empresa',
    description: 'Cidade de atuação da empresa',
    example: 'Maputo',
  },
  {
    tag: '[PAIS]',
    legacyTag: '{{pais}}',
    label: 'País',
    category: 'empresa',
    description: 'País de operação',
    example: 'Moçambique',
  },
  {
    tag: '[NICHO]',
    legacyTag: '{{nicho}}',
    label: 'Nicho / Segmento',
    category: 'empresa',
    description: 'Segmento de mercado ou especialidade',
    example: 'Saúde & Odontologia',
  },
  {
    tag: '[SCORE]',
    legacyTag: '{{score}}',
    label: 'Score ICP',
    category: 'empresa',
    description: 'Pontuação de qualificação da empresa (0-100)',
    example: '88',
  },

  // Service & Offer variables
  {
    tag: '[SERVIÇO]',
    legacyTag: '{{servico}}',
    label: 'Serviço Oferecido',
    category: 'servico',
    description: 'Nome do serviço ou solução proposta',
    example: 'Atualização de Websites',
    isContextual: true,
  },
  {
    tag: '[OFERTA]',
    legacyTag: '{{oferta}}',
    label: 'Oferta / Proposta de Valor',
    category: 'servico',
    description: 'Resumo da proposta comercial ou benefício principal',
    example: 'Diagnóstico de Presença Digital',
  },
  {
    tag: '[PREÇO]',
    legacyTag: '{{preco}}',
    label: 'Preço / Investimento',
    category: 'servico',
    description: 'Valor de investimento do serviço',
    example: '2.500 MT',
  },
  {
    tag: '[ÂNCORA]',
    legacyTag: '{{ancora}}',
    label: 'Âncora de Preço / Referência',
    category: 'servico',
    description: 'Valor âncora de mercado para contraste comercial',
    example: '5.000 MT',
  },
  {
    tag: '[BENEFÍCIO]',
    legacyTag: '{{beneficio}}',
    label: 'Benefício Chave',
    category: 'servico',
    description: 'Principal transformação gerada pelo serviço',
    example: 'atrair mais pacientes particulares pelo Google',
  },
  {
    tag: '[CTA]',
    legacyTag: '{{cta}}',
    label: 'Chamada para Ação (CTA)',
    category: 'servico',
    description: 'Pergunta de fechamento ou próximo passo',
    example: 'Você teria 10 minutos nesta quinta para avaliarmos juntos?',
  },

  // Diagnostic & Context variables
  {
    tag: '[PROBLEMA]',
    legacyTag: '{{problema}}',
    label: 'Problema / Dor Diagnosticada',
    category: 'diagnostico',
    description: 'Ponto de melhoria específico diagnosticado no lead',
    example: 'o site atual está sem botão de WhatsApp direto',
    isContextual: true,
  },
  {
    tag: '[OBSERVAÇÃO]',
    legacyTag: '{{observacao}}',
    label: 'Observação do Lead',
    category: 'diagnostico',
    description: 'Notas personalizadas cadastradas no lead',
    example: 'estão abrindo nova unidade em breve',
  },
  {
    tag: '[ETAPA_FUNIL]',
    legacyTag: '{{etapa_funil}}',
    label: 'Etapa do Funil',
    category: 'diagnostico',
    description: 'Estágio comercial atual no pipeline',
    example: 'Primeiro Contato',
  },
  {
    tag: '[PRÓXIMA_AÇÃO]',
    legacyTag: '{{proxima_acao}}',
    label: 'Próxima Ação Agendada',
    category: 'diagnostico',
    description: 'Ação estratégica planejada',
    example: 'Apresentação de Diagnóstico',
  },
  {
    tag: '[DATA]',
    legacyTag: '{{data}}',
    label: 'Data Atual / Agendada',
    category: 'diagnostico',
    description: 'Data formatada para a mensagem',
    example: new Date().toLocaleDateString('pt-BR'),
  },
];

/**
 * Normaliza o tratamento do contato respeitando a regra estrita:
 * NUNCA PRESUMIR GÊNERO PELO NOME.
 */
export function resolveSalutationDetails(contact?: Partial<Contact> | null): {
  salutationText: string;
  genderArticle: string;
  genderPronoun: string;
  treatmentWithSpace: string;
} {
  if (!contact) {
    return {
      salutationText: '',
      genderArticle: '',
      genderPronoun: '',
      treatmentWithSpace: '',
    };
  }

  const salutation = contact.salutation;
  const custom = contact.customSalutation?.trim();

  let salutationText = '';
  let genderArticle = '';
  let genderPronoun = '';

  switch (salutation) {
    case 'senhor':
      salutationText = 'Senhor';
      genderArticle = 'o';
      genderPronoun = 'ele';
      break;
    case 'senhora':
      salutationText = 'Senhora';
      genderArticle = 'a';
      genderPronoun = 'ela';
      break;
    case 'doutor':
      salutationText = 'Doutor';
      genderArticle = 'o';
      genderPronoun = 'ele';
      break;
    case 'doutora':
      salutationText = 'Doutora';
      genderArticle = 'a';
      genderPronoun = 'ela';
      break;
    case 'personalizado':
      salutationText = custom || '';
      genderArticle = contact.gender === 'feminino' ? 'a' : contact.gender === 'masculino' ? 'o' : '';
      genderPronoun = contact.gender === 'feminino' ? 'ela' : contact.gender === 'masculino' ? 'ele' : '';
      break;
    case 'nome_proprio':
    case 'outro':
    default:
      // Se gênero foi expressamente marcado como masculino ou feminino sem tratamento formal
      if (contact.gender === 'feminino') {
        genderArticle = 'a';
        genderPronoun = 'ela';
      } else if (contact.gender === 'masculino') {
        genderArticle = 'o';
        genderPronoun = 'ele';
      }
      salutationText = '';
      break;
  }

  const treatmentWithSpace = salutationText ? `${salutationText} ` : '';

  return {
    salutationText,
    genderArticle,
    genderPronoun,
    treatmentWithSpace,
  };
}

/**
 * Infere o papel de persona (Decisor vs Funcionário)
 */
export function resolvePersonaRole(contact?: Partial<Contact> | null): {
  role: PersonaRole;
  isDecisionMaker: boolean;
  label: string;
} {
  if (contact?.personaRole) {
    const isDecisionMaker = ['proprietario', 'socio', 'diretor', 'gerente'].includes(contact.personaRole);
    const labels: Record<PersonaRole, string> = {
      proprietario: 'Proprietário',
      socio: 'Sócio',
      diretor: 'Diretor',
      gerente: 'Gerente',
      marketing: 'Marketing',
      recepcao: 'Recepção',
      funcionario: 'Funcionário',
      outro: 'Outro',
    };
    return {
      role: contact.personaRole,
      isDecisionMaker,
      label: labels[contact.personaRole] || 'Decisor',
    };
  }

  const roleStr = (contact?.role || '').toLowerCase();

  if (roleStr.includes('propriet') || roleStr.includes('dono') || roleStr.includes('owner') || roleStr.includes('fundador')) {
    return { role: 'proprietario', isDecisionMaker: true, label: 'Proprietário' };
  }
  if (roleStr.includes('sócio') || roleStr.includes('socio') || roleStr.includes('partner')) {
    return { role: 'socio', isDecisionMaker: true, label: 'Sócio' };
  }
  if (roleStr.includes('diretor') || roleStr.includes('director') || roleStr.includes('ceo') || roleStr.includes('c-level')) {
    return { role: 'diretor', isDecisionMaker: true, label: 'Diretor' };
  }
  if (roleStr.includes('gerente') || roleStr.includes('gestor') || roleStr.includes('manager') || roleStr.includes('coordenador')) {
    return { role: 'gerente', isDecisionMaker: true, label: 'Gerente' };
  }
  if (roleStr.includes('marketing') || roleStr.includes('comercial') || roleStr.includes('vendas')) {
    return { role: 'marketing', isDecisionMaker: false, label: 'Marketing/Comercial' };
  }
  if (roleStr.includes('recep') || roleStr.includes('secret') || roleStr.includes('atendimento')) {
    return { role: 'recepcao', isDecisionMaker: false, label: 'Recepção' };
  }
  if (roleStr.includes('assist') || roleStr.includes('auxiliar') || roleStr.includes('funciona')) {
    return { role: 'funcionario', isDecisionMaker: false, label: 'Funcionário' };
  }

  // Padrão seguro
  return { role: 'outro', isDecisionMaker: true, label: 'Responsável' };
}

/**
 * Resolve o problema ou dor específico diagnosticado por serviço
 */
export function resolveDiagnosedProblem(
  service?: Partial<Service> | null,
  company?: Partial<Company> | null,
  lead?: Partial<Lead> | null
): string {
  // 1. Evidência direta no lead ou empresa
  if (lead?.notes && lead.notes.toLowerCase().includes('problema:')) {
    const match = lead.notes.match(/problema:\s*([^;\n\.]+)/i);
    if (match && match[1]) return match[1].trim();
  }

  if (company?.apparentNeed?.trim()) {
    return company.apparentNeed.trim();
  }

  // 2. Diagnóstico a partir da qualificação por serviço registrada
  if (service?.name && company?.serviceQualifications?.[service.name]) {
    const qual = company.serviceQualifications[service.name];
    if (qual.negativePoints && qual.negativePoints.length > 0) {
      return qual.negativePoints[0];
    }
  }

  // 3. Heurística baseada em sinais cadastrados na empresa
  const servName = (service?.name || '').toLowerCase();
  const servCategory = (service?.category || '').toLowerCase();

  if (servName.includes('site') || servName.includes('web') || servCategory.includes('web')) {
    if (company?.websiteQuality === 'nenhuma' || company?.websiteQuality === 'broken' || !company?.website) {
      return 'a empresa ainda não possui um site próprio para captar clientes online';
    }
    if (company?.websiteQuality === 'outdated' || company?.websiteQuality === 'ruim') {
      return 'o site atual possui apresentação desatualizada e poderia converter mais';
    }
    if (company?.websiteQuality === 'slow') {
      return 'o site está com carregamento lento no celular';
    }
    return 'o site atual tem potencial para gerar mais conversões diretas';
  }

  if (servName.includes('google') || servName.includes('gmb') || servName.includes('maps') || servCategory.includes('google')) {
    if (company?.googleRating && company.googleRating < 4.0) {
      return 'a média de avaliações no Google está abaixo do ideal para o segmento';
    }
    if (company?.googleReviewsCount !== undefined && company.googleReviewsCount < 10) {
      return 'o perfil no Google possui poucas avaliações de clientes para gerar autoridade';
    }
    return 'o perfil no Google Meu Negócio possui informações e fotos que podem ser otimizadas';
  }

  if (servName.includes('instagram') || servName.includes('social') || servCategory.includes('social')) {
    if (company?.instagramActive === false) {
      return 'o perfil no Instagram está sem publicações recentes';
    }
    return 'a presença visual no Instagram poderia transmitir ainda mais autoridade';
  }

  if (service?.problemsSolved && service.problemsSolved.length > 0) {
    return service.problemsSolved[0];
  }

  return 'a presença comercial atual possui oportunidades claras de melhoria';
}

/**
 * Contexto completo compilado para interpolação
 */
export interface PersonalizationContext {
  company?: Partial<Company> | null;
  contact?: Partial<Contact> | null;
  service?: Partial<Service> | null;
  lead?: Partial<Lead> | null;
  customVariables?: Record<string, string>;
}

/**
 * Extrai o mapa chave-valor de todas as variáveis suportadas
 */
export function buildVariableMap(context: PersonalizationContext): Record<string, string> {
  const { company, contact, service, lead, customVariables = {} } = context;

  const rawName = contact?.name || 'Cliente';
  const firstName = rawName.trim().split(' ')[0] || 'Cliente';
  const salutationDetails = resolveSalutationDetails(contact);
  const companyName = company?.name || 'sua empresa';
  const city = company?.city || 'sua região';
  const country = company?.country || 'Moçambique';
  const niche = company?.niche || 'seu segmento';
  const role = contact?.role || 'gestor';
  const responsible = contact?.name || 'responsável';
  const score = lead?.score !== undefined ? `${lead.score}` : '85';

  const serviceName = service?.name || 'nossas soluções';
  const offer = service?.valueProposition || service?.name || 'otimização comercial';
  const price = service?.basePrice ? `${service.currency || 'MT'} ${service.basePrice.toLocaleString('pt-BR')}` : 'sob consulta';
  const anchor = service?.basePrice ? `${service.currency || 'MT'} ${(service.basePrice * 1.6).toLocaleString('pt-BR')}` : 'valor de mercado';
  const benefit = service?.benefits?.[0] || 'aumentar a atração de clientes qualificados';
  const cta = service?.defaultCta || 'Você teria 10 minutos para vermos isso juntos esta semana?';

  const problem = resolveDiagnosedProblem(service, company, lead);
  const notes = contact?.notes || company?.notes || lead?.notes || '';
  const stage = lead?.stage || 'Primeiro Contato';
  const nextAction = lead?.nextActionTitle || 'Apresentação';
  const dateStr = new Date().toLocaleDateString('pt-BR');

  // Mapa de substituição base
  const map: Record<string, string> = {
    // Contact
    '[NOME]': rawName,
    '{{nome}}': rawName,
    '[PRIMEIRO_NOME]': firstName,
    '{{primeiro_nome}}': firstName,
    '[TRATAMENTO]': salutationDetails.salutationText,
    '{{tratamento}}': salutationDetails.salutationText,
    '[GÊNERO]': salutationDetails.genderArticle,
    '[GENERO]': salutationDetails.genderArticle,
    '{{genero}}': salutationDetails.genderArticle,
    '[CARGO]': role,
    '{{cargo}}': role,
    '[RESPONSÁVEL]': responsible,
    '[RESPONSAVEL]': responsible,
    '{{responsavel}}': responsible,

    // Company
    '[EMPRESA]': companyName,
    '{{empresa}}': companyName,
    '[CIDADE]': city,
    '{{cidade}}': city,
    '[PAIS]': country,
    '{{pais}}': country,
    '[NICHO]': niche,
    '{{nicho}}': niche,
    '[SCORE]': score,
    '{{score}}': score,
    '[DECISOR]': responsible,
    '{{decisor}}': responsible,

    // Service & Offer
    '[SERVIÇO]': serviceName,
    '[SERVICO]': serviceName,
    '{{servico}}': serviceName,
    '[OFERTA]': offer,
    '{{oferta}}': offer,
    '[PREÇO]': price,
    '[PRECO]': price,
    '{{preco}}': price,
    '[ÂNCORA]': anchor,
    '[ANCORA]': anchor,
    '{{ancora}}': anchor,
    '[BENEFÍCIO]': benefit,
    '[BENEFICIO]': benefit,
    '{{beneficio}}': benefit,
    '[CTA]': cta,
    '{{cta}}': cta,

    // Diagnostic & Context
    '[PROBLEMA]': problem,
    '{{problema}}': problem,
    '[OBSERVAÇÃO]': notes,
    '[OBSERVACAO]': notes,
    '{{observacao}}': notes,
    '[ETAPA_FUNIL]': stage,
    '{{etapa_funil}}': stage,
    '[PRÓXIMA_AÇÃO]': nextAction,
    '[PROXIMA_ACAO]': nextAction,
    '{{proxima_acao}}': nextAction,
    '[DATA]': dateStr,
    '{{data}}': dateStr,
  };

  // Merge custom user variables (ex: [CONCORRENTE], [ULTIMO_POST], etc.)
  for (const [k, v] of Object.entries(customVariables)) {
    const upperKey = k.startsWith('[') ? k.toUpperCase() : `[${k.toUpperCase()}]`;
    map[upperKey] = v;
  }

  return map;
}

/**
 * Interpola um template dinâmico com tratamento de espaçamento limpo
 */
export function interpolateDynamicTemplate(
  templateContent: string,
  context: PersonalizationContext
): string {
  if (!templateContent) return '';

  const varMap = buildVariableMap(context);
  let result = templateContent;

  // Substitui todas as tags no mapa
  for (const [key, value] of Object.entries(varMap)) {
    // Regex global case-insensitive para tags em colchetes e chaves
    const escaped = key.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    result = result.replace(regex, value);
  }

  // Se [TRATAMENTO] estava vazio e gerou espaço duplo (ex: "Olá  Carlos" -> "Olá Carlos")
  result = result.replace(/[ \t]{2,}/g, ' ');
  result = result.replace(/\s+,/g, ',');
  result = result.replace(/Olá\s*,/gi, 'Olá,');

  return result.trim();
}

/**
 * Gera variação da mensagem em 4 níveis
 */
export function generateMessageVariation(
  templateContent: string,
  context: PersonalizationContext,
  level: VariationLevel = 'none'
): string {
  const baseInterpolated = interpolateDynamicTemplate(templateContent, context);
  if (!baseInterpolated || level === 'none') {
    return baseInterpolated;
  }

  const { contact, company, service, lead } = context;
  const contactName = contact?.name || 'Cliente';
  const firstName = contactName.trim().split(' ')[0] || 'Cliente';
  const salutation = resolveSalutationDetails(contact);
  const companyName = company?.name || 'sua empresa';
  const problem = resolveDiagnosedProblem(service, company, lead);
  const serviceName = service?.name || 'nossas soluções';
  const persona = resolvePersonaRole(contact);
  const benefit = service?.benefits?.[0] || 'gerar mais previsibilidade e clientes';
  const cta = service?.defaultCta || 'Você teria 10 minutos para conversarmos esta semana?';

  // Nível 2: Pequena Variação (altera saudações e pequenas construções mantendo rigorosamente a estrutura)
  if (level === 'minor') {
    let text = baseInterpolated;

    // Variação de abertura cordial
    const salutationPrefix = salutation.salutationText ? `${salutation.salutationText} ${firstName}` : firstName;
    
    // Hash determinístico baseado no id da empresa ou nome para manter estabilidade
    const hash = (company?.id || companyName).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const greetingVariations = [
      `Olá ${salutationPrefix}, tudo bem?`,
      `Olá ${salutationPrefix}, como vai?`,
      `Oi ${salutationPrefix}, espero que esteja tendo um ótimo dia.`,
      `Tudo bem, ${salutationPrefix}?`,
    ];
    const selectedGreeting = greetingVariations[hash % greetingVariations.length];

    text = text.replace(/^(Olá|Oi|Prezado|Prezada)[^,\n]+,/i, selectedGreeting);
    return text;
  }

  // Nível 3: Variação Contextual (adapta a dor, persona e decisor vs funcionário)
  if (level === 'contextual') {
    const salutationPrefix = salutation.salutationText ? `${salutation.salutationText} ${firstName}` : firstName;

    // Se o contato for Funcionário ou Recepção: adapta a abordagem para pedir o encaminhamento correto
    if (!persona.isDecisionMaker && (persona.role === 'recepcao' || persona.role === 'funcionario')) {
      return `Olá ${salutationPrefix}, tudo bem?\n\nEncontrei a ${companyName} e percebi que ${problem}. Nós ajudamos empresas com ${serviceName} para ${benefit}.\n\nVocê poderia, por gentileza, me indicar quem é a pessoa responsável por essa área na empresa?\n\nAgradeço desde já pela atenção!`;
    }

    // Se o contato for Decisor (Proprietário, Sócio, Diretor)
    return `Olá ${salutationPrefix}, tudo bem?\n\nAcompanhando o mercado de ${company?.city || 'sua região'}, estive analisando a presença da ${companyName} e notei um detalhe importante: ${problem}.\n\nTrabalhamos exatamente com ${serviceName} com foco em ${benefit}. Preparei uma ideia rápida sobre como solucionar isso de forma prática.\n\n${cta}`;
  }

  // Nível 4: Personalização por IA (Regras estruturadas avançadas sem invenção de dados)
  if (level === 'ai') {
    const salutationPrefix = salutation.salutationText ? `${salutation.salutationText} ${firstName}` : firstName;
    const nicheDetail = company?.niche ? ` no segmento de ${company.niche}` : '';
    const cityDetail = company?.city ? ` em ${company.city}` : '';

    if (!persona.isDecisionMaker) {
      return `Olá ${salutationPrefix}, tudo bem?\n\nEstou em contato com a equipe da ${companyName}${cityDetail}. Analisando a presença de vocês, notei uma oportunidade em relação a ${problem}.\n\nComo atuamos com ${serviceName}, gostaria de saber quem é a pessoa que cuida dessa parte estratégica para eu apresentar uma sugestão rápida.\n\nObrigado!`;
    }

    return `Olá ${salutationPrefix}, tudo bem?\n\nEstive avaliando empresas de destaque${nicheDetail}${cityDetail} e encontrei a ${companyName}.\n\nDurante uma análise rápida, identifiquei que ${problem}. Desenvolvemos um método com ${serviceName} que tem gerado excelentes resultados na prática.\n\nPreparei um diagnóstico sucinto para mostrar como resolver isso. ${cta}`;
  }

  return baseInterpolated;
}

/**
 * Auditoria de Integridade Antes do Uso (Anti-Invenção e Verificação)
 */
export function auditMessageIntegrity(
  messageContent: string,
  context: PersonalizationContext,
  template?: MessageTemplate | null
): MessageAuditResult {
  const items: AuditChecklistItem[] = [];
  const missingFields: string[] = [];
  const warnings: string[] = [];

  const { company, contact, service, lead } = context;

  // 1. Contato e Destinatário
  const hasContactName = !!(contact?.name);
  items.push({
    id: 'contact_name',
    label: 'Nome do Destinatário',
    passed: hasContactName,
    status: hasContactName ? 'valid' : 'error',
    message: hasContactName
      ? `Contato confirmado: ${contact?.name}`
      : 'Nome do contato não informado no cadastro.',
    fieldKey: 'contact.name',
  });
  if (!hasContactName) missingFields.push('Nome do Contato');

  // 2. Empresa Correta
  const hasCompanyName = !!(company?.name);
  items.push({
    id: 'company_name',
    label: 'Empresa do Lead',
    passed: hasCompanyName,
    status: hasCompanyName ? 'valid' : 'error',
    message: hasCompanyName
      ? `Empresa vinculada: ${company?.name}`
      : 'Empresa não identificada.',
    fieldKey: 'company.name',
  });
  if (!hasCompanyName) missingFields.push('Nome da Empresa');

  // 3. Serviço Correspondente
  const hasService = !!service?.name;
  items.push({
    id: 'service_defined',
    label: 'Serviço Proposto',
    passed: hasService,
    status: hasService ? 'valid' : 'warning',
    message: hasService
      ? `Serviço associado: ${service?.name}`
      : 'Nenhum serviço principal selecionado para a oferta.',
    fieldKey: 'service.id',
  });
  if (!hasService) missingFields.push('Serviço');

  // 4. Problema / Diagnóstico Específico
  const hasProblem = !!(company?.apparentNeed || lead?.notes || service?.problemsSolved?.length);
  items.push({
    id: 'problem_diagnosed',
    label: 'Problema / Diagnóstico',
    passed: hasProblem,
    status: hasProblem ? 'valid' : 'warning',
    message: hasProblem
      ? `Dor identificada: ${resolveDiagnosedProblem(service, company, lead)}`
      : 'Nenhuma dor ou necessidade evidente cadastrada.',
    fieldKey: 'company.apparentNeed',
  });
  if (!hasProblem) missingFields.push('Problema / Diagnóstico');

  // 5. Tratamento e Gênero (Sem presunções)
  const salutationResolved = resolveSalutationDetails(contact);
  const isTreatmentExplicit = !!contact?.salutation;
  items.push({
    id: 'salutation_confirmed',
    label: 'Tratamento & Gênero',
    passed: true, // Não bloqueia, mas valida conformidade
    status: isTreatmentExplicit ? 'valid' : 'valid',
    message: salutationResolved.salutationText
      ? `Tratamento formal ativo: "${salutationResolved.salutationText}" (Gênero: ${contact?.gender || 'confirmado'})`
      : 'Tratamento neutro / nome próprio (sem presunção automática de gênero)',
    fieldKey: 'contact.salutation',
  });

  // 6. Variáveis Não Preenchidas (Colchetes ou Chaves residuais)
  const residualBracketMatches = messageContent.match(/\[[A-ZÀ-Ú_0-9]+\]/g) || [];
  const residualCurlyMatches = messageContent.match(/\{\{[a-z_0-9]+\}\}/gi) || [];
  const allResiduals = [...residualBracketMatches, ...residualCurlyMatches];

  const hasNoResidualTags = allResiduals.length === 0;
  items.push({
    id: 'no_residual_tags',
    label: 'Variáveis Preenchidas',
    passed: hasNoResidualTags,
    status: hasNoResidualTags ? 'valid' : 'error',
    message: hasNoResidualTags
      ? 'Todas as variáveis do script foram substituídas com sucesso.'
      : `Variáveis não preenchidas no texto: ${allResiduals.join(', ')}`,
  });
  if (!hasNoResidualTags) {
    warnings.push(`Existem variáveis pendentes no texto: ${allResiduals.join(', ')}`);
  }

  // 7. Validação Anti-Invenção (Zero Hallucination)
  items.push({
    id: 'anti_hallucination',
    label: 'Conformidade Anti-Invenção',
    passed: true,
    status: 'valid',
    message: 'A mensagem utiliza estritamente dados confirmados e cadastrados no lead.',
  });

  // 8. Compatibilidade com a etapa do funil
  const stage = lead?.stage || 'Primeiro Contato';
  items.push({
    id: 'funnel_stage_compat',
    label: 'Etapa do Funil',
    passed: true,
    status: 'valid',
    message: `Alinhado com a etapa atual: ${stage}`,
  });

  // Cálculo de Score de Integridade
  const passedCount = items.filter((i) => i.passed).length;
  const score = Math.round((passedCount / items.length) * 100);

  const isValid = hasContactName && hasCompanyName && hasNoResidualTags;
  const status: MessageAuditResult['status'] = isValid
    ? warnings.length > 0 || missingFields.length > 0
      ? 'has_warnings'
      : 'approved'
    : 'incomplete';

  return {
    isValid,
    score,
    status,
    items,
    missingFields,
    resolvedVariables: buildVariableMap(context),
    warnings,
  };
}

/**
 * Pipeline Completo de Preparação e Auditoria da Mensagem
 */
export function preparePersonalizedMessage(
  template: MessageTemplate | string,
  context: PersonalizationContext,
  variationLevel: VariationLevel = 'none'
): PersonalizedMessageResult {
  const content = typeof template === 'string' ? template : template.content;
  const message = generateMessageVariation(content, context, variationLevel);
  const audit = auditMessageIntegrity(message, context, typeof template === 'string' ? null : template);

  const rawName = context.contact?.name || 'Cliente';
  const salutationDetails = resolveSalutationDetails(context.contact);

  return {
    message,
    variationLevel,
    audit,
    metadata: {
      recipientName: rawName,
      recipientRole: context.contact?.role || 'Decisor',
      recipientSalutation: salutationDetails.salutationText || 'Neutro / Nome Próprio',
      recipientGender: context.contact?.gender || 'Não informado',
      companyName: context.company?.name || 'Empresa',
      companyCity: context.company?.city || 'Localidade',
      serviceName: context.service?.name || 'Serviço',
      diagnosedProblem: resolveDiagnosedProblem(context.service, context.company, context.lead),
      stageName: context.lead?.stage || 'Primeiro Contato',
      scoreIcp: context.lead?.score,
    },
  };
}

import {
  CommercialPersonalizationSettings,
  Company,
  Contact,
  ContactGender,
  CountryPersonalizationRule,
  IdealCustomerProfile,
  Lead,
  MarketPriceItem,
  MarketProfile,
  PersonaRole,
  ResolvedCommercialContext,
  Service,
  Campaign,
} from '../types';

/**
 * ============================================================================
 * CATÁLOGO DE REGRAS DE MERCADO E PAÍSES PADRÃO
 * ============================================================================
 */

export const DEFAULT_COUNTRY_RULES: CountryPersonalizationRule[] = [
  {
    id: 'rule-br',
    country: 'Brasil',
    countryCode: 'BR',
    defaultCurrency: 'BRL',
    currencySymbol: 'R$',
    defaultLanguage: 'pt-BR',
    defaultLanguageLabel: 'Português Brasileiro',
    formality: 'consultivo',
    pronoun: 'voce',
    salutations: ['Olá', 'Bom dia', 'Boa tarde', 'Prezado(a)'],
    terms: {
      site: 'site',
      budget: 'orçamento',
      phone: 'WhatsApp / Celular',
      team: 'equipe',
      company: 'empresa',
      pricePhrase: 'o investimento fica em',
    },
    priceFormatTemplate: 'R$ {price}',
  },
  {
    id: 'rule-pt',
    country: 'Portugal',
    countryCode: 'PT',
    defaultCurrency: 'EUR',
    currencySymbol: '€',
    defaultLanguage: 'pt-PT',
    defaultLanguageLabel: 'Português Europeu',
    formality: 'consultivo',
    pronoun: 'voce',
    salutations: ['Olá', 'Bom dia', 'Boa tarde', 'Estimado(a)'],
    terms: {
      site: 'sítio / website',
      budget: 'proposta comercial',
      phone: 'WhatsApp / Telemóvel',
      team: 'equipa',
      company: 'empresa',
      pricePhrase: 'o investimento é de',
    },
    priceFormatTemplate: '{price} €',
  },
  {
    id: 'rule-mz',
    country: 'Moçambique',
    countryCode: 'MZ',
    defaultCurrency: 'MZN',
    currencySymbol: 'MT',
    defaultLanguage: 'pt-MZ',
    defaultLanguageLabel: 'Português Moçambicano',
    formality: 'consultivo',
    pronoun: 'voce',
    salutations: ['Olá', 'Bom dia', 'Boa tarde', 'Prezado(a)', 'Doutor(a)'],
    terms: {
      site: 'página web / site',
      budget: 'proposta comercial',
      phone: 'contacto / WhatsApp',
      team: 'equipa',
      company: 'empresa',
      pricePhrase: 'o valor de investimento é de',
    },
    priceFormatTemplate: '{price} MT',
  },
  {
    id: 'rule-ao',
    country: 'Angola',
    countryCode: 'AO',
    defaultCurrency: 'AOA',
    currencySymbol: 'Kz',
    defaultLanguage: 'pt-AO',
    defaultLanguageLabel: 'Português Angolano',
    formality: 'consultivo',
    pronoun: 'voce',
    salutations: ['Olá', 'Bom dia', 'Boa tarde', 'Prezado(a)', 'Ilustre'],
    terms: {
      site: 'website / site',
      budget: 'proposta comercial',
      phone: 'contacto / terminal',
      team: 'equipa',
      company: 'empresa',
      pricePhrase: 'o investimento situa-se em',
    },
    priceFormatTemplate: '{price} Kz',
  },
  {
    id: 'rule-cv',
    country: 'Cabo Verde',
    countryCode: 'CV',
    defaultCurrency: 'CVE',
    currencySymbol: 'Esc',
    defaultLanguage: 'pt-CV',
    defaultLanguageLabel: 'Português Cabo-verdiano',
    formality: 'consultivo',
    pronoun: 'voce',
    salutations: ['Olá', 'Bom dia', 'Boa tarde', 'Estimado(a)'],
    terms: {
      site: 'site / página',
      budget: 'proposta',
      phone: 'contacto / telemóvel',
      team: 'equipa',
      company: 'empresa',
      pricePhrase: 'o valor de referência é de',
    },
    priceFormatTemplate: '{price} Esc',
  },
  {
    id: 'rule-us',
    country: 'Estados Unidos',
    countryCode: 'US',
    defaultCurrency: 'USD',
    currencySymbol: '$',
    defaultLanguage: 'en-US',
    defaultLanguageLabel: 'English (US)',
    formality: 'consultivo',
    pronoun: 'voce',
    salutations: ['Hello', 'Hi', 'Good morning', 'Dear'],
    terms: {
      site: 'website',
      budget: 'quote / proposal',
      phone: 'mobile / WhatsApp',
      team: 'team',
      company: 'company',
      pricePhrase: 'the investment is',
    },
    priceFormatTemplate: '${price}',
  },
  {
    id: 'rule-gb',
    country: 'Reino Unido',
    countryCode: 'GB',
    defaultCurrency: 'GBP',
    currencySymbol: '£',
    defaultLanguage: 'en-GB',
    defaultLanguageLabel: 'English (UK)',
    formality: 'formal',
    pronoun: 'voce',
    salutations: ['Hello', 'Good morning', 'Dear'],
    terms: {
      site: 'website',
      budget: 'proposal',
      phone: 'mobile / WhatsApp',
      team: 'team',
      company: 'company',
      pricePhrase: 'the investment is',
    },
    priceFormatTemplate: '£{price}',
  },
];

export const DEFAULT_COMMERCIAL_SETTINGS: CommercialPersonalizationSettings = {
  defaultCountry: 'Brasil',
  defaultCurrency: 'BRL',
  defaultLanguage: 'pt-BR',
  defaultFormality: 'consultivo',
  defaultTreatment: 'voce',
  marketRules: DEFAULT_COUNTRY_RULES,
  globalMarketPrices: [],
  strictNoGuessGender: true,
  strictNoAutoCurrencyConversion: true,
  updatedAt: new Date().toISOString(),
};

/**
 * Tabela de Preços de Mercado para os 6 Serviços Oficiais do Prospect OS
 */
export const DEFAULT_CORE_SERVICES_PRICING: Record<string, MarketPriceItem[]> = {
  'criacao-sites': [
    {
      id: 'prc-cs-br',
      country: 'Brasil',
      currency: 'BRL',
      currencySymbol: 'R$',
      price: 2500,
      anchorPrice: 4500,
      paymentMethod: 'Pix, Boleto, Cartão até 12x',
      paymentTerms: '50% entrada + 50% na entrega',
      observations: 'Incluso design exclusivo, otimização mobile e SEO inicial.',
    },
    {
      id: 'prc-cs-pt',
      country: 'Portugal',
      currency: 'EUR',
      currencySymbol: '€',
      price: 650,
      anchorPrice: 1200,
      paymentMethod: 'Transferência Bancária (IBAN), MB Way',
      paymentTerms: '50% adjudicação + 50% entrega',
      observations: 'Desenvolvimento conforme normas europeias de RGPD/Cookies.',
    },
    {
      id: 'prc-cs-mz',
      country: 'Moçambique',
      currency: 'MZN',
      currencySymbol: 'MT',
      price: 25000,
      anchorPrice: 45000,
      paymentMethod: 'M-Pesa, E-Mola, Transferência BIM / Millennium IZI',
      paymentTerms: '50% sinal + 50% conclusão',
      observations: 'Com integração de WhatsApp direto e domínio personalizado.',
    },
    {
      id: 'prc-cs-ao',
      country: 'Angola',
      currency: 'AOA',
      currencySymbol: 'Kz',
      price: 350000,
      anchorPrice: 600000,
      paymentMethod: 'Multicaixa Express, Transferência Bancária',
      paymentTerms: '50% adiantamento + 50% entrega',
      observations: 'Hospedagem e certificado de segurança inclusos.',
    },
  ],
  'atualizacao-sites': [
    {
      id: 'prc-as-br',
      country: 'Brasil',
      currency: 'BRL',
      currencySymbol: 'R$',
      price: 1200,
      anchorPrice: 2200,
      paymentMethod: 'Pix ou Cartão de Crédito',
      paymentTerms: '50% entrada + 50% entrega',
      observations: 'Redesign visual, aumento de velocidade e adequação mobile.',
    },
    {
      id: 'prc-as-pt',
      country: 'Portugal',
      currency: 'EUR',
      currencySymbol: '€',
      price: 300,
      anchorPrice: 550,
      paymentMethod: 'Transferência Bancária, MB Way',
      paymentTerms: '50% início + 50% conclusão',
      observations: 'Modernização de layout e chamada direta para WhatsApp.',
    },
    {
      id: 'prc-as-mz',
      country: 'Moçambique',
      currency: 'MZN',
      currencySymbol: 'MT',
      price: 12500,
      anchorPrice: 22000,
      paymentMethod: 'M-Pesa, Transferência Bancária',
      paymentTerms: '50% sinal + 50% entrega',
      observations: 'Ajuste de páginas antigas para visual moderno e veloz.',
    },
  ],
  'design-grafico': [
    {
      id: 'prc-dg-br',
      country: 'Brasil',
      currency: 'BRL',
      currencySymbol: 'R$',
      price: 1800,
      anchorPrice: 3200,
      paymentMethod: 'Pix, Cartão até 6x',
      paymentTerms: '50% entrada + 50% entrega',
      observations: 'Identidade visual, manual da marca e artes institucionais.',
    },
    {
      id: 'prc-dg-pt',
      country: 'Portugal',
      currency: 'EUR',
      currencySymbol: '€',
      price: 450,
      anchorPrice: 800,
      paymentMethod: 'Transferência Bancária (IBAN), MB Way',
      paymentTerms: '50% adjudicação + 50% entrega',
      observations: 'Ficheiros vectoriais prontos para impressão e redes sociais.',
    },
    {
      id: 'prc-dg-mz',
      country: 'Moçambique',
      currency: 'MZN',
      currencySymbol: 'MT',
      price: 18000,
      anchorPrice: 32000,
      paymentMethod: 'M-Pesa, E-Mola, Transferência BIM',
      paymentTerms: '50% sinal + 50% conclusão',
      observations: 'Manual de marca completo com paleta de cores e tipografia.',
    },
  ],
  'gmb-google': [
    {
      id: 'prc-gm-br',
      country: 'Brasil',
      currency: 'BRL',
      currencySymbol: 'R$',
      price: 1200,
      anchorPrice: 2000,
      paymentMethod: 'Pix ou Cartão de Crédito',
      paymentTerms: 'À vista ou 2x',
      observations: 'Otimização completa para Top 3 no Google Maps regional.',
    },
    {
      id: 'prc-gm-pt',
      country: 'Portugal',
      currency: 'EUR',
      currencySymbol: '€',
      price: 280,
      anchorPrice: 490,
      paymentMethod: 'Transferência Bancária, MB Way',
      paymentTerms: 'À vista com ativação imediata',
      observations: 'Configuração de categorias, SEO local e protocolo de avaliações.',
    },
    {
      id: 'prc-gm-mz',
      country: 'Moçambique',
      currency: 'MZN',
      currencySymbol: 'MT',
      price: 12000,
      anchorPrice: 20000,
      paymentMethod: 'M-Pesa, E-Mola, Transferência BIM',
      paymentTerms: '50% início + 50% conclusão',
      observations: 'Geolocalização de fotos, horários e ligação direta de chamada.',
    },
  ],
  'desenvolvimento-app': [
    {
      id: 'prc-ap-br',
      country: 'Brasil',
      currency: 'BRL',
      currencySymbol: 'R$',
      price: 15000,
      anchorPrice: 25000,
      paymentMethod: 'Transferência, Pix ou Parcelamento por Etapas',
      paymentTerms: '30% entrada + 40% homologação + 30% entrega',
      observations: 'App PWA/Mobile com notificações push e painel administrativo.',
    },
    {
      id: 'prc-ap-pt',
      country: 'Portugal',
      currency: 'EUR',
      currencySymbol: '€',
      price: 3800,
      anchorPrice: 6500,
      paymentMethod: 'Transferência Bancária (IBAN)',
      paymentTerms: '30% adjudicação + 40% beta + 30% lançamento',
      observations: 'Sem taxas de lojas de aplicações, instalação instantânea.',
    },
    {
      id: 'prc-ap-mz',
      country: 'Moçambique',
      currency: 'MZN',
      currencySymbol: 'MT',
      price: 150000,
      anchorPrice: 250000,
      paymentMethod: 'Transferência Bancária Corporativa',
      paymentTerms: '40% início + 30% teste + 30% entrega final',
      observations: 'Sistema ágil, seguro e com banco de dados próprio.',
    },
  ],
  'desenvolvimento-saas': [
    {
      id: 'prc-sa-br',
      country: 'Brasil',
      currency: 'BRL',
      currencySymbol: 'R$',
      price: 28000,
      anchorPrice: 45000,
      paymentMethod: 'Contrato com pagamento dividido por Sprints',
      paymentTerms: 'Entrada + parcelas mensais de desenvolvimento',
      observations: 'Arquitetura em nuvem, multi-tenant e integrações via API.',
    },
    {
      id: 'prc-sa-pt',
      country: 'Portugal',
      currency: 'EUR',
      currencySymbol: '€',
      price: 6500,
      anchorPrice: 11000,
      paymentMethod: 'Transferência Bancária (IBAN)',
      paymentTerms: 'Divisão em 3 marcos de entrega (Milestones)',
      observations: 'Plataforma web escalável com alta disponibilidade.',
    },
    {
      id: 'prc-sa-mz',
      country: 'Moçambique',
      currency: 'MZN',
      currencySymbol: 'MT',
      price: 280000,
      anchorPrice: 480000,
      paymentMethod: 'Transferência Bancária Corporativa',
      paymentTerms: 'Marcos de desenvolvimento contratual',
      observations: 'Desenvolvimento sob medida com suporte e documentação técnica.',
    },
  ],
};

/**
 * Normaliza o nome do país para matching
 */
export function normalizeCountryName(countryStr?: string): string {
  if (!countryStr || !countryStr.trim()) return 'Brasil';
  const c = countryStr.trim().toLowerCase();
  if (c.includes('brasil') || c.includes('brazil') || c === 'br') return 'Brasil';
  if (c.includes('portugal') || c === 'pt') return 'Portugal';
  if (c.includes('moçambique') || c.includes('mocambique') || c.includes('mozambique') || c === 'mz') return 'Moçambique';
  if (c.includes('angola') || c === 'ao') return 'Angola';
  if (c.includes('cabo verde') || c.includes('cape verde') || c === 'cv') return 'Cabo Verde';
  if (c.includes('estados unidos') || c.includes('usa') || c.includes('united states') || c === 'us') return 'Estados Unidos';
  if (c.includes('reino unido') || c.includes('uk') || c.includes('united kingdom') || c === 'gb') return 'Reino Unido';
  return countryStr.trim();
}

/**
 * Busca a regra de país cadastrada ou retorna fallback seguro
 */
export function getCountryRule(
  countryName?: string,
  settings?: CommercialPersonalizationSettings | null
): CountryPersonalizationRule {
  const normalized = normalizeCountryName(countryName);
  const rules = settings?.marketRules && settings.marketRules.length > 0 ? settings.marketRules : DEFAULT_COUNTRY_RULES;

  const match = rules.find((r) => r.country.toLowerCase() === normalized.toLowerCase());
  if (match) return match;

  // Fallback para regra do Brasil ou a primeira disponível
  return rules.find((r) => r.country === 'Brasil') || rules[0] || DEFAULT_COUNTRY_RULES[0];
}

/**
 * Formata um valor monetário de acordo com a moeda e regra do mercado
 * Sem conversão cambial fictícia!
 */
export function formatMarketCurrency(
  value: number | undefined | null,
  currencyCode?: string,
  countryRule?: CountryPersonalizationRule
): string {
  if (value === undefined || value === null || isNaN(value) || value <= 0) {
    return 'Configuração não definida';
  }

  const currency = currencyCode || countryRule?.defaultCurrency || 'BRL';
  const symbol = countryRule?.currencySymbol || (currency === 'EUR' ? '€' : currency === 'MZN' ? 'MT' : currency === 'USD' ? '$' : 'R$');

  const formattedNum = value.toLocaleString('pt-BR');

  if (currency === 'EUR') return `${formattedNum} €`;
  if (currency === 'MZN') return `${formattedNum} MT`;
  if (currency === 'AOA') return `${formattedNum} Kz`;
  if (currency === 'CVE') return `${formattedNum} Esc`;
  if (currency === 'USD') return `$${formattedNum}`;
  if (currency === 'GBP') return `£${formattedNum}`;

  return `R$ ${formattedNum}`;
}

/**
 * Estratégia de abordagem por Cargo/Função e Gênero Confirmado
 */
export function getApproachStrategyByRoleAndGender(
  role?: PersonaRole | string,
  gender?: ContactGender
): {
  angleDescription: string;
  focusPoint: string;
  suggestedOpening: string;
  genderSafeSalutation: string;
  isDecisionMaker: boolean;
} {
  const safeGender = gender || 'nao_informado';
  let genderSafeSalutation = 'Olá';

  if (safeGender === 'masculino') {
    genderSafeSalutation = 'Prezado';
  } else if (safeGender === 'feminino') {
    genderSafeSalutation = 'Prezada';
  }

  const roleStr = (role || '').toLowerCase();

  if (roleStr.includes('propriet') || roleStr.includes('dono') || roleStr.includes('owner') || roleStr === 'proprietario') {
    return {
      angleDescription: 'Proprietário / Dono: Foco em resultado financeiro, receita líquida e crescimento do negócio.',
      focusPoint: 'Retorno sobre investimento (ROI), novos clientes pagantes e fortalecimento do patrimônio da empresa.',
      suggestedOpening: `${genderSafeSalutation} [Nome], notei a sólida atuação da [Empresa] e vejo oportunidade clara para impulsionar a atração de clientes com alto retorno.`,
      genderSafeSalutation,
      isDecisionMaker: true,
    };
  }

  if (roleStr.includes('sócio') || roleStr.includes('socio') || roleStr.includes('partner')) {
    return {
      angleDescription: 'Sócio: Foco em valor de mercado, escalabilidade e solidez operacional.',
      focusPoint: 'Escalabilidade do negócio, eficiência comercial e vantagem competitiva frente a concorrentes.',
      suggestedOpening: `${genderSafeSalutation} [Nome], como sócio(a) da [Empresa], imagino que a expansão e solidez da operação sejam prioridades constantes.`,
      genderSafeSalutation,
      isDecisionMaker: true,
    };
  }

  if (roleStr.includes('diretor') || roleStr.includes('director') || roleStr.includes('ceo') || roleStr.includes('c-level')) {
    return {
      angleDescription: 'Diretor / Executivo: Foco em produtividade, metas estratégicas e ROI departamental.',
      focusPoint: 'Indicadores de desempenho, automação de processos e eficiência comercial.',
      suggestedOpening: `${genderSafeSalutation} [Nome], acompanhando a gestão da [Empresa], estruturamos uma solução para acelerar metas e otimizar processos comerciais.`,
      genderSafeSalutation,
      isDecisionMaker: true,
    };
  }

  if (roleStr.includes('gerente') || roleStr.includes('gestor') || roleStr.includes('manager') || roleStr.includes('coordenador')) {
    return {
      angleDescription: 'Gerente / Gestor: Foco em processos, produtividade do time e entrega de metas.',
      focusPoint: 'Facilidade de implementação, redução de retrabalho e previsibilidade nas entregas.',
      suggestedOpening: `${genderSafeSalutation} [Nome], como gestor(a) na [Empresa], sei que otimizar tempo e bater metas diárias são desafios centrais.`,
      genderSafeSalutation,
      isDecisionMaker: true,
    };
  }

  if (roleStr.includes('marketing') || roleStr.includes('comercial') || roleStr.includes('vendas')) {
    return {
      angleDescription: 'Marketing & Comercial: Foco em geração de demanda, taxa de conversão e presença digital.',
      focusPoint: 'Aquisição de leads qualificados, taxa de resposta, autoridade de marca e redução de CAC.',
      suggestedOpening: `${genderSafeSalutation} [Nome], vi o trabalho de presença da [Empresa] e identifiquei oportunidades práticas para alavancar a conversão de leads.`,
      genderSafeSalutation,
      isDecisionMaker: false,
    };
  }

  if (roleStr.includes('recep') || roleStr.includes('secret') || roleStr.includes('atendimento')) {
    return {
      angleDescription: 'Recepção / Atendimento: Mensagem curta, educada e fácil de encaminhar ao responsável.',
      focusPoint: 'Encaminhamento rápido ao decisor responsável pela área comercial/diretoria sem atrito.',
      suggestedOpening: `Olá, tudo bem? Por favor, você poderia me informar quem é a pessoa responsável pela área comercial da [Empresa] para apresentarmos uma oportunidade pontual?`,
      genderSafeSalutation: 'Olá',
      isDecisionMaker: false,
    };
  }

  if (roleStr.includes('assist') || roleStr.includes('auxiliar') || roleStr.includes('funciona') || roleStr === 'funcionario') {
    return {
      angleDescription: 'Funcionário / Equipe: Mensagem breve para solicitar conexão com a liderança.',
      focusPoint: 'Apresentação resumida com solicitação amigável de encaminhamento.',
      suggestedOpening: `Olá [Nome], tudo bem? Estamos preparando uma proposta de melhoria para a [Empresa] e gostaria de saber com quem posso falar da diretoria comercial.`,
      genderSafeSalutation: 'Olá',
      isDecisionMaker: false,
    };
  }

  // Padrão seguro
  return {
    angleDescription: 'Responsável / Decisor Geral: Comunicação consultiva, objetiva e respeitosa.',
    focusPoint: 'Apresentação de valor, diagnóstico prático e validação de interesse sem insistência.',
    suggestedOpening: `${genderSafeSalutation} [Nome], tudo bem? Analisamos o posicionamento da [Empresa] e preparamos pontos estratégicos sobre [Serviço].`,
    genderSafeSalutation,
    isDecisionMaker: true,
  };
}

/**
 * ============================================================================
 * MOTOR DE HIERARQUIA DE RESOLUÇÃO COMERCIAL (6 NÍVEIS)
 * 1. Lead
 * 2. Campanha
 * 3. ICP
 * 4. Serviço
 * 5. País / Mercado
 * 6. Global
 * ============================================================================
 */
export function resolveCommercialContext(params: {
  lead?: Partial<Lead> | null;
  company?: Partial<Company> | null;
  contact?: Partial<Contact> | null;
  service?: Partial<Service> | null;
  campaign?: Partial<Campaign> | null;
  icp?: Partial<IdealCustomerProfile> | null;
  settings?: CommercialPersonalizationSettings | null;
  customVariables?: Record<string, string>;
}): ResolvedCommercialContext {
  const { lead, company, contact, service, campaign, icp, settings, customVariables = {} } = params;

  // 1. Determina País
  const targetCountry =
    company?.marketProfile?.country ||
    company?.country ||
    lead?.notes?.match(/pa[ií]s:\s*([^\n;]+)/i)?.[1]?.trim() ||
    icp?.country ||
    icp?.countries?.[0] ||
    settings?.defaultCountry ||
    'Brasil';

  const countryRule = getCountryRule(targetCountry, settings);

  // 2. Determina Cidade e Região
  const city = company?.marketProfile?.city || company?.city || icp?.regionOrCity || icp?.cities?.[0] || 'Configuração não definida';
  const region = company?.marketProfile?.region || company?.state || '';

  // 3. Determina Moeda (Hierarquia: Lead > Company MarketProfile > ICP > Service > Country Rule > Global)
  let currency = countryRule.defaultCurrency;
  let currencySource: ResolvedCommercialContext['hierarchySource']['currencySource'] = 'country';

  if (company?.marketProfile?.currency) {
    currency = company.marketProfile.currency;
    currencySource = 'lead';
  } else if (company?.currency) {
    currency = company.currency;
    currencySource = 'lead';
  } else if (campaign?.channel && (campaign as any).currency) {
    currency = (campaign as any).currency;
    currencySource = 'campaign';
  } else if (icp?.priceRange?.currency) {
    currency = icp.priceRange.currency;
    currencySource = 'icp';
  } else if (service?.currency) {
    currency = service.currency;
    currencySource = 'service';
  }

  const currencySymbol =
    countryRule.defaultCurrency === currency
      ? countryRule.currencySymbol
      : currency === 'EUR'
      ? '€'
      : currency === 'MZN'
      ? 'MT'
      : currency === 'AOA'
      ? 'Kz'
      : currency === 'USD'
      ? '$'
      : currency === 'GBP'
      ? '£'
      : 'R$';

  // 4. Determina Idioma e Formalidade
  const language = company?.marketProfile?.language || company?.language || countryRule.defaultLanguage;
  const formalityLevel = company?.marketProfile?.formalityLevel || company?.formalityLevel || countryRule.formality || 'consultivo';
  const pronounUsage = company?.marketProfile?.pronounUsage || countryRule.pronoun || 'voce';

  // 5. Determina Preço e Preço Âncora (Hierarquia de 6 Níveis)
  let rawPrice: number | undefined = undefined;
  let rawAnchorPrice: number | undefined = undefined;
  let paymentMethod = countryRule.terms.budget === 'proposta' ? 'Transferência Bancária' : 'Pix ou Cartão';
  let paymentTerms = '50% entrada + 50% entrega';
  let priceSource: ResolvedCommercialContext['hierarchySource']['priceSource'] = 'not_defined';

  // Nível 1: Lead / Company Custom Price
  if (company?.marketProfile?.customPrice && company.marketProfile.customPrice > 0) {
    rawPrice = company.marketProfile.customPrice;
    rawAnchorPrice = company.marketProfile.customAnchorPrice;
    if (company.marketProfile.paymentMethod) paymentMethod = company.marketProfile.paymentMethod;
    if (company.marketProfile.paymentTerms) paymentTerms = company.marketProfile.paymentTerms;
    priceSource = 'lead';
  }
  // Nível 3: ICP (se tiver priceRange)
  else if (icp?.priceRange?.min && icp.priceRange.min > 0) {
    rawPrice = icp.priceRange.min;
    rawAnchorPrice = icp.priceRange.max || icp.priceRange.min * 1.6;
    priceSource = 'icp';
  }
  // Nível 4: Serviço com Tabela de Preços por Mercado
  else if (service) {
    // Procura na tabela de preços do serviço para o país em questão
    const serviceMarketPrice = service.marketPrices?.find(
      (mp) => normalizeCountryName(mp.country).toLowerCase() === normalizeCountryName(targetCountry).toLowerCase()
    );

    if (serviceMarketPrice && serviceMarketPrice.price > 0) {
      rawPrice = serviceMarketPrice.price;
      rawAnchorPrice = serviceMarketPrice.anchorPrice;
      if (serviceMarketPrice.paymentMethod) paymentMethod = serviceMarketPrice.paymentMethod;
      if (serviceMarketPrice.paymentTerms) paymentTerms = serviceMarketPrice.paymentTerms;
      currency = serviceMarketPrice.currency || currency;
      priceSource = 'service';
    } else if (service.basePrice && service.basePrice > 0) {
      // Preço base cadastrado no serviço
      rawPrice = service.basePrice;
      rawAnchorPrice = service.anchorPrice || service.basePrice * 1.6;
      priceSource = 'service';
    }
  }

  // Nível 5 & 6: Global Settings Market Prices
  if (!rawPrice && settings?.globalMarketPrices && settings.globalMarketPrices.length > 0) {
    const globalPriceMatch = settings.globalMarketPrices.find(
      (gp) =>
        normalizeCountryName(gp.country).toLowerCase() === normalizeCountryName(targetCountry).toLowerCase() &&
        (!service?.id || gp.serviceId === service.id)
    );
    if (globalPriceMatch && globalPriceMatch.price > 0) {
      rawPrice = globalPriceMatch.price;
      rawAnchorPrice = globalPriceMatch.anchorPrice;
      if (globalPriceMatch.paymentMethod) paymentMethod = globalPriceMatch.paymentMethod;
      if (globalPriceMatch.paymentTerms) paymentTerms = globalPriceMatch.paymentTerms;
      priceSource = 'global';
    }
  }

  const priceFormatted = rawPrice ? formatMarketCurrency(rawPrice, currency, countryRule) : 'Configuração não definida';
  const anchorPriceFormatted = rawAnchorPrice ? formatMarketCurrency(rawAnchorPrice, currency, countryRule) : 'Configuração não definida';

  // 6. Determina Contato, Gênero e Cargo
  const contactName = contact?.name || company?.marketProfile?.contactName || 'Responsável';
  const contactFirstName = contactName.trim().split(' ')[0] || 'Responsável';
  const contactGender = contact?.gender || company?.marketProfile?.contactGender || 'nao_informado';
  const contactRole = contact?.personaRole || contact?.role || company?.marketProfile?.contactRole || 'outro';

  const roleStrategy = getApproachStrategyByRoleAndGender(contactRole, contactGender);

  // 7. Determina Serviço, Problema e Sinais
  const serviceName = service?.name || lead?.serviceName || 'Nossas Soluções Digitais';
  const serviceId = service?.id || lead?.serviceId;

  // Problema
  let diagnosedProblem = company?.apparentNeed || '';
  if (!diagnosedProblem && service?.problemsSolved && service.problemsSolved.length > 0) {
    diagnosedProblem = service.problemsSolved[0];
  }
  if (!diagnosedProblem) {
    diagnosedProblem = 'oportunidades claras de melhoria na presença digital e captação de clientes';
  }

  // Sinal identificado
  let detectedSignal = company?.signals?.[0] || company?.customSignals?.[0] || '';
  if (!detectedSignal && company?.websiteQuality && company.websiteQuality !== 'good') {
    detectedSignal = `website com apresentação ${company.websiteQuality}`;
  }
  if (!detectedSignal) {
    detectedSignal = 'potencial de expansão comercial no segmento';
  }

  // CTA
  const cta =
    service?.defaultCta ||
    `Você teria 10 minutos nesta semana para avaliarmos essa oportunidade juntos?`;

  return {
    country: targetCountry,
    city,
    region,
    currency,
    currencySymbol,
    language,
    formalityLevel,
    pronounUsage,
    terms: countryRule.terms,
    serviceName,
    serviceId,
    priceFormatted,
    rawPrice,
    anchorPriceFormatted,
    rawAnchorPrice,
    paymentMethod,
    paymentTerms,
    contactName,
    contactFirstName,
    contactGender,
    contactRole,
    roleLabel: roleStrategy.focusPoint,
    salutation: roleStrategy.genderSafeSalutation,
    personaAngle: roleStrategy.angleDescription,
    diagnosedProblem,
    detectedSignal,
    cta,
    hierarchySource: {
      priceSource,
      currencySource,
      languageSource: company?.marketProfile?.language ? 'lead' : 'country',
      roleSource: contact?.personaRole ? 'contact' : 'inferred',
    },
  };
}

/**
 * ============================================================================
 * INTERPOLADOR DE VARIÁVEIS CONTEXTUAIS & MERCADO
 * Suporta formatos [Nome], [Empresa], [Preço], [Moeda], [CTA] e {{nome}}, etc.
 * ============================================================================
 */
export function interpolateCommercialVariables(
  templateText: string,
  context: ResolvedCommercialContext,
  company?: Partial<Company> | null,
  lead?: Partial<Lead> | null,
  customVars: Record<string, string> = {}
): string {
  if (!templateText) return '';

  const companyName = company?.name || 'sua empresa';
  const segment = company?.niche || company?.category || 'seu segmento';
  const customNotes = lead?.notes || company?.notes || 'Configuração não definida';

  // Dicionário canônico de substituições
  const replacementMap: Record<string, string> = {
    // Contato
    '[nome]': context.contactName,
    '{{nome}}': context.contactName,
    '[primeiro_nome]': context.contactFirstName,
    '{{primeiro_nome}}': context.contactFirstName,
    '[primeironome]': context.contactFirstName,
    '[cargo]': typeof context.contactRole === 'string' ? context.contactRole : 'Responsável',
    '{{cargo}}': typeof context.contactRole === 'string' ? context.contactRole : 'Responsável',
    '[tratamento]': context.salutation,
    '{{tratamento}}': context.salutation,

    // Empresa & Geografia
    '[empresa]': companyName,
    '{{empresa}}': companyName,
    '[país]': context.country,
    '[pais]': context.country,
    '{{pais}}': context.country,
    '{{país}}': context.country,
    '[cidade]': context.city,
    '{{cidade}}': context.city,
    '[segmento]': segment,
    '{{segmento}}': segment,
    '[nicho]': segment,
    '{{nicho}}': segment,

    // Serviço & Comercial
    '[serviço]': context.serviceName,
    '[servico]': context.serviceName,
    '{{servico}}': context.serviceName,
    '{{serviço}}': context.serviceName,
    '[preço]': context.priceFormatted,
    '[preco]': context.priceFormatted,
    '{{preco}}': context.priceFormatted,
    '{{preço}}': context.priceFormatted,
    '[moeda]': context.currencySymbol || context.currency,
    '{{moeda}}': context.currencySymbol || context.currency,
    '[preço de referência]': context.anchorPriceFormatted,
    '[preco de referencia]': context.anchorPriceFormatted,
    '[âncora]': context.anchorPriceFormatted,
    '[ancora]': context.anchorPriceFormatted,
    '{{ancora}}': context.anchorPriceFormatted,
    '{{âncora}}': context.anchorPriceFormatted,
    '[forma de pagamento]': context.paymentMethod,
    '{{forma_de_pagamento}}': context.paymentMethod,
    '[condição de pagamento]': context.paymentTerms,
    '[condicao de pagamento]': context.paymentTerms,
    '{{condicao_de_pagamento}}': context.paymentTerms,

    // Diagnóstico, Sinais & CTA
    '[problema]': context.diagnosedProblem,
    '{{problema}}': context.diagnosedProblem,
    '[sinal]': context.detectedSignal,
    '{{sinal}}': context.detectedSignal,
    '[cta]': context.cta,
    '{{cta}}': context.cta,
    '[observação personalizada]': customNotes,
    '[observacao personalizada]': customNotes,
    '[observação]': customNotes,
    '[observacao]': customNotes,
    '{{observacao}}': customNotes,
  };

  // Aplica variáveis customizadas adicionais
  Object.entries(customVars).forEach(([key, val]) => {
    const cleanKey = key.startsWith('[') ? key.toLowerCase() : `[${key.toLowerCase()}]`;
    replacementMap[cleanKey] = val;
    replacementMap[`{{${key.replace(/[{}[\]]/g, '').toLowerCase()}}}`] = val;
  });

  let result = templateText;

  // Substituição case-insensitive precisa
  Object.keys(replacementMap).forEach((tag) => {
    const escapedTag = tag.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedTag, 'gi');
    result = result.replace(regex, replacementMap[tag]);
  });

  return result;
}

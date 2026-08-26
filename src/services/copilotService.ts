import {
  Company,
  Contact,
  Lead,
  Service,
  Campaign,
  HistoryEvent,
  CopilotActionType,
  CopilotLeadContext,
  CopilotRequest,
  CopilotResult,
} from '../types';

/**
 * Constrói o contexto padronizado e auditável do prospect para o Copiloto
 */
export function buildCopilotLeadContext(params: {
  company?: Company;
  contact?: Contact;
  lead?: Lead;
  service?: Service;
  campaign?: Campaign;
  recentEvents?: HistoryEvent[];
}): CopilotLeadContext {
  const { company, contact, lead, service, campaign, recentEvents } = params;

  return {
    companyName: company?.name || lead?.companyId || 'Empresa Prospectada',
    niche: company?.niche,
    city: company?.city,
    country: company?.country,
    website: company?.website,
    websiteQuality: company?.websiteQuality,
    unitsCount: company?.unitsCount || company?.numberOfUnits,
    apparentNeed: company?.apparentNeed,
    notes: [company?.notes, lead?.notes].filter(Boolean).join(' | '),
    contactName: contact?.name,
    contactRole: contact?.role,
    contactPhone: contact?.phone,
    contactWhatsapp: contact?.whatsapp,
    contactEmail: contact?.email,
    stage: lead?.stage,
    temperature: lead?.temperature,
    priority: lead?.priority,
    score: lead?.score,
    serviceName: service?.name,
    serviceDescription: service?.description,
    serviceBenefits: service?.benefits,
    serviceProblemsSolved: service?.problemsSolved,
    campaignName: campaign?.name,
    campaignObjective: campaign?.objective,
    recentInteractions: (recentEvents || []).slice(0, 5).map((e) => ({
      type: e.type,
      title: e.title,
      description: e.description,
      timestamp: e.timestamp,
    })),
  };
}

/**
 * Heurísticas offline para garantir funcionamento contínuo mesmo sem conexão ou API
 */
function generateOfflineFallback(request: CopilotRequest): CopilotResult {
  const ctx = request.leadContext;
  const factsUsed: string[] = [];
  const inferences: string[] = [];
  const missingData: string[] = [];

  // Fatos
  if (ctx.companyName) factsUsed.push(`Nome da empresa: "${ctx.companyName}"`);
  if (ctx.niche) factsUsed.push(`Nicho de mercado: "${ctx.niche}"`);
  if (ctx.contactName) factsUsed.push(`Nome do contacto: "${ctx.contactName}"`);
  if (ctx.contactRole) factsUsed.push(`Cargo do contacto: "${ctx.contactRole}"`);
  if (ctx.city) factsUsed.push(`Localização: "${ctx.city}"`);
  if (ctx.serviceName) factsUsed.push(`Serviço foco: "${ctx.serviceName}"`);
  if (ctx.website) factsUsed.push(`Website informado: "${ctx.website}"`);
  if (ctx.apparentNeed) factsUsed.push(`Necessidade anotada: "${ctx.apparentNeed}"`);

  // Dados Ausentes
  if (!ctx.website) missingData.push('Website ou presença online oficial não cadastrada');
  if (!ctx.contactRole) missingData.push('Cargo de tomada de decisão não especificado');
  if (!ctx.contactWhatsapp && !ctx.contactPhone) missingData.push('Telefone / WhatsApp direto não registrado');
  if (!ctx.apparentNeed && !ctx.notes) missingData.push('Histórico de dores ou notas específicas ausentes');

  // Inferências
  if (ctx.niche) {
    inferences.push(`Empresas do nicho de ${ctx.niche} tipicamente buscam previsibilidade e novos clientes qualificados.`);
  }
  if (ctx.unitsCount && ctx.unitsCount > 1) {
    inferences.push(`Por possuir ${ctx.unitsCount} unidades, a operação exige padronização e processos robustos.`);
  }

  const contactGreeting = ctx.contactName ? `Olá, ${ctx.contactName}` : `Olá equipe da ${ctx.companyName}`;
  const serviceMention = ctx.serviceName ? ` sobre ${ctx.serviceName}` : '';

  let resultText = '';
  let alternatives: string[] = [];
  let intentClassification: string | undefined;
  let sentiment: string | undefined;
  let recommendedService = ctx.serviceName;
  let nextActionSuggestion = '';

  switch (request.actionType) {
    case 'PERSONALIZAR':
      resultText = `${contactGreeting}, tudo bem?\n\nAcompanhei a actuação da ${ctx.companyName}${ctx.niche ? ` no sector de ${ctx.niche}` : ''} e notei uma grande oportunidade de potencializar seus resultados comerciais${serviceMention}.\n\nPodemos trocar 5 minutos de ideias nesta semana para apresentar um diagnóstico prático?`;
      alternatives = [
        `${contactGreeting}! Vi a ${ctx.companyName} em ${ctx.city || 'actuação'} e preparei 3 pontos práticos para acelerar sua geração de demanda. Terias 5 min na quinta-feira?`,
        `${contactGreeting}, direto ao ponto: estruturamos soluções sob medida para empresas de ${ctx.niche || 'seu segmento'}. Faz sentido avaliarmos uma sinergia?`,
      ];
      break;

    case 'GERAR_FOLLOWUP':
      resultText = `${contactGreeting}, espero que a semana esteja produtiva!\n\nPassando apenas para dar um toque sobre nosso contacto anterior a respeito de ${ctx.serviceName || 'melhorias comerciais para a ' + ctx.companyName}.\n\nConseguiu dar uma olhada no ponto que comentei? Fico à disposição para uma rápida conversa.`;
      alternatives = [
        `${contactGreeting}, sei que a rotina na ${ctx.companyName} é intensa. Gostaria de retomar nossa conversa sobre ${ctx.serviceName || 'otimização de processos'}. Qual o melhor dia para nos falarmos?`,
        `${contactGreeting}, algum avanço sobre a oportunidade que conversamos? Se fizer sentido, reservo 10 min no seu calendário amanhã.`,
      ];
      nextActionSuggestion = 'Aguardar 48h. Se não houver retorno, enviar prova social ou caso de sucesso.';
      break;

    case 'ANALISAR_RESPOSTA': {
      const resp = (request.inputMessage || request.options?.prospectResponse || '').toLowerCase();
      if (resp.includes('preço') || resp.includes('caro') || resp.includes('orçamento')) {
        intentClassification = 'Objeção de Preço / Custo';
        sentiment = 'Objeção';
        resultText = `${contactGreeting}, compreendo perfeitamente a preocupação com investimento. Nosso modelo é desenhado para gerar ROI já nas primeiras semanas. Que tal alinharmos um escopo enxuto para validar o retorno?`;
      } else if (resp.includes('não') || resp.includes('momento') || resp.includes('sem interesse')) {
        intentClassification = 'Objeção de Timing / Sem Interesse Imediato';
        sentiment = 'Negativo';
        resultText = `${contactGreeting}, muito obrigado pela transparência! Vou respeitar o seu momento. Posso entrar em contacto daqui a 60 dias para saber como estão as metas da ${ctx.companyName}?`;
      } else if (resp.includes('sim') || resp.includes('tenho interesse') || resp.includes('apresentação') || resp.includes('reunião')) {
        intentClassification = 'Interesse / Pedido de Reunião';
        sentiment = 'Positivo';
        resultText = `Excelente, ${ctx.contactName || 'parceiro'}! Tenho disponibilidade na próxima terça às 10h ou quinta às 15h. Qual horário fica mais conveniente para você?`;
      } else {
        intentClassification = 'Dúvida Geral / Pedido de Informações';
        sentiment = 'Neutro';
        resultText = `${contactGreeting}, com certeza! Nossa solução atende exatamente as necessidades de ${ctx.niche || 'operações como a sua'}. Posso te enviar um resumo de 2 minutos em PDF ou prefere um rápido áudio?`;
      }
      nextActionSuggestion = 'Registrar interação no histórico e agendar follow-up conforme resposta.';
      break;
    }

    case 'SUGERIR_SERVICO':
      resultText = `Com base no perfil da ${ctx.companyName} (${ctx.niche || 'Nicho geral'}), o serviço mais recomendado é "${ctx.serviceName || 'Diagnóstico e Estruturação Comercial'}".\n\nMotivo: Atende diretamente a necessidade de estruturação e captação de clientes sem exigir infraestrutura pesada prévia.`;
      recommendedService = ctx.serviceName || 'Consultoria Comercial & Prospecção';
      break;

    case 'MELHORAR':
      resultText = (request.inputMessage || '')
        .replace(/Espero que esteja tudo bem/gi, 'Tudo bem?')
        .replace(/Venho por meio desta/gi, 'Directo ao ponto:')
        .trim();
      if (!resultText) {
        resultText = `${contactGreeting}, acompanho os passos da ${ctx.companyName} e vejo potencial imediato para aumentar sua conversão comercial. Terias 5 min para um alinhamento?`;
      }
      alternatives = [
        `Olá! Preparámos uma solução objectiva para a ${ctx.companyName}. Podemos falar brevemente amanhã?`,
      ];
      break;

    case 'RESUMIR':
      resultText = `• Prospect: ${ctx.companyName} (${ctx.city || 'Local não informado'})\n• Contacto Chave: ${ctx.contactName || 'Não especificado'} (${ctx.contactRole || 'Cargo ausente'})\n• Estágio: ${ctx.stage || 'NOVO'}\n• Prioridade: ${ctx.priority || 'Média'} | Score: ${ctx.score ?? '--'}/100\n• Contexto: ${ctx.notes || 'Sem anotações detalhadas.'}`;
      break;

    case 'PROXIMA_ACAO':
      resultText = `Ação recomendada: Realizar contacto via ${ctx.contactWhatsapp ? 'WhatsApp' : 'LinkedIn / Telefone'}.\n\nObjetivo: Apresentar proposta de valor contextualizada e validar quem é o decisor pela área comercial da ${ctx.companyName}.`;
      nextActionSuggestion = 'Enviar mensagem personalizada e registrar no histórico.';
      break;
  }

  return {
    resultText,
    alternatives,
    factsUsed,
    inferences,
    missingData,
    intentClassification,
    sentiment,
    recommendedService,
    nextActionSuggestion,
    isOfflineFallback: true,
  };
}

/**
 * Executa uma ação de Copiloto de Prospecção
 * Comunica com o servidor Gemini e tem fallback automático instantâneo para modo offline
 */
export async function executeCopilotAction(request: CopilotRequest): Promise<CopilotResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const response = await fetch('/api/copilot/action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[Copilot] Servidor retornou ${response.status}. Usando motor heurístico offline.`);
      return generateOfflineFallback(request);
    }

    const payload = await response.json();
    if (payload.success && payload.data) {
      return {
        resultText: payload.data.resultText || '',
        alternatives: payload.data.alternatives || [],
        factsUsed: payload.data.factsUsed || [],
        inferences: payload.data.inferences || [],
        missingData: payload.data.missingData || [],
        intentClassification: payload.data.intentClassification,
        sentiment: payload.data.sentiment,
        identifiedProblems: payload.data.identifiedProblems,
        recommendedService: payload.data.recommendedService,
        nextActionSuggestion: payload.data.nextActionSuggestion,
        recommendedChannel: payload.data.recommendedChannel,
        isOfflineFallback: false,
      };
    }

    return generateOfflineFallback(request);
  } catch (err) {
    console.warn('[Copilot] Erro na requisição ao Gemini. Utilizando fallback local seguro:', err);
    return generateOfflineFallback(request);
  }
}

/**
 * Verifica se a API do Gemini está online e com chave disponível
 */
export async function checkCopilotStatus(): Promise<{ online: boolean; aiAvailable: boolean; model: string }> {
  try {
    const res = await fetch('/api/copilot/status');
    if (!res.ok) throw new Error('Status endpoint offline');
    return await res.json();
  } catch {
    return {
      online: false,
      aiAvailable: false,
      model: 'gemini-3.7-flash',
    };
  }
}

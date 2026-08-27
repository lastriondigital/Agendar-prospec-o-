import {
  Campaign,
  CampaignSequenceStep,
  CampaignType,
  Client,
  Company,
  Contact,
  ContactChannel,
  Lead,
  MessageTemplate,
  ProspectAction,
  ScheduledMessageStatus,
  Service,
} from '../types';
import { ALLOWED_VARIABLES } from './formatting';

/**
 * Tipos de Ação Padrão (Extensível dinamicamente pelos Scripts cadastrados)
 */
export const DEFAULT_ACTION_TYPES: string[] = [
  'Primeiro contato',
  'Apresentação',
  'Follow-up 1',
  'Follow-up 2',
  'Follow-up 3',
  'Quebra de objeção',
  'Oferta',
  'Reativação',
  'Encerramento',
  'Pós-venda',
  'Agendamento de Reunião',
  'Diagnóstico',
  'Envio de Proposta',
];

/**
 * Tipos de Campanha Disponíveis e Extensíveis
 */
export const CAMPAIGN_TYPE_LABELS: Record<string, string> = {
  prospeccao: 'Prospecção',
  follow_up: 'Follow-up',
  reativacao: 'Reativação',
  pos_venda: 'Pós-venda',
  nutricao: 'Nutrição',
  oferta: 'Oferta',
  personalizada: 'Personalizada',
};

export const DEFAULT_CAMPAIGN_TYPES: Array<{ value: CampaignType; label: string; description: string }> = [
  { value: 'prospeccao', label: 'Prospecção', description: 'Atração ativa e primeiro contato com novos leads frios' },
  { value: 'follow_up', label: 'Follow-up', description: 'Acompanhamento estruturado após envio de proposta ou contato inicial' },
  { value: 'reativacao', label: 'Reativação', description: 'Reaquecimento de leads e contatos inativos da base' },
  { value: 'pos_venda', label: 'Pós-venda', description: 'Onboarding, acompanhamento de satisfação e retenção de clientes' },
  { value: 'nutricao', label: 'Nutrição', description: 'Compartilhamento de conteúdo de valor e autoridade contínua' },
  { value: 'oferta', label: 'Oferta', description: 'Condições especiais, lançamentos e campanhas de conversão direta' },
  { value: 'personalizada', label: 'Personalizada', description: 'Campanha com fluxo e objetivos sob medida' },
];

/**
 * Canais de Comunicação Suportados e Extensíveis
 */
export const CHANNEL_OPTIONS: Array<{ value: ContactChannel; label: string; icon: string }> = [
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { value: 'whatsapp_business', label: 'WhatsApp Business', icon: '🏢' },
  { value: 'instagram', label: 'Instagram Direct', icon: '📷' },
  { value: 'email', label: 'E-mail', icon: '✉️' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'call', label: 'Chamada Telefônica', icon: '📞' },
];

/**
 * Normaliza o canal para comparação compatível (ex: whatsapp e whatsapp_business podem ser compatíveis)
 */
export function isChannelCompatible(scriptChannel: ContactChannel, targetChannel: ContactChannel): boolean {
  if (scriptChannel === targetChannel) return true;
  if ((scriptChannel === 'whatsapp' && targetChannel === 'whatsapp_business') ||
      (scriptChannel === 'whatsapp_business' && targetChannel === 'whatsapp')) {
    return true;
  }
  return false;
}

/**
 * Retorna todos os Tipos de Ação disponíveis no sistema:
 * Combina os tipos padrão com qualquer tipo de ação customizado criado em scripts de mensagens.
 */
export function getActionTypes(templates: MessageTemplate[] = []): string[] {
  const dynamicSet = new Set<string>(DEFAULT_ACTION_TYPES);
  templates.forEach((t) => {
    if (t.actionType && t.actionType.trim()) {
      dynamicSet.add(t.actionType.trim());
    }
  });
  return Array.from(dynamicSet);
}

/**
 * Retorna scripts compatíveis filtrados estritamente por Canal e Tipo de Ação.
 */
export function getCompatibleScripts(
  templates: MessageTemplate[] = [],
  filter: {
    channel?: ContactChannel;
    actionType?: string;
    serviceId?: string;
    includeArchived?: boolean;
  }
): MessageTemplate[] {
  return templates.filter((t) => {
    if (!filter.includeArchived && t.isArchived) return false;
    
    // Filtro de canal
    if (filter.channel && !isChannelCompatible(t.channel, filter.channel)) {
      if (t.channels && t.channels.length > 0) {
        const matchesAny = t.channels.some((c) => isChannelCompatible(c, filter.channel!));
        if (!matchesAny) return false;
      } else {
        return false;
      }
    }

    // Filtro de Tipo de Ação
    if (filter.actionType) {
      const scriptAction = t.actionType || t.category || t.type || '';
      if (scriptAction.toLowerCase().trim() !== filter.actionType.toLowerCase().trim()) {
        return false;
      }
    }

    // Filtro opcional por serviço
    if (filter.serviceId && t.serviceId && t.serviceId !== filter.serviceId) {
      // Se o script é específico de outro serviço, filtra; se não tiver serviceId, é genérico (permitido)
      return false;
    }

    return true;
  });
}

/**
 * Formata o intervalo da cadência em texto humano e inteligível em Português.
 * Exemplos:
 * 0 dias + 0 horas = "Imediatamente / Data inicial"
 * 1 dia + 0 horas = "Após 1 dia"
 * 2 dias + 4 horas = "Após 2 dias e 4 horas"
 * 0 dias + 6 horas = "Após 6 horas"
 * 3 dias + 12 horas = "Após 3 dias e 12 horas"
 */
export function formatCadenceInterval(waitDays: number, waitHours: number, waitMinutes: number = 0): string {
  const d = Math.max(0, Number(waitDays) || 0);
  const h = Math.max(0, Number(waitHours) || 0);
  const m = Math.max(0, Number(waitMinutes) || 0);

  if (d === 0 && h === 0 && m === 0) {
    return 'Imediatamente / Data inicial';
  }

  const parts: string[] = [];
  if (d > 0) {
    parts.push(d === 1 ? '1 dia' : `${d} dias`);
  }
  if (h > 0) {
    parts.push(h === 1 ? '1 hora' : `${h} horas`);
  }
  if (m > 0) {
    parts.push(m === 1 ? '1 minuto' : `${m} minutos`);
  }

  return `Aguardar ${parts.join(' e ')}`;
}

/**
 * Converte intervalo de dias, horas e minutos para minutos totais acumulados.
 */
export function calculateIntervalInMinutes(waitDays: number, waitHours: number, waitMinutes: number = 0): number {
  const d = Math.max(0, Number(waitDays) || 0);
  const h = Math.max(0, Number(waitHours) || 0);
  const m = Math.max(0, Number(waitMinutes) || 0);
  return d * 24 * 60 + h * 60 + m;
}

/**
 * Calcula a data e hora de execução com precisão de minutos a partir de uma data/hora base e minutos adicionais.
 */
export function calculateExecutionDateTime(
  baseDateStr: string,
  baseTimeStr: string = '09:00',
  additionalMinutes: number = 0
): { date: string; time: string; formatted: string } {
  const [year, month, day] = (baseDateStr || new Date().toISOString().slice(0, 10)).split('-').map(Number);
  const [hours, minutes] = (baseTimeStr || '09:00').split(':').map(Number);

  const dateObj = new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, 0);
  dateObj.setMinutes(dateObj.getMinutes() + additionalMinutes);

  const pad = (n: number) => String(n).padStart(2, '0');
  const resultDate = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;
  const resultTime = `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;

  const formatted = `${pad(dateObj.getDate())}/${pad(dateObj.getMonth() + 1)}/${dateObj.getFullYear()} às ${resultTime}`;

  return {
    date: resultDate,
    time: resultTime,
    formatted,
  };
}

export interface CalculatedCadenceStep extends CampaignSequenceStep {
  cumulativeMinutes: number;
  calculatedDate: string;
  calculatedTime: string;
  formattedDateTime: string;
  intervalLabel: string;
  scriptDetails?: MessageTemplate;
}

/**
 * Calcula a linha do tempo completa da cadência com todas as datas aproximadas calculadas.
 */
export function calculateCadenceTimeline(
  steps: CampaignSequenceStep[] = [],
  startDate: string = new Date().toISOString().slice(0, 10),
  startTime: string = '09:00',
  templates: MessageTemplate[] = []
): CalculatedCadenceStep[] {
  let cumulativeMinutes = 0;

  return steps.map((step, index) => {
    const stepWaitMinutes = calculateIntervalInMinutes(step.waitDays || 0, step.waitHours || 0, step.waitMinutes || 0);
    cumulativeMinutes += stepWaitMinutes;

    const { date, time, formatted } = calculateExecutionDateTime(startDate, startTime, cumulativeMinutes);
    const intervalLabel = formatCadenceInterval(step.waitDays || 0, step.waitHours || 0, step.waitMinutes || 0);
    const scriptDetails = step.templateId ? templates.find((t) => t.id === step.templateId) : undefined;

    return {
      ...step,
      order: index + 1,
      cumulativeMinutes,
      calculatedDate: date,
      calculatedTime: time,
      formattedDateTime: formatted,
      intervalLabel,
      scriptDetails,
    };
  });
}

/**
 * Resolve todas as variáveis dinâmicas de um script usando os dados reais de um Prospect / Cliente.
 * Se uma variável não tiver valor preenchido no cadastro, identifica claramente sem substituições silenciosas incorretas.
 */
export function resolveVariablesDetailed(
  content: string,
  context: {
    client?: Partial<Client> | null;
    company?: Partial<Company> | null;
    contact?: Partial<Contact> | null;
    service?: Partial<Service> | null;
    scheduledDate?: string;
    scheduledTime?: string;
  }
): {
  resolvedText: string;
  missingVariables: string[];
  warnings: string[];
  resolvedVariablesMap: Record<string, string>;
} {
  if (!content) {
    return { resolvedText: '', missingVariables: [], warnings: [], resolvedVariablesMap: {} };
  }

  const contactName = context.contact?.name || context.client?.name || '';
  const firstName = contactName ? contactName.trim().split(' ')[0] : '';
  const companyName = context.company?.name || context.client?.company || '';
  const role = context.contact?.role || context.client?.role || '';
  const city = context.company?.city || context.client?.segment || '';
  const country = context.company?.country || 'Brasil';
  const niche = context.company?.niche || context.client?.segment || '';
  const serviceName = context.service?.name || '';
  const problem = context.company?.apparentNeed || context.service?.problemsSolved?.[0] || '';
  const benefit = context.service?.benefits?.[0] || '';
  const price = context.service?.basePrice
    ? `${context.service.currency || 'R$'} ${context.service.basePrice.toLocaleString('pt-BR')}`
    : '';
  const cta = context.service?.defaultCta || '';
  const phone = context.contact?.whatsapp || context.contact?.phone || context.company?.companyWhatsApp || context.company?.companyPhone || '';

  // Data e hora formatada
  const dateFormatted = context.scheduledDate
    ? (() => {
        const [y, m, d] = context.scheduledDate.split('-');
        return d && m && y ? `${d}/${m}/${y}` : context.scheduledDate;
      })()
    : new Date().toLocaleDateString('pt-BR');
  const timeFormatted = context.scheduledTime || '09:00';

  const variablesMap: Record<string, string> = {
    nome: contactName,
    primeiro_nome: firstName,
    empresa: companyName,
    cidade: city,
    pais: country,
    nicho: niche,
    servico: serviceName,
    problema: problem,
    beneficio: benefit,
    preco: price,
    cta: cta,
    cargo: role,
    telefone: phone,
    whatsapp: phone,
    data: dateFormatted,
    hora: timeFormatted,
  };

  const matches = content.match(/\{\{([^}]+)\}\}/g) || [];
  const usedVars = Array.from(new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '').trim())));

  const missingVariables: string[] = [];
  const warnings: string[] = [];

  let resolvedText = content;

  for (const v of usedVars) {
    const rawVal = variablesMap[v];
    const isVariableKnown = ALLOWED_VARIABLES.includes(v) || ['telefone', 'whatsapp', 'data', 'hora'].includes(v);

    if (!isVariableKnown) {
      warnings.push(`Variável {{${v}}} não reconhecida pelo sistema.`);
    }

    if (!rawVal || rawVal.trim() === '') {
      missingVariables.push(v);
      // Mantém um placeholder amigável ou destaca para o usuário preencher
      resolvedText = resolvedText.replaceAll(`{{${v}}}`, `[Sem ${v} preenchido]`);
    } else {
      resolvedText = resolvedText.replaceAll(`{{${v}}}`, rawVal);
    }
  }

  if (missingVariables.length > 0) {
    warnings.push(`Variáveis sem dados no cadastro: ${missingVariables.map((v) => `{{${v}}}`).join(', ')}`);
  }

  return {
    resolvedText,
    missingVariables,
    warnings,
    resolvedVariablesMap: variablesMap,
  };
}

/**
 * Aplica uma cadência de campanha a um prospect/lead gerando as mensagens agendadas individuais
 * preservando referências completas: campaignId, cadenceStepId, templateId, actionType, channel, etc.
 */
export function generateScheduledMessagesFromCadence(params: {
  campaign: Campaign;
  lead: Lead;
  company?: Company | null;
  contact?: Contact | null;
  service?: Service | null;
  templates: MessageTemplate[];
  startDate?: string;
  startTime?: string;
}): ProspectAction[] {
  const { campaign, lead, company, contact, service, templates, startDate, startTime } = params;
  const sequence = campaign.sequence || [];

  if (sequence.length === 0) return [];

  const timeline = calculateCadenceTimeline(
    sequence,
    startDate || campaign.startDate || new Date().toISOString().slice(0, 10),
    startTime || campaign.startTime || '09:00',
    templates
  );

  const scheduledActions: ProspectAction[] = [];
  const nowIso = new Date().toISOString();

  timeline.forEach((step, idx) => {
    const template = step.templateId ? templates.find((t) => t.id === step.templateId) : undefined;
    
    // Resolve o conteúdo da mensagem estritamente com snapshot no momento do agendamento
    const scriptContent = template?.content || '';
    const { resolvedText } = resolveVariablesDetailed(scriptContent, {
      company,
      contact,
      service,
      scheduledDate: step.calculatedDate,
      scheduledTime: step.calculatedTime,
    });

    const action: ProspectAction = {
      id: `act-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
      clientId: lead.id,
      leadId: lead.id,
      companyId: company?.id || lead.companyId,
      contactId: contact?.id || lead.contactId,
      campaignId: campaign.id,
      campaignType: campaign.campaignType || campaign.type || 'prospeccao',
      cadenceId: campaign.id,
      cadenceStepId: step.id,
      templateId: template?.id,
      scriptName: template?.title || step.title || `Etapa ${idx + 1}`,
      actionType: step.actionType || template?.actionType || 'Primeiro contato',
      channel: step.channel || campaign.channel || 'whatsapp',
      scheduledDate: step.calculatedDate,
      scheduledTime: step.calculatedTime,
      status: 'agendada',
      priority: idx === 0 ? 'high' : 'medium',
      estMinutes: 2,
      customMessage: resolvedText || scriptContent,
      originalScriptContent: scriptContent,
      notes: `Gerado pela cadência da campanha "${campaign.name}" (Etapa ${idx + 1})`,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    scheduledActions.push(action);
  });

  return scheduledActions;
}

/**
 * Retorna as propriedades visuais do status de uma mensagem agendada
 */
export function getScheduledStatusBadgeDetails(status?: string): {
  label: string;
  variant: 'emerald' | 'blue' | 'amber' | 'rose' | 'neutral' | 'purple' | 'cyan';
} {
  const norm = (status || 'pendente').toLowerCase();
  switch (norm) {
    case 'agendada':
      return { label: 'Agendada', variant: 'blue' };
    case 'pendente':
    case 'pending':
      return { label: 'Pendente', variant: 'amber' };
    case 'enviada':
      return { label: 'Enviada', variant: 'cyan' };
    case 'concluida':
    case 'completed':
      return { label: 'Concluída', variant: 'emerald' };
    case 'adiada':
    case 'rescheduled':
      return { label: 'Adiada', variant: 'purple' };
    case 'cancelada':
    case 'skipped':
      return { label: 'Cancelada', variant: 'neutral' };
    case 'falhou':
      return { label: 'Falhou', variant: 'rose' };
    default:
      return { label: status || 'Pendente', variant: 'amber' };
  }
}

import {
  CadenceStep,
  Campaign,
  CampaignType,
  Client,
  Company,
  Contact,
  ContactChannel,
  Lead,
  MessageTemplate,
  ProspectAction,
  Service,
} from '../types';
import { cleanPhoneNumberDigits, formatPhoneNumber } from '../utils/formatting';

/**
 * Tipos de ação padrão recomendados para cadências de prospecção
 */
export const STANDARD_ACTION_TYPES = [
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
] as const;

export type StandardActionType = (typeof STANDARD_ACTION_TYPES)[number];

/**
 * Tipos de campanha padrão do PROSPECT OS
 */
export const STANDARD_CAMPAIGN_TYPES: { id: CampaignType; label: string; description: string }[] = [
  { id: 'prospeccao', label: 'Prospecção', description: 'Atração e primeiro contato com novos prospects' },
  { id: 'follow_up', label: 'Follow-up', description: 'Acompanhamento de leads mornos e sem resposta' },
  { id: 'reativacao', label: 'Reativação', description: 'Recontato com contatos antigos ou inativos' },
  { id: 'pos_venda', label: 'Pós-venda', description: 'Onboarding, retenção e satisfação de novos clientes' },
  { id: 'nutricao', label: 'Nutrição', description: 'Envio de conteúdos de valor e autoridade' },
  { id: 'oferta', label: 'Oferta', description: 'Campanhas promocionais ou condições especiais' },
  { id: 'personalizada', label: 'Personalizada', description: 'Estratégia e cadência sob medida' },
];

/**
 * Opções de canais de comunicação com rótulos amigáveis em português
 */
export const COMMUNICATION_CHANNELS: { id: ContactChannel; label: string; icon: string }[] = [
  { id: 'whatsapp', label: 'WhatsApp', icon: 'MessageCircle' },
  { id: 'whatsapp_business', label: 'WhatsApp Business', icon: 'MessageSquare' },
  { id: 'instagram', label: 'Instagram Direct', icon: 'Instagram' },
  { id: 'email', label: 'E-mail', icon: 'Mail' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'Share2' },
  { id: 'call', label: 'Chamada Telefônica', icon: 'Phone' },
];

/**
 * Retorna todos os Tipos de Ação disponíveis no sistema:
 * Extrai dinamicamente de todos os scripts cadastrados + lista padrão
 * Garantindo que a criação de um novo script com novo tipo de ação reflita imediatamente em todo o app!
 */
export function getAllAvailableActionTypes(templates: MessageTemplate[] = []): string[] {
  const dynamicTypes = new Set<string>();

  // 1. Adiciona os padrões
  STANDARD_ACTION_TYPES.forEach((t) => dynamicTypes.add(t));

  // 2. Extrai de todos os templates existentes
  templates.forEach((t) => {
    if (t.actionType && t.actionType.trim()) {
      dynamicTypes.add(t.actionType.trim());
    } else if (t.category) {
      // Mapeia categorias antigas para tipos amigáveis
      const mapped = mapLegacyCategoryToActionType(t.category);
      if (mapped) dynamicTypes.add(mapped);
    }
  });

  return Array.from(dynamicTypes);
}

/**
 * Mapeia categorias legadas para tipos de ação
 */
export function mapLegacyCategoryToActionType(category: string): string {
  switch (category) {
    case 'primeiro_contacto':
      return 'Primeiro contato';
    case 'follow_up':
      return 'Follow-up 1';
    case 'diagnóstico':
      return 'Apresentação';
    case 'prova':
      return 'Apresentação';
    case 'proposta':
      return 'Oferta';
    case 'objeção':
      return 'Quebra de objeção';
    case 'fechamento':
      return 'Encerramento';
    case 'pós_venda':
      return 'Pós-venda';
    case 'reativação':
      return 'Reativação';
    default:
      return category || 'Primeiro contato';
  }
}

/**
 * Retorna o tipo de ação normalizado de um script
 */
export function getScriptActionType(template: MessageTemplate): string {
  if (template.actionType && template.actionType.trim()) {
    return template.actionType.trim();
  }
  return mapLegacyCategoryToActionType(template.category || template.type || 'primeiro_contacto');
}

/**
 * Verifica se um canal de script é compatível com o canal solicitado.
 * Por exemplo: um script 'whatsapp' é compatível com 'whatsapp' e 'whatsapp_business'.
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
 * Filtra scripts compatíveis com base no Canal e no Tipo de Ação
 */
export function getCompatibleScripts(
  templates: MessageTemplate[],
  channel?: ContactChannel,
  actionType?: string
): MessageTemplate[] {
  return templates.filter((tpl) => {
    // Se estiver arquivado, não exibe nos seletores de agendamento ativo
    if (tpl.isArchived) return false;

    // Filtro por canal
    if (channel) {
      const channelMatches = isChannelCompatible(tpl.channel, channel) ||
        (tpl.channels && tpl.channels.some((c) => isChannelCompatible(c, channel)));
      if (!channelMatches) return false;
    }

    // Filtro por tipo de ação
    if (actionType && actionType.trim()) {
      const tplAction = getScriptActionType(tpl);
      if (tplAction.toLowerCase() !== actionType.trim().toLowerCase()) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Formata um intervalo de cadência em texto claro em Português
 * Exemplos:
 * 0 dias + 0 horas = "Imediatamente"
 * 1 dia + 0 horas = "Após 1 dia"
 * 2 dias + 4 horas = "Após 2 dias e 4 horas"
 * 0 dias + 6 horas = "Após 6 horas"
 * 3 dias + 12 horas = "Após 3 dias e 12 horas"
 */
export function formatCadenceInterval(days = 0, hours = 0, minutes = 0): string {
  const parts: string[] = [];

  if (days > 0) {
    parts.push(days === 1 ? '1 dia' : `${days} dias`);
  }

  if (hours > 0) {
    parts.push(hours === 1 ? '1 hora' : `${hours} horas`);
  }

  if (minutes > 0) {
    parts.push(minutes === 1 ? '1 minuto' : `${minutes} minutos`);
  }

  if (parts.length === 0) {
    return 'Imediatamente';
  }

  return `Após ${parts.join(' e ')}`;
}

/**
 * Calcula a duração total em minutos a partir de dias, horas e minutos
 */
export function calculateTotalMinutes(days = 0, hours = 0, minutes = 0): number {
  return Number(days || 0) * 1440 + Number(hours || 0) * 60 + Number(minutes || 0);
}

/**
 * Converte minutos totais de volta em dias, horas e minutos
 */
export function breakdownMinutes(totalMinutes = 0): { days: number; hours: number; minutes: number } {
  const days = Math.floor(totalMinutes / 1440);
  const remainderAfterDays = totalMinutes % 1440;
  const hours = Math.floor(remainderAfterDays / 60);
  const minutes = remainderAfterDays % 60;
  return { days, hours, minutes };
}

/**
 * Calcula a data e hora de execução com base na data inicial e no delay acumulado
 */
export function calculateExecutionDateTime(
  startDateStr: string,
  startTimeStr = '09:00',
  accumulatedMinutes = 0
): { dateStr: string; timeStr: string; formatted: string; isoString: string } {
  const [year, month, day] = startDateStr.split('-').map(Number);
  const [hours, minutes] = startTimeStr.split(':').map(Number);

  const baseDate = new Date(year, (month || 1) - 1, day || 1, hours || 9, minutes || 0, 0);
  const targetDate = new Date(baseDate.getTime() + accumulatedMinutes * 60 * 1000);

  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const d = String(targetDate.getDate()).padStart(2, '0');
  const hh = String(targetDate.getHours()).padStart(2, '0');
  const mm = String(targetDate.getMinutes()).padStart(2, '0');

  const dateStr = `${y}-${m}-${d}`;
  const timeStr = `${hh}:${mm}`;

  const formatted = `${d}/${m}/${y} às ${hh}:${mm}`;

  return {
    dateStr,
    timeStr,
    formatted,
    isoString: targetDate.toISOString(),
  };
}

/**
 * Variáveis suportadas nos scripts de mensagem
 */
export const SUPPORTED_SCRIPT_VARIABLES = [
  { key: 'nome', label: 'Nome do contato / decisor', sample: 'João Silva' },
  { key: 'primeiro_nome', label: 'Primeiro nome', sample: 'João' },
  { key: 'empresa', label: 'Nome da empresa', sample: 'Clínica Alfa' },
  { key: 'cargo', label: 'Cargo do contato', sample: 'Diretor Clínico' },
  { key: 'telefone', label: 'Telefone formatado', sample: '(11) 98765-4321' },
  { key: 'cidade', label: 'Cidade da empresa', sample: 'São Paulo' },
  { key: 'pais', label: 'País', sample: 'Brasil' },
  { key: 'nicho', label: 'Nicho / Ramo de atuação', sample: 'Saúde & Odontologia' },
  { key: 'servico', label: 'Nome do serviço ofertado', sample: 'Landing Page de Alta Conversão' },
  { key: 'problema', label: 'Dor / Problema identificado', sample: 'baixo retorno em anúncios locais' },
  { key: 'beneficio', label: 'Benefício principal', sample: 'dobrar o agendamento de consultas' },
  { key: 'preco', label: 'Preço / Condição', sample: 'R$ 2.500' },
  { key: 'cta', label: 'Chamada para ação (CTA)', sample: 'Podemos conversar 10 minutos esta semana?' },
  { key: 'data', label: 'Data do agendamento', sample: '15/09/2026' },
  { key: 'hora', label: 'Hora do agendamento', sample: '10:30' },
  { key: 'proposta_valor', label: 'Proposta de valor', sample: 'gerar mais vendas com tráfego qualificado' },
];

export interface VariableResolutionResult {
  resolvedText: string;
  detectedVariables: string[];
  missingVariables: { key: string; label: string }[];
  allVariablesResolved: boolean;
}

/**
 * Resolve todas as variáveis dinâmicas de um script com base nos dados do prospect
 */
export function resolveScriptVariables(
  content: string,
  context: {
    company?: Partial<Company> | null;
    contact?: Partial<Contact> | null;
    client?: Partial<Client> | null;
    lead?: Partial<Lead> | null;
    service?: Partial<Service> | null;
    scheduledDate?: string;
    scheduledTime?: string;
  }
): VariableResolutionResult {
  if (!content) {
    return {
      resolvedText: '',
      detectedVariables: [],
      missingVariables: [],
      allVariablesResolved: true,
    };
  }

  // Detecta todas as variáveis {{variavel}} no texto
  const matches = content.match(/\{\{([^}]+)\}\}/g) || [];
  const detectedVariables = Array.from(new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '').trim())));

  const missingVariables: { key: string; label: string }[] = [];

  // Mapeia valores
  const contactName = context.contact?.name || context.client?.name || '';
  const firstName = contactName ? contactName.trim().split(' ')[0] : '';
  const companyName = context.company?.name || context.company?.tradeName || context.client?.company || '';
  const role = context.contact?.role || context.client?.role || '';
  const rawPhone = context.contact?.whatsapp || context.contact?.phone || context.company?.companyWhatsApp || context.company?.companyPhone || context.client?.whatsapp || context.client?.phone || '';
  const phone = formatPhoneNumber(rawPhone);
  const city = context.company?.city || '';
  const country = context.company?.country || 'Brasil';
  const niche = context.company?.niche || context.client?.segment || '';
  const serviceName = context.service?.name || context.lead?.serviceName || '';
  const problem = context.company?.apparentNeed || context.service?.problemsSolved?.[0] || '';
  const benefit = context.service?.benefits?.[0] || '';
  const price = context.service?.basePrice
    ? `${context.service.currency || 'R$'} ${context.service.basePrice.toLocaleString('pt-BR')}`
    : '';
  const cta = context.service?.defaultCta || '';
  const valueProp = context.service?.valueProposition || '';

  // Formata data / hora
  let formattedDate = '';
  if (context.scheduledDate) {
    const [y, m, d] = context.scheduledDate.split('-');
    formattedDate = d && m && y ? `${d}/${m}/${y}` : context.scheduledDate;
  }
  const formattedTime = context.scheduledTime || '';

  const valueMap: Record<string, string> = {
    nome: contactName,
    primeiro_nome: firstName,
    empresa: companyName,
    cargo: role,
    telefone: phone,
    cidade: city,
    pais: country,
    nicho: niche,
    servico: serviceName,
    problema: problem,
    beneficio: benefit,
    preco: price,
    cta: cta,
    proposta_valor: valueProp,
    data: formattedDate,
    hora: formattedTime,
  };

  let resolvedText = content;

  detectedVariables.forEach((variableKey) => {
    const val = valueMap[variableKey];
    const varMeta = SUPPORTED_SCRIPT_VARIABLES.find((v) => v.key === variableKey);
    const label = varMeta ? varMeta.label : variableKey;

    if (!val || val.trim().length === 0) {
      missingVariables.push({ key: variableKey, label });
      // Mantém a tag ou substitui com aviso destacado
    } else {
      resolvedText = resolvedText.replaceAll(`{{${variableKey}}}`, val);
    }
  });

  return {
    resolvedText,
    detectedVariables,
    missingVariables,
    allVariablesResolved: missingVariables.length === 0,
  };
}

/**
 * Cria ações de agendamento a partir da cadência de uma campanha para um prospect
 */
export function generateCadenceActionsForProspect(
  campaign: Campaign,
  cadenceSteps: CadenceStep[],
  prospect: {
    companyId: string;
    contactId?: string;
    leadId?: string;
    clientId?: string;
    company?: Company;
    contact?: Contact;
    client?: Client;
    service?: Service;
  },
  templates: MessageTemplate[],
  options: {
    startDateStr: string;
    startTimeStr?: string;
    priority?: 'high' | 'medium' | 'low';
    estMinutesPerAction?: number;
  }
): ProspectAction[] {
  const actions: ProspectAction[] = [];
  const now = new Date().toISOString();
  let accumulatedMinutes = 0;

  // Ordena as etapas pela numeração ou índice
  const sortedSteps = [...cadenceSteps].sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0));

  sortedSteps.forEach((step, index) => {
    // Calcula o delay desta etapa
    const stepDelayMinutes = step.totalDelayMinutes !== undefined
      ? step.totalDelayMinutes
      : calculateTotalMinutes(step.delayDays || 0, step.delayHours || 0, step.delayMinutes || 0);

    accumulatedMinutes += stepDelayMinutes;

    const { dateStr, timeStr } = calculateExecutionDateTime(
      options.startDateStr,
      options.startTimeStr || '09:00',
      accumulatedMinutes
    );

    // Identifica o script associado
    const template = templates.find((t) => t.id === step.scriptId);
    let resolvedCustomMessage = '';

    if (template) {
      const resolution = resolveScriptVariables(template.content, {
        company: prospect.company,
        contact: prospect.contact,
        client: prospect.client,
        service: prospect.service,
        scheduledDate: dateStr,
        scheduledTime: timeStr,
      });
      resolvedCustomMessage = resolution.resolvedText;
    }

    const action: ProspectAction = {
      id: `act-cadence-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
      clientId: prospect.companyId || prospect.clientId || '',
      leadId: prospect.leadId,
      contactId: prospect.contactId,
      campaignId: campaign.id,
      campaignName: campaign.name,
      campaignType: campaign.type || 'prospeccao',
      cadenceStepId: step.id,
      templateId: step.scriptId,
      scriptTitle: step.scriptTitle || template?.title || step.actionType,
      actionType: step.actionType,
      channel: step.channel || campaign.channel || 'whatsapp',
      scheduledDate: dateStr,
      scheduledTime: timeStr,
      status: 'pending',
      priority: options.priority || 'medium',
      estMinutes: options.estMinutesPerAction || 2,
      customMessage: resolvedCustomMessage || undefined,
      notes: step.notes,
      createdAt: now,
      updatedAt: now,
    };

    actions.push(action);
  });

  return actions;
}

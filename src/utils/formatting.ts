import { Client, Company, Contact, ContactChannel, Service } from '../types';

export const ALLOWED_VARIABLES = [
  'nome',
  'primeiro_nome',
  'empresa',
  'cidade',
  'pais',
  'nicho',
  'servico',
  'problema',
  'beneficio',
  'preco',
  'cta',
  'cargo',
  'proposta_valor',
];

export interface MessageValidationResult {
  isValid: boolean;
  isEmpty: boolean;
  isTooLong: boolean;
  invalidVariables: string[];
  missingValueVariables: string[];
  warnings: string[];
}

/**
 * Interpolates variables in a message template
 */
export function interpolateMessage(
  templateContent: string,
  client?: Partial<Client> | null,
  service?: Partial<Service> | null,
  company?: Partial<Company> | null,
  contact?: Partial<Contact> | null
): string {
  if (!templateContent) return '';

  let result = templateContent;

  const contactName = contact?.name || client?.name || 'Cliente';
  const firstName = contactName.trim().split(' ')[0] || 'Cliente';
  const companyName = company?.name || client?.company || 'sua empresa';
  const role = contact?.role || client?.role || 'gestor';
  const serviceName = service?.name || 'nossas soluções';
  const city = company?.city || client?.segment || 'sua região';
  const country = company?.country || 'Brasil';
  const niche = company?.niche || client?.segment || 'seu setor';
  const problem = company?.apparentNeed || service?.problemsSolved?.[0] || 'otimização de processos';
  const benefit = service?.benefits?.[0] || 'resultados escaláveis';
  const price = service?.basePrice ? `${service.currency || 'R$'} ${service.basePrice.toLocaleString('pt-BR')}` : 'sob consulta';
  const cta = service?.defaultCta || 'Podemos agendar 15 minutos esta semana?';
  const valueProp = service?.valueProposition || 'gerar mais receita e eficiência';

  const replaceMap: Record<string, string> = {
    '{{nome}}': contactName,
    '{{primeiro_nome}}': firstName,
    '{{empresa}}': companyName,
    '{{cidade}}': city,
    '{{pais}}': country,
    '{{nicho}}': niche,
    '{{servico}}': serviceName,
    '{{problema}}': problem,
    '{{beneficio}}': benefit,
    '{{preco}}': price,
    '{{cta}}': cta,
    '{{cargo}}': role,
    '{{proposta_valor}}': valueProp,
  };

  for (const [key, value] of Object.entries(replaceMap)) {
    result = result.replaceAll(key, value);
  }

  return result;
}

/**
 * Validates message template content against rules
 */
export function validateMessageContent(
  content: string,
  context?: { company?: Partial<Company> | null; service?: Partial<Service> | null; contact?: Partial<Contact> | null }
): MessageValidationResult {
  const isEmpty = !content || content.trim().length === 0;
  const isTooLong = content.length > 1000;

  // Extract all {{variable}} occurrences
  const matches = content.match(/\{\{([^}]+)\}\}/g) || [];
  const usedVars = matches.map((m) => m.replace(/\{\{|\}\}/g, '').trim());

  const invalidVariables: string[] = [];
  const missingValueVariables: string[] = [];
  const warnings: string[] = [];

  for (const v of usedVars) {
    if (!ALLOWED_VARIABLES.includes(v)) {
      invalidVariables.push(v);
    } else if (context) {
      // Check if value is missing in context
      if (v === 'cidade' && !context.company?.city) missingValueVariables.push(v);
      if (v === 'nicho' && !context.company?.niche) missingValueVariables.push(v);
      if (v === 'preco' && !context.service?.basePrice) missingValueVariables.push(v);
    }
  }

  if (isEmpty) warnings.push('A mensagem está vazia.');
  if (isTooLong) warnings.push('A mensagem excede 1000 caracteres (pode ser longa para o WhatsApp).');
  if (invalidVariables.length > 0) warnings.push(`Variável(is) desconhecida(s): ${invalidVariables.join(', ')}.`);
  if (missingValueVariables.length > 0) warnings.push(`Variável(is) sem valor cadastrado no lead: ${missingValueVariables.join(', ')}.`);

  const isValid = !isEmpty && invalidVariables.length === 0;

  return {
    isValid,
    isEmpty,
    isTooLong,
    invalidVariables,
    missingValueVariables,
    warnings,
  };
}

/**
 * Limpa o telefone mantendo estritamente apenas dígitos numéricos válidos para Click-to-Chat WhatsApp
 */
export function cleanPhoneNumberDigits(phone?: string): string {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');
  if (!digits) return '';

  // Remove zeros iniciais de discagem local (ex: 0841234567 -> 841234567, 011987654321 -> 11987654321)
  if (digits.startsWith('0') && digits.length >= 9) {
    digits = digits.replace(/^0+/, '');
  }

  // Se já possui DDI conhecido (258 Moçambique, 351 Portugal, 55 Brasil, etc.)
  if (digits.startsWith('258') || digits.startsWith('351') || digits.startsWith('55') || digits.length >= 12) {
    return digits;
  }

  // Padrão Moçambique sem DDI (9 dígitos iniciando em 82, 83, 84, 85, 86, 87)
  if (digits.length === 9 && /^8[2-7]/.test(digits)) {
    return '258' + digits;
  }

  // Formato brasileiro padrão com DDD (10 ou 11 dígitos, DDD 11 a 99)
  if (digits.length === 10 || digits.length === 11) {
    return '55' + digits;
  }

  return digits;
}

/**
 * Formats a phone number for Brazilian formats or international standard
 */
export function formatPhoneNumber(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  if (digits.startsWith('258') && digits.length === 12) {
    return `+258 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  if (digits.startsWith('351') && digits.length === 12) {
    return `+351 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  return phone;
}

/**
 * Generates WhatsApp Web or App link with pre-filled message
 * Link estrito https://wa.me/NUMERO_DIGITOS?text=URL_ENCODED
 */
export function generateWhatsAppLink(phone?: string, text?: string): string {
  if (!phone) return '';
  const cleanDigits = cleanPhoneNumberDigits(phone);
  if (!cleanDigits) return '';
  const encodedText = text ? encodeURIComponent(text) : '';
  return encodedText
    ? `https://wa.me/${cleanDigits}?text=${encodedText}`
    : `https://wa.me/${cleanDigits}`;
}

/**
 * Formats date relative to today (Hoje, Amanhã, Ontem, ou DD/MM)
 */
export function formatRelativeDate(dateStr?: string): string {
  if (!dateStr) return 'Sem data';
  
  const target = new Date(dateStr + (dateStr.length <= 10 ? 'T00:00:00' : ''));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDateOnly = new Date(target);
  targetDateOnly.setHours(0, 0, 0, 0);

  const diffDays = Math.round((targetDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Amanhã';
  if (diffDays === -1) return 'Ontem';
  if (diffDays > 1 && diffDays < 7) return `Em ${diffDays} dias`;
  if (diffDays < -1 && diffDays > -7) return `Há ${Math.abs(diffDays)} dias`;

  return target.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Calculates estimated minutes as formatted text
 */
export function formatDurationMinutes(minutes: number): string {
  if (minutes <= 0) return '0 min';
  if (minutes < 60) return `~${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `~${hours}h ${remaining}m` : `~${hours}h`;
}

/**
 * Channel visual helpers
 */
export function getChannelBadgeDetails(channel: ContactChannel): { label: string; bgClass: string; textClass: string; icon: string } {
  switch (channel) {
    case 'whatsapp':
      return { label: 'WhatsApp', bgClass: 'bg-emerald-500/10 dark:bg-emerald-500/20', textClass: 'text-emerald-700 dark:text-emerald-400', icon: 'MessageCircle' };
    case 'linkedin':
      return { label: 'LinkedIn', bgClass: 'bg-sky-500/10 dark:bg-sky-500/20', textClass: 'text-sky-700 dark:text-sky-400', icon: 'Share2' };
    case 'email':
      return { label: 'E-mail', bgClass: 'bg-blue-500/10 dark:bg-blue-500/20', textClass: 'text-blue-700 dark:text-blue-400', icon: 'Mail' };
    case 'call':
      return { label: 'Ligação', bgClass: 'bg-amber-500/10 dark:bg-amber-500/20', textClass: 'text-amber-700 dark:text-amber-400', icon: 'Phone' };
    case 'instagram':
      return { label: 'Instagram', bgClass: 'bg-pink-500/10 dark:bg-pink-500/20', textClass: 'text-pink-700 dark:text-pink-400', icon: 'Instagram' };
    default:
      return { label: channel, bgClass: 'bg-neutral-500/10', textClass: 'text-neutral-700 dark:text-neutral-300', icon: 'Send' };
  }
}

import { Client, ContactChannel, Service } from '../types';

/**
 * Interpolates variables in a message template like {{nome}}, {{primeiro_nome}}, {{empresa}}, {{cargo}}, {{servico}}
 */
export function interpolateMessage(
  templateContent: string,
  client?: Partial<Client> | null,
  service?: Partial<Service> | null
): string {
  if (!templateContent) return '';

  let result = templateContent;

  const firstName = client?.name ? client.name.trim().split(' ')[0] : 'colega';
  const fullName = client?.name || 'colega';
  const company = client?.company || 'sua empresa';
  const role = client?.role || 'líder';
  const serviceName = service?.name || 'nossas soluções especializadas';
  const valueProp = service?.valueProposition || 'otimizar processos e gerar novos negócios';

  const replaceMap: Record<string, string> = {
    '{{nome}}': fullName,
    '{{primeiro_nome}}': firstName,
    '{{empresa}}': company,
    '{{cargo}}': role,
    '{{servico}}': serviceName,
    '{{proposta_valor}}': valueProp,
  };

  for (const [key, value] of Object.entries(replaceMap)) {
    result = result.replaceAll(key, value);
  }

  return result;
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
  return phone;
}

/**
 * Generates WhatsApp Web or App link with pre-filled message
 */
export function generateWhatsAppLink(phone?: string, text?: string): string {
  if (!phone) return '';
  let cleanDigits = phone.replace(/\D/g, '');
  if (cleanDigits.length === 10 || cleanDigits.length === 11) {
    cleanDigits = '55' + cleanDigits;
  }
  const encodedText = encodeURIComponent(text || '');
  return `https://wa.me/${cleanDigits}?text=${encodedText}`;
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

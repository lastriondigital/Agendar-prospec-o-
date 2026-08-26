/**
 * PROSPECT OS - Security & Input Sanitization Utilities
 * Prevents XSS, invalid schema inputs, malicious script injections, and malformed data.
 */

/**
 * Strips dangerous HTML tags, script injections, and trims whitespace
 */
export function sanitizeText(input: unknown): string {
  if (input === null || input === undefined) return '';
  const str = String(input);
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // remove control chars
    .trim();
}

/**
 * Validates standard email address format
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

/**
 * Validates telephone / WhatsApp number format
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

/**
 * Validates Brazilian CNPJ format and check digits
 */
export function validateCNPJ(cnpj: string): boolean {
  if (!cnpj || typeof cnpj !== 'string') return false;
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) return false;
  if (/^(\d)\1+$/.test(clean)) return false; // Reject sequences like 00000000000000

  let size = clean.length - 2;
  let numbers = clean.substring(0, size);
  const digits = clean.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += Number(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number(digits.charAt(0))) return false;

  size = size + 1;
  numbers = clean.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += Number(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === Number(digits.charAt(1));
}

/**
 * Escapes values for safe CSV formatting (UTF-8 Portuguese Excel/Sheets compatible)
 */
export function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return '""';
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) {
    const joined = val.map((v) => sanitizeText(v)).join('; ');
    return `"${joined.replace(/"/g, '""')}"`;
  }
  if (typeof val === 'object') {
    return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
  }
  const clean = sanitizeText(val);
  return `"${clean.replace(/"/g, '""')}"`;
}

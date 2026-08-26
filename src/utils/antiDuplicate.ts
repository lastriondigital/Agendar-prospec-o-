import { Company, Contact, DuplicateMatch, Lead } from '../types';

/**
 * Normaliza número de telefone removendo pontuações, parênteses, espaços, hífens e símbolos.
 */
export function normalizePhone(raw?: string): string {
  if (!raw) return '';
  return raw.replace(/[\s\(\)\-\+\.\/]/g, '').trim();
}

/**
 * Normaliza strings para comparação (remove acentos, caixa baixa, espaços extras).
 */
export function normalizeText(text?: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normaliza email para comparação segura.
 */
export function normalizeEmail(email?: string): string {
  if (!email) return '';
  return email.toLowerCase().trim();
}

/**
 * Compara dois números de telefone ignorando DDI/DDD se forem equivalentes nos últimos 8-9 dígitos.
 */
export function arePhonesMatching(phoneA?: string, phoneB?: string): boolean {
  const normA = normalizePhone(phoneA);
  const normB = normalizePhone(phoneB);
  if (!normA || !normB) return false;
  if (normA === normB) return true;

  // Comparar os últimos 8 ou 9 dígitos para tolerar ausência/presença de código de país (55, 351, etc)
  const minLen = Math.min(normA.length, normB.length);
  if (minLen >= 8) {
    const endA = normA.slice(-8);
    const endB = normB.slice(-8);
    return endA === endB;
  }

  return false;
}

export interface AntiDuplicateParams {
  contactName?: string;
  companyName?: string;
  tradeName?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  excludeCompanyId?: string;
  excludeContactId?: string;
}

/**
 * Executa algoritmo anti-duplicação e localiza potenciais conflitos cadastrais.
 */
export function findPotentialDuplicates(
  params: AntiDuplicateParams,
  companies: Company[],
  contacts: Contact[],
  leads: Lead[]
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];
  const normPhone = normalizePhone(params.phone);
  const normWhatsapp = normalizePhone(params.whatsapp);
  const normEmail = normalizeEmail(params.email);
  const normContactName = normalizeText(params.contactName);
  const normCompanyName = normalizeText(params.companyName);
  const normTradeName = normalizeText(params.tradeName);

  // Mapear contatos e leads por companyId
  const contactsByCompany = new Map<string, Contact[]>();
  contacts.forEach((c) => {
    const list = contactsByCompany.get(c.companyId) || [];
    list.push(c);
    contactsByCompany.set(c.companyId, list);
  });

  const leadByCompany = new Map<string, Lead>();
  leads.forEach((l) => leadByCompany.set(l.companyId, l));

  // 1. Verificar contatos existentes por Telefone, WhatsApp, Email e Nome
  for (const contact of contacts) {
    if (params.excludeContactId && contact.id === params.excludeContactId) continue;
    if (params.excludeCompanyId && contact.companyId === params.excludeCompanyId) continue;

    const comp = companies.find((c) => c.id === contact.companyId);
    if (!comp) continue;
    const lead = leadByCompany.get(comp.id);

    // Verificação por Telefone
    if (normPhone && contact.phone && arePhonesMatching(normPhone, contact.phone)) {
      matches.push({
        type: 'phone',
        reason: 'Telefone já cadastrado no sistema.',
        company: comp,
        contact,
        lead,
        matchedField: 'Telefone',
        matchedValue: contact.phone,
      });
      continue;
    }

    // Verificação por WhatsApp
    if (normWhatsapp && contact.whatsapp && arePhonesMatching(normWhatsapp, contact.whatsapp)) {
      matches.push({
        type: 'whatsapp',
        reason: 'Número de WhatsApp já associado a outro contacto.',
        company: comp,
        contact,
        lead,
        matchedField: 'WhatsApp',
        matchedValue: contact.whatsapp,
      });
      continue;
    }

    // Verificação por Email
    if (normEmail && contact.email && normalizeEmail(contact.email) === normEmail) {
      matches.push({
        type: 'email',
        reason: 'Endereço de e-mail já registrado.',
        company: comp,
        contact,
        lead,
        matchedField: 'E-mail',
        matchedValue: contact.email,
      });
      continue;
    }

    // Verificação por Nome do Contacto + Empresa
    if (normContactName && normCompanyName) {
      const existingCompName = normalizeText(comp.name);
      const existingCompTrade = normalizeText(comp.tradeName);
      const existingContactName = normalizeText(contact.name);

      const isSameCompany =
        existingCompName === normCompanyName ||
        (normTradeName && existingCompName === normTradeName) ||
        (existingCompTrade && existingCompTrade === normCompanyName);

      const isSameContact = existingContactName === normContactName;

      if (isSameCompany && isSameContact) {
        matches.push({
          type: 'name_company',
          reason: 'Mesmo nome de contacto cadastrado na mesma empresa.',
          company: comp,
          contact,
          lead,
          matchedField: 'Contacto + Empresa',
          matchedValue: `${contact.name} (${comp.name})`,
        });
        continue;
      }
    }
  }

  // 2. Verificar duplicação direta de Empresa por Nome ou Nome Fantasia
  if (normCompanyName) {
    for (const comp of companies) {
      if (params.excludeCompanyId && comp.id === params.excludeCompanyId) continue;

      const existingCompName = normalizeText(comp.name);
      const existingCompTrade = normalizeText(comp.tradeName);

      if (
        existingCompName === normCompanyName ||
        (normTradeName && existingCompTrade && existingCompTrade === normTradeName)
      ) {
        // Se já não estiver nos matches
        const alreadyMatched = matches.some((m) => m.company.id === comp.id);
        if (!alreadyMatched) {
          const compContacts = contactsByCompany.get(comp.id) || [];
          const lead = leadByCompany.get(comp.id);
          matches.push({
            type: 'name_company',
            reason: 'Empresa com nome ou razão social já existente.',
            company: comp,
            contact: compContacts[0],
            lead,
            matchedField: 'Nome da Empresa',
            matchedValue: comp.name,
          });
        }
      }
    }
  }

  return matches;
}

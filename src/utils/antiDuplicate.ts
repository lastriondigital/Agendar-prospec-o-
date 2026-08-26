import { Company, Contact, DuplicateMatch, Lead } from '../types';

/**
 * Normaliza número de telefone removendo pontuações, parênteses, espaços, hífens e símbolos.
 */
export function normalizePhone(raw?: string): string {
  if (!raw) return '';
  return raw.replace(/[\s\(\)\-\+\.\/]/g, '').trim();
}

/**
 * Normaliza strings para comparação (remove acentos, caixa baixa, espaços extras, pontuação e sufixos societários comuns).
 */
export function normalizeText(text?: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Remove sufixos jurídicos comuns para comparar a raiz do nome da empresa
 */
export function cleanCompanyCorporateSuffixes(name?: string): string {
  const norm = normalizeText(name);
  return norm
    .replace(/\b(ltda|eireli|s\/a|sa|me|epp|inc|llc|gmbh|co|limitada|tecnologia|tech|solucoes|servicos|grupo)\b/gi, '')
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
 * Compara dois números de telefone considerando DDI (+55, +351, etc), DDD e formato local.
 */
export function arePhonesMatching(phoneA?: string, phoneB?: string): boolean {
  const normA = normalizePhone(phoneA);
  const normB = normalizePhone(phoneB);
  if (!normA || !normB) return false;
  if (normA === normB) return true;

  // Se um número termina com o outro (ex: +5511999998888 termina com 11999998888 ou 999998888)
  if (normA.endsWith(normB) && normB.length >= 8) return true;
  if (normB.endsWith(normA) && normA.length >= 8) return true;

  // Comparar os últimos 9 dígitos (padrão celular BR) ou 8 dígitos
  if (normA.length >= 9 && normB.length >= 9) {
    if (normA.slice(-9) === normB.slice(-9)) return true;
  }
  if (normA.length >= 8 && normB.length >= 8) {
    if (normA.slice(-8) === normB.slice(-8)) return true;
  }

  return false;
}

/**
 * Calcula similaridade de Jaccard e substring entre dois nomes de empresas
 */
export function areCompanyNamesSimilar(nameA?: string, nameB?: string): { similar: boolean; reason?: string } {
  if (!nameA || !nameB) return { similar: false };

  const normA = normalizeText(nameA);
  const normB = normalizeText(nameB);
  if (normA === normB) return { similar: true, reason: 'Nome idêntico' };

  const cleanA = cleanCompanyCorporateSuffixes(nameA);
  const cleanB = cleanCompanyCorporateSuffixes(nameB);
  if (cleanA && cleanB && cleanA === cleanB) {
    return { similar: true, reason: 'Nome raiz da empresa idêntico (ignorando sufixos corporativos)' };
  }

  // Substring direta se o nome raiz tiver pelo menos 4 caracteres
  if (cleanA.length >= 4 && cleanB.length >= 4) {
    if (cleanA.includes(cleanB) || cleanB.includes(cleanA)) {
      return { similar: true, reason: `Nome muito semelhante ("${cleanA}" / "${cleanB}")` };
    }
  }

  // Comparação de tokens (palavras)
  const wordsA = new Set(cleanA.split(' ').filter((w) => w.length > 2));
  const wordsB = new Set(cleanB.split(' ').filter((w) => w.length > 2));

  if (wordsA.size > 0 && wordsB.size > 0) {
    let intersection = 0;
    wordsA.forEach((w) => {
      if (wordsB.has(w)) intersection++;
    });
    const union = new Set([...wordsA, ...wordsB]).size;
    const similarity = intersection / union;

    if (similarity >= 0.6) {
      return { similar: true, reason: `Alta similaridade de termos (${Math.round(similarity * 100)}%)` };
    }
  }

  return { similar: false };
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

  // 2. Verificar duplicação de Empresa por Nome, Nome Fantasia e Similaridade
  if (params.companyName || params.tradeName) {
    for (const comp of companies) {
      if (params.excludeCompanyId && comp.id === params.excludeCompanyId) continue;

      const compSimilarity = areCompanyNamesSimilar(params.companyName, comp.name);
      const tradeSimilarity = params.tradeName ? areCompanyNamesSimilar(params.tradeName, comp.tradeName || comp.name) : { similar: false };
      const crossSimilarity = areCompanyNamesSimilar(params.companyName, comp.tradeName);

      if (compSimilarity.similar || tradeSimilarity.similar || crossSimilarity.similar) {
        // Se já não estiver nos matches
        const alreadyMatched = matches.some((m) => m.company.id === comp.id);
        if (!alreadyMatched) {
          const compContacts = contactsByCompany.get(comp.id) || [];
          const lead = leadByCompany.get(comp.id);
          const reasonText =
            compSimilarity.reason ||
            tradeSimilarity.reason ||
            crossSimilarity.reason ||
            'Empresa com nome ou razão social muito semelhante já existente.';

          matches.push({
            type: 'name_company',
            reason: reasonText,
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

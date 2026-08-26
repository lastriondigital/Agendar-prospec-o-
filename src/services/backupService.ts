/**
 * PROSPECT OS - Backup, Validation & Multi-Format Export Service
 * Supports JSON deep validation, schema integrity checks, corrupted data repair, and UTF-8 CSV exports.
 */

import {
  Company,
  Contact,
  Lead,
  HistoryEvent,
  Client,
  Campaign,
  Service,
  IdealCustomerProfile,
  MessageTemplate,
  ProspectAction,
  PipelineStage,
  ObjectionItem,
  PricingItem,
  ProofItem,
  PainPointItem,
  ValueArgumentItem,
  CtaItem,
  FollowUpStrategyItem,
  ABTestExperiment,
  AppSettings,
} from '../types';
import { sanitizeText, escapeCSV } from '../utils/sanitizer';

export interface BackupDataPayload {
  version: string;
  exportDate: string;
  appName: string;
  data: {
    companies?: Company[];
    contacts?: Contact[];
    leads?: Lead[];
    history?: HistoryEvent[];
    clients?: Client[];
    campaigns?: Campaign[];
    services?: Service[];
    icps?: IdealCustomerProfile[];
    templates?: MessageTemplate[];
    actions?: ProspectAction[];
    stages?: PipelineStage[];
    objections?: ObjectionItem[];
    pricing?: PricingItem[];
    proofs?: ProofItem[];
    painPoints?: PainPointItem[];
    arguments?: ValueArgumentItem[];
    ctas?: CtaItem[];
    followups?: FollowUpStrategyItem[];
    abTests?: ABTestExperiment[];
    settings?: AppSettings;
  };
}

export interface BackupValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    companiesCount: number;
    contactsCount: number;
    leadsCount: number;
    actionsCount: number;
    campaignsCount: number;
    templatesCount: number;
    servicesCount: number;
    objectionsCount: number;
  };
  sanitizedPayload?: BackupDataPayload;
}

/**
 * Performs strict schema validation and sanitization of a backup JSON file
 */
export function validateBackupJSON(jsonStr: string): BackupValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const summary = {
    companiesCount: 0,
    contactsCount: 0,
    leadsCount: 0,
    actionsCount: 0,
    campaignsCount: 0,
    templatesCount: 0,
    servicesCount: 0,
    objectionsCount: 0,
  };

  if (!jsonStr || typeof jsonStr !== 'string' || !jsonStr.trim()) {
    return {
      valid: false,
      errors: ['Arquivo vazio ou formato não textual.'],
      warnings: [],
      summary,
    };
  }

  let parsed: any;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    return {
      valid: false,
      errors: [`JSON corrompido ou malformado: ${(e as Error).message}`],
      warnings: [],
      summary,
    };
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      valid: false,
      errors: ['Estrutura raiz do JSON deve ser um objeto válido.'],
      warnings: [],
      summary,
    };
  }

  // Handle both standard PROSPECT OS format ({ version, data: {...} }) or direct object ({ companies: [...] })
  const rawData = parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed;

  const sanitizeEntityList = <T extends { id: string }>(
    list: unknown,
    requiredFields: string[],
    entityName: string
  ): T[] => {
    if (!Array.isArray(list)) return [];
    const validItems: T[] = [];

    list.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        warnings.push(`${entityName} #${index + 1}: registro inválido ignorado.`);
        return;
      }

      // Ensure valid ID
      let id = item.id;
      if (!id || typeof id !== 'string') {
        id = `${entityName.toLowerCase()}_${Date.now()}_${index}`;
        warnings.push(`${entityName} #${index + 1} sem ID válido. Novo ID atribuído: ${id}`);
      }

      // Check required fields
      const hasMissingField = requiredFields.some((f) => item[f] === undefined || item[f] === null);
      if (hasMissingField) {
        warnings.push(`${entityName} (${id}): campos obrigatórios ausentes (${requiredFields.join(', ')}).`);
      }

      // Sanitize string values
      const sanitizedItem: any = { ...item, id: sanitizeText(id) };
      for (const key of Object.keys(sanitizedItem)) {
        if (typeof sanitizedItem[key] === 'string') {
          sanitizedItem[key] = sanitizeText(sanitizedItem[key]);
        }
      }

      validItems.push(sanitizedItem as T);
    });

    return validItems;
  };

  const cleanCompanies = sanitizeEntityList<Company>(rawData.companies, ['name'], 'Empresa');
  const cleanContacts = sanitizeEntityList<Contact>(rawData.contacts, ['name', 'companyId'], 'Contato');
  const cleanLeads = sanitizeEntityList<Lead>(rawData.leads, ['companyId', 'status'], 'Lead');
  const cleanActions = sanitizeEntityList<ProspectAction>(rawData.actions, ['type', 'status'], 'Ação');
  const cleanCampaigns = sanitizeEntityList<Campaign>(rawData.campaigns, ['name'], 'Campanha');
  const cleanTemplates = sanitizeEntityList<MessageTemplate>(rawData.templates, ['title'], 'Template');
  const cleanServices = sanitizeEntityList<Service>(rawData.services, ['name'], 'Serviço');
  const cleanObjections = sanitizeEntityList<ObjectionItem>(rawData.objections, ['name'], 'Objeção');

  summary.companiesCount = cleanCompanies.length;
  summary.contactsCount = cleanContacts.length;
  summary.leadsCount = cleanLeads.length;
  summary.actionsCount = cleanActions.length;
  summary.campaignsCount = cleanCampaigns.length;
  summary.templatesCount = cleanTemplates.length;
  summary.servicesCount = cleanServices.length;
  summary.objectionsCount = cleanObjections.length;

  const totalEntities =
    summary.companiesCount +
    summary.contactsCount +
    summary.leadsCount +
    summary.actionsCount +
    summary.campaignsCount +
    summary.templatesCount +
    summary.servicesCount +
    summary.objectionsCount;

  if (totalEntities === 0 && !rawData.settings) {
    errors.push('O arquivo não contém registros válidos do PROSPECT OS para importar.');
  }

  const sanitizedPayload: BackupDataPayload = {
    version: parsed.version || '5.0.0',
    exportDate: parsed.exportDate || new Date().toISOString(),
    appName: 'PROSPECT OS',
    data: {
      ...rawData,
      companies: cleanCompanies,
      contacts: cleanContacts,
      leads: cleanLeads,
      actions: cleanActions,
      campaigns: cleanCampaigns,
      templates: cleanTemplates,
      services: cleanServices,
      objections: cleanObjections,
    },
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary,
    sanitizedPayload,
  };
}

/**
 * Generates UTF-8 CSV with BOM for Brazilian Excel compatibility
 */
export function generateCSVBlob(headers: string[], rows: string[][]): Blob {
  const BOM = '\uFEFF'; // Byte Order Mark for Excel UTF-8 recognition
  const headerLine = headers.map(escapeCSV).join(';');
  const rowLines = rows.map((row) => row.map(escapeCSV).join(';'));
  const csvContent = BOM + [headerLine, ...rowLines].join('\r\n');
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Downloads a generated file blob to client
 */
export function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Exports Companies & Leads database to CSV
 */
export function exportCompaniesCSV(companies: Company[], contacts: Contact[], leads: Lead[]): void {
  const headers = [
    'ID Empresa',
    'Nome Empresa',
    'Nome Fantasia',
    'Nicho / Setor',
    'País',
    'Cidade',
    'Estado',
    'Website',
    'Instagram',
    'LinkedIn',
    'Status Empresa',
    'Nome do Contato',
    'Cargo do Contato',
    'WhatsApp Contato',
    'Email Contato',
    'Origem Lead',
    'Estágio Lead',
    'Score Qualificação',
    'Status Lead',
    'Cadastrado Em',
  ];

  const rows: string[][] = [];

  companies.forEach((company) => {
    const compContacts = contacts.filter((c) => c.companyId === company.id);
    const compLeads = leads.filter((l) => l.companyId === company.id);

    if (compContacts.length === 0) {
      const lead = compLeads[0];
      rows.push([
        company.id,
        company.name,
        company.tradeName || '',
        company.niche || '',
        company.country || '',
        company.city || '',
        company.state || '',
        company.website || '',
        company.instagram || '',
        company.linkedin || '',
        company.status || 'active',
        '',
        '',
        '',
        '',
        lead?.source || '',
        lead?.stage || '',
        lead?.score !== undefined ? String(lead.score) : '0',
        lead?.status || 'active',
        company.createdAt || '',
      ]);
    } else {
      compContacts.forEach((contact) => {
        const lead = compLeads.find((l) => l.contactId === contact.id) || compLeads[0];
        rows.push([
          company.id,
          company.name,
          company.tradeName || '',
          company.niche || '',
          company.country || '',
          company.city || '',
          company.state || '',
          company.website || '',
          company.instagram || '',
          company.linkedin || '',
          company.status || 'active',
          contact.name,
          contact.role || '',
          contact.whatsapp || contact.phone || '',
          contact.email || '',
          lead?.source || '',
          lead?.stage || '',
          lead?.score !== undefined ? String(lead.score) : '0',
          lead?.status || 'active',
          company.createdAt || '',
        ]);
      });
    }
  });

  const blob = generateCSVBlob(headers, rows);
  triggerFileDownload(blob, `prospect-os-empresas-leads-${new Date().toISOString().slice(0, 10)}.csv`);
}

/**
 * Exports Prospecting Actions Queue to CSV
 */
export function exportActionsCSV(actions: ProspectAction[], companies: Company[], contacts: Contact[]): void {
  const headers = [
    'ID Ação',
    'Cliente / Empresa ID',
    'Canal',
    'Data Agendada',
    'Hora Agendada',
    'Status',
    'Prioridade',
    'Tempo Estimado (min)',
    'Campanha ID',
    'Notas / Resultado',
    'Criado Em',
    'Executado Em',
  ];

  const rows: string[][] = actions.map((act) => {
    const comp = companies.find((c) => c.id === act.clientId);

    return [
      act.id,
      comp ? comp.name : act.clientId,
      act.channel,
      act.scheduledDate,
      act.scheduledTime || '',
      act.status,
      act.priority,
      String(act.estMinutes || 2),
      act.campaignId || '',
      act.outcomeNotes || act.customMessage || '',
      act.createdAt || '',
      act.executedAt || '',
    ];
  });

  const blob = generateCSVBlob(headers, rows);
  triggerFileDownload(blob, `prospect-os-fila-acoes-${new Date().toISOString().slice(0, 10)}.csv`);
}

/**
 * Exports Interaction History to CSV
 */
export function exportHistoryCSV(history: HistoryEvent[], companies: Company[], contacts: Contact[]): void {
  const headers = [
    'ID Histórico',
    'Empresa',
    'Contato',
    'Tipo Evento',
    'Título',
    'Descrição / Detalhes',
    'Data e Hora',
  ];

  const rows: string[][] = history.map((h) => {
    const comp = companies.find((c) => c.id === h.companyId);
    const cont = contacts.find((c) => c.id === h.contactId);

    return [
      h.id,
      comp?.name || h.companyId || '',
      cont?.name || h.contactId || '',
      h.type,
      h.title,
      h.description || '',
      h.timestamp,
    ];
  });

  const blob = generateCSVBlob(headers, rows);
  triggerFileDownload(blob, `prospect-os-historico-interacoes-${new Date().toISOString().slice(0, 10)}.csv`);
}

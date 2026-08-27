import { CompanyRepository, companyRepository } from '../db/repositories/companyRepository';
import { ContactRepository, contactRepository } from '../db/repositories/contactRepository';
import { HistoryRepository, historyRepository } from '../db/repositories/historyRepository';
import { LeadRepository, leadRepository } from '../db/repositories/leadRepository';
import { deleteFromStore, putInStore } from '../db/indexedDB';
import {
  Client,
  Company,
  Contact,
  ContactChannel,
  DuplicateMatch,
  HistoryEvent,
  Lead,
  LeadPriority,
  LeadStage,
  LeadTemperature,
  ProspectAction,
} from '../types';
import { findPotentialDuplicates } from '../utils/antiDuplicate';
import { STAGES_CONFIG } from '../utils/constants';

export interface CreateCompanyPayload {
  company: {
    id?: string;
    name: string;
    tradeName?: string;
    category: string;
    niche: string;
    country: string;
    city: string;
    address?: string;
    companyPhone?: string;
    companyWhatsApp?: string;
    companyWhatsAppVerified?: boolean;
    website?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    googleBusiness?: string;
    unitsCount?: number;
    notes?: string;
    status?: 'active' | 'archived' | 'lead' | 'client';
  };
  contact: {
    id?: string;
    name: string;
    role?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    notes?: string;
    isPrimary?: boolean;
  };
  lead: {
    id?: string;
    serviceId?: string;
    serviceName?: string;
    source?: string;
    score?: number;
    priority?: LeadPriority;
    temperature?: LeadTemperature;
    stage?: LeadStage;
    nextActionTitle?: string;
    nextActionDate?: string;
    nextActionChannel?: ContactChannel;
    notes?: string;
  };
}

export class LeadService {
  constructor(
    private compRepo: CompanyRepository = companyRepository,
    private contRepo: ContactRepository = contactRepository,
    private leadRepo: LeadRepository = leadRepository,
    private histRepo: HistoryRepository = historyRepository
  ) {}

  /**
   * Valida anti-duplicação comparando telefone, whatsapp, email, website e nome+empresa.
   */
  async validateDuplicates(
    params: {
      contactName?: string;
      companyName?: string;
      tradeName?: string;
      phone?: string;
      whatsapp?: string;
      email?: string;
      website?: string;
      companyPhone?: string;
      companyWhatsApp?: string;
      companyEmail?: string;
      excludeCompanyId?: string;
      excludeContactId?: string;
    }
  ): Promise<DuplicateMatch[]> {
    const [companies, contacts, leads] = await Promise.all([
      this.compRepo.getAll(),
      this.contRepo.getAll(),
      this.leadRepo.getAll(),
    ]);

    return findPotentialDuplicates(params, companies, contacts, leads);
  }

  /**
   * Cria cadastro completo com Empresa, Contacto e Lead integrados
   */
  async createCompanyWithLead(
    payload: CreateCompanyPayload
  ): Promise<{ company: Company; contact: Contact; lead: Lead; history: HistoryEvent }> {
    const now = new Date().toISOString();
    const compId = payload.company.id || `comp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const contId = payload.contact.id || `cnt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const leadId = payload.lead.id || `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // 1. Salvar Empresa
    const savedCompany = await this.compRepo.save({
      id: compId,
      name: payload.company.name.trim(),
      tradeName: payload.company.tradeName?.trim() || undefined,
      category: payload.company.category.trim(),
      niche: payload.company.niche.trim(),
      country: payload.company.country.trim() || 'Brasil',
      city: payload.company.city.trim(),
      address: payload.company.address?.trim() || undefined,
      companyPhone: payload.company.companyPhone?.trim() || undefined,
      companyWhatsApp: payload.company.companyWhatsApp?.trim() || undefined,
      companyWhatsAppVerified: payload.company.companyWhatsAppVerified ?? false,
      website: payload.company.website?.trim() || undefined,
      instagram: payload.company.instagram?.trim() || undefined,
      facebook: payload.company.facebook?.trim() || undefined,
      linkedin: payload.company.linkedin?.trim() || undefined,
      googleBusiness: payload.company.googleBusiness?.trim() || undefined,
      unitsCount: payload.company.unitsCount ?? 1,
      notes: payload.company.notes?.trim() || undefined,
      status: payload.company.status || 'lead',
      createdAt: now,
      updatedAt: now,
    });

    // 2. Salvar Contacto Principal
    const savedContact = await this.contRepo.save({
      id: contId,
      companyId: compId,
      name: payload.contact.name.trim(),
      role: payload.contact.role?.trim() || undefined,
      phone: payload.contact.phone?.trim() || undefined,
      whatsapp: payload.contact.whatsapp?.trim() || undefined,
      email: payload.contact.email?.trim() || undefined,
      notes: payload.contact.notes?.trim() || undefined,
      isPrimary: true,
      createdAt: now,
      updatedAt: now,
    });

    // 3. Salvar Lead
    const stage = payload.lead.stage || 'NOVO';
    const savedLead = await this.leadRepo.save({
      id: leadId,
      companyId: compId,
      contactId: contId,
      serviceId: payload.lead.serviceId || undefined,
      serviceName: payload.lead.serviceName || undefined,
      source: payload.lead.source || 'Outbound Direto',
      score: payload.lead.score ?? 50,
      priority: payload.lead.priority || 'média',
      temperature: payload.lead.temperature || 'morno',
      stage,
      status: stage === 'CLIENTE' ? 'won' : stage === 'PERDIDO' ? 'lost' : 'active',
      entryDate: now.slice(0, 10),
      lastContactDate: undefined,
      nextActionTitle: payload.lead.nextActionTitle?.trim() || undefined,
      nextActionDate: payload.lead.nextActionDate || undefined,
      nextActionChannel: payload.lead.nextActionChannel || 'whatsapp',
      notes: payload.lead.notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    });

    // 4. Registrar Evento de Histórico
    const savedHistory = await this.histRepo.add({
      companyId: compId,
      contactId: contId,
      leadId,
      type: 'created',
      title: 'Empresa e Lead criados no PROSPECT OS',
      description: `Cadastro inicial para ${savedContact.name} na empresa ${savedCompany.name}. Estágio: ${stage}.`,
      timestamp: now,
    });

    // 5. Sincronizar Client consolidado para compatibilidade
    await this.syncToClientStore(savedCompany, savedContact, savedLead);

    return {
      company: savedCompany,
      contact: savedContact,
      lead: savedLead,
      history: savedHistory,
    };
  }

  /**
   * Atualiza dados cadastrais da empresa
   */
  async updateCompany(company: Company): Promise<Company> {
    const updated = await this.compRepo.save(company);
    await this.histRepo.add({
      companyId: company.id,
      type: 'updated',
      title: 'Dados da empresa atualizados',
      description: `Informações cadastrais de ${company.name} foram atualizadas.`,
    });

    // Sincronizar client
    const [contacts, lead] = await Promise.all([
      this.contRepo.getByCompanyId(company.id),
      this.leadRepo.getByCompanyId(company.id),
    ]);
    const primary = contacts.find((c) => c.isPrimary) || contacts[0];
    if (primary && lead) {
      await this.syncToClientStore(updated, primary, lead);
    }

    return updated;
  }

  /**
   * Arquiva empresa e todos os registros
   */
  async archiveCompany(companyId: string): Promise<Company | null> {
    const company = await this.compRepo.archive(companyId);
    if (company) {
      await this.histRepo.add({
        companyId,
        type: 'archived',
        title: 'Empresa arquivada',
        description: `${company.name} foi movida para os arquivos.`,
      });

      const [contacts, lead] = await Promise.all([
        this.contRepo.getByCompanyId(companyId),
        this.leadRepo.getByCompanyId(companyId),
      ]);
      const primary = contacts.find((c) => c.isPrimary) || contacts[0];
      if (primary && lead) {
        await this.syncToClientStore(company, primary, lead);
      }
    }
    return company;
  }

  /**
   * Desarquiva empresa
   */
  async unarchiveCompany(companyId: string): Promise<Company | null> {
    const company = await this.compRepo.unarchive(companyId);
    if (company) {
      await this.histRepo.add({
        companyId,
        type: 'unarchived',
        title: 'Empresa reativada do arquivo',
        description: `${company.name} foi restaurada como lead ativo.`,
      });

      const [contacts, lead] = await Promise.all([
        this.contRepo.getByCompanyId(companyId),
        this.leadRepo.getByCompanyId(companyId),
      ]);
      const primary = contacts.find((c) => c.isPrimary) || contacts[0];
      if (primary && lead) {
        await this.syncToClientStore(company, primary, lead);
      }
    }
    return company;
  }

  /**
   * Exclui empresa e registros filhos com confirmação segura
   */
  async deleteCompany(companyId: string): Promise<void> {
    await Promise.all([
      this.compRepo.delete(companyId),
      this.contRepo.deleteByCompanyId(companyId),
      this.leadRepo.deleteByCompanyId(companyId),
      this.histRepo.deleteByCompanyId(companyId),
      deleteFromStore('clients', companyId),
    ]);
  }

  /**
   * Adiciona um novo contacto a uma empresa existente
   */
  async addContactToCompany(
    companyId: string,
    contactData: Omit<Contact, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>
  ): Promise<Contact> {
    const id = `cnt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const saved = await this.contRepo.save({
      id,
      companyId,
      status: contactData.status || 'active',
      ...contactData,
    });

    // Se for o primeiro contato da empresa ou marcado como principal, definir como primário
    if (contactData.isPrimary) {
      await this.setPrimaryContact(companyId, id);
    }

    const descParts: string[] = [];
    if (saved.role) descParts.push(`Cargo: ${saved.role}`);
    if (saved.department) descParts.push(`Departamento: ${saved.department}`);
    if (saved.referredByName) {
      descParts.push(`Origem: Indicação (${saved.referredByName} indicou ${saved.name})`);
    }

    await this.histRepo.add({
      companyId,
      contactId: id,
      type: 'contact_created',
      title: `Novo contacto adicionado: ${saved.name}`,
      description: descParts.length > 0 ? descParts.join(' | ') : undefined,
    });

    // Se houver indicação, criar evento dedicado de indicação na timeline
    if (saved.referredByName) {
      await this.histRepo.add({
        companyId,
        contactId: id,
        type: 'referral_recorded',
        title: `Indicação registrada: ${saved.name}`,
        description: `${saved.referredByName} indicou ${saved.name} para a empresa. Origem: Indicação.`,
        metadata: {
          referredByName: saved.referredByName,
          referredByContactId: saved.referredByContactId,
        },
      });
    }

    return saved;
  }

  /**
   * Atualiza contacto existente
   */
  async updateContact(contact: Contact): Promise<Contact> {
    const saved = await this.contRepo.save(contact);
    await this.histRepo.add({
      companyId: contact.companyId,
      contactId: contact.id,
      type: 'contact_updated',
      title: `Contacto atualizado: ${contact.name}`,
      description: contact.role ? `Cargo: ${contact.role}` : undefined,
    });

    // Se for contacto primário, sincronizar com Client
    if (contact.isPrimary) {
      const [company, lead] = await Promise.all([
        this.compRepo.getById(contact.companyId),
        this.leadRepo.getByCompanyId(contact.companyId),
      ]);
      if (company && lead) {
        await this.syncToClientStore(company, saved, lead);
      }
    }

    return saved;
  }

  /**
   * Arquiva um contacto específico
   */
  async archiveContact(contactId: string, companyId: string): Promise<void> {
    const contact = await this.contRepo.getById(contactId);
    if (!contact) return;

    await this.contRepo.save({
      ...contact,
      status: 'archived',
      updatedAt: new Date().toISOString(),
    });

    await this.histRepo.add({
      companyId,
      contactId,
      type: 'contact_archived',
      title: `Contacto arquivado: ${contact.name}`,
      description: `O contacto ${contact.name} foi movido para o arquivo.`,
    });
  }

  /**
   * Desarquiva um contacto
   */
  async unarchiveContact(contactId: string, companyId: string): Promise<void> {
    const contact = await this.contRepo.getById(contactId);
    if (!contact) return;

    await this.contRepo.save({
      ...contact,
      status: 'active',
      updatedAt: new Date().toISOString(),
    });

    await this.histRepo.add({
      companyId,
      contactId,
      type: 'contact_unarchived',
      title: `Contacto desarquivado: ${contact.name}`,
      description: `O contacto ${contact.name} voltou a ficar ativo.`,
    });
  }

  /**
   * Define um contacto como primário/principal da empresa
   */
  async setPrimaryContact(companyId: string, contactId: string): Promise<void> {
    const contacts = await this.contRepo.getByCompanyId(companyId);
    for (const c of contacts) {
      const isTarget = c.id === contactId;
      if (c.isPrimary !== isTarget) {
        await this.contRepo.save({
          ...c,
          isPrimary: isTarget,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    const [company, lead, targetContact] = await Promise.all([
      this.compRepo.getById(companyId),
      this.leadRepo.getByCompanyId(companyId),
      this.contRepo.getById(contactId),
    ]);

    if (company && targetContact && lead) {
      await this.leadRepo.save({
        ...lead,
        contactId,
        updatedAt: new Date().toISOString(),
      });
      await this.syncToClientStore(company, targetContact, lead);
    }
  }

  /**
   * Remove um contacto
   */
  async deleteContact(contactId: string, companyId: string): Promise<void> {
    const contact = await this.contRepo.getById(contactId);
    const contactName = contact?.name || 'Contacto';
    await this.contRepo.delete(contactId);
    await this.histRepo.add({
      companyId,
      type: 'contact_deleted',
      title: `Contacto removido: ${contactName}`,
      description: `O contacto ${contactName} foi excluído da empresa.`,
    });
  }

  /**
   * Atualiza o estágio de um lead e grava no histórico
   */
  async advanceStage(leadId: string, newStage: LeadStage, note?: string): Promise<Lead | null> {
    const lead = await this.leadRepo.getById(leadId);
    if (!lead) return null;

    const oldStage = lead.stage;
    const stageDef = STAGES_CONFIG[newStage];
    const status = newStage === 'CLIENTE' ? 'won' : newStage === 'PERDIDO' ? 'lost' : 'active';

    const updatedLead: Lead = {
      ...lead,
      stage: newStage,
      status,
      lastContactDate: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString(),
      notes: note ? (lead.notes ? `${lead.notes}\n[${new Date().toLocaleDateString('pt-BR')}]: ${note}` : note) : lead.notes,
    };

    await this.leadRepo.save(updatedLead);

    // Gravar no histórico
    await this.histRepo.add({
      companyId: lead.companyId,
      contactId: lead.contactId,
      leadId: lead.id,
      type: 'stage_change',
      title: `Estágio alterado: ${oldStage} ➔ ${newStage}`,
      description: note || `Lead avançou para o estágio "${stageDef?.label || newStage}".`,
      metadata: { previousStage: oldStage, newStage },
    });

    // Sincronizar client
    const [company, contact] = await Promise.all([
      this.compRepo.getById(lead.companyId),
      lead.contactId ? this.contRepo.getById(lead.contactId) : Promise.resolve(null),
    ]);

    if (company) {
      const primaryContact = contact || (await this.contRepo.getByCompanyId(company.id))[0];
      if (primaryContact) {
        await this.syncToClientStore(company, primaryContact, updatedLead);
      }
    }

    return updatedLead;
  }

  /**
   * Agenda ou atualiza a próxima ação do Lead
   */
  async scheduleNextAction(
    leadId: string,
    actionTitle: string,
    actionDate: string,
    channel: ContactChannel = 'whatsapp'
  ): Promise<Lead | null> {
    const lead = await this.leadRepo.getById(leadId);
    if (!lead) return null;

    const updated: Lead = {
      ...lead,
      nextActionTitle: actionTitle,
      nextActionDate: actionDate,
      nextActionChannel: channel,
      updatedAt: new Date().toISOString(),
    };

    await this.leadRepo.save(updated);

    await this.histRepo.add({
      companyId: lead.companyId,
      leadId,
      type: 'action_completed',
      title: `Próxima ação agendada: ${actionTitle}`,
      description: `Agendada para ${actionDate} via ${channel.toUpperCase()}`,
    });

    // Sincronizar com Client
    const [company, contact] = await Promise.all([
      this.compRepo.getById(lead.companyId),
      lead.contactId ? this.contRepo.getById(lead.contactId) : Promise.resolve(null),
    ]);

    if (company) {
      const primaryContact = contact || (await this.contRepo.getByCompanyId(company.id))[0];
      if (primaryContact) {
        await this.syncToClientStore(company, primaryContact, updated);
      }
    }

    // Criar/atualizar ação na fila de execução
    const actionItem: ProspectAction = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      clientId: lead.companyId,
      channel,
      scheduledDate: actionDate,
      status: 'pending',
      priority: lead.priority === 'alta' || lead.priority === 'high' ? 'high' : 'medium',
      estMinutes: 2,
      customMessage: actionTitle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await putInStore('actions', actionItem);

    return updated;
  }

  /**
   * Atualiza dados de um lead (incluindo preparedMessages)
   */
  async updateLead(lead: Lead): Promise<Lead> {
    const saved = await this.leadRepo.save(lead);
    const [company, contact] = await Promise.all([
      this.compRepo.getById(lead.companyId),
      lead.contactId ? this.contRepo.getById(lead.contactId) : Promise.resolve(null),
    ]);
    if (company) {
      const primaryContact = contact || (await this.contRepo.getByCompanyId(company.id))[0];
      if (primaryContact) {
        await this.syncToClientStore(company, primaryContact, saved);
      }
    }
    return saved;
  }

  /**
   * Adiciona um evento avulso diretamente na timeline de histórico da empresa
   */
  async addHistoryEvent(event: Omit<HistoryEvent, 'id' | 'timestamp'>): Promise<HistoryEvent> {
    return this.histRepo.add(event);
  }

  /**
   * Executa a finalização de uma interação de prospecção:
   * - Grava evento na timeline
   * - Atualiza último contato do lead
   * - Opcionalmente altera o estágio do lead
   * - Calcula ou agenda a próxima ação (garantindo que nenhum lead ativo fique sem próxima ação)
   */
  async logInteractionAndAdvance(params: {
    companyId: string;
    contactId?: string;
    leadId?: string;
    channel: ContactChannel;
    messageSent?: string;
    notes?: string;
    newStage?: LeadStage;
    nextActionTitle?: string;
    nextActionDate?: string;
    nextActionChannel?: ContactChannel;
  }): Promise<void> {
    const now = new Date().toISOString();
    const today = now.slice(0, 10);

    // 1. Obter Lead
    let lead = params.leadId ? await this.leadRepo.getById(params.leadId) : null;
    if (!lead) {
      lead = await this.leadRepo.getByCompanyId(params.companyId);
    }

    const company = await this.compRepo.getById(params.companyId);
    const contact = params.contactId ? await this.contRepo.getById(params.contactId) : (await this.contRepo.getByCompanyId(params.companyId))[0];

    // 2. Registrar evento na timeline
    await this.histRepo.add({
      companyId: params.companyId,
      contactId: params.contactId || contact?.id,
      leadId: lead?.id,
      type: 'message_sent',
      title: `Contacto realizado via ${params.channel.toUpperCase()}`,
      description: params.messageSent || params.notes || 'Mensagem enviada com sucesso.',
      metadata: {
        channel: params.channel,
        notes: params.notes,
        newStage: params.newStage,
      },
    });

    // 3. Atualizar Lead
    if (lead) {
      const stageToSet = params.newStage || (lead.stage === 'NOVO' ? 'PRIMEIRO_CONTACTO' : lead.stage);
      
      // Próxima ação padrão: se não informada, sugere follow-up em 2 dias para não deixar o lead sem próxima ação
      let nextTitle = params.nextActionTitle?.trim();
      let nextDate = params.nextActionDate;
      const nextChan = params.nextActionChannel || params.channel;

      if (!nextTitle && stageToSet !== 'CLIENTE' && stageToSet !== 'PERDIDO') {
        nextTitle = 'Follow-up #1 (Checar resposta)';
        const d = new Date();
        d.setDate(d.getDate() + 2);
        nextDate = d.toISOString().slice(0, 10);
      }

      const updatedLead: Lead = {
        ...lead,
        stage: stageToSet,
        status: stageToSet === 'CLIENTE' ? 'won' : stageToSet === 'PERDIDO' ? 'lost' : 'active',
        lastContactDate: today,
        nextActionTitle: nextTitle || undefined,
        nextActionDate: nextDate || undefined,
        nextActionChannel: nextChan,
        updatedAt: now,
      };

      await this.leadRepo.save(updatedLead);

      if (params.newStage && params.newStage !== lead.stage) {
        await this.histRepo.add({
          companyId: params.companyId,
          contactId: params.contactId || contact?.id,
          leadId: lead.id,
          type: 'stage_change',
          title: `Estágio avançado para ${params.newStage}`,
          description: params.notes || `Lead movido para ${STAGES_CONFIG[params.newStage]?.label || params.newStage}`,
        });
      }

      if (company && contact) {
        await this.syncToClientStore(company, contact, updatedLead);
      }
    }
  }

  /**
   * Sincroniza a entidade agregada na tabela Client para interoperabilidade contínua
   */
  private async syncToClientStore(company: Company, contact: Contact, lead: Lead): Promise<void> {
    const stageDef = STAGES_CONFIG[lead.stage];
    const clientStatus =
      company.status === 'archived'
        ? 'archived'
        : stageDef?.statusMapping || 'new';

    const client: Client = {
      id: company.id,
      name: contact.name,
      company: company.name,
      role: contact.role,
      phone: contact.phone,
      whatsapp: contact.whatsapp || contact.phone,
      email: contact.email,
      website: company.website,
      linkedinUrl: company.linkedin,
      segment: company.niche || company.category,
      status: clientStatus,
      stageId: `stage-${lead.stage.toLowerCase()}`,
      serviceIds: lead.serviceId ? [lead.serviceId] : [],
      notes: [company.notes, contact.notes, lead.notes].filter(Boolean).join(' | '),
      tags: [company.niche, lead.priority, lead.temperature, lead.stage].filter(Boolean) as string[],
      lastContactedAt: lead.lastContactDate ? `${lead.lastContactDate}T12:00:00Z` : undefined,
      nextFollowUpDate: lead.nextActionDate,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };

    await putInStore('clients', client);
  }
}

export const leadService = new LeadService();

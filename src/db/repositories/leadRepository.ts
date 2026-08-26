import { Lead, LeadStage } from '../../types';
import { deleteFromStore, getAllFromStore, getFromStore, putInStore } from '../indexedDB';

export class LeadRepository {
  async getAll(): Promise<Lead[]> {
    return getAllFromStore<Lead>('leads');
  }

  async getById(id: string): Promise<Lead | null> {
    return getFromStore<Lead>('leads', id);
  }

  async getByCompanyId(companyId: string): Promise<Lead | null> {
    const all = await this.getAll();
    return all.find((l) => l.companyId === companyId) || null;
  }

  async save(lead: Lead): Promise<Lead> {
    const now = new Date().toISOString();
    const toSave: Lead = {
      ...lead,
      createdAt: lead.createdAt || now,
      updatedAt: now,
    };
    await putInStore('leads', toSave);
    return toSave;
  }

  async updateStage(id: string, newStage: LeadStage): Promise<Lead | null> {
    const existing = await this.getById(id);
    if (!existing) return null;
    const updated: Lead = {
      ...existing,
      stage: newStage,
      updatedAt: new Date().toISOString(),
    };
    await putInStore('leads', updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await deleteFromStore('leads', id);
  }

  async deleteByCompanyId(companyId: string): Promise<void> {
    const lead = await this.getByCompanyId(companyId);
    if (lead) {
      await this.delete(lead.id);
    }
  }
}

export const leadRepository = new LeadRepository();

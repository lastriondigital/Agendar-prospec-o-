import { Company } from '../../types';
import { deleteFromStore, getAllFromStore, getFromStore, putInStore } from '../indexedDB';
import { syncEngine } from '../../services/syncEngine';

export class CompanyRepository {
  async getAll(): Promise<Company[]> {
    const companies = await getAllFromStore<Company>('companies');
    return companies.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  }

  async getById(id: string): Promise<Company | null> {
    return getFromStore<Company>('companies', id);
  }

  async save(company: Company): Promise<Company> {
    const now = new Date().toISOString();
    const toSave: Company = {
      ...company,
      createdAt: company.createdAt || now,
      updatedAt: now,
    };
    await putInStore('companies', toSave);
    await syncEngine.enqueueChange('companies', toSave.id, 'update', toSave);
    return toSave;
  }

  async archive(id: string): Promise<Company | null> {
    const existing = await this.getById(id);
    if (!existing) return null;
    const updated: Company = {
      ...existing,
      status: 'archived',
      updatedAt: new Date().toISOString(),
    };
    await putInStore('companies', updated);
    await syncEngine.enqueueChange('companies', updated.id, 'update', updated);
    return updated;
  }

  async unarchive(id: string): Promise<Company | null> {
    const existing = await this.getById(id);
    if (!existing) return null;
    const updated: Company = {
      ...existing,
      status: 'lead',
      updatedAt: new Date().toISOString(),
    };
    await putInStore('companies', updated);
    await syncEngine.enqueueChange('companies', updated.id, 'update', updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await deleteFromStore('companies', id);
    await syncEngine.enqueueChange('companies', id, 'delete', { id });
  }
}

export const companyRepository = new CompanyRepository();


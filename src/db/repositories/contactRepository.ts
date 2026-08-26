import { Contact } from '../../types';
import { deleteFromStore, getAllFromStore, getFromStore, putInStore } from '../indexedDB';

export class ContactRepository {
  async getAll(): Promise<Contact[]> {
    return getAllFromStore<Contact>('contacts');
  }

  async getById(id: string): Promise<Contact | null> {
    return getFromStore<Contact>('contacts', id);
  }

  async getByCompanyId(companyId: string): Promise<Contact[]> {
    const all = await this.getAll();
    return all.filter((c) => c.companyId === companyId);
  }

  async save(contact: Contact): Promise<Contact> {
    const now = new Date().toISOString();
    const toSave: Contact = {
      ...contact,
      createdAt: contact.createdAt || now,
      updatedAt: now,
    };
    await putInStore('contacts', toSave);
    return toSave;
  }

  async delete(id: string): Promise<void> {
    await deleteFromStore('contacts', id);
  }

  async deleteByCompanyId(companyId: string): Promise<void> {
    const contacts = await this.getByCompanyId(companyId);
    for (const c of contacts) {
      await this.delete(c.id);
    }
  }
}

export const contactRepository = new ContactRepository();

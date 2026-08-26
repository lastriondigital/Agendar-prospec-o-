import { HistoryEvent } from '../../types';
import { deleteFromStore, getAllFromStore, putInStore } from '../indexedDB';

export class HistoryRepository {
  async getAll(): Promise<HistoryEvent[]> {
    const events = await getAllFromStore<HistoryEvent>('history');
    return events.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
  }

  async getByCompanyId(companyId: string): Promise<HistoryEvent[]> {
    const all = await this.getAll();
    return all.filter((h) => h.companyId === companyId);
  }

  async getByLeadId(leadId: string): Promise<HistoryEvent[]> {
    const all = await this.getAll();
    return all.filter((h) => h.leadId === leadId);
  }

  async add(event: Omit<HistoryEvent, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<HistoryEvent> {
    const fullEvent: HistoryEvent = {
      id: event.id || `hist-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      companyId: event.companyId,
      contactId: event.contactId,
      leadId: event.leadId,
      type: event.type,
      title: event.title,
      description: event.description,
      metadata: event.metadata,
      timestamp: event.timestamp || new Date().toISOString(),
    };
    await putInStore('history', fullEvent);
    return fullEvent;
  }

  async delete(id: string): Promise<void> {
    await deleteFromStore('history', id);
  }

  async deleteByCompanyId(companyId: string): Promise<void> {
    const events = await this.getByCompanyId(companyId);
    for (const e of events) {
      await this.delete(e.id);
    }
  }
}

export const historyRepository = new HistoryRepository();

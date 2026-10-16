import { api } from '../lib/api';
import type { CreateEventInput, EventItem } from '../types/event';

export const eventService = {
  async getAll(): Promise<EventItem[]> {
    return api.get<EventItem[]>('/api/events');
  },

  async getById(id: number): Promise<EventItem> {
    return api.get<EventItem>(`/api/events/${id}`);
  },

  async create(data: CreateEventInput): Promise<EventItem> {
    return api.post<EventItem>('/api/events', data);
  },
};

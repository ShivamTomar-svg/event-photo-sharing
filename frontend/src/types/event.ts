export interface EventItem {
  id: number;
  name: string;
  description?: string | null;
  eventDate: string; // ISO date 'YYYY-MM-DD'
  location: string;
  organizerId: number;
  organizerName: string;
  createdAt: string;
}

export interface CreateEventInput {
  name: string;
  description?: string;
  eventDate: string;
  location: string;
}

export type EventSortOption = 'date-asc' | 'date-desc' | 'name-asc' | 'created-desc';

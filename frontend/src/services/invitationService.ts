import { api } from '../lib/api';
import type { EventInvitationItem } from '../types/invitation';

export const invitationService = {
  async inviteGuest(eventId: number, guestEmail: string): Promise<EventInvitationItem> {
    return api.post<EventInvitationItem>(`/api/events/${eventId}/invitations`, { guestEmail });
  },

  async getEventInvitations(eventId: number): Promise<EventInvitationItem[]> {
    return api.get<EventInvitationItem[]>(`/api/events/${eventId}/invitations`);
  },

  async getMyInvitations(): Promise<EventInvitationItem[]> {
    return api.get<EventInvitationItem[]>('/api/my-invitations');
  },

  async respond(invitationId: number, status: 'ACCEPTED' | 'REJECTED'): Promise<EventInvitationItem> {
    return api.put<EventInvitationItem>(`/api/my-invitations/${invitationId}/respond`, { status });
  },
};

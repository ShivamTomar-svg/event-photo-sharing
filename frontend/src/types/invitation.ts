export interface EventInvitationItem {
  id: number;
  eventId: number;
  eventName: string;
  inviteeId: number;
  inviteeEmail: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'DECLINED';
  invitedAt: string;
}

export interface MyInvitationItem {
  invitationId: number;
  eventId: number;
  eventName: string;
  eventDate: string;
  location: string;
  organizerName: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'DECLINED';
  invitedAt: string;
}

import React, { useState, useEffect } from 'react';
import { Mail, UserPlus, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { invitationService } from '../../services/invitationService';
import { useToast } from '../../context/ToastContext';
import type { EventInvitationItem } from '../../types/invitation';

export interface InviteGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number;
  eventName: string;
}

export const InviteGuestModal: React.FC<InviteGuestModalProps> = ({
  isOpen,
  onClose,
  eventId,
  eventName,
}) => {
  const { success, error: toastError } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitations, setInvitations] = useState<EventInvitationItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  useEffect(() => {
    if (isOpen && eventId) {
      loadInvitations();
    }
  }, [isOpen, eventId]);

  const loadInvitations = async () => {
    setIsLoadingList(true);
    try {
      const data = await invitationService.getEventInvitations(eventId);
      setInvitations(data || []);
    } catch {
      // ignore
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await invitationService.inviteGuest(eventId, email.trim().toLowerCase());
      success(`Invitation sent to ${email.trim()}!`);
      setEmail('');
      loadInvitations();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send invitation';
      toastError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Guests"
      description={`Invite attendees to contribute and browse photos in "${eventName}".`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              type="email"
              placeholder="guest@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<UserPlus className="w-4 h-4" />}
            className="flex-shrink-0"
          >
            Send Invite
          </Button>
        </form>

        <div className="border-t border-slate-100 pt-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
            <span>Invited Guests ({invitations.length})</span>
            {isLoadingList && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E83E8C]" />}
          </h4>

          {invitations.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">
              No invitations have been sent for this event yet.
            </p>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {invitations.map((inv) => {
                const isAccepted = inv.status === 'ACCEPTED';
                const isRejected = inv.status === 'REJECTED' || inv.status === 'DECLINED';
                const isPending = !isAccepted && !isRejected;

                return (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm"
                  >
                    <div className="flex items-center gap-2.5 truncate mr-2">
                      <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                        {inv.inviteeEmail.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800 truncate">
                        {inv.inviteeEmail}
                      </span>
                    </div>

                    <div className="flex-shrink-0">
                      {isAccepted && (
                        <Badge variant="green" className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Accepted</span>
                        </Badge>
                      )}
                      {isPending && (
                        <Badge variant="orange" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Pending</span>
                        </Badge>
                      )}
                      {isRejected && (
                        <Badge variant="red" className="flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          <span>Declined</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

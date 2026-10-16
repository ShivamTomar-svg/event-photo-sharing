import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Check, X, ArrowRight, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { invitationService } from '../services/invitationService';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { formatDate } from '../lib/utils';
import type { EventInvitationItem } from '../types/invitation';

export const InvitationsPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [invitations, setInvitations] = useState<EventInvitationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgressId, setActionInProgressId] = useState<number | null>(null);

  const loadInvitations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await invitationService.getMyInvitations();
      setInvitations(data || []);
    } catch (err: unknown) {
      console.error('Failed to load invitations', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  const handleRespond = async (invitationId: number, status: 'ACCEPTED' | 'REJECTED') => {
    setActionInProgressId(invitationId);
    try {
      await invitationService.respond(invitationId, status);
      success(
        status === 'ACCEPTED'
          ? 'Invitation accepted! You can now access the event gallery.'
          : 'Invitation declined.'
      );
      // Update local state optimistically
      setInvitations((prev) =>
        prev.map((inv) => (inv.id === invitationId ? { ...inv, status } : inv))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update invitation status';
      toastError(msg);
    } finally {
      setActionInProgressId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Event Invitations
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review invitations sent to your email and RSVP to participate in private galleries.
        </p>
      </div>

      {/* Invitations List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : invitations.length === 0 ? (
        <EmptyState
          icon={<Mail className="w-8 h-8 text-[#E83E8C]" />}
          title="No invitations yet"
          description="When event organizers invite your email address, invitations will show up here for you to accept or decline."
          actionLabel="Explore Public Events"
          onAction={() => window.location.assign('/events')}
          actionVariant="secondary"
        />
      ) : (
        <div className="space-y-4">
          {invitations.map((inv) => {
            const isAccepted = inv.status === 'ACCEPTED';
            const isRejected = inv.status === 'REJECTED' || inv.status === 'DECLINED';
            const isPending = !isAccepted && !isRejected;
            const isBusy = actionInProgressId === inv.id;

            return (
              <div
                key={inv.id}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-pink-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900">{inv.eventName}</h3>
                    {isAccepted && (
                      <Badge variant="green" className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Accepted</span>
                      </Badge>
                    )}
                    {isPending && (
                      <Badge variant="orange" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Pending RSVP</span>
                      </Badge>
                    )}
                    {isRejected && (
                      <Badge variant="red" className="flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        <span>Declined</span>
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-slate-500">
                    Invited: {formatDate(inv.invitedAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  {isPending ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRespond(inv.id, 'REJECTED')}
                        isLoading={isBusy}
                        leftIcon={<X className="w-3.5 h-3.5" />}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleRespond(inv.id, 'ACCEPTED')}
                        isLoading={isBusy}
                        leftIcon={<Check className="w-3.5 h-3.5" />}
                      >
                        Accept RSVP
                      </Button>
                    </>
                  ) : isAccepted ? (
                    <Link to={`/events/${inv.eventId}`}>
                      <Button
                        size="sm"
                        variant="secondary"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        Go to Event
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRespond(inv.id, 'ACCEPTED')}
                      isLoading={isBusy}
                    >
                      Re-Accept
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Calendar, Plus, Camera, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import { invitationService } from '../services/invitationService';
import { photoService } from '../services/photoService';
import { EventCard } from '../components/events/EventCard';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import type { EventItem } from '../types/event';
import type { EventInvitationItem } from '../types/invitation';

interface OutletContextType {
  openCreateModal: () => void;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const { openCreateModal } = useOutletContext<OutletContextType>();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [invitations, setInvitations] = useState<EventInvitationItem[]>([]);
  const [photoCounts, setPhotoCounts] = useState<Record<number, number>>({});
  const [totalPhotosCount, setTotalPhotosCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch accessible events
      const eventsData = await eventService.getAll();
      setEvents(eventsData || []);

      // 2. Fetch invitations
      try {
        const invData = await invitationService.getMyInvitations();
        setInvitations(invData || []);
      } catch {
        // Invitations might be empty or restricted
      }

      // 3. For each accessible event, fetch photo count
      if (eventsData && eventsData.length > 0) {
        let totalPhotos = 0;
        const counts: Record<number, number> = {};

        // Fetch counts in parallel
        await Promise.all(
          eventsData.map(async (ev) => {
            try {
              const photos = await photoService.getByEvent(ev.id);
              counts[ev.id] = photos.length;
              totalPhotos += photos.length;
            } catch {
              counts[ev.id] = 0;
            }
          })
        );

        setPhotoCounts(counts);
        setTotalPhotosCount(totalPhotos);
      }
    } catch (err: unknown) {
      console.error('Error loading dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();

    // Listen to global event creation to re-fetch
    const handleEventCreated = () => {
      loadDashboardData();
    };

    window.addEventListener('event:created', handleEventCreated);
    return () => window.removeEventListener('event:created', handleEventCreated);
  }, [loadDashboardData]);

  // Handle RSVP response directly from dashboard banner
  const handleRsvp = async (invitationId: number, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await invitationService.respond(invitationId, status);
      success(
        status === 'ACCEPTED'
          ? 'Invitation accepted! Event added to your gallery.'
          : 'Invitation declined.'
      );
      loadDashboardData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update RSVP';
      toastError(msg);
    }
  };

  const hostedCount = events.filter((e) => e.organizerId === user?.id).length;
  const pendingInvitations = invitations.filter((i) => i.status === 'PENDING');
  const recentEvents = events.slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E83E8C] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome Back</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Hi, {user?.fullName || 'Photographer'} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here's what is happening across your events and shared galleries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="orange"
            onClick={openCreateModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Event
          </Button>
        </div>
      </div>

      {/* Pending Invitations Alert Banner */}
      {pendingInvitations.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-pink-500/10 border border-orange-200/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF8A3D] flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                You have {pendingInvitations.length} pending event {pendingInvitations.length === 1 ? 'invitation' : 'invitations'}!
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Latest from <strong>"{pendingInvitations[0].eventName}"</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => handleRsvp(pendingInvitations[0].id, 'REJECTED')}
            >
              Decline
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="text-xs"
              onClick={() => handleRsvp(pendingInvitations[0].id, 'ACCEPTED')}
            >
              Accept RSVP
            </Button>
            {pendingInvitations.length > 1 && (
              <Link to="/invitations" className="ml-2 text-xs font-bold text-[#E83E8C] hover:underline">
                View all ({pendingInvitations.length})
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Stat 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFF0F6] text-[#E83E8C] flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Events</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {isLoading ? <Skeleton className="h-7 w-12" /> : events.length}
            </h3>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFF4ED] text-[#FF8A3D] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Hosted by Me</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {isLoading ? <Skeleton className="h-7 w-12" /> : hostedCount}
            </h3>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-pink-100/60 text-[#E83E8C] flex items-center justify-center flex-shrink-0">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Photos Gathered</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {isLoading ? <Skeleton className="h-7 w-12" /> : totalPhotosCount}
            </h3>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending RSVPs</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {isLoading ? <Skeleton className="h-7 w-12" /> : pendingInvitations.length}
            </h3>
          </div>
        </div>
      </div>

      {/* Recent Events Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Recent Events
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Select an event to view, upload, or download photos.
            </p>
          </div>

          {events.length > 0 && (
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E83E8C] hover:text-[#D62F7C] transition-colors"
            >
              <span>View All ({events.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
                <Skeleton className="h-36 w-full rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-8 h-8 text-[#E83E8C]" />}
            title="You don't have any events yet"
            description="Create your first event to start gathering photos from your wedding, birthday, or conference."
            actionLabel="Create My First Event"
            onAction={openCreateModal}
            actionVariant="primary"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                photoCount={photoCounts[event.id]}
                isOrganizer={event.organizerId === user?.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

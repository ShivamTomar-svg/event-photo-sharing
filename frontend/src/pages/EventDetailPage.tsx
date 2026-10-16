import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  User as UserIcon,
  UploadCloud,
  UserPlus,
  Share2,
  ArrowLeft,
  Camera,
  RefreshCw,
} from 'lucide-react';
import { eventService } from '../services/eventService';
import { photoService } from '../services/photoService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { PhotoGrid } from '../components/photos/PhotoGrid';
import { PhotoUploadModal } from '../components/photos/PhotoUploadModal';
import { PhotoLightbox } from '../components/photos/PhotoLightbox';
import { InviteGuestModal } from '../components/events/InviteGuestModal';
import { formatDate, getEventGradient } from '../lib/utils';
import type { EventItem } from '../types/event';
import type { PhotoItem } from '../types/photo';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const eventId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError, info } = useToast();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<PhotoItem | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<PhotoItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    if (!eventId || isNaN(eventId)) {
      navigate('/events', { replace: true });
      return;
    }

    try {
      const [eventData, photosData] = await Promise.all([
        eventService.getById(eventId),
        photoService.getByEvent(eventId),
      ]);
      setEvent(eventData);
      setPhotos(photosData || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load event details';
      toastError(msg);
      navigate('/events', { replace: true });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [eventId, navigate, toastError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    info('Event link copied to clipboard!');
  };

  const handleDownload = async (photo: PhotoItem) => {
    try {
      info(`Downloading "${photo.fileName}"...`);
      await photoService.downloadPhoto(eventId, photo.id, photo.fileName);
      success('Download completed!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Download failed';
      toastError(msg);
    }
  };

  const confirmDeletePhoto = async () => {
    if (!photoToDelete) return;

    setIsDeleting(true);
    try {
      await photoService.delete(eventId, photoToDelete.id);
      success('Photo removed from event gallery.');
      setPhotos((prev) => prev.filter((p) => p.id !== photoToDelete.id));

      if (activeLightboxPhoto?.id === photoToDelete.id) {
        setActiveLightboxPhoto(null);
      }
      setPhotoToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete photo';
      toastError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-48 w-full rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!event) return null;

  const isOrganizer = user?.id === event.organizerId;
  const gradient = getEventGradient(event.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Back Link */}
      <Link
        to="/events"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-[#E83E8C] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events</span>
      </Link>

      {/* Hero Banner Header */}
      <div className={`relative rounded-3xl bg-gradient-to-tr ${gradient} p-6 sm:p-10 text-white shadow-xl overflow-hidden`}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant={isOrganizer ? 'pink' : 'orange'} className="bg-white/90 backdrop-blur-md shadow-xs">
                {isOrganizer ? 'Hosted by You' : 'You are Invited'}
              </Badge>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black/25 backdrop-blur-md">
                <Camera className="w-3.5 h-3.5" />
                <span>{photos.length} {photos.length === 1 ? 'photo' : 'photos'}</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight drop-shadow-sm">
              {event.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/90 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-white" />
                <span className="font-semibold">{formatDate(event.eventDate)}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-white" />
                <span>{event.location}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <UserIcon className="w-4 h-4 text-white" />
                <span>Organizer: {event.organizerName}</span>
              </span>
            </div>

            {event.description && (
              <p className="text-xs sm:text-sm text-white/85 max-w-xl pt-2 leading-relaxed">
                {event.description}
              </p>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              leftIcon={<Share2 className="w-4 h-4 text-[#E83E8C]" />}
              className="bg-white/95 text-slate-800 border-none font-semibold shadow-md"
            >
              Share Link
            </Button>

            {isOrganizer && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsInviteOpen(true)}
                leftIcon={<UserPlus className="w-4 h-4 text-[#FF8A3D]" />}
                className="bg-white/95 text-slate-800 border-none font-semibold shadow-md"
              >
                Invite Guests
              </Button>
            )}

            <Button
              variant="orange"
              size="sm"
              onClick={() => setIsUploadOpen(true)}
              leftIcon={<UploadCloud className="w-4 h-4" />}
              className="shadow-md"
            >
              Upload Photos
            </Button>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Event Gallery
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF0F6] text-[#E83E8C]">
              {photos.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Refresh Gallery"
              aria-label="Refresh gallery"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Photos Grid */}
        <PhotoGrid
          photos={photos}
          currentUserId={user?.id}
          isOrganizer={isOrganizer}
          onOpenLightbox={(photo) => setActiveLightboxPhoto(photo)}
          onDownload={handleDownload}
          onDelete={(photo) => setPhotoToDelete(photo)}
          onUploadClick={() => setIsUploadOpen(true)}
        />
      </div>

      {/* Upload Modal */}
      <PhotoUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        eventId={event.id}
        eventName={event.name}
        onUploadSuccess={loadData}
      />

      {/* Invite Modal */}
      <InviteGuestModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        eventId={event.id}
        eventName={event.name}
      />

      {/* Lightbox Preview */}
      <PhotoLightbox
        photo={activeLightboxPhoto}
        photos={photos}
        isOpen={!!activeLightboxPhoto}
        canDelete={
          isOrganizer ||
          (user?.id !== undefined && activeLightboxPhoto?.uploadedById === user.id)
        }
        onClose={() => setActiveLightboxPhoto(null)}
        onDownload={handleDownload}
        onDelete={(photo) => setPhotoToDelete(photo)}
        onSelectPhoto={(photo) => setActiveLightboxPhoto(photo)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!photoToDelete}
        onClose={() => setPhotoToDelete(null)}
        onConfirm={confirmDeletePhoto}
        title="Delete Photo?"
        message={`Are you sure you want to permanently delete "${photoToDelete?.fileName}"? This action cannot be undone.`}
        confirmLabel="Delete Photo"
        isDangerous={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

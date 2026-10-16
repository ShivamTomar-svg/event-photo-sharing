import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Trash2, ZoomIn, ZoomOut, Calendar, HardDrive } from 'lucide-react';
import { AuthenticatedImage } from '../common/AuthenticatedImage';
import { formatFileSize, formatDateTime } from '../../lib/utils';
import type { PhotoItem } from '../../types/photo';

export interface PhotoLightboxProps {
  photo: PhotoItem | null;
  photos: PhotoItem[];
  isOpen: boolean;
  canDelete: boolean;
  onClose: () => void;
  onDownload: (photo: PhotoItem) => void;
  onDelete: (photo: PhotoItem) => void;
  onSelectPhoto: (photo: PhotoItem) => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  photo,
  photos,
  isOpen,
  canDelete,
  onClose,
  onDownload,
  onDelete,
  onSelectPhoto,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || !photo) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        navigatePrev();
      } else if (e.key === 'ArrowRight') {
        navigateNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, photo, photos]);

  // Reset zoom whenever active photo changes
  useEffect(() => {
    setIsZoomed(false);
  }, [photo]);

  if (!isOpen || !photo) return null;

  const currentIndex = photos.findIndex((p) => p.id === photo.id);
  const totalCount = photos.length;

  const navigatePrev = () => {
    if (totalCount <= 1) return;
    const prevIndex = (currentIndex - 1 + totalCount) % totalCount;
    onSelectPhoto(photos[prevIndex]);
  };

  const navigateNext = () => {
    if (totalCount <= 1) return;
    const nextIndex = (currentIndex + 1) % totalCount;
    onSelectPhoto(photos[nextIndex]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none animate-fade-in">
      {/* Top Header Bar */}
      <div className="absolute top-0 inset-x-0 h-16 sm:h-20 px-4 sm:px-6 flex items-center justify-between text-white z-20 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold tracking-widest uppercase bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-md">
            {currentIndex + 1} of {totalCount}
          </span>
          <span className="text-sm font-semibold truncate max-w-[200px] sm:max-w-md drop-shadow">
            {photo.fileName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Toggle */}
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={isZoomed ? 'Zoom Out' : 'Zoom In'}
            aria-label="Toggle zoom"
          >
            {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
          </button>

          {/* Download Button */}
          <button
            onClick={() => onDownload(photo)}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Download Original"
            aria-label="Download original"
          >
            <Download className="w-5 h-5" />
          </button>

          {/* Delete Button */}
          {canDelete && (
            <button
              onClick={() => onDelete(photo)}
              className="p-2.5 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white transition-colors"
              title="Delete Photo"
              aria-label="Delete photo"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors ml-2"
            title="Close Lightbox"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div
        className="w-full h-full flex items-center justify-center p-4 sm:p-14 overflow-hidden"
        onClick={() => !isZoomed && onClose()}
      >
        <div
          className={`relative max-w-full max-h-full transition-all duration-300 ${
            isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-default'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <AuthenticatedImage
            eventId={photo.eventId}
            photoId={photo.id}
            alt={photo.fileName}
            className="max-h-[82vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
          />
        </div>
      </div>

      {/* Previous Arrow */}
      {totalCount > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigatePrev();
          }}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all backdrop-blur-md active:scale-95 z-20"
          aria-label="Previous photo"
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      )}

      {/* Next Arrow */}
      {totalCount > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigateNext();
          }}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all backdrop-blur-md active:scale-95 z-20"
          aria-label="Next photo"
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      )}

      {/* Bottom Metadata Bar */}
      <div className="absolute bottom-0 inset-x-0 h-14 px-6 flex items-center justify-between text-white/70 text-xs z-20 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5" />
            <span>{formatFileSize(photo.fileSize)}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDateTime(photo.uploadedAt)}</span>
          </span>
        </div>
        <div className="hidden sm:block text-slate-400">
          Tip: Use <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">←</kbd> and <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">→</kbd> keys to navigate
        </div>
      </div>
    </div>
  );
};

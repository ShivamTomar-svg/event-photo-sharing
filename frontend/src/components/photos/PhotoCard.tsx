import React from 'react';
import { Download, Trash2, Maximize2 } from 'lucide-react';
import { AuthenticatedImage } from '../common/AuthenticatedImage';
import { formatFileSize, formatDateTime } from '../../lib/utils';
import type { PhotoItem } from '../../types/photo';

export interface PhotoCardProps {
  photo: PhotoItem;
  canDelete: boolean;
  onOpenLightbox: (photo: PhotoItem) => void;
  onDownload: (photo: PhotoItem) => void;
  onDelete: (photo: PhotoItem) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  canDelete,
  onOpenLightbox,
  onDownload,
  onDelete,
}) => {
  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-card-hover overflow-hidden transition-all duration-300">
      {/* Photo Image Aspect */}
      <div
        className="w-full aspect-[4/3] relative cursor-pointer overflow-hidden bg-slate-100"
        onClick={() => onOpenLightbox(photo)}
      >
        <AuthenticatedImage
          eventId={photo.eventId}
          photoId={photo.id}
          alt={photo.fileName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5">
          {/* Top Bar with Actions */}
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onDownload(photo)}
              title="Download Photo"
              className="p-2 rounded-xl bg-white/80 hover:bg-white text-slate-800 backdrop-blur-md shadow-sm transition-transform active:scale-95"
              aria-label="Download photo"
            >
              <Download className="w-4 h-4" />
            </button>
            {canDelete && (
              <button
                onClick={() => onDelete(photo)}
                title="Delete Photo"
                className="p-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white backdrop-blur-md shadow-sm transition-transform active:scale-95"
                aria-label="Delete photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Bottom Bar with Metadata */}
          <div className="text-white">
            <p className="text-xs font-semibold truncate drop-shadow-sm">{photo.fileName}</p>
            <div className="flex items-center justify-between text-[11px] text-white/80 mt-0.5">
              <span>{formatFileSize(photo.fileSize)}</span>
              <span>{formatDateTime(photo.uploadedAt)}</span>
            </div>
          </div>
        </div>

        {/* Zoom Indicator badge */}
        <div className="absolute bottom-2.5 right-2.5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="p-1.5 rounded-lg bg-black/40 text-white backdrop-blur-md">
            <Maximize2 className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

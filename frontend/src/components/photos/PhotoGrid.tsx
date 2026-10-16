import React from 'react';
import { Camera } from 'lucide-react';
import { PhotoCard } from './PhotoCard';
import { EmptyState } from '../common/EmptyState';
import type { PhotoItem } from '../../types/photo';

export interface PhotoGridProps {
  photos: PhotoItem[];
  currentUserId?: number;
  isOrganizer?: boolean;
  onOpenLightbox: (photo: PhotoItem) => void;
  onDownload: (photo: PhotoItem) => void;
  onDelete: (photo: PhotoItem) => void;
  onUploadClick?: () => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  currentUserId,
  isOrganizer = false,
  onOpenLightbox,
  onDownload,
  onDelete,
  onUploadClick,
}) => {
  if (photos.length === 0) {
    return (
      <EmptyState
        icon={<Camera className="w-8 h-8" />}
        title="No photos shared yet"
        description="Be the first to upload memories from this event! High-resolution photos are supported."
        actionLabel={onUploadClick ? "Upload First Photo" : undefined}
        onAction={onUploadClick}
        actionVariant="primary"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {photos.map((photo) => {
        const isUploader = currentUserId !== undefined && photo.uploadedById === currentUserId;
        const canDelete = isOrganizer || isUploader;

        return (
          <PhotoCard
            key={photo.id}
            photo={photo}
            canDelete={canDelete}
            onOpenLightbox={onOpenLightbox}
            onDownload={onDownload}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
};

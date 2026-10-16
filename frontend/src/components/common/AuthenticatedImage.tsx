import React from 'react';
import { ImageOff, Loader2 } from 'lucide-react';
import { usePhotoUrl } from '../../hooks/usePhotoUrl';
import { cn } from '../../lib/utils';

export interface AuthenticatedImageProps {
  eventId: number;
  photoId: number;
  alt: string;
  className?: string;
  onClick?: () => void;
}

export const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({
  eventId,
  photoId,
  alt,
  className,
  onClick,
}) => {
  const { url, loading, error } = usePhotoUrl(eventId, photoId);

  if (loading) {
    return (
      <div
        className={cn(
          'w-full h-full bg-slate-100 flex items-center justify-center animate-pulse text-slate-400',
          className
        )}
      >
        <Loader2 className="w-6 h-6 animate-spin text-[#E83E8C]/60" />
      </div>
    );
  }

  if (error || !url) {
    return (
      <div
        className={cn(
          'w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400 p-4 text-center',
          className
        )}
      >
        <ImageOff className="w-8 h-8 mb-1.5 opacity-60" />
        <span className="text-xs">Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      onClick={onClick}
      className={cn('w-full h-full object-cover transition-opacity duration-300', className)}
    />
  );
};

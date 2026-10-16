import { api } from '../lib/api';
import type { PhotoItem } from '../types/photo';

export const photoService = {
  async getByEvent(eventId: number): Promise<PhotoItem[]> {
    return api.get<PhotoItem[]>(`/api/events/${eventId}/photos`);
  },

  async upload(eventId: number, file: File): Promise<PhotoItem> {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<PhotoItem>(`/api/events/${eventId}/photos`, formData);
  },

  async getPhotoBlob(eventId: number, photoId: number): Promise<Blob> {
    return api.getBlob(`/api/events/${eventId}/photos/${photoId}/view`);
  },

  async downloadPhoto(eventId: number, photoId: number, fileName: string): Promise<void> {
    const blob = await api.getBlob(`/api/events/${eventId}/photos/${photoId}/download`);
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName || `photo-${photoId}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(objectUrl);
  },

  async delete(eventId: number, photoId: number): Promise<void> {
    return api.delete<void>(`/api/events/${eventId}/photos/${photoId}`);
  },
};

import { useState, useEffect } from 'react';
import { photoService } from '../services/photoService';

// Module-level cache so image blobs are retained in memory across renders
const urlCache = new Map<string, string>();
const pendingPromises = new Map<string, Promise<string>>();

export function usePhotoUrl(eventId?: number, photoId?: number) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!eventId || !photoId) {
      setUrl(null);
      setLoading(false);
      return;
    }

    const key = `${eventId}:${photoId}`;

    if (urlCache.has(key)) {
      setUrl(urlCache.get(key)!);
      setLoading(false);
      setError(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(false);

    let promise = pendingPromises.get(key);
    if (!promise) {
      promise = photoService.getPhotoBlob(eventId, photoId).then((blob) => {
        const objectUrl = window.URL.createObjectURL(blob);
        urlCache.set(key, objectUrl);
        pendingPromises.delete(key);
        return objectUrl;
      }).catch((err) => {
        pendingPromises.delete(key);
        throw err;
      });
      pendingPromises.set(key, promise);
    }

    promise
      .then((objectUrl) => {
        if (isMounted) {
          setUrl(objectUrl);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [eventId, photoId]);

  return { url, loading, error };
}

export function clearPhotoCache() {
  urlCache.forEach((objectUrl) => window.URL.revokeObjectURL(objectUrl));
  urlCache.clear();
  pendingPromises.clear();
}

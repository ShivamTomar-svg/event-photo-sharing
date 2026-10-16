export interface PhotoItem {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  eventId: number;
  uploadedById: number;
  uploadedAt: string;
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
  result?: PhotoItem;
}

import React, { useState, useRef } from 'react';
import { UploadCloud, X, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { photoService } from '../../services/photoService';
import { useToast } from '../../context/ToastContext';
import { formatFileSize } from '../../lib/utils';
import type { UploadProgress } from '../../types/photo';

export interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number;
  eventName: string;
  onUploadSuccess: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB backend constraint

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  eventId,
  eventName,
  onUploadSuccess,
}) => {
  const { success, error: toastError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newEntries: UploadProgress[] = [];

    Array.from(fileList).forEach((file) => {
      // Validate MIME type
      if (!file.type.startsWith('image/')) {
        toastError(`"${file.name}" is not an image file.`);
        return;
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        toastError(`"${file.name}" exceeds the 10MB size limit (${formatFileSize(file.size)}).`);
        return;
      }

      // Check if already in queue
      if (queue.some((item) => item.file.name === file.name && item.file.size === file.size)) {
        return;
      }

      newEntries.push({
        file,
        progress: 0,
        status: 'pending',
      });
    });

    setQueue((prev) => [...prev, ...newEntries]);
  };

  const removeQueueItem = (index: number) => {
    if (isUploading) return;
    setQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const startUpload = async () => {
    if (queue.length === 0 || isUploading) return;

    setIsUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'success') continue;

      // Update status to uploading
      setQueue((prev) =>
        prev.map((q, idx) => (idx === i ? { ...q, status: 'uploading', progress: 50 } : q))
      );

      try {
        const uploaded = await photoService.upload(eventId, item.file);
        successCount++;
        setQueue((prev) =>
          prev.map((q, idx) =>
            idx === i ? { ...q, status: 'success', progress: 100, result: uploaded } : q
          )
        );
      } catch (err: unknown) {
        failCount++;
        const message = err instanceof Error ? err.message : 'Upload failed';
        setQueue((prev) =>
          prev.map((q, idx) =>
            idx === i ? { ...q, status: 'error', progress: 0, errorMessage: message } : q
          )
        );
      }
    }

    setIsUploading(false);

    if (successCount > 0) {
      success(`Successfully uploaded ${successCount} ${successCount === 1 ? 'photo' : 'photos'}!`);
      onUploadSuccess();
      if (failCount === 0) {
        setTimeout(() => {
          setQueue([]);
          onClose();
        }, 1200);
      }
    } else if (failCount > 0) {
      toastError(`Failed to upload photos. Please check file sizes or try again.`);
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setQueue([]);
    onClose();
  };

  const allCompleted = queue.length > 0 && queue.every((i) => i.status === 'success');

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Event Photos"
      description={`Share high-resolution images to "${eventName}".`}
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
            isDragOver
              ? 'border-[#E83E8C] bg-pink-50/50 scale-[0.99]'
              : 'border-slate-200 hover:border-pink-300 hover:bg-pink-50/20'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="w-14 h-14 rounded-2xl bg-[#FFF0F6] text-[#E83E8C] flex items-center justify-center mb-3 shadow-xs">
            <UploadCloud className="w-7 h-7" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            Click to upload or drag & drop photos here
          </p>
          <p className="text-xs text-slate-400 mt-1">
            PNG, JPG, WEBP, GIF up to 10MB each
          </p>
        </div>

        {/* Selected Photos Queue */}
        {queue.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600">
              <span>Selected Photos ({queue.length})</span>
              {!isUploading && !allCompleted && (
                <button
                  type="button"
                  onClick={() => setQueue([])}
                  className="text-slate-400 hover:text-slate-600 font-medium lowercase"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {queue.map((item, index) => (
                <div
                  key={`${item.file.name}-${index}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-pink-100/60 text-[#E83E8C] flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 truncate text-xs sm:text-sm">
                        {item.file.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {formatFileSize(item.file.size)}
                        {item.errorMessage && (
                          <span className="text-rose-600 ml-2 font-medium">
                            • {item.errorMessage}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.status === 'uploading' && (
                      <Loader2 className="w-4 h-4 animate-spin text-[#E83E8C]" />
                    )}
                    {item.status === 'success' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                    {item.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}

                    {!isUploading && item.status !== 'success' && (
                      <button
                        type="button"
                        onClick={() => removeQueueItem(index)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                        aria-label="Remove photo from queue"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isUploading}
          >
            {allCompleted ? 'Done' : 'Cancel'}
          </Button>

          {queue.length > 0 && !allCompleted && (
            <Button
              type="button"
              variant="primary"
              onClick={startUpload}
              isLoading={isUploading}
              leftIcon={<UploadCloud className="w-4 h-4" />}
            >
              Upload {queue.filter((q) => q.status !== 'success').length} {queue.length === 1 ? 'Photo' : 'Photos'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

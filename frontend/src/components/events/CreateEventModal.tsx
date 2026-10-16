import React, { useState } from 'react';
import { Calendar, MapPin, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { eventService } from '../../services/eventService';
import { useToast } from '../../context/ToastContext';
import type { CreateEventInput } from '../../types/event';

export interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: (newEventId: number) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
}) => {
  const { success, error: toastError } = useToast();
  const [formData, setFormData] = useState<CreateEventInput>({
    name: '',
    description: '',
    eventDate: '',
    location: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Today's date formatted as YYYY-MM-DD for the min date constraint
  const today = new Date().toISOString().split('T')[0];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    } else if (formData.name.length > 150) {
      newErrors.name = 'Event name cannot exceed 150 characters';
    }

    if (!formData.eventDate) {
      newErrors.eventDate = 'Event date is required';
    } else if (formData.eventDate < today) {
      newErrors.eventDate = 'Event date cannot be in the past';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Event location is required';
    } else if (formData.location.length > 255) {
      newErrors.location = 'Location cannot exceed 255 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const created = await eventService.create({
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        eventDate: formData.eventDate,
        location: formData.location.trim(),
      });

      success(`Event "${created.name}" created successfully!`);
      setFormData({
        name: '',
        description: '',
        eventDate: '',
        location: '',
      });
      setErrors({});
      onClose();
      if (onEventCreated) {
        onEventCreated(created.id);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create event';
      toastError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Event"
      description="Set up your event space and start gathering unforgettable photos from everyone."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Event Name *"
          placeholder="e.g. Maya & Liam's Wedding, Tech Summit 2026"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          maxLength={150}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Event Date *"
            min={today}
            value={formData.eventDate}
            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
            error={errors.eventDate}
            leftIcon={<Calendar className="w-4 h-4" />}
          />

          <Input
            label="Location *"
            placeholder="e.g. Grand Palace Hotel, Seattle"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            error={errors.location}
            maxLength={255}
            leftIcon={<MapPin className="w-4 h-4" />}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Description (Optional)
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a welcoming message, details about dress code, schedule, or photography tips..."
              maxLength={500}
              className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E83E8C]/20 focus:border-[#E83E8C]"
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            {errors.description ? (
              <p className="text-xs text-rose-600 font-medium">{errors.description}</p>
            ) : <span />}
            <span className="text-[10px] text-slate-400">
              {formData.description?.length || 0}/500
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            rightIcon={<Sparkles className="w-4 h-4" />}
          >
            Create Event
          </Button>
        </div>
      </form>
    </Modal>
  );
};

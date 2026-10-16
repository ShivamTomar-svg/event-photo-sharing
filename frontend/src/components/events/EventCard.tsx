import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, User as UserIcon, ArrowRight, Camera } from 'lucide-react';
import type { EventItem } from '../../types/event';
import { formatDate, getEventGradient } from '../../lib/utils';
import { Badge } from '../common/Badge';

export interface EventCardProps {
  event: EventItem;
  photoCount?: number;
  isOrganizer?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, photoCount, isOrganizer }) => {
  const gradient = getEventGradient(event.id);
  const dateFormatted = formatDate(event.eventDate);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-card-hover hover:border-pink-200 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Event Header Banner */}
      <div className={`h-36 sm:h-40 bg-gradient-to-tr ${gradient} relative p-4 flex flex-col justify-between overflow-hidden`}>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="flex items-center justify-between z-10">
          <Badge variant={isOrganizer ? 'pink' : 'orange'} className="bg-white/90 backdrop-blur-md shadow-xs">
            {isOrganizer ? 'Organizer' : 'Guest'}
          </Badge>
          {photoCount !== undefined && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/30 text-white backdrop-blur-md">
              <Camera className="w-3.5 h-3.5" />
              <span>{photoCount} {photoCount === 1 ? 'photo' : 'photos'}</span>
            </span>
          )}
        </div>

        <div className="z-10">
          <h3 className="text-xl font-bold text-white tracking-tight drop-shadow-sm line-clamp-1">
            {event.name}
          </h3>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2.5 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#E83E8C] flex-shrink-0" />
            <span className="font-medium text-slate-800">{dateFormatted}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#FF8A3D] flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <UserIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>Hosted by <strong className="text-slate-700">{event.organizerName}</strong></span>
          </div>

          {event.description && (
            <p className="text-xs text-slate-500 line-clamp-2 pt-1 border-t border-slate-100">
              {event.description}
            </p>
          )}
        </div>

        {/* Footer Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <Link
            to={`/events/${event.id}`}
            className="w-full inline-flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#E83E8C] group-hover:text-[#D62F7C] transition-colors py-1"
          >
            <span>Open Gallery</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

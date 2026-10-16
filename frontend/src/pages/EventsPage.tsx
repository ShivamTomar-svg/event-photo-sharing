import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Filter, Plus, Calendar, ArrowUpDown } from 'lucide-react';
import { eventService } from '../services/eventService';
import { photoService } from '../services/photoService';
import { useAuth } from '../context/AuthContext';
import { EventCard } from '../components/events/EventCard';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import type { EventItem, EventSortOption } from '../types/event';

interface OutletContextType {
  openCreateModal: () => void;
}

export const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const { openCreateModal } = useOutletContext<OutletContextType>();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [photoCounts, setPhotoCounts] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'hosted' | 'guest'>('all');
  const [sortOption, setSortOption] = useState<EventSortOption>('date-desc');

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await eventService.getAll();
      setEvents(data || []);

      if (data && data.length > 0) {
        const counts: Record<number, number> = {};
        await Promise.all(
          data.map(async (ev) => {
            try {
              const photos = await photoService.getByEvent(ev.id);
              counts[ev.id] = photos.length;
            } catch {
              counts[ev.id] = 0;
            }
          })
        );
        setPhotoCounts(counts);
      }
    } catch (e) {
      console.error('Failed to load events', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();

    const handleEventCreated = () => {
      loadEvents();
    };

    window.addEventListener('event:created', handleEventCreated);
    return () => window.removeEventListener('event:created', handleEventCreated);
  }, []);

  const filteredAndSortedEvents = useMemo(() => {
    let result = [...events];

    // Filter by hosted vs guest
    if (activeFilter === 'hosted') {
      result = result.filter((e) => e.organizerId === user?.id);
    } else if (activeFilter === 'guest') {
      result = result.filter((e) => e.organizerId !== user?.id);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.organizerName.toLowerCase().includes(q) ||
          (e.description && e.description.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortOption === 'date-desc') {
        return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();
      }
      if (sortOption === 'date-asc') {
        return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
      }
      if (sortOption === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortOption === 'created-desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

    return result;
  }, [events, activeFilter, searchQuery, sortOption, user?.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Events Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and manage all celebrations, gatherings, and ceremonies.
          </p>
        </div>

        <Button
          variant="orange"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Event
        </Button>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by event title, location, or host..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-2.5 transition-all placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E83E8C]/20 focus:border-[#E83E8C]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <ArrowUpDown className="w-4 h-4" />
              </div>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as EventSortOption)}
                className="appearance-none bg-slate-50/80 border border-slate-200 text-slate-700 text-xs sm:text-sm rounded-xl pl-9 pr-8 py-2.5 font-medium hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E83E8C]/20 focus:border-[#E83E8C]"
              >
                <option value="date-desc">Event Date: Newest first</option>
                <option value="date-asc">Event Date: Oldest first</option>
                <option value="name-asc">Event Name (A-Z)</option>
                <option value="created-desc">Recently Created</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs font-semibold overflow-x-auto">
          <span className="text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeFilter === 'all'
                ? 'bg-[#E83E8C] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Events ({events.length})
          </button>
          <button
            onClick={() => setActiveFilter('hosted')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeFilter === 'hosted'
                ? 'bg-[#E83E8C] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hosted by Me ({events.filter((e) => e.organizerId === user?.id).length})
          </button>
          <button
            onClick={() => setActiveFilter('guest')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeFilter === 'guest'
                ? 'bg-[#E83E8C] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Invited As Guest ({events.filter((e) => e.organizerId !== user?.id).length})
          </button>
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
              <Skeleton className="h-36 w-full rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredAndSortedEvents.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-8 h-8 text-[#E83E8C]" />}
          title={searchQuery ? 'No matching events found' : 'No events in this view'}
          description={
            searchQuery
              ? `We couldn't find any events matching "${searchQuery}". Try a different keyword.`
              : 'Create a new event or ask hosts to invite your email address.'
          }
          actionLabel={searchQuery ? 'Clear Search' : 'Create Event'}
          onAction={searchQuery ? () => setSearchQuery('') : openCreateModal}
          actionVariant="primary"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              photoCount={photoCounts[event.id]}
              isOrganizer={event.organizerId === user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

import { createMemo, createSignal, Accessor } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Event, EventSource } from '../types/events';
import { FilterState, EventStats } from '../types/store';

export function createEventAggregator(
  earthquakes: Accessor<Event[]>,
  news: Accessor<Event[]>,
  space: Accessor<Event[]>,
  weather: Accessor<Event[]>,
  crypto: Accessor<Event[]>,
  sports: Accessor<Event[]>
) {
  const [filters, setFilters] = createStore<FilterState>({
    sources: new Set<EventSource>(['earthquake', 'news', 'space', 'weather', 'crypto', 'sports']),
    timeRange: 720,
    searchQuery: '',
  });

  const allEvents = createMemo(() => {
    return [
      ...earthquakes(),
      ...news(),
      ...space(),
      ...weather(),
      ...crypto(),
      ...sports(),
    ].sort((a, b) => b.timestamp - a.timestamp);
  });

  const filteredEvents = createMemo(() => {
    const now = Date.now();
    const timeLimit = now - filters.timeRange * 60 * 1000;

    return allEvents().filter((event) => {
      if (!filters.sources.has(event.source)) return false;
      if (event.timestamp < timeLimit) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchableText = JSON.stringify(event).toLowerCase();
        if (!searchableText.includes(query)) return false;
      }
      return true;
    });
  });

  const stats = createMemo<EventStats>(() => {
    const events = filteredEvents();
    const bySource: Record<EventSource, number> = {
      earthquake: 0,
      news: 0,
      space: 0,
      weather: 0,
      crypto: 0,
      sports: 0,
    };

    events.forEach((event) => {
      bySource[event.source]++;
    });

    const recentThreshold = Date.now() - 5 * 60 * 1000; // last 5 minutes
    const recentActivity = events.filter((e) => e.timestamp > recentThreshold).length;

    return {
      total: events.length,
      bySource,
      recentActivity,
    };
  });

  return {
    allEvents,
    filteredEvents,
    stats,
    filters,
    setFilters,
  };
}

import { createMemo, Accessor } from 'solid-js';
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

  const allEvents = createMemo(() =>
    [...earthquakes(), ...news(), ...space(), ...weather(), ...crypto(), ...sports()]
      .sort((a, b) => b.timestamp - a.timestamp)
  );

  const filteredEvents = createMemo(() => {
    const timeLimit = Date.now() - filters.timeRange * 60_000;
    const query = filters.searchQuery.toLowerCase();
    return allEvents().filter(e =>
      filters.sources.has(e.source) &&
      e.timestamp >= timeLimit &&
      (!query || JSON.stringify(e).toLowerCase().includes(query))
    );
  });

  const stats = createMemo<EventStats>(() => {
    const bySource: Record<EventSource, number> = {
      earthquake: 0, news: 0, space: 0, weather: 0, crypto: 0, sports: 0,
    };
    for (const e of filteredEvents()) bySource[e.source]++;
    return { total: filteredEvents().length, bySource };
  });

  return { allEvents, filteredEvents, stats, filters, setFilters };
}

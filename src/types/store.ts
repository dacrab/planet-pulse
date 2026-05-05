import { Accessor } from 'solid-js';
import { Event, EventSource } from './events';

export interface StoreState<T> {
  data: Accessor<T[]>;
  loading: Accessor<boolean>;
  error: Accessor<string | null>;
}

export interface PollingStore<T> extends StoreState<T> {
  subscribe: () => void;
  unsubscribe: () => void;
}

export interface FilterState {
  sources: Set<EventSource>;
  timeRange: number;
  searchQuery: string;
}

export interface EventStats {
  total: number;
  bySource: Record<EventSource, number>;
}

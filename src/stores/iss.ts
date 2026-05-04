import { createSignal, onCleanup } from 'solid-js';
import { ISSEvent } from '../types/events';
import { PollingStore } from '../types/store';
import { fetchISS } from '../services/iss';
import { API_CONFIG } from '../config/api';

export function createISSStore(): PollingStore<ISSEvent> {
  const [data, setData] = createSignal<ISSEvent[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  let intervalId: number | null = null;

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const events = await fetchISS();
      setData(events);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const subscribe = () => {
    fetch();
    intervalId = setInterval(fetch, API_CONFIG.iss.interval) as unknown as number;
  };

  const unsubscribe = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  onCleanup(unsubscribe);

  return { data, loading, error, fetch, subscribe, unsubscribe };
}

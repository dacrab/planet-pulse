import { createSignal, onCleanup, batch } from 'solid-js';
import { PollingStore } from '../types/store';

export function createPollingStore<T>(
  fetchFn: () => Promise<T[]>,
  interval: number
): PollingStore<T> {
  const [data, setData] = createSignal<T[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  let intervalId: number | null = null;

  const fetch = async () => {
    batch(() => {
      setLoading(true);
      setError(null);
    });
    try {
      const events = await fetchFn();
      batch(() => {
        setData(events);
        setLoading(false);
      });
    } catch (err) {
      batch(() => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      });
    }
  };

  const subscribe = () => {
    fetch();
    intervalId = setInterval(fetch, interval) as unknown as number;
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

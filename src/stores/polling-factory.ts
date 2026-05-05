import { createSignal, onCleanup } from 'solid-js';
import { PollingStore } from '../types/store';

export function createPollingStore<T>(fetchFn: () => Promise<T[]>, interval: number): PollingStore<T> {
  const [data, setData] = createSignal<T[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  let intervalId: number | null = null;

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchFn());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const subscribe = () => { fetch(); intervalId = setInterval(fetch, interval) as unknown as number; };
  const unsubscribe = () => { if (intervalId) { clearInterval(intervalId); intervalId = null; } };

  onCleanup(unsubscribe);
  return { data, loading, error, subscribe, unsubscribe };
}

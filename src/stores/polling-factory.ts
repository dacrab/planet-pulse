import { createSignal, onCleanup, batch } from 'solid-js';
import { PollingStore } from '../types/store';

export function createPollingStore<T>(fetchFn: () => Promise<T[]>, interval: number): PollingStore<T> {
  const [data, setData] = createSignal<T[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  let intervalId: number | null = null;

  const poll = async () => {
    setLoading(true);
    try {
      const result = await fetchFn();
      batch(() => {
        setData(result);
        setError(null);
        setLoading(false);
      });
    } catch (err) {
      batch(() => {
        setError(err instanceof Error ? err.message : 'Fetch failed');
        setLoading(false);
      });
    }
  };

  const subscribe = () => {
    poll();
    intervalId = setInterval(poll, interval) as unknown as number;
  };

  const unsubscribe = () => {
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
  };

  onCleanup(unsubscribe);
  return { data, loading, error, subscribe, unsubscribe };
}

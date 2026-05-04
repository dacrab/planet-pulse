import { createSignal, onCleanup } from 'solid-js';
import { GitHubEvent } from '../types/events';
import { PollingStore } from '../types/store';
import { fetchGitHub } from '../services/github';
import { API_CONFIG } from '../config/api';

export function createGitHubStore(): PollingStore<GitHubEvent> {
  const [data, setData] = createSignal<GitHubEvent[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  let intervalId: number | null = null;

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const events = await fetchGitHub();
      setData(events);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const subscribe = () => {
    fetch();
    intervalId = setInterval(fetch, API_CONFIG.github.interval) as unknown as number;
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

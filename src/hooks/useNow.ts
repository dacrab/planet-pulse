import { createSignal, onCleanup } from 'solid-js';

export function useNow(intervalMs = 1000) {
  const [now, setNow] = createSignal(Date.now());
  const id = setInterval(() => setNow(Date.now()), intervalMs);
  onCleanup(() => clearInterval(id));
  return now;
}

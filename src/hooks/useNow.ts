import { createSignal, onCleanup } from 'solid-js';

/** A shared-ish clock signal for relative timestamps. */
export function useNow(intervalMs = 1_000) {
  const [now, setNow] = createSignal(Date.now());
  const timer = setInterval(() => setNow(Date.now()), intervalMs);
  onCleanup(() => clearInterval(timer));
  return now;
}

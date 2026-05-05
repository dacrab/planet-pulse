import { createSignal, onCleanup } from 'solid-js';

export function useVisibility() {
  const [isVisible, setIsVisible] = createSignal(!document.hidden);
  const handler = () => setIsVisible(!document.hidden);
  document.addEventListener('visibilitychange', handler);
  onCleanup(() => document.removeEventListener('visibilitychange', handler));
  return isVisible;
}

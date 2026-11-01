import { createSignal, onCleanup } from 'solid-js';

export function useVisibility() {
  const [visible, setVisible] = createSignal(
    typeof document === 'undefined' ? true : !document.hidden
  );

  if (typeof document !== 'undefined') {
    const handler = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', handler);
    onCleanup(() => document.removeEventListener('visibilitychange', handler));
  }

  return visible;
}

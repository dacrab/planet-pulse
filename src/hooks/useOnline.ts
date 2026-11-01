import { createSignal, onCleanup } from 'solid-js';

export function useOnline() {
  const [online, setOnline] = createSignal(
    typeof navigator === 'undefined' ? true : navigator.onLine
  );

  if (typeof window !== 'undefined') {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    onCleanup(() => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    });
  }

  return online;
}

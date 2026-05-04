import { createSignal, onMount, onCleanup } from 'solid-js';

export function useVisibility() {
  const [isVisible, setIsVisible] = createSignal(!document.hidden);

  onMount(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    onCleanup(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    });
  });

  return isVisible;
}

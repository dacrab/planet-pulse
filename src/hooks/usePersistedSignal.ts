import { createEffect, createSignal, type Accessor, type Setter } from 'solid-js';

export function usePersistedSignal<T>(
  key: string,
  fallback: T
): [Accessor<T>, Setter<T>] {
  let initial = fallback;

  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) initial = JSON.parse(raw) as T;
  } catch {
    // Private mode or malformed value — keep the fallback.
  }

  const [value, setValue] = createSignal<T>(initial);

  createEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value()));
    } catch {
      // Storage can be unavailable; persistence is best-effort.
    }
  });

  return [value, setValue];
}

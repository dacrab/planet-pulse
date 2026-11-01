import { onCleanup } from 'solid-js';

/** Focus an element after it mounts. Used by dialogs and the command palette. */
export function focus(el: HTMLElement) {
  requestAnimationFrame(() => el.focus());
}

/** Reveal a section once it enters the viewport. */
export function reveal(el: HTMLElement) {
  if (
    typeof IntersectionObserver === 'undefined' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    el.classList.add('is-visible');
    return;
  }

  el.classList.add('reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        el.classList.add('is-visible');
        observer.disconnect();
      }
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  observer.observe(el);
  onCleanup(() => observer.disconnect());
}

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      focus: boolean;
      reveal: boolean;
    }
  }
}

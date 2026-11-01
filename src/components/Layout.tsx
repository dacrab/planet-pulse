import {
  ErrorBoundary,
  Suspense,
  onCleanup,
  onMount,
  type JSX,
} from 'solid-js';
import { PulseProvider, usePulse } from '../stores/pulse';
import { TopBar } from './TopBar';
import { Ticker } from './Ticker';
import { MobileNav } from './MobileNav';
import { CommandPalette } from './CommandPalette';
import { EventDrawer } from './EventDrawer';
import { Button, Skeleton } from './UI';

export function RootLayout(props: { children?: JSX.Element }) {
  return (
    <PulseProvider>
      <Shell>{props.children}</Shell>
    </PulseProvider>
  );
}

function Shell(props: { children?: JSX.Element }) {
  const pulse = usePulse();

  onMount(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        pulse.setCommandOpen((open) => !open);
        return;
      }

      if (event.key === 'Escape') {
        pulse.setCommandOpen(false);
        if (pulse.selectedEvent()) pulse.closeEvent();
        return;
      }

      if (event.key === '/' && !typing && !pulse.commandOpen()) {
        event.preventDefault();
        pulse.setCommandOpen(true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    onCleanup(() => window.removeEventListener('keydown', onKeyDown));
  });

  return (
    <div class="min-h-dvh bg-bg text-ink">
      <a href="#main" class="skip-link">
        Skip to content
      </a>

      <TopBar />
      <Ticker />

      <main
        id="main"
        class="mx-auto w-full max-w-[1500px] px-4 pb-28 pt-5 sm:px-6 lg:pb-12"
      >
        <ErrorBoundary
          fallback={(error, reset) => (
            <ErrorPanel error={error} reset={reset} />
          )}
        >
          <Suspense fallback={<PageSkeleton />}>{props.children}</Suspense>
        </ErrorBoundary>
      </main>

      <footer class="mx-auto flex w-full max-w-[1500px] flex-col gap-2 border-t border-line px-4 py-6 font-mono text-[9px] uppercase tracking-wider text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:pb-8">
        <span>Planet Pulse · public data, no keys, no tracking</span>
        <span class="flex items-center gap-4">
          <span>Built with SolidJS</span>
          <a
            href="https://www.solidjs.com"
            target="_blank"
            rel="noopener noreferrer"
            class="focus-ring rounded text-muted transition-colors hover:text-ink"
          >
            solidjs.com ↗
          </a>
        </span>
      </footer>

      <MobileNav />
      <CommandPalette />
      <EventDrawer />
    </div>
  );
}

function ErrorPanel(props: { error: unknown; reset: () => void }) {
  return (
    <div class="panel mx-auto mt-16 max-w-md p-6 text-center">
      <p class="eyebrow text-danger">Error</p>
      <h1 class="display mt-2 text-2xl text-ink">This page failed to load.</h1>
      <p class="mt-2 text-xs leading-relaxed text-muted">
        {props.error instanceof Error ? props.error.message : String(props.error)}
      </p>
      <Button class="mt-5" onClick={props.reset}>
        Try again
      </Button>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div class="space-y-4" aria-busy="true" aria-label="Loading page">
      <div class="flex items-end justify-between gap-4">
        <div class="space-y-2">
          <Skeleton class="h-3 w-32" />
          <Skeleton class="h-12 w-72 max-w-full" />
          <Skeleton class="h-3 w-96 max-w-full" />
        </div>
        <Skeleton class="hidden h-16 w-48 sm:block" />
      </div>
      <div class="grid gap-4 lg:grid-cols-12">
        <Skeleton class="h-[420px] lg:col-span-8" />
        <div class="space-y-4 lg:col-span-4">
          <Skeleton class="h-56" />
          <Skeleton class="h-40" />
        </div>
      </div>
      <div class="grid gap-4 md:grid-cols-3">
        <Skeleton class="h-52" />
        <Skeleton class="h-52" />
        <Skeleton class="h-52" />
      </div>
    </div>
  );
}

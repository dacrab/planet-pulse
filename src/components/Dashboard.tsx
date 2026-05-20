import { Component, createSignal, lazy, Show, Suspense, ErrorBoundary } from 'solid-js';
import { useStore } from '../stores/context';
import { EventFeed } from './EventFeed';
import { StatsBar } from './StatsBar';
import { FilterPanel } from './FilterPanel';
import { AlertsPanel } from './AlertsPanel';

const InsightsPanel = lazy(() => import('./InsightsPanel').then(m => ({ default: m.InsightsPanel })));
const CorrelationsPanel = lazy(() => import('./CorrelationsPanel').then(m => ({ default: m.CorrelationsPanel })));

type Tab = 'feed' | 'filter' | 'insights';

const statusConfig = {
  connected:  { color: 'bg-success', label: 'Live' },
  connecting: { color: 'bg-warning', label: 'Connecting' },
  error:      { color: 'bg-danger',  label: 'Error' },
} as const;

const PanelFallback = () => (
  <div class="text-xs text-content-subtle text-center py-4">Loading…</div>
);

export const Dashboard: Component = () => {
  const { status } = useStore();
  const [tab, setTab] = createSignal<Tab>('feed');

  return (
    <div class="h-screen flex flex-col bg-page text-content overflow-hidden">
      <header class="shrink-0 h-12 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div class="h-full px-5 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-accent" />
            <span class="text-sm font-semibold">Planet Pulse</span>
          </div>
          <StatsBar />
          <div class="flex items-center gap-2">
            <div class={`w-1.5 h-1.5 rounded-full ${statusConfig[status()].color} ${status() === 'connected' ? 'animate-pulse' : ''}`} />
            <span class="text-[11px] text-content-subtle uppercase tracking-wider">{statusConfig[status()].label}</span>
          </div>
        </div>
      </header>

      <AlertsPanel />

      <ErrorBoundary fallback={(err) => (
        <div class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <p class="text-sm text-danger font-medium">Something went wrong</p>
            <p class="text-xs text-content-subtle mt-1">{err.message}</p>
          </div>
        </div>
      )}>
        {/* Desktop: full-height 3-col */}
        <div class="hidden lg:grid lg:grid-cols-[180px_1fr_260px] flex-1 min-h-0">
          <aside class="border-r border-border p-4 overflow-y-auto">
            <FilterPanel />
          </aside>
          <main class="overflow-y-auto p-4">
            <EventFeed />
          </main>
          <aside class="border-l border-border p-4 overflow-y-auto space-y-4">
            <Suspense fallback={<PanelFallback />}>
              <InsightsPanel />
              <CorrelationsPanel />
            </Suspense>
          </aside>
        </div>

        {/* Mobile: tabbed */}
        <div class="lg:hidden flex-1 min-h-0 overflow-y-auto p-4">
          <Show when={tab() === 'feed'}><EventFeed /></Show>
          <Show when={tab() === 'filter'}><FilterPanel /></Show>
          <Show when={tab() === 'insights'}>
            <Suspense fallback={<PanelFallback />}>
              <div class="space-y-4">
                <InsightsPanel />
                <CorrelationsPanel />
              </div>
            </Suspense>
          </Show>
        </div>
      </ErrorBoundary>

      <nav class="lg:hidden shrink-0 bg-surface/95 backdrop-blur-md border-t border-border flex">
        {(['feed', 'filter', 'insights'] as Tab[]).map(t => (
          <button
            onClick={() => setTab(t)}
            class={`flex-1 py-3 text-xs font-medium capitalize transition-colors ${
              tab() === t ? 'text-accent' : 'text-content-subtle'
            }`}
          >
            {t}
          </button>
        ))}
      </nav>
    </div>
  );
};

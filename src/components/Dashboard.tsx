import { createSignal, Show } from 'solid-js';
import { useStore } from '../stores/context';
import { EventFeed } from './EventFeed';
import { StatsBar } from './StatsBar';
import { FilterPanel } from './FilterPanel';
import { AlertsPanel } from './AlertsPanel';
import { InsightsPanel } from './InsightsPanel';
import { CorrelationsPanel } from './CorrelationsPanel';
import { WeatherPanel } from './WeatherPanel';
import { CryptoPanel } from './CryptoPanel';

type Tab = 'feed' | 'filter' | 'insights';

const statusConfig = {
  connected:  { dot: 'bg-success',  label: 'Live',       pill: 'border-success/30 text-success bg-success/10',  pulse: true },
  connecting: { dot: 'bg-warning',  label: 'Connecting', pill: 'border-warning/30 text-warning bg-warning/10',  pulse: false },
  error:      { dot: 'bg-danger',   label: 'Error',      pill: 'border-danger/30 text-danger bg-danger/10',     pulse: false },
} as const;

export const Dashboard = () => {
  const { status } = useStore();
  const [tab, setTab] = createSignal<Tab>('feed');

  return (
    <div class="h-screen flex flex-col bg-page text-content overflow-hidden">
      {/* Header */}
      <header class="shrink-0 h-14 border-b border-border bg-surface/80 backdrop-blur-md z-50">
        <div class="h-full px-6 flex items-center justify-between gap-4">
          <div class="flex items-center gap-2.5 shrink-0">
            <div class="w-2 h-2 rounded-full bg-accent" />
            <span class="text-sm font-semibold tracking-tight">Planet Pulse</span>
          </div>

          <StatsBar />

          {/* Status pill */}
          <div class={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${statusConfig[status()].pill}`}>
            <div class={`w-1.5 h-1.5 rounded-full ${statusConfig[status()].dot} ${statusConfig[status()].pulse ? 'animate-pulse' : ''}`} />
            {statusConfig[status()].label}
          </div>
        </div>
      </header>

      <AlertsPanel />

      {/* Desktop: 3-col */}
      <div class="hidden lg:grid lg:grid-cols-[220px_1fr_280px] flex-1 min-h-0">
        <aside class="border-r border-border overflow-y-auto">
          <FilterPanel />
        </aside>
        <main class="overflow-y-auto">
          <EventFeed />
        </main>
        <aside class="border-l border-border overflow-y-auto">
          <InsightsPanel />
          <WeatherPanel />
          <CryptoPanel />
          <CorrelationsPanel />
        </aside>
      </div>

      {/* Mobile: tabbed */}
      <div class="lg:hidden flex-1 min-h-0 overflow-y-auto">
        <Show when={tab() === 'feed'}><EventFeed /></Show>
        <Show when={tab() === 'filter'}><FilterPanel /></Show>
        <Show when={tab() === 'insights'}>
          <InsightsPanel />
          <WeatherPanel />
          <CryptoPanel />
          <CorrelationsPanel />
        </Show>
      </div>

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

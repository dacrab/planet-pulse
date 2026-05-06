import { Component, createSignal, lazy, Show } from 'solid-js';
import { EventFeed } from './EventFeed';
import { StatsBar } from './StatsBar';
import { FilterPanel } from './FilterPanel';
import { AlertsPanel } from './AlertsPanel';

const InsightsPanel = lazy(() => import('./InsightsPanel').then(m => ({ default: m.InsightsPanel })));
const CorrelationsPanel = lazy(() => import('./CorrelationsPanel').then(m => ({ default: m.CorrelationsPanel })));
const AchievementsPanel = lazy(() => import('./AchievementsPanel').then(m => ({ default: m.AchievementsPanel })));

type MobileTab = 'feed' | 'filter' | 'insights';

const tabs: { id: MobileTab; label: string; icon: string }[] = [
  { id: 'feed',     label: 'Feed',    icon: '📡' },
  { id: 'filter',   label: 'Filter',  icon: '🔍' },
  { id: 'insights', label: 'Insights',icon: '📊' },
];

export const Dashboard: Component = () => {
  const [activeTab, setActiveTab] = createSignal<MobileTab>('feed');

  return (
    <div class="min-h-screen bg-page text-content">
      {/* Header */}
      <header class="h-[var(--header-h)] border-b border-border bg-surface/80 backdrop-blur-xl sticky top-0 z-50">
        <div class="max-w-[var(--layout-max)] mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
              <div class="w-2.5 h-2.5 rounded-full bg-accent" />
            </div>
            <div>
              <span class="text-sm font-semibold tracking-tight text-content">Planet Pulse</span>
              <span class="hidden sm:inline text-xs text-content-subtle ml-2">real-time intelligence</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-1.5 rounded-full bg-success animate-[pulse_2s_ease-in-out_infinite]" />
            <span class="text-xs font-medium text-content-subtle tracking-widest uppercase">Live</span>
          </div>
        </div>
      </header>

      {/* Main — desktop: 3-col grid, mobile: tab-driven single column */}
      <main class="max-w-[var(--layout-max)] mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 pb-20 lg:pb-6">
        <StatsBar />
        <AlertsPanel />

        {/* Desktop layout */}
        <div class="hidden lg:grid grid-cols-[220px_1fr_300px] gap-4">
          <FilterPanel />
          <EventFeed />
          <div class="flex flex-col gap-4">
            <InsightsPanel />
            <CorrelationsPanel />
            <AchievementsPanel />
          </div>
        </div>

        {/* Mobile layout — show active tab panel */}
        <div class="lg:hidden">
          <Show when={activeTab() === 'feed'}>
            <EventFeed />
          </Show>
          <Show when={activeTab() === 'filter'}>
            <FilterPanel />
          </Show>
          <Show when={activeTab() === 'insights'}>
            <div class="flex flex-col gap-4">
              <InsightsPanel />
              <CorrelationsPanel />
              <AchievementsPanel />
            </div>
          </Show>
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav class="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-surface/95 backdrop-blur-xl border-t border-border flex">
        {tabs.map(tab => (
          <button
            onClick={() => setActiveTab(tab.id)}
            class={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors ${
              activeTab() === tab.id
                ? 'text-accent'
                : 'text-content-subtle hover:text-content'
            }`}
          >
            <span class="text-base leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

import { Component, lazy } from 'solid-js';
import { EventFeed } from './EventFeed';
import { StatsBar } from './StatsBar';
import { FilterPanel } from './FilterPanel';
import { AlertsPanel } from './AlertsPanel';

const InsightsPanel = lazy(() => import('./InsightsPanel').then(m => ({ default: m.InsightsPanel })));
const CorrelationsPanel = lazy(() => import('./CorrelationsPanel').then(m => ({ default: m.CorrelationsPanel })));
const AchievementsPanel = lazy(() => import('./AchievementsPanel').then(m => ({ default: m.AchievementsPanel })));

export const Dashboard: Component = () => {
  return (
    <div class="min-h-screen bg-page text-content">
      {/* Header */}
      <header class="h-[var(--header-h)] border-b border-border bg-surface/80 backdrop-blur-xl sticky top-0 z-50">
        <div class="max-w-[var(--layout-max)] mx-auto h-full px-6 flex items-center justify-between">
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

      {/* Main */}
      <main class="max-w-[var(--layout-max)] mx-auto px-6 py-6 space-y-4">
        <StatsBar />
        <AlertsPanel />

        <div class="grid grid-cols-1 lg:grid-cols-[220px_1fr_300px] gap-4">
          <FilterPanel />
          <EventFeed />
          <div class="flex flex-col gap-4">
            <InsightsPanel />
            <CorrelationsPanel />
            <AchievementsPanel />
          </div>
        </div>
      </main>
    </div>
  );
};

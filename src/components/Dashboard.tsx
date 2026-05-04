import { Component, Index, lazy } from 'solid-js';
import { useStore } from '../stores/context';
import { EventFeed } from './EventFeed';
import { StatsBar } from './StatsBar';
import { FilterPanel } from './FilterPanel';
import { AlertsPanel } from './AlertsPanel';

const InsightsPanel = lazy(() => import('./InsightsPanel').then(m => ({ default: m.InsightsPanel })));
const CorrelationsPanel = lazy(() => import('./CorrelationsPanel').then(m => ({ default: m.CorrelationsPanel })));
const AchievementsPanel = lazy(() => import('./AchievementsPanel').then(m => ({ default: m.AchievementsPanel })));

export const Dashboard: Component = () => {
  const store = useStore();

  return (
    <div class="min-h-screen bg-page text-content">
      <header class="h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50 flex items-center px-6">
        <div class="max-w-[1800px] w-full mx-auto flex items-center justify-between">
          <div>
            <h1 class="text-xl font-semibold tracking-tight leading-tight">Planet Pulse</h1>
            <p class="text-xs text-content-muted tracking-wide mt-1 hidden sm:block">Real-time intelligence · Cross-source correlations</p>
          </div>
          <div class="flex items-center gap-2 text-xs font-medium text-content-subtle">
            <div class="w-2 h-2 rounded-full bg-success animate-[pulse_1.5s_ease-in-out_infinite]" />
            <span>LIVE</span>
          </div>
        </div>
      </header>

      <main class="p-6 max-w-[1800px] mx-auto space-y-6">
        <StatsBar />
        
        <AlertsPanel />

        <div class="grid grid-cols-1 lg:grid-cols-[240px_1fr_320px] gap-6">
          <FilterPanel />

          <EventFeed />

          <div class="flex flex-col gap-6">
            <InsightsPanel />
            <CorrelationsPanel />
            <AchievementsPanel />
          </div>
        </div>
      </main>
    </div>
  );
};

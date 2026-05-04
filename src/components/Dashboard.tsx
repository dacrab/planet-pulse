import { Component, For, createSignal, onMount } from 'solid-js';
import { useStore } from '../stores/context';
import { EventFeed } from './EventFeed';
import { StatsBar } from './StatsBar';
import { FilterPanel } from './FilterPanel';
import { AlertsPanel } from './AlertsPanel';
import { InsightsPanel } from './InsightsPanel';
import { CorrelationsPanel } from './CorrelationsPanel';

export const Dashboard: Component = () => {
  const store = useStore();
  const [time, setTime] = createSignal('');

  onMount(() => {
    const update = () => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  });

  return (
    <div class="dashboard">
      <header class="dashboard-header">
        <div class="dashboard-header-content">
          <div>
            <h1 class="dashboard-title">🌍 Planet Pulse</h1>
            <p class="dashboard-subtitle">Real-time intelligence · Cross-source correlations</p>
          </div>
          <div style="display: flex; align-items: center; gap: 2rem;">
            <div style="text-align: right;">
              <div class="status-label">Live</div>
              <div style="font-size: 1.125rem; font-weight: 600; font-variant-numeric: tabular-nums; color: var(--text-primary);">{time()}</div>
            </div>
            <ConnectionStatus />
          </div>
        </div>
      </header>

      <main class="dashboard-main">
        <StatsBar />
        
        <div style="margin-bottom: var(--space-lg);">
          <AlertsPanel />
        </div>

        <div class="dashboard-layout">
          <FilterPanel />

          <EventFeed />

          <div class="dashboard-sidebar-right">
            <InsightsPanel />
            <CorrelationsPanel />
          </div>
        </div>
      </main>
    </div>
  );
};

const ConnectionStatus: Component = () => {
  const store = useStore();
  
  const sources = [
    { name: 'Earthquake', store: store.earthquakeStore },
    { name: 'Flights', store: store.flightStore },
    { name: 'ISS', store: store.issStore },
    { name: 'Weather', store: store.weatherStore },
    { name: 'Crypto', store: store.cryptoStore },
    { name: 'GitHub', store: store.githubStore },
  ];

  return (
    <div class="status-group">
      <div class="status-label">Status</div>
      <div class="status-dots">
        <For each={sources}>
          {(src) => (
            <div 
              class="status-dot"
              classList={{
                'active': !src.store.loading() && !src.store.error(),
                'loading': src.store.loading(),
                'error': !!src.store.error(),
              }}
              title={src.name}
              aria-label={`${src.name}: ${src.store.error() ? 'error' : src.store.loading() ? 'loading' : 'connected'}`}
            />
          )}
        </For>
      </div>
    </div>
  );
};

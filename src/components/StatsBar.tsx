import { Component, For } from 'solid-js';
import { useStore } from '../stores/context';
import { eventColors } from '../design-tokens';

export const StatsBar: Component = () => {
  const store = useStore();
  const stats = () => store.aggregator.stats();

  const sourceData = () => {
    const s = stats();
    return [
      { label: 'Earthquakes', count: s.bySource.earthquake, color: eventColors.earthquake },
      { label: 'Flights', count: s.bySource.flight, color: eventColors.flight },
      { label: 'ISS', count: s.bySource.iss, color: eventColors.iss },
      { label: 'Weather', count: s.bySource.weather, color: eventColors.weather },
      { label: 'Crypto', count: s.bySource.crypto, color: eventColors.crypto },
      { label: 'GitHub', count: s.bySource.github, color: eventColors.github },
    ];
  };

  return (
    <div class="stats-bar-compact">
      <div class="stat-total">
        <span class="stat-total-value">{stats().total}</span>
        <span class="stat-total-label">Events</span>
      </div>
      
      <div class="stat-divider" />
      
      <div class="stat-sources">
        <For each={sourceData()}>
          {(item) => (
            <div class={`stat-source event-${item.color}`}>
              <div class="event-dot" />
              <span class="stat-source-count">{item.count}</span>
              <span class="stat-source-label">{item.label}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

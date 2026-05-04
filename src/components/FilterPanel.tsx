import { Component, For } from 'solid-js';
import { useStore } from '../stores/context';
import { EventSource } from '../types/events';
import { eventColors } from '../design-tokens';

export const FilterPanel: Component = () => {
  const store = useStore();
  const filters = () => store.aggregator.filters;

  const sources: { id: EventSource; label: string }[] = [
    { id: 'earthquake', label: 'Earthquakes' },
    { id: 'flight', label: 'Flights' },
    { id: 'iss', label: 'ISS' },
    { id: 'weather', label: 'Weather' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'github', label: 'GitHub' },
  ];

  const timeRanges = [
    { value: 5, label: '5m' },
    { value: 15, label: '15m' },
    { value: 30, label: '30m' },
    { value: 60, label: '1h' },
    { value: 180, label: '3h' },
  ];

  const toggleSource = (source: EventSource) => {
    const newSources = new Set(filters().sources);
    if (newSources.has(source)) {
      newSources.delete(source);
    } else {
      newSources.add(source);
    }
    store.aggregator.setFilters('sources', newSources);
  };

  return (
    <div class="filter-panel">
      <div class="filter-section">
        <label class="filter-label">Search</label>
        <input
          type="text"
          placeholder="Filter events..."
          value={filters().searchQuery}
          onInput={(e) => store.aggregator.setFilters('searchQuery', e.currentTarget.value)}
          class="filter-input"
        />
      </div>

      <div class="filter-section">
        <label class="filter-label">Time Range</label>
        <div class="time-range-pills">
          <For each={timeRanges}>
            {(range) => (
              <button
                onClick={() => store.aggregator.setFilters('timeRange', range.value)}
                class="time-pill"
                classList={{ 'active': filters().timeRange === range.value }}
              >
                {range.label}
              </button>
            )}
          </For>
        </div>
      </div>

      <div class="filter-section">
        <label class="filter-label">Data Sources</label>
        <div class="source-toggles">
          <For each={sources}>
            {(source) => {
              const isActive = () => filters().sources.has(source.id);
              
              return (
                <button
                  onClick={() => toggleSource(source.id)}
                  class={`source-toggle event-${eventColors[source.id]}`}
                  classList={{ 'active': isActive() }}
                >
                  <div class="event-dot" />
                  <span class="source-label">{source.label}</span>
                  <div class="toggle-switch">
                    <div class="toggle-thumb" />
                  </div>
                </button>
              );
            }}
          </For>
        </div>
      </div>
    </div>
  );
};

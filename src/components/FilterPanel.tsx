import { Component, Index } from 'solid-js';
import { useStore } from '../stores/context';
import { EventSource } from '../types/events';
import { eventColors } from '../utils/colors';

export const FilterPanel: Component = () => {
  const store = useStore();
  const filters = () => store.aggregator.filters;

  const sources: { id: EventSource; label: string }[] = [
    { id: 'earthquake', label: 'Earthquakes' },
    { id: 'news', label: 'News' },
    { id: 'space', label: 'Space' },
    { id: 'weather', label: 'Weather' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'sports', label: 'Sports' },
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
    <div class="flex flex-col gap-6 lg:sticky lg:top-24">
      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium uppercase tracking-wider text-content-subtle">Search</label>
        <input
          type="text"
          placeholder="Filter events..."
          value={filters().searchQuery}
          onInput={(e) => store.aggregator.setFilters('searchQuery', e.currentTarget.value)}
          class="w-full px-4 py-2.5 bg-sidebar border border-border rounded-lg text-sm text-content transition-all focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 placeholder:text-content-subtle"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium uppercase tracking-wider text-content-subtle">Time Range</label>
        <div class="flex flex-wrap gap-2">
          <Index each={timeRanges}>
            {(range) => (
              <button
                onClick={() => store.aggregator.setFilters('timeRange', range().value)}
                class={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  filters().timeRange === range().value 
                    ? 'bg-accent border-accent text-white shadow-[0_0_12px_rgba(88,166,255,0.3)]' 
                    : 'bg-card border-border text-content-muted hover:bg-hover hover:text-content'
                }`}
              >
                {range().label}
              </button>
            )}
          </Index>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium uppercase tracking-wider text-content-subtle">Data Sources</label>
        <div class="flex flex-col gap-2">
          <Index each={sources}>
            {(source) => {
              const isActive = () => filters().sources.has(source().id);
              const color = eventColors[source().id];
              
              return (
                <button
                  onClick={() => toggleSource(source().id)}
                  class={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all w-full text-left ${
                    isActive()
                      ? `${color.bg10} border-border`
                      : 'border-transparent bg-transparent hover:bg-hover'
                  }`}
                >
                  <div class={`w-2 h-2 rounded-full transition-opacity ${color.bg} ${isActive() ? 'opacity-100' : 'opacity-30'}`} />
                  <span class={`flex-1 text-sm font-medium transition-colors ${isActive() ? color.text : 'text-content-subtle'}`}>
                    {source().label}
                  </span>
                  <div class={`w-8 h-4 rounded-full transition-colors ${isActive() ? color.bg : 'bg-border'} relative`}>
                    <div class={`absolute top-0.5 w-3 h-3 rounded-full transition-all bg-white ${isActive() ? 'left-[18px]' : 'left-0.5'}`} />
                  </div>
                </button>
              );
            }}
          </Index>
        </div>
      </div>
    </div>
  );
};

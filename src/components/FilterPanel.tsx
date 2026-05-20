import { Index } from 'solid-js';
import { useStore } from '../stores/context';
import { EventSource } from '../types/events';
import { eventColors } from '../utils/colors';

const sources: { id: EventSource; label: string }[] = [
  { id: 'earthquake', label: 'Quakes' },
  { id: 'news',       label: 'News' },
  { id: 'space',      label: 'Space' },
  { id: 'weather',    label: 'Weather' },
  { id: 'crypto',     label: 'Crypto' },
  { id: 'sports',     label: 'Sports' },
];

const timeRanges = [
  { value: 5,   label: '5m' },
  { value: 15,  label: '15m' },
  { value: 30,  label: '30m' },
  { value: 60,  label: '1h' },
  { value: 180, label: '3h' },
];

export const FilterPanel = () => {
  const { aggregator: { filters, setFilters } } = useStore();

  const toggleSource = (source: EventSource) => {
    const next = new Set(filters.sources);
    next.has(source) ? next.delete(source) : next.add(source);
    setFilters('sources', next);
  };

  return (
    <div class="space-y-4">
      <div>
        <label class="text-[10px] font-semibold uppercase tracking-widest text-content-subtle mb-1.5 block">Search</label>
        <input
          type="text"
          placeholder="Filter…"
          value={filters.searchQuery}
          onInput={(e) => setFilters('searchQuery', e.currentTarget.value)}
          class="w-full px-3 py-1.5 bg-card border border-border rounded-lg text-sm text-content placeholder:text-content-subtle focus:outline-none focus:border-accent/50"
        />
      </div>

      <div>
        <label class="text-[10px] font-semibold uppercase tracking-widest text-content-subtle mb-1.5 block">Time</label>
        <div class="flex flex-wrap gap-1">
          <Index each={timeRanges}>
            {(r) => (
              <button
                onClick={() => setFilters('timeRange', r().value)}
                class={`px-2 py-1 text-xs rounded-md border transition-colors ${
                  filters.timeRange === r().value
                    ? 'bg-accent/15 border-accent/40 text-accent'
                    : 'border-border text-content-subtle hover:text-content'
                }`}
              >
                {r().label}
              </button>
            )}
          </Index>
        </div>
      </div>

      <div>
        <label class="text-[10px] font-semibold uppercase tracking-widest text-content-subtle mb-1.5 block">Sources</label>
        <div class="grid grid-cols-2 lg:grid-cols-1 gap-0.5">
          <Index each={sources}>
            {(s) => {
              const active = () => filters.sources.has(s().id);
              const color = eventColors[s().id];
              return (
                <button
                  onClick={() => toggleSource(s().id)}
                  class={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                    active() ? 'bg-card text-content' : 'text-content-subtle hover:text-content'
                  }`}
                >
                  <div class={`w-1.5 h-1.5 rounded-full ${color.bg} ${active() ? '' : 'opacity-30'}`} />
                  <span class="text-xs">{s().label}</span>
                </button>
              );
            }}
          </Index>
        </div>
      </div>
    </div>
  );
};

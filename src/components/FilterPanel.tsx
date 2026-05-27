import { Index } from 'solid-js';
import { useStore } from '../stores/context';
import { EventSource } from '../types/events';
import { eventColors } from '../utils/colors';
import { SOURCES } from '../config/sources';

const TIME_RANGES = [
  { value: 5,   label: '5m' },
  { value: 15,  label: '15m' },
  { value: 30,  label: '30m' },
  { value: 60,  label: '1h' },
  { value: 180, label: '3h' },
  { value: 720, label: '12h' },
];

export const FilterPanel = () => {
  const { aggregator: { filters, setFilters } } = useStore();

  const toggleSource = (source: EventSource) => {
    const next = new Set(filters.sources);
    next.has(source) ? next.delete(source) : next.add(source);
    setFilters('sources', next);
  };

  return (
    <div class="p-5 space-y-6">
      {/* Search */}
      <div class="space-y-2">
        <p class="text-xs font-semibold text-content-muted uppercase tracking-widest">Search</p>
        <input
          type="text"
          placeholder="Filter events…"
          value={filters.searchQuery}
          onInput={(e) => setFilters('searchQuery', e.currentTarget.value)}
          class="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-content placeholder:text-content-subtle focus:outline-none focus:border-accent/50 transition-colors"
        />
      </div>

      {/* Time range */}
      <div class="space-y-2">
        <p class="text-xs font-semibold text-content-muted uppercase tracking-widest">Time Range</p>
        <div class="grid grid-cols-3 gap-1">
          <Index each={TIME_RANGES}>
            {(r) => (
              <button
                onClick={() => setFilters('timeRange', filters.timeRange === r().value ? null : r().value)}
                class={`py-1.5 text-xs rounded-md border transition-colors ${
                  filters.timeRange === r().value
                    ? 'bg-accent/15 border-accent/40 text-accent font-medium'
                    : 'border-border text-content-subtle hover:text-content hover:border-border-strong'
                }`}
              >
                {r().label}
              </button>
            )}
          </Index>
        </div>
      </div>

      {/* Sources */}
      <div class="space-y-2">
        <p class="text-xs font-semibold text-content-muted uppercase tracking-widest">Sources</p>
        <div class="space-y-0.5">
          <Index each={SOURCES}>
            {(s) => {
              const active = () => filters.sources.has(s().id);
              return (
                <button
                  onClick={() => toggleSource(s().id)}
                  class={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
                    active() ? 'bg-card text-content' : 'text-content-subtle hover:text-content hover:bg-card/50'
                  }`}
                >
                  <div class={`w-2 h-2 rounded-full shrink-0 ${eventColors[s().id].bg} ${active() ? '' : 'opacity-30'}`} />
                  <span class="text-sm">{s().label}</span>
                </button>
              );
            }}
          </Index>
        </div>
      </div>
    </div>
  );
};

import { createSignal, Index } from 'solid-js';
import { useStore } from '../stores/context';
import { EventSource } from '../types/events';
import { eventColors } from '../utils/colors';

const sources: { id: EventSource; label: string }[] = [
  { id: 'earthquake', label: 'Earthquakes' },
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
  const [open, setOpen] = createSignal(true);

  const toggleSource = (source: EventSource) => {
    const next = new Set(filters.sources);
    next.has(source) ? next.delete(source) : next.add(source);
    setFilters('sources', next);
  };

  return (
    <div class="flex flex-col gap-3 lg:gap-5 lg:sticky lg:top-[var(--header-h)]">
      {/* Mobile collapse toggle — hidden on desktop */}
      <button
        class="lg:hidden flex items-center justify-between w-full px-4 py-3 bg-card border border-border rounded-xl text-sm font-medium text-content"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open()}
      >
        <span>Filters</span>
        <span class="text-content-subtle text-xs">{open() ? '▲' : '▼'}</span>
      </button>

      <div class={`flex flex-col gap-4 lg:gap-5 ${open() ? '' : 'hidden lg:flex'}`}>
        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-semibold uppercase tracking-widest text-content-subtle">Search</label>
          <input
            type="text"
            placeholder="Filter events..."
            value={filters.searchQuery}
            onInput={(e) => setFilters('searchQuery', e.currentTarget.value)}
            class="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-content placeholder:text-content-subtle focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-semibold uppercase tracking-widest text-content-subtle">Time Range</label>
          {/* Horizontal scroll on mobile */}
          <div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <Index each={timeRanges}>
              {(range) => (
                <button
                  onClick={() => setFilters('timeRange', range().value)}
                  class={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all shrink-0 ${
                    filters.timeRange === range().value
                      ? 'bg-accent/15 border-accent/40 text-accent'
                      : 'bg-transparent border-border text-content-subtle hover:text-content hover:border-border-strong'
                  }`}
                >
                  {range().label}
                </button>
              )}
            </Index>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-semibold uppercase tracking-widest text-content-subtle">Sources</label>
          {/* Grid on mobile, column on desktop */}
          <div class="grid grid-cols-2 lg:grid-cols-1 gap-1">
            <Index each={sources}>
              {(source) => {
                const active = () => filters.sources.has(source().id);
                const color = eventColors[source().id];
                return (
                  <button
                    onClick={() => toggleSource(source().id)}
                    class={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all text-left ${
                      active() ? 'border-border-strong bg-card' : 'border-transparent bg-transparent hover:bg-card/50'
                    }`}
                  >
                    <div class={`w-1.5 h-1.5 rounded-full shrink-0 ${color.bg} ${active() ? 'opacity-100' : 'opacity-25'}`} />
                    <span class={`text-sm transition-colors ${active() ? 'text-content' : 'text-content-subtle'}`}>
                      {source().label}
                    </span>
                  </button>
                );
              }}
            </Index>
          </div>
        </div>
      </div>
    </div>
  );
};

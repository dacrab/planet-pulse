import { For, Show, createUniqueId, useTransition } from 'solid-js';
import { usePulse } from '../stores/pulse';
import { SOURCES } from '../data/sources';
import type { SourceId } from '../types';
import { Icon } from './Icon';
import { Button, SourceDot } from './UI';

const ALL_SOURCES = SOURCES.map((source) => source.id);

const WINDOWS: Array<{ value: number | null; label: string }> = [
  { value: null, label: 'All' },
  { value: 15, label: '15m' },
  { value: 60, label: '1h' },
  { value: 360, label: '6h' },
  { value: 1440, label: '24h' },
];

const KINDS: Array<{ value: 'all' | 'event' | 'signal'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'event', label: 'Events' },
  { value: 'signal', label: 'Readings' },
];

export function FilterBar() {
  const pulse = usePulse();
  const searchId = createUniqueId();
  const [pending, start] = useTransition();

  const toggleSource = (source: SourceId) => {
    start(() => {
      const active = pulse.filters.sources.includes(source);
      const next = active
        ? pulse.filters.sources.filter((id) => id !== source)
        : [...pulse.filters.sources, source];
      pulse.setFilters('sources', next);
    });
  };

  const reset = () => {
    start(() => {
      pulse.setFilters({
        sources: [...ALL_SOURCES],
        window: null,
        query: '',
        sort: 'newest',
        kind: 'all',
      });
    });
  };

  const isDirty = () =>
    pulse.filters.query !== '' ||
    pulse.filters.window !== null ||
    pulse.filters.kind !== 'all' ||
    pulse.filters.sort !== 'newest' ||
    pulse.filters.sources.length !== ALL_SOURCES.length ||
    ALL_SOURCES.some((id) => !pulse.filters.sources.includes(id));

  return (
    <div class="sticky top-16 z-30 -mx-4 border-y border-line bg-bg px-4 py-3 sm:-mx-6 sm:px-6">
      <div class="flex flex-col gap-2.5">
        <div class="flex items-center gap-2">
          <div class="relative min-w-0 flex-1">
            <label class="sr-only" for={searchId}>
              Search events
            </label>
            <Icon
              name="search"
              size={15}
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
            />
            <input
              id={searchId}
              type="search"
              value={pulse.filters.query}
              onInput={(event) =>
                pulse.setFilters('query', event.currentTarget.value)
              }
              placeholder="Search events, places, assets, teams…"
              class="focus-ring h-9 w-full rounded border border-line bg-panel-2 pl-9 pr-9 text-[13px] text-ink placeholder:text-faint"
            />
            <Show when={pulse.filters.query}>
              <button
                type="button"
                class="focus-ring absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-faint hover:bg-line/60 hover:text-ink"
                onClick={() => pulse.setFilters('query', '')}
                aria-label="Clear search"
              >
                <Icon name="x" size={13} />
              </button>
            </Show>
          </div>

          <div class="hidden h-9 items-center gap-1 rounded border border-line bg-panel-2 p-0.5 sm:flex">
            <For each={KINDS}>
              {(kind) => (
                <button
                  type="button"
                  onClick={() => start(() => pulse.setFilters('kind', kind.value))}
                  class="focus-ring h-8 rounded-sm px-2.5 text-[11px] font-medium text-faint transition-colors hover:text-ink"
                  classList={{
                    'bg-panel text-ink': pulse.filters.kind === kind.value,
                  }}
                  aria-pressed={pulse.filters.kind === kind.value}
                >
                  {kind.label}
                </button>
              )}
            </For>
          </div>

          <Button
            variant="ghost"
            size="sm"
            class="hidden md:inline-flex"
            onClick={() =>
              start(() =>
                pulse.setFilters(
                  'sort',
                  pulse.filters.sort === 'newest' ? 'impact' : 'newest'
                )
              )
            }
            aria-label={`Sort by ${pulse.filters.sort === 'newest' ? 'priority' : 'newest'}`}
          >
            <Icon name="sliders" size={13} />
            {pulse.filters.sort === 'newest' ? 'Newest' : 'Priority'}
          </Button>

          <Show when={isDirty()}>
            <Button variant="ghost" size="sm" onClick={reset}>
              <Icon name="x" size={13} />
              <span class="hidden sm:inline">Reset</span>
            </Button>
          </Show>
        </div>

        <div class="scrollbar-none flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <span class="eyebrow mr-1 shrink-0 text-[8px] text-faint">Sources</span>

          <button
            type="button"
            onClick={() =>
              start(() =>
                pulse.setFilters(
                  'sources',
                  pulse.filters.sources.length === ALL_SOURCES.length
                    ? []
                    : [...ALL_SOURCES]
                )
              )
            }
            class="focus-ring h-7 shrink-0 rounded border border-line px-2.5 text-[10px] font-medium text-muted transition-colors hover:border-line-strong hover:text-ink"
            aria-pressed={pulse.filters.sources.length === ALL_SOURCES.length}
          >
            All
          </button>

          <For each={SOURCES}>
            {(source) => {
              const active = () => pulse.filters.sources.includes(source.id);
              return (
                <button
                  type="button"
                  onClick={() => toggleSource(source.id)}
                  class="source-chip focus-ring flex h-7 shrink-0 items-center gap-1.5 rounded border px-2.5 text-[10px] font-medium transition-colors"
                  classList={{ 'is-active': active() }}
                  style={{ '--chip': source.color }}
                  aria-pressed={active()}
                >
                  <SourceDot source={source.id} size={5} />
                  {source.short}
                  <span class="font-mono text-[9px] tabular-nums opacity-60">
                    {pulse.counts()[source.id]}
                  </span>
                </button>
              );
            }}
          </For>

          <span class="mx-1.5 h-4 w-px shrink-0 bg-line" />

          <span class="eyebrow mr-1 shrink-0 text-[8px] text-faint">Window</span>
          <For each={WINDOWS}>
            {(window) => (
              <button
                type="button"
                onClick={() =>
                  start(() =>
                    pulse.setFilters(
                      'window',
                      pulse.filters.window === window.value ? null : window.value
                    )
                  )
                }
                class="focus-ring h-7 shrink-0 rounded border px-2.5 text-[10px] font-medium transition-colors"
                classList={{
                  'border-line': pulse.filters.window !== window.value,
                  'text-faint': pulse.filters.window !== window.value,
                  'hover:text-ink': pulse.filters.window !== window.value,
                  'border-accent/40': pulse.filters.window === window.value,
                  'bg-accent/10': pulse.filters.window === window.value,
                  'text-accent': pulse.filters.window === window.value,
                }}
                aria-pressed={pulse.filters.window === window.value}
              >
                {window.label}
              </button>
            )}
          </For>

          <Show when={pending()}>
            <span class="ml-auto shrink-0 font-mono text-[9px] uppercase tracking-wider text-accent">
              updating
            </span>
          </Show>
        </div>
      </div>
    </div>
  );
}

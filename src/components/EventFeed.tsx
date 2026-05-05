import { Component, Index, Show } from 'solid-js';
import { useStore } from '../stores/context';
import { Event } from '../types/events';
import { eventColors } from '../utils/colors';
import { formatTimestamp } from '../utils/formatters';

export const EventFeed: Component = () => {
  const store = useStore();
  const events = () => store.aggregator.filteredEvents();

  return (
    <div class="bg-card border border-border rounded-xl flex flex-col self-start sticky top-[var(--header-h)]">
      <div class="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <span class="text-sm font-medium text-content">Live Feed</span>
        <span class="text-xs tabular-nums font-semibold text-content-subtle bg-surface px-2 py-0.5 rounded-md">
          {events().length}
        </span>
      </div>

      <div class="max-h-[calc(100svh-var(--header-h))] overflow-y-auto">
        <Show
          when={events().length > 0}
          fallback={
            <div class="flex flex-col items-center justify-center py-20 gap-2">
              <div class="w-8 h-8 rounded-full border border-border flex items-center justify-center">
                <div class="w-2 h-2 rounded-full bg-border-strong" />
              </div>
              <p class="text-sm text-content-subtle">Waiting for events…</p>
            </div>
          }
        >
          <div class="divide-y divide-border-subtle">
            <Index each={events()}>
              {(event) => <EventRow event={event()} />}
            </Index>
          </div>
        </Show>
      </div>
    </div>
  );
};

const EventRow: Component<{ event: Event }> = (props) => {
  const label = () => {
    const e = props.event;
    switch (e.source) {
      case 'earthquake': return `M${e.magnitude.toFixed(1)} — ${e.place}`;
      case 'news':       return e.title;
      case 'space':      return `ISS at ${e.altitude}km altitude`;
      case 'weather':    return `${e.temperature.toFixed(1)}°C, ${e.condition} · ${e.location}`;
      case 'crypto': {
        const ch = e.change_24h > 0 ? `+${e.change_24h.toFixed(2)}` : e.change_24h.toFixed(2);
        return `${e.symbol} $${e.price.toFixed(2)} (${ch}%)`;
      }
      case 'sports': return `${e.home_team} vs ${e.away_team}`;
    }
  };

  const color = eventColors[props.event.source];

  return (
    <div class="flex items-center gap-3.5 px-5 py-3 hover:bg-card-hover transition-colors">
      <div class={`w-1.5 h-1.5 rounded-full shrink-0 ${color.bg}`} />
      <div class="flex-1 min-w-0">
        <p class="text-sm text-content truncate">{label()}</p>
        <p class="text-xs text-content-subtle mt-0.5 tabular-nums">{formatTimestamp(props.event.timestamp)}</p>
      </div>
    </div>
  );
};

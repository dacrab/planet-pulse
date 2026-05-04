import { Component, Index, Show, Switch, Match } from 'solid-js';
import { useStore } from '../stores/context';
import { Event } from '../types/events';
import { eventColors } from '../utils/colors';
import { formatTimestamp } from '../utils/formatters';

export const EventFeed: Component = () => {
  const store = useStore();
  const events = () => store.aggregator.filteredEvents();

  return (
    <div class="bg-card border border-border rounded-xl flex flex-col h-fit overflow-hidden">
      <div class="flex items-center justify-between p-4 px-6 border-b border-border">
        <h2 class="text-base font-medium text-content-muted">Live Event Feed</h2>
        <div class="text-sm font-semibold tabular-nums text-content-muted">{events().length}</div>
      </div>
      
      <div class="max-h-[calc(100vh-400px)] overflow-y-auto">
        <Show when={events().length > 0} fallback={
          <div class="p-24 text-center">
            <p class="text-sm font-medium text-content-muted mb-1">No events yet</p>
            <p class="text-xs text-content-subtle">Events will appear here as they happen</p>
          </div>
        }>
          <div class="divide-y divide-border-subtle">
            <Index each={events()}>
              {(event) => <EventCard event={event()} />}
            </Index>
          </div>
        </Show>
      </div>
    </div>
  );
};

const EventCard: Component<{ event: Event }> = (props) => {
  const getContent = () => {
    const e = props.event;
    switch (e.source) {
      case 'earthquake':
        return `M${e.magnitude.toFixed(1)} — ${e.place}`;
      case 'news':
        return e.title;
      case 'space':
        return `ISS orbiting at ${e.altitude}km altitude`;
      case 'weather':
        return `${e.temperature.toFixed(1)}°C, ${e.condition} in ${e.location}`;
      case 'crypto':
        const change = e.change_24h > 0 ? `+${e.change_24h.toFixed(2)}` : e.change_24h.toFixed(2);
        return `${e.symbol} $${e.price.toFixed(2)} (${change}%)`;
      case 'sports':
        return `${e.home_team} vs ${e.away_team}`;
    }
  };

  return (
    <div class="flex items-center gap-4 p-4 px-6 transition-colors">
      <div class={`w-2 h-2 rounded-full ${eventColors[props.event.source].bg} shrink-0`} />
      <div class="flex-1 min-w-0">
        <div class="text-sm text-content truncate mb-1">{getContent()}</div>
        <div class="text-xs tabular-nums text-content-subtle">{formatTimestamp(props.event.timestamp)}</div>
      </div>
    </div>
  );
};

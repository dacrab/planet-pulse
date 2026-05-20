import { Component, Index, Show } from 'solid-js';
import { useStore } from '../stores/context';
import { Event } from '../types/events';
import { eventColors } from '../utils/colors';
import { formatTimestamp } from '../utils/formatters';

export const EventFeed: Component = () => {
  const store = useStore();
  const events = () => store.aggregator.filteredEvents();

  return (
    <div class="flex flex-col h-full">
      <div class="flex items-center justify-between pb-3">
        <span class="text-sm font-medium">Live Feed</span>
        <span class="text-xs tabular-nums text-content-subtle">{events().length} events</span>
      </div>

      <Show
        when={events().length > 0}
        fallback={<p class="text-sm text-content-subtle text-center py-12">Waiting for events…</p>}
      >
        <div class="space-y-px">
          <Index each={events()}>
            {(event) => <EventRow event={event()} />}
          </Index>
        </div>
      </Show>
    </div>
  );
};

const getEventUrl = (e: Event): string | null => {
  switch (e.source) {
    case 'earthquake': return `https://earthquake.usgs.gov/earthquakes/eventpage/${e.id}`;
    case 'news':       return e.url;
    case 'crypto':     return `https://www.coingecko.com/en/coins/${e.id}`;
    case 'sports':     return `https://www.thesportsdb.com/event/${e.id}`;
    default:           return null;
  }
};

const EventRow: Component<{ event: Event }> = (props) => {
  const label = () => {
    const e = props.event;
    switch (e.source) {
      case 'earthquake': return `M${e.magnitude.toFixed(1)} — ${e.place}`;
      case 'news':       return e.title;
      case 'space':      return `ISS ${e.altitude}km`;
      case 'weather':    return `${e.temperature.toFixed(1)}°C ${e.condition} · ${e.location}`;
      case 'crypto': {
        const ch = e.change_24h > 0 ? `+${e.change_24h.toFixed(1)}` : e.change_24h.toFixed(1);
        return `${e.symbol} $${e.price.toFixed(2)} (${ch}%)`;
      }
      case 'sports': return `${e.home_team} vs ${e.away_team}`;
    }
  };

  const url = getEventUrl(props.event);
  const color = eventColors[props.event.source];

  const content = (
    <>
      <div class={`w-1.5 h-1.5 rounded-full shrink-0 ${color.bg}`} />
      <span class="flex-1 min-w-0 text-[13px] text-content truncate">{label()}</span>
      <span class="text-[11px] text-content-subtle tabular-nums shrink-0">{formatTimestamp(props.event.timestamp)}</span>
    </>
  );

  const base = "flex items-center gap-3 px-3 py-2 rounded-md transition-colors";

  return url
    ? <a href={url} target="_blank" rel="noopener noreferrer" class={`${base} hover:bg-card-hover cursor-pointer group`}>
        {content}
        <span class="text-[11px] text-content-subtle group-hover:text-accent shrink-0">↗</span>
      </a>
    : <div class={base}>{content}</div>;
};

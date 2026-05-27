import { createMemo, Index, Show, Accessor } from 'solid-js';
import { useStore } from '../stores/context';
import { Event } from '../types/events';
import { eventColors } from '../utils/colors';
import { formatTimestamp } from '../utils/formatters';
import { useNow } from '../hooks/useNow';

const SOURCE_LABELS: Record<string, string> = {
  earthquake: 'Quake', news: 'News', space: 'Space',
  weather: 'Weather', crypto: 'Crypto', sports: 'Sports',
};

export const EventFeed = () => {
  const { aggregator } = useStore();
  const now = useNow();

  return (
    <div class="p-5">
      <div class="flex items-center justify-between mb-4">
        <span class="text-sm font-semibold">Live Feed</span>
        <span class="text-xs tabular-nums text-content-subtle">{aggregator.filteredEvents().length} events</span>
      </div>

      <Show
        when={aggregator.filteredEvents().length > 0}
        fallback={<p class="text-sm text-content-subtle text-center py-16">Waiting for events…</p>}
      >
        <div class="space-y-1.5">
          <Index each={aggregator.filteredEvents()}>
            {(event) => <EventRow event={event()} now={now} />}
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
    case 'crypto':     return `https://www.binance.com/en/trade/${e.symbol}_USDT`;
    case 'sports':     return `https://www.thesportsdb.com/event/${e.id}`;
    default:           return null;
  }
};

const getSubtitle = (e: Event): string | null => {
  switch (e.source) {
    case 'earthquake': return `Depth ${e.depth}km`;
    case 'crypto': {
      const sign = e.change_24h >= 0 ? '+' : '';
      return `${sign}${e.change_24h.toFixed(2)}% 24h`;
    }
    case 'sports':  return e.league;
    case 'weather': return e.location;
    default:        return null;
  }
};

const EventRow = (props: { event: Event; now: Accessor<number> }) => {
  const label = createMemo(() => {
    const e = props.event;
    switch (e.source) {
      case 'earthquake': return `M${e.magnitude.toFixed(1)} — ${e.place}`;
      case 'news':       return e.title;
      case 'space':      return `ISS · ${e.altitude} km alt · ${e.velocity.toLocaleString()} km/h`;
      case 'weather':    return `${e.temperature.toFixed(1)}°C · ${e.condition}`;
      case 'crypto':     return `${e.symbol}  $${e.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
      case 'sports':     return `${e.home_team} vs ${e.away_team}`;
    }
  });

  const subtitle = createMemo(() => getSubtitle(props.event));
  const url = () => getEventUrl(props.event);
  const color = eventColors[props.event.source];
  const sourceLabel = SOURCE_LABELS[props.event.source];

  const content = (
    <div class="flex items-start gap-3 w-full">
      <span class={`shrink-0 mt-0.5 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${color.bg} bg-opacity-15 ${color.text}`}>
        {sourceLabel}
      </span>
      <div class="flex-1 min-w-0">
        <p class="text-[13px] text-content leading-snug truncate">{label()}</p>
        <Show when={subtitle()}>
          <p class="text-[11px] text-content-subtle mt-0.5">{subtitle()}</p>
        </Show>
      </div>
      <div class="shrink-0 flex items-center gap-2 mt-0.5">
        <span class="text-[11px] text-content-subtle tabular-nums">{formatTimestamp(props.event.timestamp, props.now())}</span>
        <Show when={url()}>
          <span class="text-[11px] text-content-subtle group-hover:text-accent transition-colors">↗</span>
        </Show>
      </div>
    </div>
  );

  const base = "w-full flex items-start px-3 py-2.5 rounded-lg border border-transparent transition-colors";

  return (
    <Show when={url()} fallback={<div class={base}>{content}</div>}>
      <a href={url()!} target="_blank" rel="noopener noreferrer"
        class={`${base} hover:bg-card hover:border-border cursor-pointer`}>
        {content}
      </a>
    </Show>
  );
};

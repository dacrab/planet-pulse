import { Show } from 'solid-js';
import { useStore } from '../stores/context';
import { Event } from '../types/events';
import { eventColors } from '../utils/colors';

function EventDetail(props: { event: Event }) {
  const e = props.event;
  const color = eventColors[e.source];

  if (e.source === 'crypto') {
    const up = e.change_24h >= 0;
    return (
      <div class="mt-3 flex items-center justify-between">
        <span class={`text-xs px-2 py-0.5 rounded font-semibold ${color.bg} bg-opacity-15 ${color.text}`}>{e.symbol}</span>
        <div class="text-right">
          <p class="text-sm font-semibold tabular-nums text-content">${e.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          <p class={`text-xs tabular-nums ${up ? 'text-success' : 'text-danger'}`}>{up ? '+' : ''}{e.change_24h.toFixed(2)}%</p>
        </div>
      </div>
    );
  }

  if (e.source === 'earthquake') {
    return (
      <div class="mt-3 flex items-center justify-between">
        <span class={`text-xs px-2 py-0.5 rounded font-semibold ${color.bg} bg-opacity-15 ${color.text}`}>M{e.magnitude.toFixed(1)}</span>
        <p class="text-xs text-content-muted">Depth {e.depth} km</p>
      </div>
    );
  }

  if (e.source === 'news') {
    return (
      <div class="mt-3 flex items-center justify-between">
        <span class={`text-xs px-2 py-0.5 rounded font-semibold ${color.bg} bg-opacity-15 ${color.text}`}>{e.source_name}</span>
        <a href={e.url} target="_blank" rel="noopener noreferrer" class="text-xs text-accent hover:underline">Read ↗</a>
      </div>
    );
  }

  return null;
}

export function InsightsPanel() {
  const { insights } = useStore();

  return (
    <Show when={insights.topEvent()}>
      {(top) => (
        <div class="p-5 border-b border-border">
          <p class="text-xs font-semibold text-content-muted uppercase tracking-widest mb-3">Top Event</p>
          <p class="text-sm text-content leading-relaxed">{top().description}</p>
          <div class="flex items-center gap-3 mt-3">
            <div class="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
              <div class="h-full bg-accent rounded-full transition-all" style={`width: ${top().score}%`} />
            </div>
            <span class="text-xs font-semibold tabular-nums text-content-muted w-6 text-right">{Math.round(top().score)}</span>
          </div>
          <EventDetail event={top().event} />
        </div>
      )}
    </Show>
  );
}

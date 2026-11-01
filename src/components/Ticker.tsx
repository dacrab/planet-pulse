import { Index, Show, createMemo } from 'solid-js';
import { usePulse } from '../stores/pulse';
import { percent } from '../lib/format';
import { SourceDot } from './UI';
import type { SourceId } from '../types';

interface TickerItem {
  id: string;
  source: SourceId;
  text: string;
  delta?: number;
}

export function Ticker() {
  const pulse = usePulse();

  const items = createMemo<TickerItem[]>(() => {
    const events = pulse.events();
    const headlines = events
      .filter((event) => event.source === 'news')
      .slice(0, 6)
      .map((event) => ({
        id: event.id,
        source: event.source,
        text: event.title,
      }));

    const movers = events
      .filter((event) => event.source === 'crypto')
      .slice(0, 4)
      .map((event) => ({
        id: event.id,
        source: event.source,
        text: `${event.title.split(' · ')[0]} $${event.title.split('$')[1] ?? ''}`,
        delta: event.delta,
      }));

    const fixtures = events
      .filter((event) => event.source === 'sports')
      .slice(0, 3)
      .map((event) => ({
        id: event.id,
        source: event.source,
        text: `${event.title} — ${event.subtitle}`,
      }));

    return [...headlines, ...movers, ...fixtures];
  });

  return (
    <div
      class="relative flex h-8 items-center overflow-hidden border-b border-line bg-panel"
      aria-label="Live headline ticker"
    >
      <div class="relative z-10 flex h-full shrink-0 items-center gap-2 border-r border-line bg-panel px-3 sm:px-4">
        <span class="h-1.5 w-1.5 rounded-full bg-accent" />
        <span class="eyebrow text-[8px] text-muted">Wire</span>
      </div>

      <Show
        when={items().length}
        fallback={
          <p class="px-4 font-mono text-[10px] uppercase tracking-wider text-faint">
            Connecting to feeds…
          </p>
        }
      >
        <div
          class="ticker-track"
          style={{
            '--ticker-duration': `${Math.max(36, items().length * 7)}s`,
          }}
        >
          <Index each={items()}>
            {(item) => <TickerEntry item={item()} />}
          </Index>
          <div aria-hidden="true" class="contents">
            <Index each={items()}>
              {(item) => <TickerEntry item={item()} />}
            </Index>
          </div>
        </div>
      </Show>

      <div class="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-bg to-transparent" />
    </div>
  );
}

function TickerEntry(props: { item: TickerItem }) {
  return (
    <span class="ticker-item">
      <SourceDot source={props.item.source} size={5} />
      <span class="max-w-[52ch] truncate text-muted">{props.item.text}</span>
      <Show when={props.item.delta !== undefined}>
        <span
          class="font-mono text-[10px] tabular-nums"
          classList={{
            'text-success': (props.item.delta ?? 0) >= 0,
            'text-danger': (props.item.delta ?? 0) < 0,
          }}
        >
          {percent(props.item.delta ?? 0)}
        </span>
      </Show>
    </span>
  );
}

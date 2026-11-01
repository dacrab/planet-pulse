import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  untrack,
} from 'solid-js';
import { createStore } from 'solid-js/store';
import { A } from '@solidjs/router';
import { usePulse } from '../stores/pulse';
import { clamp, percent, price } from '../lib/format';
import { Icon } from './Icon';
import { Panel } from './UI';

export function MarketPanel() {
  const pulse = usePulse();
  const [previous, setPrevious] = createStore<Record<string, number>>({});
  const [flash, setFlash] = createSignal<Record<string, 'up' | 'down'>>({});

  const movers = createMemo(() =>
    pulse
      .events()
      .filter((event) => event.source === 'crypto')
      .sort((a, b) => Math.abs(b.delta ?? 0) - Math.abs(a.delta ?? 0))
      .slice(0, 5)
  );

  createEffect(() => {
    const list = movers();
    const nextFlash: Record<string, 'up' | 'down'> = {};

    for (const event of list) {
      if (event.value === undefined) continue;
      const old = untrack(() => previous[event.id]);
      if (old !== undefined && old !== event.value) {
        nextFlash[event.id] = event.value > old ? 'up' : 'down';
      }
      setPrevious(event.id, event.value);
    }

    if (Object.keys(nextFlash).length) {
      setFlash(nextFlash);
      const timer = setTimeout(() => setFlash({}), 800);
      onCleanup(() => clearTimeout(timer));
    }
  });

  return (
    <Panel
      eyebrow="Markets"
      title="Movers"
      action={
        <A
          href="/sources/crypto"
          class="focus-ring inline-flex items-center gap-1 rounded text-[10px] text-faint transition-colors hover:text-ink"
        >
          Explore <Icon name="arrow-right" size={12} />
        </A>
      }
      bodyClass="space-y-0.5 p-2"
    >
      <Show
        when={movers().length}
        fallback={
          <p class="py-6 text-center text-xs text-muted">Waiting for market data…</p>
        }
      >
        <For each={movers()}>
          {(event) => {
            const up = () => (event.delta ?? 0) >= 0;
            const width = () => clamp(Math.abs(event.delta ?? 0) * 4, 3, 50);

            return (
              <button
                type="button"
                onClick={() => pulse.openEvent(event.id)}
                class="focus-ring group rounded-lg border border-transparent px-2 py-1.5 text-left transition-colors hover:border-line hover:bg-panel-2/70"
                classList={{
                  'flash-up': flash()[event.id] === 'up',
                  'flash-down': flash()[event.id] === 'down',
                }}
              >
                <div class="flex items-center justify-between gap-2">
                  <div class="flex min-w-0 items-center gap-2">
                    <span class="w-10 font-mono text-[10px] font-medium text-ink">
                      {event.title.split(' · ')[0]}
                    </span>
                    <span class="truncate text-[10px] text-faint">{event.place}</span>
                  </div>
                  <span
                    class="font-mono text-[10px] tabular-nums"
                    classList={{
                      'text-success': up(),
                      'text-danger': !up(),
                    }}
                  >
                    {percent(event.delta ?? 0)}
                  </span>
                </div>

                <div class="mt-1.5 flex items-center gap-2">
                  <span class="w-10 shrink-0 text-right font-mono text-[9px] text-muted">
                    ${price(event.value ?? 0)}
                  </span>
                  <span class="relative h-1 flex-1 rounded-full bg-line/60">
                    <span
                      class="absolute top-0 h-full rounded-full"
                      style={{
                        left: up() ? '50%' : `${50 - width()}%`,
                        width: `${width()}%`,
                        'background-color': up() ? 'var(--success)' : 'var(--danger)',
                      }}
                    />
                    <span class="absolute left-1/2 top-1/2 h-2.5 w-px -translate-y-1/2 bg-line-strong" />
                  </span>
                </div>
              </button>
            );
          }}
        </For>
      </Show>
    </Panel>
  );
}

import { Show, createMemo } from 'solid-js';
import { A } from '@solidjs/router';
import { usePulse } from '../stores/pulse';
import { timeAgoLabel } from '../lib/format';
import { Icon } from './Icon';
import { Panel, Sparkline } from './UI';

export function SeismicPanel() {
  const pulse = usePulse();

  const quakes = createMemo(() =>
    pulse
      .events()
      .filter((event) => event.source === 'earthquake')
      .sort((a, b) => a.timestamp - b.timestamp)
  );

  const biggest = createMemo(() =>
    quakes().reduce(
      (best, event) => (!best || (event.value ?? 0) > (best.value ?? 0) ? event : best),
      quakes()[0]
    )
  );

  const values = createMemo(() =>
    quakes()
      .slice(-32)
      .map((event) => event.value ?? 0)
  );

  return (
    <Panel
      eyebrow="Seismic"
      title="Earth's pulse"
      action={
        <A
          href="/sources/earthquake"
          class="focus-ring inline-flex items-center gap-1 rounded text-[10px] text-faint transition-colors hover:text-ink"
        >
          Explore <Icon name="arrow-right" size={12} />
        </A>
      }
    >
      <Show
        when={biggest()}
        fallback={<p class="py-6 text-center text-xs text-muted">No seismic events yet.</p>}
      >
        {(event) => (
          <>
            <div class="flex items-end justify-between gap-3">
              <div class="min-w-0">
                <p class="eyebrow text-[8px] text-faint">Largest · 24h</p>
                <button
                  type="button"
                  onClick={() => pulse.openEvent(event().id)}
                  class="focus-ring mt-1 block rounded text-left"
                >
                  <p class="display text-3xl leading-none text-[var(--src-earthquake)]">
                    M{(event().value ?? 0).toFixed(1)}
                  </p>
                  <p class="mt-1 max-w-[20ch] truncate text-[11px] text-muted">
                    {event().place}
                  </p>
                </button>
              </div>
              <div class="shrink-0 text-right">
                <p class="display text-2xl leading-none text-ink">{quakes().length}</p>
                <p class="eyebrow text-[8px] text-faint">events</p>
              </div>
            </div>

            <Sparkline
              values={values()}
              color="var(--src-earthquake)"
              class="mt-4 h-12 w-full"
            />

            <div class="mt-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-faint">
              <span>24h ago</span>
              <span>{timeAgoLabel(event().timestamp, pulse.now())}</span>
              <span>now</span>
            </div>
          </>
        )}
      </Show>
    </Panel>
  );
}

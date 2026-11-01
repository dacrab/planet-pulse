import { For, Show, createMemo } from 'solid-js';
import { A } from '@solidjs/router';
import { usePulse } from '../stores/pulse';
import { Icon } from './Icon';
import { Panel } from './UI';
import type { IconName, PulseEvent } from '../types';

function weatherIcon(event: PulseEvent): IconName {
  const condition = event.tags[0] ?? '';
  if (condition.includes('storm') || condition.includes('thunder')) return 'storm';
  if (condition.includes('snow')) return 'snow';
  if (
    condition.includes('rain') ||
    condition.includes('drizzle') ||
    condition.includes('shower')
  ) {
    return 'rain';
  }
  if (
    condition.includes('cloud') ||
    condition.includes('overcast') ||
    condition.includes('fog')
  ) {
    return 'cloud';
  }
  return event.tags.includes('night') ? 'moon' : 'sun';
}

export function WeatherPanel() {
  const pulse = usePulse();
  const cities = createMemo(() =>
    pulse
      .events()
      .filter((event) => event.source === 'weather')
      .sort((a, b) => (a.place ?? '').localeCompare(b.place ?? ''))
  );

  return (
    <Panel
      eyebrow="Weather"
      title="City conditions"
      action={
        <A
          href="/sources/weather"
          class="focus-ring inline-flex items-center gap-1 rounded text-[10px] text-faint transition-colors hover:text-ink"
        >
          Details <Icon name="arrow-right" size={12} />
        </A>
      }
      bodyClass="grid grid-cols-2 gap-1 p-2"
    >
      <Show
        when={cities().length}
        fallback={
          <p class="col-span-2 py-6 text-center text-xs text-muted">
            No weather data yet.
          </p>
        }
      >
        <For each={cities()}>
          {(event) => (
            <button
              type="button"
              onClick={() => pulse.openEvent(event.id)}
              class="focus-ring group rounded border border-transparent p-2.5 text-left transition-colors hover:border-line hover:bg-panel-2"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="text-[11px] text-muted">{event.place}</span>
                <Icon
                  name={weatherIcon(event)}
                  size={15}
                  class="text-[var(--src-weather)]"
                />
              </div>
              <div class="mt-1 flex items-baseline gap-2">
                <span class="display text-2xl leading-none text-ink">
                  {Math.round(event.value ?? 0)}°
                </span>
                <span class="truncate text-[10px] text-faint">
                  {event.tags[0]}
                </span>
              </div>
            </button>
          )}
        </For>
      </Show>
    </Panel>
  );
}

import {
  For,
  Show,
  createMemo,
  createUniqueId,
  onCleanup,
  onMount,
} from 'solid-js';
import { Portal } from 'solid-js/web';
import { A } from '@solidjs/router';
import { usePulse } from '../stores/pulse';
import type { City } from '../data/sources';
import { haversineKm } from '../lib/analysis';
import { round, timeAgoLabel } from '../lib/format';
import type { IconName, PulseEvent } from '../types';
import { Icon } from './Icon';
import { Button, SourceTag } from './UI';

const CITY_ALIASES: Record<string, string[]> = {
  'New York': ['nyc'],
  'São Paulo': ['sao paulo', 'sampa'],
};

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const kmLabel = (km: number) =>
  km < 10 ? `${km.toFixed(1)} km` : `${round(km)} km`;

function weatherIcon(event: PulseEvent | null): IconName {
  const condition = event?.tags[0] ?? '';
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
  return event?.tags.includes('night') ? 'moon' : 'sun';
}

export function CitySheet(props: {
  city: City;
  onClose: () => void;
  onFocus: () => void;
}) {
  const pulse = usePulse();
  const titleId = createUniqueId();

  const weather = createMemo(
    () =>
      pulse
        .events()
        .find(
          (event) =>
            event.source === 'weather' && event.place === props.city.name
        ) ?? null
  );

  const nearestQuake = createMemo(() => {
    const located = pulse
      .events()
      .filter(
        (event) =>
          event.source === 'earthquake' &&
          event.lat !== undefined &&
          event.lon !== undefined
      )
      .map((event) => ({
        event,
        distance: haversineKm(
          props.city.lat,
          props.city.lon,
          event.lat!,
          event.lon!
        ),
      }))
      .sort((a, b) => a.distance - b.distance);

    return located[0] ?? null;
  });

  const station = createMemo(
    () => pulse.events().find((event) => event.source === 'space') ?? null
  );

  const stationDistance = createMemo(() => {
    const event = station();
    if (!event || event.lat === undefined || event.lon === undefined) {
      return null;
    }
    return haversineKm(props.city.lat, props.city.lon, event.lat, event.lon);
  });

  const aliases = createMemo(() => [
    normalize(props.city.name),
    ...(CITY_ALIASES[props.city.name] ?? []),
  ]);

  const headlines = createMemo(() =>
    pulse
      .events()
      .filter(
        (event) =>
          event.source === 'news' &&
          aliases().some((alias) => normalize(event.search).includes(alias))
      )
      .slice(0, 4)
  );

  const weatherMetrics = createMemo(() => {
    const current = weather();
    if (!current) return [];
    return [
      ...current.metrics.filter((metric) => metric.label !== 'Temperature'),
      { label: 'Updated', value: timeAgoLabel(current.timestamp, pulse.now()) },
    ];
  });

  const openEvent = (event: PulseEvent) => {
    props.onClose();
    pulse.openEvent(event.id);
  };

  onMount(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        props.onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    onCleanup(() => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKeyDown);
    });
  });

  return (
    <Portal>
      <div class="fixed inset-0 z-[60]">
        <button
          type="button"
          class="absolute inset-0 bg-black/60"
          onClick={props.onClose}
          aria-label="Close place details"
        />

        <aside
          class="drawer-panel absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto border-l border-line bg-bg"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <header class="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-line bg-bg px-4 py-3">
            <div class="min-w-0">
              <p class="eyebrow text-faint">Monitored city</p>
              <h2
                id={titleId}
                class="display mt-1 text-2xl leading-none text-ink"
              >
                {props.city.name}
              </h2>
              <p class="mt-1.5 font-mono text-[9px] uppercase tracking-wider text-faint">
                {props.city.lat.toFixed(3)}, {props.city.lon.toFixed(3)}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={props.onClose}
              aria-label="Close place details"
              ref={(element) => queueMicrotask(() => element.focus())}
            >
              <Icon name="x" size={17} />
            </Button>
          </header>

          <div class="flex-1 px-4 py-4">
            <div class="grid grid-cols-2 gap-2">
              <Button variant="primary" onClick={props.onFocus}>
                <Icon name="map-pin" size={14} />
                Zoom to city
              </Button>
              <A
                href={`/feed?q=${encodeURIComponent(props.city.name)}`}
                onClick={props.onClose}
                class="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded border border-line-strong bg-transparent px-3.5 text-[13px] font-medium text-ink transition-colors hover:bg-panel-2"
              >
                <Icon name="feed" size={14} />
                Open feed
              </A>
            </div>

            <section class="mt-5" aria-labelledby={`${titleId}-weather`}>
              <div class="flex items-center justify-between gap-3">
                <h3
                  id={`${titleId}-weather`}
                  class="eyebrow text-faint"
                >
                  Current conditions
                </h3>
                <span class="font-mono text-[9px] uppercase tracking-wider text-faint">
                  Open-Meteo
                </span>
              </div>

              <Show
                when={weather()}
                fallback={
                  <p class="mt-2 rounded border border-line bg-panel px-3 py-3 text-xs text-muted">
                    Weather data is not available for this city right now.
                  </p>
                }
              >
                {(current) => (
                  <div class="mt-2 rounded border border-line bg-panel p-3">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <div class="flex items-baseline gap-2">
                          <span class="display text-4xl leading-none text-ink">
                            {Math.round(current().value ?? 0)}°
                          </span>
                          <span class="text-xs text-muted">
                            {current().tags[0]}
                          </span>
                        </div>
                        <p class="mt-1 text-[11px] text-muted">
                          {current().subtitle}
                        </p>
                      </div>
                      <Icon
                        name={weatherIcon(current())}
                        size={24}
                        class="shrink-0 text-[var(--src-weather)]"
                      />
                    </div>

                    <div class="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded border border-line bg-line/60">
                      <For each={weatherMetrics()}>
                        {(metric) => (
                          <div class="bg-panel px-3 py-2">
                            <p class="eyebrow text-[8px] text-faint">
                              {metric.label}
                            </p>
                            <p class="mt-1 text-[11px] font-medium text-ink">
                              {metric.value}
                            </p>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>
                )}
              </Show>
            </section>

            <section class="mt-5" aria-labelledby={`${titleId}-quake`}>
              <h3 id={`${titleId}-quake`} class="eyebrow text-faint">
                Nearest earthquake
              </h3>

              <Show
                when={nearestQuake()}
                fallback={
                  <p class="mt-2 rounded border border-line bg-panel px-3 py-3 text-xs text-muted">
                    No located earthquakes in the current feed.
                  </p>
                }
              >
                {(near) => (
                  <button
                    type="button"
                    onClick={() => openEvent(near().event)}
                    class="focus-ring mt-2 w-full rounded border border-line bg-panel p-3 text-left transition-colors hover:border-line-strong hover:bg-panel-2"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <SourceTag source="earthquake" />
                      <span class="font-mono text-[9px] tabular-nums uppercase tracking-wider text-faint">
                        {kmLabel(near().distance)} away
                      </span>
                    </div>
                    <p class="mt-1.5 line-clamp-2 text-xs leading-snug text-ink">
                      {near().event.title}
                    </p>
                    <p class="mt-0.5 text-[10px] text-muted">
                      {near().event.subtitle}
                    </p>
                    <div class="mt-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-faint">
                      <span>
                        {timeAgoLabel(near().event.timestamp, pulse.now())}
                      </span>
                      <span>Open details</span>
                    </div>
                  </button>
                )}
              </Show>
            </section>

            <section class="mt-5" aria-labelledby={`${titleId}-iss`}>
              <h3 id={`${titleId}-iss`} class="eyebrow text-faint">
                Orbit
              </h3>

              <Show
                when={station()}
                fallback={
                  <p class="mt-2 rounded border border-line bg-panel px-3 py-3 text-xs text-muted">
                    The ISS position is not available right now.
                  </p>
                }
              >
                {(event) => (
                  <button
                    type="button"
                    onClick={() => openEvent(event())}
                    class="focus-ring mt-2 w-full rounded border border-line bg-panel p-3 text-left transition-colors hover:border-line-strong hover:bg-panel-2"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <SourceTag source="space" />
                      <span class="font-mono text-[9px] tabular-nums uppercase tracking-wider text-faint">
                        <Show
                          when={stationDistance() !== null}
                          fallback="position pending"
                        >
                          {kmLabel(stationDistance()!)} away
                        </Show>
                      </span>
                    </div>
                    <p class="mt-1.5 text-xs leading-snug text-ink">
                      {event().title}
                    </p>
                    <p class="mt-0.5 text-[10px] text-muted">
                      {event().subtitle}
                    </p>
                    <p class="mt-2 font-mono text-[9px] uppercase tracking-wider text-faint">
                      Straight-line distance from the city
                    </p>
                  </button>
                )}
              </Show>
            </section>

            <section class="mt-5" aria-labelledby={`${titleId}-news`}>
              <div class="flex items-baseline justify-between gap-3">
                <h3 id={`${titleId}-news`} class="eyebrow text-faint">
                  Headline mentions
                </h3>
                <span class="font-mono text-[9px] uppercase tracking-wider text-faint">
                  Text match
                </span>
              </div>

              <Show
                when={headlines().length}
                fallback={
                  <p class="mt-2 rounded border border-line bg-panel px-3 py-3 text-xs text-muted">
                    No current headline names this city. Matches are approximate
                    and depend on the live news feed.
                  </p>
                }
              >
                <div class="mt-2 overflow-hidden rounded border border-line bg-panel">
                  <For each={headlines()}>
                    {(event) => (
                      <button
                        type="button"
                        onClick={() => openEvent(event)}
                        class="focus-ring group flex w-full items-start gap-2 border-b border-line/60 px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-panel-2"
                      >
                        <span class="min-w-0 flex-1">
                          <span class="line-clamp-2 text-[11px] leading-snug text-ink">
                            {event.title}
                          </span>
                          <span class="mt-0.5 block truncate text-[10px] text-muted">
                            {event.subtitle}
                          </span>
                        </span>
                        <Icon
                          name="arrow-up-right"
                          size={12}
                          class="mt-0.5 shrink-0 text-faint"
                        />
                      </button>
                    )}
                  </For>
                </div>
                <p class="mt-2 text-[10px] leading-relaxed text-faint">
                  Approximate matches from titles and sections in the current
                  news cycle.
                </p>
              </Show>
            </section>
          </div>
        </aside>
      </div>
    </Portal>
  );
}

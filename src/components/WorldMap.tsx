import { For, Show, createMemo, createSignal } from 'solid-js';
import { usePulse } from '../stores/pulse';
import { CITIES, SOURCE_BY_ID } from '../data/sources';
import { LAND_PATH } from '../data/land';
import {
  WORLD_HEIGHT,
  WORLD_WIDTH,
  projectLat,
  projectLon,
} from '../data/world';
import { timeAgoLabel } from '../lib/format';
import type { PulseEvent } from '../types';
import { Icon } from './Icon';
import { SourceTag } from './UI';

const LON_LINES = [-120, -60, 0, 60, 120];
const LAT_LINES = [-60, -30, 0, 30, 60];

interface HoverState {
  event: PulseEvent;
  x: number;
  y: number;
}

export function WorldMap() {
  const pulse = usePulse();
  const [hover, setHover] = createSignal<HoverState | null>(null);

  const quakes = createMemo(() =>
    pulse
      .events()
      .filter(
        (event) =>
          event.source === 'earthquake' &&
          event.lat !== undefined &&
          event.lon !== undefined
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, 60)
  );

  const weatherByCity = createMemo(() => {
    const map = new Map<string, PulseEvent>();
    for (const event of pulse.events()) {
      if (event.source === 'weather' && event.place) map.set(event.place, event);
    }
    return map;
  });

  const iss = createMemo(() =>
    pulse.events().find((event) => event.source === 'space')
  );

  const trailPath = createMemo(() => {
    const points = pulse.issTrail();
    if (points.length < 2) return '';
    return points
      .map(
        (point, index) =>
          `${index === 0 ? 'M' : 'L'}${projectLon(point.lon).toFixed(1)},${projectLat(
            point.lat
          ).toFixed(1)}`
      )
      .join(' ');
  });

  const selectedGeo = createMemo(() => {
    const event = pulse.selectedEvent();
    return event && event.lat !== undefined && event.lon !== undefined
      ? event
      : null;
  });

  const showHover = (event: PulseEvent, lat: number, lon: number) => {
    setHover({ event, x: projectLon(lon), y: projectLat(lat) });
  };

  const open = (event: PulseEvent) => {
    setHover(null);
    pulse.openEvent(event.id);
  };

  return (
    <section class="panel relative flex h-full flex-col overflow-hidden" aria-label="World map">
      <header class="relative z-20 px-4 pb-2 pt-3 sm:absolute sm:left-4 sm:top-3 sm:p-0">
        <p class="eyebrow text-faint">World</p>
        <h2 class="display mt-1 text-xl leading-none text-ink">Live positions</h2>
      </header>

      <div class="absolute right-4 top-4 z-20 hidden items-center gap-3 sm:right-5 sm:top-5 sm:flex">
        <Legend color="var(--src-earthquake)" label="Quake" />
        <Legend color="var(--src-weather)" label="City" />
        <Legend color="var(--src-space)" label="ISS" />
      </div>

      <div class="relative aspect-[2/1] w-full bg-[var(--map-ocean)] sm:aspect-auto sm:min-h-0 sm:flex-1">
        <svg
          viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          class="absolute inset-0 block h-full w-full"
          role="img"
          aria-label="World map showing live earthquakes, monitored cities and the International Space Station"
        >
          <rect width={WORLD_WIDTH} height={WORLD_HEIGHT} fill="var(--map-ocean)" />

          <For each={LON_LINES}>
            {(lon) => (
              <line
                x1={projectLon(lon)}
                x2={projectLon(lon)}
                y1={0}
                y2={WORLD_HEIGHT}
                stroke="var(--map-line)"
                stroke-width="0.6"
                stroke-dasharray="2 5"
              />
            )}
          </For>
          <For each={LAT_LINES}>
            {(lat) => (
              <line
                x1={0}
                x2={WORLD_WIDTH}
                y1={projectLat(lat)}
                y2={projectLat(lat)}
                stroke="var(--map-line)"
                stroke-width={lat === 0 ? '0.9' : '0.6'}
                stroke-dasharray={lat === 0 ? undefined : '2 5'}
              />
            )}
          </For>

          <path
            d={LAND_PATH}
            fill="var(--map-land)"
            stroke="var(--map-coast)"
            stroke-width="0.7"
            stroke-linejoin="round"
            fill-rule="evenodd"
          />

          <Show when={trailPath()}>
            <path
              d={trailPath()}
              fill="none"
              stroke="var(--src-space)"
              stroke-width="1.3"
              stroke-dasharray="3 4"
              stroke-linecap="round"
              opacity="0.75"
            />
          </Show>

          <For each={quakes()}>
            {(event) => {
              const x = projectLon(event.lon!);
              const y = projectLat(event.lat!);
              const radius = 2.4 + Math.min(event.value ?? 0, 7) * 1.15;

              return (
                <g
                  class="cursor-pointer"
                  role="button"
                  tabindex="0"
                  aria-label={`${event.title}. ${event.subtitle}`}
                  onClick={() => open(event)}
                  onKeyDown={(keyboardEvent) => {
                    if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
                      keyboardEvent.preventDefault();
                      open(event);
                    }
                  }}
                  onMouseEnter={() => showHover(event, event.lat!, event.lon!)}
                  onMouseLeave={() => setHover(null)}
                >
                  <Show when={(event.value ?? 0) >= 4.5}>
                    <circle
                      cx={x}
                      cy={y}
                      r={radius + 5}
                      fill="none"
                      stroke="var(--src-earthquake)"
                      stroke-width="1"
                      class="marker-ring"
                      opacity="0.5"
                    />
                  </Show>
                  <circle
                    cx={x}
                    cy={y}
                    r={radius}
                    fill="var(--src-earthquake)"
                    fill-opacity="0.24"
                    stroke="var(--src-earthquake)"
                    stroke-width="1.2"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={Math.max(1.2, radius * 0.28)}
                    fill="var(--src-earthquake)"
                  />
                </g>
              );
            }}
          </For>

          <For each={CITIES}>
            {(city) => {
              const event = () => weatherByCity().get(city.name);
              const x = () => projectLon(city.lon);
              const y = () => projectLat(city.lat);
              const labelX = () => (x() > WORLD_WIDTH - 110 ? x() - 7 : x() + 7);
              const anchor = () => (x() > WORLD_WIDTH - 110 ? 'end' : 'start');

              return (
                <g
                  class={event() ? 'cursor-pointer' : ''}
                  onClick={() => event() && open(event()!)}
                  onMouseEnter={() => event() && showHover(event()!, city.lat, city.lon)}
                  onMouseLeave={() => setHover(null)}
                >
                  <circle
                    cx={x()}
                    cy={y()}
                    r="3.2"
                    fill="var(--src-weather)"
                    stroke="var(--bg)"
                    stroke-width="1.2"
                  />
                  <text
                    x={labelX()}
                    y={y() + 2.5}
                    text-anchor={anchor()}
                    class="map-label"
                    fill="var(--muted)"
                  >
                    {city.name}
                    <Show when={event()?.value !== undefined}>
                      {' '}
                      {Math.round(event()!.value!)}°
                    </Show>
                  </text>
                </g>
              );
            }}
          </For>

          <Show when={iss()}>
            {(station) => {
              const x = () => projectLon(station().lon!);
              const y = () => projectLat(station().lat!);
              return (
                <g
                  class="cursor-pointer"
                  role="button"
                  tabindex="0"
                  aria-label={`International Space Station. ${station().title}`}
                  onClick={() => open(station())}
                  onKeyDown={(keyboardEvent) => {
                    if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
                      keyboardEvent.preventDefault();
                      open(station());
                    }
                  }}
                  onMouseEnter={() => showHover(station(), station().lat!, station().lon!)}
                  onMouseLeave={() => setHover(null)}
                >
                  <circle
                    cx={x()}
                    cy={y()}
                    r="11"
                    fill="none"
                    stroke="var(--src-space)"
                    stroke-width="1"
                    class="marker-ring"
                    opacity="0.6"
                  />
                  <line
                    x1={x() - 11}
                    x2={x() + 11}
                    y1={y()}
                    y2={y()}
                    stroke="var(--src-space)"
                    stroke-width="0.8"
                    opacity="0.7"
                  />
                  <line
                    x1={x()}
                    x2={x()}
                    y1={y() - 11}
                    y2={y() + 11}
                    stroke="var(--src-space)"
                    stroke-width="0.8"
                    opacity="0.7"
                  />
                  <circle
                    cx={x()}
                    cy={y()}
                    r="3"
                    fill="var(--src-space)"
                    stroke="var(--bg)"
                    stroke-width="1.2"
                  />
                  <text
                    x={x() + 15}
                    y={y() + 3}
                    class="map-label"
                    fill="var(--src-space)"
                  >
                    ISS
                  </text>
                </g>
              );
            }}
          </Show>

          <Show when={selectedGeo()}>
            {(event) => (
              <circle
                cx={projectLon(event().lon!)}
                cy={projectLat(event().lat!)}
                r="15"
                fill="none"
                stroke="var(--accent)"
                stroke-width="1.4"
                stroke-dasharray="3 3"
              />
            )}
          </Show>
        </svg>

        <Show when={hover()}>
          {(item) => (
            <div
              class="pointer-events-none absolute z-30 w-56 -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded border border-line-strong bg-panel p-3"
              style={{
                left: `${(item().x / WORLD_WIDTH) * 100}%`,
                top: `${(item().y / WORLD_HEIGHT) * 100}%`,
              }}
            >
              <SourceTag source={item().event.source} />
              <p class="mt-1.5 line-clamp-2 text-xs font-medium leading-snug text-ink">
                {item().event.title}
              </p>
              <p class="mt-1 text-[10px] text-muted">{item().event.subtitle}</p>
              <div class="mt-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-faint">
                <span>{SOURCE_BY_ID[item().event.source].label}</span>
                <span>{timeAgoLabel(item().event.timestamp, pulse.now())}</span>
              </div>
            </div>
          )}
        </Show>
      </div>

      <footer class="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-3 border-t border-line bg-panel px-4 py-2 sm:px-4">
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-faint">
            <Icon name="activity" size={11} class="text-[var(--src-earthquake)]" />
            {quakes().length} plotted
          </span>
          <span class="hidden items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-faint sm:flex">
            <Icon name="map-pin" size={11} class="text-[var(--src-weather)]" />
            {CITIES.length} cities
          </span>
          <span class="hidden items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-faint md:flex">
            <Icon name="orbit" size={11} class="text-[var(--src-space)]" />
            1 orbit
          </span>
        </div>
        <span class="font-mono text-[9px] uppercase tracking-wider text-faint">
          updated {pulse.lastUpdateLabel()}
        </span>
      </footer>
    </section>
  );
}

function Legend(props: { color: string; label: string }) {
  return (
    <span class="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-faint">
      <span
        class="h-1.5 w-1.5 rounded-sm"
        style={{ 'background-color': props.color }}
      />
      {props.label}
    </span>
  );
}

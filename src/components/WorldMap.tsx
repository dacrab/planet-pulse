import {
  For,
  Show,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';
import { usePulse } from '../stores/pulse';
import { CITIES, SOURCE_BY_ID, type City } from '../data/sources';
import { LAND_PATH } from '../data/land';
import {
  WORLD_HEIGHT,
  WORLD_WIDTH,
  projectLat,
  projectLon,
} from '../data/world';
import { clamp, timeAgoLabel } from '../lib/format';
import type { PulseEvent } from '../types';
import { CitySheet } from './CitySheet';
import { Icon } from './Icon';
import { SourceTag } from './UI';

const LON_LINES = [-120, -60, 0, 60, 120];
const LAT_LINES = [-60, -30, 0, 30, 60];

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const TOOLTIP_WIDTH = 224;
const TOOLTIP_HEIGHT = 136;
const TOOLTIP_GAP = 14;
const MAP_PAD = 8;

interface HoverState {
  event: PulseEvent;
  x: number;
  y: number;
}

interface Point {
  x: number;
  y: number;
}

const clampPan = (pan: Point, zoom: number): Point => ({
  x: clamp(pan.x, WORLD_WIDTH * (1 - zoom), 0),
  y: clamp(pan.y, WORLD_HEIGHT * (1 - zoom), 0),
});

export function WorldMap() {
  const pulse = usePulse();
  const [hover, setHover] = createSignal<HoverState | null>(null);
  const [zoom, setZoom] = createSignal(1);
  const [pan, setPan] = createSignal<Point>({ x: 0, y: 0 });
  const [dragging, setDragging] = createSignal(false);
  const [mapSize, setMapSize] = createSignal({ width: 0, height: 0 });
  const [place, setPlace] = createSignal<City | null>(null);

  let mapRef: HTMLDivElement | undefined;
  let drag: {
    pointerId: number;
    startX: number;
    startY: number;
    startPan: Point;
    moved: boolean;
  } | null = null;
  let pinch: {
    distance: number;
    zoom: number;
    world: Point;
  } | null = null;
  const pointers = new Map<number, Point>();
  let listening = false;
  let lastDragAt = 0;

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

  const fit = () => {
    const { width, height } = mapSize();
    const scale = Math.min(width / WORLD_WIDTH, height / WORLD_HEIGHT);
    return {
      scale,
      offsetX: (width - WORLD_WIDTH * scale) / 2,
      offsetY: (height - WORLD_HEIGHT * scale) / 2,
    };
  };

  function screenToWorld(
    clientX: number,
    clientY: number,
    z: number,
    p: Point
  ): Point {
    if (!mapRef) return { x: 0, y: 0 };
    const rect = mapRef.getBoundingClientRect();
    const { scale, offsetX, offsetY } = fit();
    if (!scale) return { x: 0, y: 0 };
    return {
      x: ((clientX - rect.left - offsetX) / scale - p.x) / z,
      y: ((clientY - rect.top - offsetY) / scale - p.y) / z,
    };
  }

  function zoomAt(clientX: number, clientY: number, next: number) {
    const target = clamp(next, MIN_ZOOM, MAX_ZOOM);
    const current = zoom();
    if (Math.abs(target - current) < 0.001) return;

    const world = screenToWorld(clientX, clientY, current, pan());
    const nextPan = clampPan(
      {
        x: pan().x + world.x * (current - target),
        y: pan().y + world.y * (current - target),
      },
      target
    );

    setZoom(target);
    setPan(nextPan);
  }

  function zoomBy(factor: number) {
    if (!mapRef) return;
    const rect = mapRef.getBoundingClientRect();
    zoomAt(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      zoom() * factor
    );
  }

  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function panByScreen(dx: number, dy: number) {
    const { scale } = fit();
    if (!scale) return;
    setPan(
      clampPan(
        {
          x: pan().x + dx / (scale * zoom()),
          y: pan().y + dy / (scale * zoom()),
        },
        zoom()
      )
    );
  }

  function focusCity(city: City) {
    const target = 2.6;
    const wx = projectLon(city.lon);
    const wy = projectLat(city.lat);
    setZoom(target);
    setPan(
      clampPan(
        {
          x: WORLD_WIDTH / 2 - wx * target,
          y: WORLD_HEIGHT / 2 - wy * target,
        },
        target
      )
    );
    setPlace(null);
  }

  function startListening() {
    if (listening) return;
    listening = true;
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }

  function stopListening() {
    if (!listening) return;
    listening = false;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
  }

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.size === 1) {
      drag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startPan: pan(),
        moved: false,
      };
      pinch = null;
      setDragging(true);
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      pinch = {
        distance: Math.hypot(a.x - b.x, a.y - b.y),
        zoom: zoom(),
        world: screenToWorld(center.x, center.y, zoom(), pan()),
      };
      drag = null;
      setDragging(true);
    }

    startListening();
  }

  function onPointerMove(event: PointerEvent) {
    if (pointers.has(event.pointerId)) {
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }

    if (pinch && pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch.distance > 0 && mapRef) {
        const nextZoom = clamp(
          pinch.zoom * (distance / pinch.distance),
          MIN_ZOOM,
          MAX_ZOOM
        );
        const center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const rect = mapRef.getBoundingClientRect();
        const { scale, offsetX, offsetY } = fit();
        const nextPan = clampPan(
          {
            x:
              (center.x - rect.left - offsetX) / scale -
              pinch.world.x * nextZoom,
            y:
              (center.y - rect.top - offsetY) / scale -
              pinch.world.y * nextZoom,
          },
          nextZoom
        );

        setZoom(nextZoom);
        setPan(nextPan);
      }
      setHover(null);
      return;
    }

    if (!drag) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) > 3) {
      drag.moved = true;
      setHover(null);
    }
    if (!drag.moved) return;

    const { scale } = fit();
    if (!scale) return;
    setPan(
      clampPan(
        {
          x: drag.startPan.x + dx / scale,
          y: drag.startPan.y + dy / scale,
        },
        zoom()
      )
    );
  }

  function onPointerUp(event: PointerEvent) {
    pointers.delete(event.pointerId);

    if (drag && drag.pointerId === event.pointerId) {
      if (drag.moved) lastDragAt = Date.now();
      drag = null;
    }
    if (pointers.size < 2) pinch = null;

    if (pointers.size === 0) {
      drag = null;
      pinch = null;
      setDragging(false);
      stopListening();
    }
  }

  onMount(() => {
    if (!mapRef) return;

    const updateSize = () =>
      setMapSize({
        width: mapRef!.clientWidth,
        height: mapRef!.clientHeight,
      });
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(mapRef);

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 1) return;
      event.preventDefault();
      zoomAt(
        event.clientX,
        event.clientY,
        zoom() * (event.deltaY < 0 ? 1.18 : 1 / 1.18)
      );
    };

    mapRef.addEventListener('wheel', onWheel, { passive: false });

    onCleanup(() => {
      observer.disconnect();
      mapRef?.removeEventListener('wheel', onWheel);
      stopListening();
    });
  });

  const showHover = (event: PulseEvent, lat: number, lon: number) => {
    setHover({ event, x: projectLon(lon), y: projectLat(lat) });
  };

  const open = (event: PulseEvent) => {
    if (Date.now() - lastDragAt < 250) return;
    setHover(null);
    pulse.openEvent(event.id);
  };

  const openCity = (city: City) => {
    if (Date.now() - lastDragAt < 250) return;
    setHover(null);
    setPlace(city);
  };

  const tooltip = createMemo(() => {
    const item = hover();
    if (!item) return null;

    const { width, height } = mapSize();
    if (!width || !height) return null;

    const { scale, offsetX, offsetY } = fit();
    const sx = offsetX + (item.x * zoom() + pan().x) * scale;
    const sy = offsetY + (item.y * zoom() + pan().y) * scale;
    const half = TOOLTIP_WIDTH / 2;
    const left = clamp(half, sx, Math.max(half, width - half));
    const minTop = TOOLTIP_HEIGHT + TOOLTIP_GAP + MAP_PAD;
    const below =
      sy < minTop &&
      sy + TOOLTIP_HEIGHT + TOOLTIP_GAP + MAP_PAD <= height;
    const top = below
      ? sy
      : clamp(minTop, sy, Math.max(minTop, height));

    return { left, top, below };
  });

  const dash = (value: number) => `${value / zoom()} ${(value + 3) / zoom()}`;

  return (
    <>
      <section
        class="panel relative flex h-full flex-col overflow-hidden"
        aria-label="World map"
      >
        <header class="relative z-20 px-4 pb-2 pt-3 sm:absolute sm:left-4 sm:top-3 sm:p-0">
          <p class="eyebrow text-faint">World</p>
          <h2 class="display mt-1 text-xl leading-none text-ink">Live positions</h2>
        </header>

        <div class="absolute right-4 top-4 z-20 hidden items-center gap-3 sm:right-5 sm:top-5 sm:flex">
          <Legend color="var(--src-earthquake)" label="Quake" />
          <Legend color="var(--src-weather)" label="City" />
          <Legend color="var(--src-space)" label="ISS" />
        </div>

        <div
          ref={mapRef}
          class="focus-ring relative aspect-[2/1] w-full touch-none select-none overflow-hidden bg-[var(--map-ocean)] sm:aspect-auto sm:min-h-0 sm:flex-1"
          classList={{
            'cursor-grabbing': dragging(),
            'cursor-grab': !dragging(),
          }}
          tabIndex={0}
          role="group"
          aria-label="Interactive world map. Drag or use the arrow keys to pan, scroll to zoom, or use the zoom controls."
          onPointerDown={onPointerDown}
          onDblClick={(event) => {
            event.preventDefault();
            zoomAt(event.clientX, event.clientY, zoom() * 1.6);
          }}
          onKeyDown={(event) => {
            if (event.key === '+' || event.key === '=') {
              event.preventDefault();
              zoomBy(1.25);
            } else if (event.key === '-' || event.key === '_') {
              event.preventDefault();
              zoomBy(1 / 1.25);
            } else if (event.key === '0') {
              event.preventDefault();
              resetView();
            } else if (event.key === 'ArrowLeft') {
              event.preventDefault();
              panByScreen(48, 0);
            } else if (event.key === 'ArrowRight') {
              event.preventDefault();
              panByScreen(-48, 0);
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              panByScreen(0, 48);
            } else if (event.key === 'ArrowDown') {
              event.preventDefault();
              panByScreen(0, -48);
            }
          }}
        >
          <svg
            viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`}
            preserveAspectRatio="xMidYMid meet"
            class="absolute inset-0 block h-full w-full"
            role="img"
            aria-label="World map showing live earthquakes, monitored cities and the International Space Station"
          >
            <rect width={WORLD_WIDTH} height={WORLD_HEIGHT} fill="var(--map-ocean)" />

            <g transform={`translate(${pan().x} ${pan().y}) scale(${zoom()})`}>
              <For each={LON_LINES}>
                {(lon) => (
                  <line
                    x1={projectLon(lon)}
                    x2={projectLon(lon)}
                    y1={0}
                    y2={WORLD_HEIGHT}
                    stroke="var(--map-line)"
                    stroke-width="0.6"
                    stroke-dasharray={dash(2)}
                    vector-effect="non-scaling-stroke"
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
                    stroke-dasharray={lat === 0 ? undefined : dash(2)}
                    vector-effect="non-scaling-stroke"
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
                vector-effect="non-scaling-stroke"
              />

              <Show when={trailPath()}>
                <path
                  d={trailPath()}
                  fill="none"
                  stroke="var(--src-space)"
                  stroke-width="1.3"
                  stroke-dasharray={dash(3)}
                  stroke-linecap="round"
                  opacity="0.75"
                  vector-effect="non-scaling-stroke"
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
                        if (
                          keyboardEvent.key === 'Enter' ||
                          keyboardEvent.key === ' '
                        ) {
                          keyboardEvent.preventDefault();
                          open(event);
                        }
                      }}
                      onMouseEnter={() =>
                        showHover(event, event.lat!, event.lon!)
                      }
                      onMouseLeave={() => setHover(null)}
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={(radius + 7) / zoom()}
                        fill="transparent"
                      />
                      <Show when={(event.value ?? 0) >= 4.5}>
                        <circle
                          cx={x}
                          cy={y}
                          r={(radius + 5) / zoom()}
                          fill="none"
                          stroke="var(--src-earthquake)"
                          stroke-width="1"
                          class="marker-ring"
                          opacity="0.5"
                          vector-effect="non-scaling-stroke"
                        />
                      </Show>
                      <circle
                        cx={x}
                        cy={y}
                        r={radius / zoom()}
                        fill="var(--src-earthquake)"
                        fill-opacity="0.24"
                        stroke="var(--src-earthquake)"
                        stroke-width="1.2"
                        vector-effect="non-scaling-stroke"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r={Math.max(1.2, radius * 0.28) / zoom()}
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
                  const labelX = () =>
                    x() > WORLD_WIDTH - 110
                      ? x() - 7 / zoom()
                      : x() + 7 / zoom();
                  const anchor = () =>
                    x() > WORLD_WIDTH - 110 ? 'end' : 'start';

                  return (
                    <g
                      class="cursor-pointer"
                      role="button"
                      tabindex="0"
                      aria-label={`${city.name}. Open place details.`}
                      onClick={() => openCity(city)}
                      onKeyDown={(keyboardEvent) => {
                        if (
                          keyboardEvent.key === 'Enter' ||
                          keyboardEvent.key === ' '
                        ) {
                          keyboardEvent.preventDefault();
                          openCity(city);
                        }
                      }}
                      onMouseEnter={() =>
                        event() && showHover(event()!, city.lat, city.lon)
                      }
                      onMouseLeave={() => setHover(null)}
                    >
                      <circle
                        cx={x()}
                        cy={y()}
                        r={11 / zoom()}
                        fill="transparent"
                      />
                      <circle
                        cx={x()}
                        cy={y()}
                        r={3.2 / zoom()}
                        fill="var(--src-weather)"
                        stroke="var(--bg)"
                        stroke-width="1.2"
                        vector-effect="non-scaling-stroke"
                      />
                      <text
                        x={labelX()}
                        y={y() + 2.5 / zoom()}
                        text-anchor={anchor()}
                        class="map-label"
                        fill="var(--muted)"
                        style={{ 'font-size': `${7.5 / zoom()}px` }}
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
                  const size = () => 11 / zoom();
                  return (
                    <g
                      class="cursor-pointer"
                      role="button"
                      tabindex="0"
                      aria-label={`International Space Station. ${station().title}`}
                      onClick={() => open(station())}
                      onKeyDown={(keyboardEvent) => {
                        if (
                          keyboardEvent.key === 'Enter' ||
                          keyboardEvent.key === ' '
                        ) {
                          keyboardEvent.preventDefault();
                          open(station());
                        }
                      }}
                      onMouseEnter={() =>
                        showHover(station(), station().lat!, station().lon!)
                      }
                      onMouseLeave={() => setHover(null)}
                    >
                      <circle
                        cx={x()}
                        cy={y()}
                        r={15 / zoom()}
                        fill="transparent"
                      />
                      <circle
                        cx={x()}
                        cy={y()}
                        r={size()}
                        fill="none"
                        stroke="var(--src-space)"
                        stroke-width="1"
                        class="marker-ring"
                        opacity="0.6"
                        vector-effect="non-scaling-stroke"
                      />
                      <line
                        x1={x() - size()}
                        x2={x() + size()}
                        y1={y()}
                        y2={y()}
                        stroke="var(--src-space)"
                        stroke-width="0.8"
                        opacity="0.7"
                        vector-effect="non-scaling-stroke"
                      />
                      <line
                        x1={x()}
                        x2={x()}
                        y1={y() - size()}
                        y2={y() + size()}
                        stroke="var(--src-space)"
                        stroke-width="0.8"
                        opacity="0.7"
                        vector-effect="non-scaling-stroke"
                      />
                      <circle
                        cx={x()}
                        cy={y()}
                        r={3 / zoom()}
                        fill="var(--src-space)"
                        stroke="var(--bg)"
                        stroke-width="1.2"
                        vector-effect="non-scaling-stroke"
                      />
                      <text
                        x={x() + 15 / zoom()}
                        y={y() + 3 / zoom()}
                        class="map-label"
                        fill="var(--src-space)"
                        style={{ 'font-size': `${7.5 / zoom()}px` }}
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
                    r={15 / zoom()}
                    fill="none"
                    stroke="var(--accent)"
                    stroke-width="1.4"
                    stroke-dasharray={dash(3)}
                    vector-effect="non-scaling-stroke"
                  />
                )}
              </Show>
            </g>
          </svg>

          <Show when={tooltip()}>
            {(position) => (
              <div
                class="pointer-events-none absolute z-50 w-56 rounded border border-line-strong bg-panel p-3"
                style={{
                  left: `${position().left}px`,
                  top: `${position().top}px`,
                  transform: position().below
                    ? `translate(-50%, ${TOOLTIP_GAP}px)`
                    : `translate(-50%, calc(-100% - ${TOOLTIP_GAP}px))`,
                }}
              >
                <SourceTag source={hover()!.event.source} />
                <p class="mt-1.5 line-clamp-2 text-xs font-medium leading-snug text-ink">
                  {hover()!.event.title}
                </p>
                <p class="mt-1 text-[10px] text-muted">
                  {hover()!.event.subtitle}
                </p>
                <div class="mt-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-faint">
                  <span>{SOURCE_BY_ID[hover()!.event.source].label}</span>
                  <span>
                    {timeAgoLabel(hover()!.event.timestamp, pulse.now())}
                  </span>
                </div>
              </div>
            )}
          </Show>
        </div>

        <div class="absolute right-3 top-12 z-30 flex flex-col divide-y divide-line overflow-hidden rounded border border-line bg-panel sm:right-5 sm:top-14">
          <button
            type="button"
            class="focus-ring flex h-6 w-8 items-center justify-center font-mono text-[12px] text-muted transition-colors hover:bg-panel-2 hover:text-ink sm:h-7 sm:w-9"
            onClick={() => zoomBy(1.35)}
            aria-label="Zoom in"
            title="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            class="focus-ring flex h-6 w-8 items-center justify-center font-mono text-[9px] tabular-nums text-faint transition-colors hover:bg-panel-2 hover:text-ink sm:h-7 sm:w-9"
            onClick={resetView}
            aria-label="Reset map view"
            title="Reset view"
          >
            {Math.round(zoom() * 100)}%
          </button>
          <button
            type="button"
            class="focus-ring flex h-6 w-8 items-center justify-center font-mono text-[12px] text-muted transition-colors hover:bg-panel-2 hover:text-ink sm:h-7 sm:w-9"
            onClick={() => zoomBy(1 / 1.35)}
            aria-label="Zoom out"
            title="Zoom out"
          >
            −
          </button>
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
          <div class="flex items-center gap-3">
            <span class="hidden font-mono text-[9px] uppercase tracking-wider text-faint lg:inline">
              drag to pan · scroll to zoom
            </span>
            <span class="font-mono text-[9px] uppercase tracking-wider text-faint">
              updated {pulse.lastUpdateLabel()}
            </span>
          </div>
        </footer>
      </section>

      <Show when={place()} keyed>
        {(city) => (
          <CitySheet
            city={city}
            onClose={() => setPlace(null)}
            onFocus={() => focusCity(city)}
          />
        )}
      </Show>
    </>
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

import { For, Show, createMemo } from 'solid-js';
import { Meta, Title } from '@solidjs/meta';
import { usePulse } from '../stores/pulse';
import { CITIES } from '../data/sources';
import { haversineKm } from '../lib/analysis';
import { percent, timeAgoLabel } from '../lib/format';
import type { IconName, SourceId } from '../types';
import { AlertCard } from '../components/AlertCard';
import { Icon } from '../components/Icon';
import {
  Button,
  EmptyState,
  Panel,
  SourceTag,
} from '../components/UI';
import { SourceStatusPill } from '../components/SourceStatusPill';

const METHOD: Array<{ icon: IconName; title: string; text: string; source: SourceId }> = [
  {
    icon: 'activity',
    title: 'Seismic proximity',
    text: 'An M3.5+ earthquake in the last 24 hours within 1,500 km of one of the six monitored cities.',
    source: 'earthquake',
  },
  {
    icon: 'coin',
    title: 'Market volatility',
    text: 'Four or more tracked assets moving more than 4% in the same 24-hour window.',
    source: 'crypto',
  },
  {
    icon: 'orbit',
    title: 'Orbital proximity',
    text: 'The International Space Station passing within 1,000 km of a monitored city.',
    source: 'space',
  },
];

export default function Intelligence() {
  const pulse = usePulse();

  const watchlist = createMemo(() =>
    pulse
      .activeCorrelations()
      .filter(
        (correlation) =>
          !pulse.alerts().some((alert) => alert.id === correlation.id)
      )
  );

  const quakeRange = createMemo(() => {
    let best:
      | { magnitude: number; city: string; distance: number; timestamp: number }
      | undefined;

    for (const event of pulse.events()) {
      if (
        event.source !== 'earthquake' ||
        event.lat === undefined ||
        event.lon === undefined
      ) {
        continue;
      }
      for (const city of CITIES) {
        const distance = haversineKm(event.lat, event.lon, city.lat, city.lon);
        if (!best || distance < best.distance) {
          best = {
            magnitude: event.value ?? 0,
            city: city.name,
            distance,
            timestamp: event.timestamp,
          };
        }
      }
    }

    return best;
  });

  const marketRange = createMemo(() => {
    const coins = pulse.events().filter(
      (event) => event.source === 'crypto' && event.delta !== undefined
    );
    const movers = coins.filter((event) => Math.abs(event.delta!) >= 4);
    const leader = coins.reduce<typeof coins[number] | null>(
      (best, event) =>
        !best || Math.abs(event.delta!) > Math.abs(best.delta!) ? event : best,
      null
    );
    const average = movers.length
      ? movers.reduce((sum, event) => sum + Math.abs(event.delta!), 0) / movers.length
      : 0;

    return { total: coins.length, movers: movers.length, average, leader };
  });

  const orbitRange = createMemo(() => {
    const station = pulse.events().find((event) => event.source === 'space');
    if (!station || station.lat === undefined || station.lon === undefined) {
      return null;
    }

    let best: { city: string; distance: number } | undefined;
    for (const city of CITIES) {
      const distance = haversineKm(
        station.lat,
        station.lon,
        city.lat,
        city.lon
      );
      if (!best || distance < best.distance) {
        best = { city: city.name, distance };
      }
    }

    return best ? { ...best, altitude: station.value ?? 0 } : null;
  });

  return (
    <>
      <Title>Intelligence — Planet Pulse</Title>
      <Meta
        name="description"
        content="Cross-source correlations and tiered alerts derived from the live Planet Pulse feeds."
      />

      <header class="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <p class="eyebrow text-faint">Intelligence</p>
          <h1 class="display mt-1 text-3xl text-ink">Alerts and correlations</h1>
          <p class="mt-2 max-w-xl text-xs leading-relaxed text-muted">
            Three fixed rules compare sources and score the overlap. Alerts are
            suggestions, not predictions. Dismiss anything that is not useful.
          </p>
        </div>

        <div class="flex gap-5">
          <MiniStat value={pulse.alerts().length} label="active alerts" />
          <MiniStat value={watchlist().length} label="watchlist" />
          <MiniStat value={pulse.dismissed().length} label="dismissed" />
        </div>
      </header>

      <div class="mt-6 grid gap-4 lg:grid-cols-12">
        <div class="lg:col-span-8">
          <Panel
            eyebrow="Alerts"
            title="Active alerts"
            action={
              <span class="font-mono text-[9px] uppercase tracking-wider text-faint">
                action ≥ 75 · watch ≥ 55
              </span>
            }
            bodyClass="p-3"
          >
            <Show
              when={pulse.alerts().length}
              fallback={
                <EmptyState
                  icon="alert"
                  title="No active alerts"
                  message={
                    watchlist().length
                      ? 'Nothing has crossed the alert threshold. The watchlist below shows correlations that are still forming.'
                      : 'No cross-source overlap is strong enough to flag right now. The method panel explains what is watched.'
                  }
                />
              }
            >
              <div class="space-y-2">
                <For each={pulse.alerts()}>
                  {(alert) => <AlertCard alert={alert} />}
                </For>
              </div>
            </Show>
          </Panel>

          <Panel
            eyebrow="Watchlist"
            title="Below alert threshold"
            class="mt-4"
            bodyClass="p-3"
          >
            <Show
              when={watchlist().length}
              fallback={
                <p class="px-2 py-6 text-center text-xs leading-relaxed text-muted">
                  {pulse.activeCorrelations().length === 0
                    ? pulse.correlations().length
                      ? 'Every current correlation has been dismissed. Use Restore dismissed below.'
                      : 'No cross-source correlation is forming right now. The method panel explains what we look for.'
                    : 'Every current correlation has crossed the alert threshold.'}
                </p>
              }
            >
              <div class="space-y-2">
                <For each={watchlist()}>
                  {(correlation) => (
                    <article class="rounded border border-line bg-panel-2 p-3">
                      <div class="flex items-center justify-between gap-2">
                        <p class="eyebrow text-[8px] text-faint">
                          {correlation.kind}
                        </p>
                        <span class="font-mono text-[10px] tabular-nums text-faint">
                          {Math.round(correlation.significance)}
                        </span>
                      </div>
                      <p class="mt-1 text-[12px] font-medium text-ink">
                        {correlation.title}
                      </p>
                      <p class="mt-1 text-[10px] leading-relaxed text-muted">
                        {correlation.description}
                      </p>
                      <div class="mt-2 flex flex-wrap items-center gap-2">
                        <For each={correlation.sourceIds}>
                          {(source) => <SourceTag source={source} />}
                        </For>
                        <span class="ml-auto font-mono text-[9px] uppercase tracking-wider text-faint">
                          {timeAgoLabel(correlation.timestamp, pulse.now())}
                        </span>
                      </div>
                    </article>
                  )}
                </For>
              </div>
            </Show>
          </Panel>

          <Panel
            eyebrow="Range check"
            title="Distances to thresholds"
            class="mt-4"
            bodyClass="p-1"
          >
            <RangeRow
              icon="activity"
              color="var(--src-earthquake)"
              label="Nearest quake to a city"
              value={quakeRange() ? `M${quakeRange()!.magnitude.toFixed(1)}` : '—'}
              detail={
                quakeRange()
                  ? `${Math.round(quakeRange()!.distance).toLocaleString()} km from ${quakeRange()!.city} · ${timeAgoLabel(quakeRange()!.timestamp, pulse.now())}`
                  : 'Waiting for seismic data'
              }
            />
            <RangeRow
              icon="coin"
              color="var(--src-crypto)"
              label="Market breadth above 4%"
              value={marketRange().total ? `${marketRange().movers} / ${marketRange().total}` : '—'}
              detail={
                marketRange().total
                  ? marketRange().movers
                    ? `${percent(marketRange().average)} average among movers`
                    : 'No asset has crossed 4% yet'
                  : 'Waiting for market data'
              }
            />
            <RangeRow
              icon="orbit"
              color="var(--src-space)"
              label="ISS to nearest city"
              value={orbitRange() ? `${Math.round(orbitRange()!.distance).toLocaleString()} km` : '—'}
              detail={
                orbitRange()
                  ? `${orbitRange()!.city} · ${Math.round(orbitRange()!.altitude)} km up`
                  : 'Waiting for orbital data'
              }
            />
            <p class="border-t border-line/60 px-3 py-2 text-[9px] leading-relaxed text-faint">
              Raw distances, shown whether or not they cross a threshold.
            </p>
          </Panel>
        </div>

        <aside class="flex flex-col gap-4 lg:col-span-4">
          <Panel eyebrow="Method" title="Detection rules" bodyClass="p-3">
            <div class="space-y-2">
              <For each={METHOD}>
                {(method) => (
                  <div class="rounded border border-line bg-panel-2 p-3">
                    <div class="flex items-center gap-2">
                      <span class="text-accent">
                        <Icon name={method.icon} size={15} />
                      </span>
                      <p class="text-[12px] font-medium text-ink">
                        {method.title}
                      </p>
                    </div>
                    <p class="mt-1 text-[10px] leading-relaxed text-muted">
                      {method.text}
                    </p>
                    <div class="mt-2">
                      <SourceTag source={method.source} />
                    </div>
                  </div>
                )}
              </For>
            </div>

            <div class="mt-3 rounded border border-line bg-panel-2 p-3">
              <p class="eyebrow text-[8px] text-faint">Scoring</p>
              <p class="mt-1 text-[10px] leading-relaxed text-muted">
                Significance is a 0–100 blend of the source values and the
                proximity or breadth of the overlap. It is not a prediction.
                Alerts are hints, not conclusions.
              </p>
            </div>
          </Panel>

          <Panel
            eyebrow="System"
            title="Feed status"
            action={
              <SourceStatusPill
                status={
                  pulse.status() === 'live'
                    ? 'ready'
                    : pulse.status() === 'syncing'
                      ? 'refreshing'
                      : pulse.status() === 'error'
                        ? 'error'
                        : pulse.status() === 'degraded'
                          ? 'stale'
                          : 'idle'
                }
                paused={pulse.paused()}
                online={pulse.online()}
              />
            }
            bodyClass="p-4"
          >
            <p class="text-[11px] leading-relaxed text-muted">
              {pulse.events().length} items from six sources. Last synced{' '}
              {pulse.lastUpdateLabel()}.
            </p>
            <div class="mt-4 flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={pulse.refreshAll}>
                <Icon name="refresh" size={13} />
                Refresh all
              </Button>
              <Show when={pulse.dismissed().length}>
                <Button size="sm" variant="ghost" onClick={pulse.restoreAlerts}>
                  Restore dismissed
                </Button>
              </Show>
            </div>
          </Panel>
        </aside>
      </div>
    </>
  );
}

function MiniStat(props: { value: string | number; label: string }) {
  return (
    <div>
      <p class="display text-2xl leading-none text-ink">{props.value}</p>
      <p class="eyebrow mt-1 text-[8px] text-faint">{props.label}</p>
    </div>
  );
}

function RangeRow(props: {
  icon: IconName;
  color: string;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div class="flex items-center gap-3 rounded px-2 py-2.5">
      <span
        class="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-line"
        style={{
          color: props.color,
          'background-color': `color-mix(in srgb, ${props.color} 8%, transparent)`,
        }}
      >
        <Icon name={props.icon} size={13} />
      </span>
      <div class="min-w-0 flex-1">
        <p class="eyebrow text-[8px] text-faint">{props.label}</p>
        <p class="mt-0.5 truncate text-[10px] text-muted">{props.detail}</p>
      </div>
      <p class="shrink-0 font-mono text-[11px] tabular-nums text-ink">
        {props.value}
      </p>
    </div>
  );
}

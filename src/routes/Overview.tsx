import { A } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { usePulse } from '../stores/pulse';
import { SOURCES } from '../data/sources';
import { calendarDate } from '../lib/format';
import { WorldMap } from '../components/WorldMap';
import { TopSignal } from '../components/TopSignal';
import { Vitals } from '../components/Vitals';
import { SeismicPanel } from '../components/SeismicPanel';
import { WeatherPanel } from '../components/WeatherPanel';
import { MarketPanel } from '../components/MarketPanel';
import { BriefPanel } from '../components/BriefPanel';
import { IntelligencePreview } from '../components/IntelligencePreview';
import { EventList } from '../components/EventRow';
import { Panel } from '../components/UI';
import { reveal } from '../directives';

export default function Overview() {
  const pulse = usePulse();

  const liveFeeds = () =>
    pulse.paused() || !pulse.online()
      ? 0
      : SOURCES.filter((source) =>
          ['ready', 'refreshing'].includes(pulse.sources[source.id].status())
        ).length;

  return (
    <>
      <Title>Planet Pulse — Live World Observatory</Title>
      <Meta
        name="description"
        content="A live observatory for earthquakes, world news, the ISS, weather, markets and football fixtures. Built with SolidJS."
      />

      <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-2xl">
          <p class="eyebrow text-faint">
            Planetary observatory · {calendarDate(pulse.now())}
          </p>
          <h1 class="display mt-2 text-4xl leading-[0.95] tracking-tight sm:text-6xl">
            The world, <em class="text-accent">in motion.</em>
          </h1>
          <p class="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            Six public feeds, one reactive surface. Earthquakes, headlines, orbit,
            weather, markets and fixtures are merged, ranked and cross-checked as
            they arrive.
          </p>
        </div>

        <div class="flex items-center gap-5 sm:gap-7">
          <HeroStat value={pulse.events().length} label="signals" />
          <HeroStat value={pulse.alerts().length} label="alerts" accent />
          <HeroStat value={`${liveFeeds()}/6`} label="feeds live" />
        </div>
      </div>

      <section
        use:reveal
        class="mt-6 grid gap-4 lg:grid-cols-12"
        aria-label="Planetary overview"
      >
        <div class="lg:col-span-8">
          <WorldMap />
        </div>
        <div class="flex flex-col gap-4 lg:col-span-4">
          <TopSignal />
          <Vitals />
        </div>
      </section>

      <section
        use:reveal
        class="mt-4 grid gap-4 md:grid-cols-3"
        aria-label="Signal panels"
      >
        <SeismicPanel />
        <WeatherPanel />
        <MarketPanel />
      </section>

      <section
        use:reveal
        class="mt-4 grid gap-4 lg:grid-cols-12"
        aria-label="Latest signals"
      >
        <div class="lg:col-span-8">
          <Panel
            eyebrow="Live wire"
            title="Latest across all feeds"
            action={
              <A
                href="/feed"
                class="focus-ring inline-flex items-center gap-1 rounded text-[10px] text-muted transition-colors hover:text-ink"
              >
                Open the wire <span aria-hidden="true">→</span>
              </A>
            }
            bodyClass="p-2"
          >
            <EventList
              events={pulse.events().slice(0, 7)}
              emptyTitle="Waiting for the first signal"
              emptyMessage="The feeds are connecting. Events will appear here as soon as they land."
            />
          </Panel>
        </div>

        <div class="flex flex-col gap-4 lg:col-span-4">
          <IntelligencePreview />
          <BriefPanel />
        </div>
      </section>

      <p class="mt-5 font-mono text-[9px] uppercase tracking-wider text-faint">
        Last synchronised {pulse.lastUpdateLabel()} · all timestamps local
      </p>
    </>
  );
}

function HeroStat(props: { value: string | number; label: string; accent?: boolean }) {
  return (
    <div class="border-l border-line pl-4">
      <p
        class="display text-3xl leading-none text-ink"
        classList={{ 'text-accent': props.accent }}
      >
        {props.value}
      </p>
      <p class="eyebrow mt-1 text-[8px] text-faint">{props.label}</p>
    </div>
  );
}

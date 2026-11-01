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
      <Title>Planet Pulse — Live world monitor</Title>
      <Meta
        name="description"
        content="A live monitor for earthquakes, world news, the ISS, weather, markets and football fixtures. Built with SolidJS."
      />

      <header class="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div class="max-w-2xl">
          <p class="eyebrow text-faint">{calendarDate(pulse.now())}</p>
          <h1 class="display mt-1 text-3xl text-ink">Live overview</h1>
          <p class="mt-2 max-w-2xl text-xs leading-relaxed text-muted">
            Earthquakes, headlines, orbit, weather, markets and football fixtures.
            Six public feeds, one ranked timeline, refreshed continuously.
          </p>
        </div>

        <div class="flex items-center gap-5 sm:gap-7">
          <HeroStat value={pulse.events().length} label="items" />
          <HeroStat value={pulse.alerts().length} label="alerts" accent />
          <HeroStat value={`${liveFeeds()}/6`} label="sources up" />
        </div>
      </header>

      <section
        use:reveal
        class="mt-6 grid gap-4 lg:grid-cols-12"
        aria-label="World overview"
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
        aria-label="Data panels"
      >
        <SeismicPanel />
        <WeatherPanel />
        <MarketPanel />
      </section>

      <section
        use:reveal
        class="mt-4 grid gap-4 lg:grid-cols-12"
        aria-label="Latest events"
      >
        <div class="lg:col-span-8">
          <Panel
            eyebrow="All sources"
            title="Latest events"
            action={
              <A
                href="/feed"
                class="focus-ring inline-flex items-center gap-1 rounded text-[10px] text-muted transition-colors hover:text-ink"
              >
                Open event log <span aria-hidden="true">→</span>
              </A>
            }
            bodyClass="p-2"
          >
            <EventList
              events={pulse.events().slice(0, 7)}
              emptyTitle="No data yet"
              emptyMessage="Sources are still connecting. Events will appear here as they arrive."
            />
          </Panel>
        </div>

        <div class="flex flex-col gap-4 lg:col-span-4">
          <IntelligencePreview />
          <BriefPanel />
        </div>
      </section>

      <p class="mt-4 font-mono text-[9px] uppercase tracking-wider text-faint">
        Last sync {pulse.lastUpdateLabel()} · times local
      </p>
    </>
  );
}

function HeroStat(props: { value: string | number; label: string; accent?: boolean }) {
  return (
    <div class="border-l border-line pl-4">
      <p
        class="display text-2xl leading-none text-ink"
        classList={{ 'text-accent': props.accent }}
      >
        {props.value}
      </p>
      <p class="eyebrow mt-1 text-[8px] text-faint">{props.label}</p>
    </div>
  );
}

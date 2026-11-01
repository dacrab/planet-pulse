import { For, Show } from 'solid-js';
import { A } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { usePulse } from '../stores/pulse';
import { SOURCES } from '../data/sources';
import { intervalLabel, timeAgoLabel } from '../lib/format';
import { Icon } from '../components/Icon';
import { Button, Panel, Sparkline } from '../components/UI';
import { SourceStatusPill } from '../components/SourceStatusPill';
import { reveal } from '../directives';

export default function Sources() {
  const pulse = usePulse();

  const healthy = () =>
    pulse.paused() || !pulse.online()
      ? 0
      : SOURCES.filter((source) =>
          ['ready', 'refreshing'].includes(pulse.sources[source.id].status())
        ).length;

  return (
    <>
      <Title>Sources — Planet Pulse</Title>
      <Meta
        name="description"
        content="Health, cadence and raw output for all six Planet Pulse feeds."
      />

      <header class="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <p class="eyebrow text-faint">Public endpoints</p>
          <h1 class="display mt-1 text-3xl text-ink">Sources</h1>
          <p class="mt-2 max-w-xl text-xs leading-relaxed text-muted">
            Six independent feeds. Each polls, fails and refreshes on its own.
            No API keys, no proxy, no backend.
          </p>
        </div>
        <div class="flex gap-5">
          <MiniStat value={`${healthy()}/6`} label="healthy" />
          <MiniStat value={pulse.events().length} label="items" />
          <MiniStat value={pulse.lastUpdateLabel()} label="last sync" />
        </div>
      </header>

      <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <For each={SOURCES}>
          {(source) => {
            const runtime = () => pulse.sources[source.id];
            const values = () =>
              runtime()
                .events()
                .slice(0, 18)
                .map((event) => event.score)
                .reverse();

            return (
              <article
                use:reveal
                class="panel group flex flex-col p-4"
                aria-label={`${source.label} source`}
              >
                <div class="flex items-start justify-between gap-3">
                  <span
                    class="flex h-9 w-9 items-center justify-center rounded border border-line"
                    style={{
                      color: source.color,
                      'background-color': `color-mix(in srgb, ${source.color} 9%, transparent)`,
                    }}
                  >
                    <Icon name={source.icon} size={17} />
                  </span>
                  <SourceStatusPill
                    status={runtime().status()}
                    paused={pulse.paused()}
                    online={pulse.online()}
                  />
                </div>

                <A
                  href={`/sources/${source.id}`}
                  class="focus-ring mt-3 inline-flex w-fit items-center gap-1.5 rounded text-sm font-semibold text-ink"
                >
                  {source.label}
                  <Icon
                    name="arrow-up-right"
                    size={13}
                    class="text-faint opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </A>
                <p class="mt-1 text-[11px] leading-relaxed text-muted">
                  {source.blurb}
                </p>

                <div class="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <p class="display text-3xl leading-none text-ink">
                      {pulse.counts()[source.id]}
                    </p>
                    <p class="eyebrow mt-1 text-[8px] text-faint">items</p>
                  </div>
                  <Sparkline
                    values={values()}
                    color={source.color}
                    class="h-8 w-24"
                  />
                </div>

                <div class="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-line/60 pt-3 font-mono text-[9px] uppercase tracking-wider text-faint">
                  <span>every {intervalLabel(source.interval)}</span>
                  <span class="text-right">
                    {runtime().latency() ? `${runtime().latency()} ms` : '—'}
                  </span>
                  <span>
                    {runtime().fetchedAt()
                      ? timeAgoLabel(runtime().fetchedAt(), pulse.now())
                      : 'waiting'}
                  </span>
                  <span class="text-right">
                    {source.kind === 'signal' ? 'reading' : 'event'}
                  </span>
                </div>

                <Show when={runtime().error()}>
                  {(error) => (
                    <div class="mt-3 rounded border border-danger/20 bg-danger/5 px-2.5 py-2 text-[10px] leading-relaxed text-danger">
                      {error()}
                    </div>
                  )}
                </Show>

                <div class="mt-4 flex items-center gap-2">
                  <A
                    href={`/sources/${source.id}`}
                    class="focus-ring inline-flex h-8 items-center justify-center gap-1.5 rounded border border-line px-2.5 text-[11px] font-medium text-ink transition-colors hover:border-line-strong hover:bg-panel-2"
                  >
                    Inspect <Icon name="arrow-right" size={12} />
                  </A>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={runtime().refresh}
                    aria-label={`Refresh ${source.label}`}
                    title={`Refresh ${source.label}`}
                  >
                    <Icon
                      name="refresh"
                      size={13}
                      class={
                        runtime().status() === 'refreshing' ? 'animate-spin' : ''
                      }
                    />
                    Refresh
                  </Button>
                </div>
              </article>
            );
          }}
        </For>
      </div>

      <Panel
        eyebrow="Data"
        title="How it works"
        class="mt-4"
        bodyClass="p-5"
      >
        <div class="grid gap-5 sm:grid-cols-3">
          <Info
            title="Public endpoints"
            text="Every feed is a browser-side request to a free public API. There are no secrets, proxies or server functions to configure."
          />
          <Info
            title="Failure isolation"
            text="A broken source never takes down the others. Errors surface on its card, previous data stays visible, and the next poll retries."
          />
          <Info
            title="Visibility aware"
            text="Polling pauses when the tab is hidden, when you pause the feeds, or when the browser goes offline."
          />
        </div>

        <div class="mt-5 flex flex-wrap gap-2 border-t border-line/60 pt-4">
          <For each={SOURCES}>
            {(source) => (
              <a
                href={source.docs}
                target="_blank"
                rel="noopener noreferrer"
                class="focus-ring inline-flex items-center gap-1.5 rounded border border-line bg-panel-2 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-muted transition-colors hover:border-line-strong hover:text-ink"
              >
                {source.label}
                <Icon name="external" size={10} />
              </a>
            )}
          </For>
        </div>
      </Panel>
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

function Info(props: { title: string; text: string }) {
  return (
    <div>
      <p class="text-[12px] font-medium text-ink">{props.title}</p>
      <p class="mt-1 text-[11px] leading-relaxed text-muted">{props.text}</p>
    </div>
  );
}

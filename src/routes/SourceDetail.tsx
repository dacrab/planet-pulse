import {
  Show,
  createDeferred,
  createMemo,
  createSignal,
  createUniqueId,
} from 'solid-js';
import { A, Navigate, useParams } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { usePulse } from '../stores/pulse';
import { SOURCE_BY_ID } from '../data/sources';
import { intervalLabel, timeAgoLabel } from '../lib/format';
import type { SourceId } from '../types';
import { Icon } from '../components/Icon';
import { Button, Panel, Sparkline } from '../components/UI';
import { SourceStatusPill } from '../components/SourceStatusPill';
import { PagedEventList } from '../components/PagedEventList';

export default function SourceDetail() {
  const pulse = usePulse();
  const params = useParams<{ source: string }>();
  const source = createMemo(() => SOURCE_BY_ID[params.source as SourceId]);
  const searchId = createUniqueId();
  const [query, setQuery] = createSignal('');
  const deferredQuery = createDeferred(query);

  const events = createMemo(() => {
    const meta = source();
    if (!meta) return [];
    const search = deferredQuery().trim().toLowerCase();
    return pulse.sources[meta.id].events().filter(
      (event) => !search || event.search.includes(search)
    );
  });

  const averageScore = createMemo(() => {
    if (!events().length) return 0;
    return (
      events().reduce((sum, event) => sum + event.score, 0) / events().length
    );
  });

  return (
    <>
      <Title>{source()?.label ?? 'Source'} — Planet Pulse</Title>
      <Meta
        name="description"
        content={source()?.blurb ?? 'Live source detail on Planet Pulse.'}
      />

      <Show when={source()} fallback={<Navigate href="/sources" />}>
        {(meta) => {
          const runtime = () => pulse.sources[meta().id];

          return (
            <>
              <A
                href="/sources"
                class="focus-ring inline-flex items-center gap-1.5 rounded text-[10px] text-faint transition-colors hover:text-ink"
              >
                <span aria-hidden="true">←</span> All sources
              </A>

              <div class="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div class="flex items-start gap-4">
                  <span
                    class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-line"
                    style={{
                      color: meta().color,
                      'background-color': `color-mix(in srgb, ${meta().color} 10%, transparent)`,
                    }}
                  >
                    <Icon name={meta().icon} size={22} />
                  </span>
                  <div>
                    <p class="eyebrow text-faint">Source</p>
                    <h1 class="display mt-1 text-4xl leading-none tracking-tight text-ink sm:text-5xl">
                      {meta().label}
                    </h1>
                    <p class="mt-2 max-w-xl text-xs leading-relaxed text-muted">
                      {meta().blurb}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <SourceStatusPill
                    status={runtime().status()}
                    paused={pulse.paused()}
                    online={pulse.online()}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={runtime().refresh}
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
              </div>

              <div class="mt-6 grid gap-4 lg:grid-cols-12">
                <div class="lg:col-span-8">
                  <Panel
                    eyebrow={`${meta().kind} feed`}
                    title={`${events().length} signals`}
                    action={
                      <div class="relative w-48 max-w-full sm:w-64">
                        <label class="sr-only" for={searchId}>
                          Search {meta().label}
                        </label>
                        <Icon
                          name="search"
                          size={13}
                          class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint"
                        />
                        <input
                          id={searchId}
                          type="search"
                          value={query()}
                          onInput={(event) =>
                            setQuery(event.currentTarget.value)
                          }
                          placeholder={`Search ${meta().short.toLowerCase()}…`}
                          class="focus-ring h-8 w-full rounded-lg border border-line bg-panel-2 pl-8 pr-2 text-[11px] text-ink placeholder:text-faint"
                        />
                      </div>
                    }
                    bodyClass="p-2"
                  >
                    <PagedEventList
                      events={events()}
                      resetKey={`${meta().id}:${deferredQuery()}`}
                      pageSize={40}
                      emptyTitle={`No ${meta().short.toLowerCase()} match`}
                      emptyMessage="This feed has no events for that search yet. Try a broader term or refresh the source."
                    />
                  </Panel>
                </div>

                <aside class="flex flex-col gap-4 lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
                  <Panel eyebrow="Health" title="Feed telemetry" bodyClass="p-5">
                    <div class="grid grid-cols-2 gap-4">
                      <Metric
                        value={String(pulse.counts()[meta().id])}
                        label="signals"
                      />
                      <Metric
                        value={runtime().latency() ? `${runtime().latency()} ms` : '—'}
                        label="latency"
                      />
                      <Metric
                        value={intervalLabel(meta().interval)}
                        label="cadence"
                      />
                      <Metric
                        value={
                          runtime().fetchedAt()
                            ? timeAgoLabel(runtime().fetchedAt(), pulse.now())
                            : '—'
                        }
                        label="last sync"
                      />
                    </div>

                    <div class="mt-5 border-t border-line/60 pt-4">
                      <p class="eyebrow text-[8px] text-faint">Recent weight</p>
                      <Sparkline
                        values={events()
                          .slice(0, 24)
                          .map((event) => event.score)
                          .reverse()}
                        color={meta().color}
                        class="mt-2 h-12 w-full"
                      />
                    </div>

                    <div class="mt-5 border-t border-line/60 pt-4">
                      <div class="flex items-center justify-between text-[11px]">
                        <span class="text-muted">Average score</span>
                        <span class="font-mono tabular-nums text-ink">
                          {Math.round(averageScore())}
                        </span>
                      </div>
                      <div class="mt-2 flex items-center justify-between text-[11px]">
                        <span class="text-muted">Kind</span>
                        <span class="font-mono uppercase tracking-wider text-ink">
                          {meta().kind}
                        </span>
                      </div>
                    </div>

                    <a
                      href={meta().docs}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="focus-ring mt-5 flex items-center justify-between rounded-xl border border-line px-3 py-2.5 text-[11px] text-muted transition-colors hover:border-line-strong hover:text-ink"
                    >
                      API documentation
                      <Icon name="external" size={13} />
                    </a>
                  </Panel>
                </aside>
              </div>
            </>
          );
        }}
      </Show>
    </>
  );
}

function Metric(props: { value: string; label: string }) {
  return (
    <div>
      <p class="display text-2xl leading-none text-ink">{props.value}</p>
      <p class="eyebrow mt-1 text-[8px] text-faint">{props.label}</p>
    </div>
  );
}

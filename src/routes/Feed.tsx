import { onMount } from 'solid-js';
import { useSearchParams } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { usePulse } from '../stores/pulse';
import { SOURCE_BY_ID } from '../data/sources';
import type { SourceId } from '../types';
import { FilterBar } from '../components/FilterBar';
import { PagedEventList } from '../components/PagedEventList';
import { SourceMix } from '../components/SourceMix';
import { BriefPanel } from '../components/BriefPanel';
import { Panel } from '../components/UI';

export default function Feed() {
  const pulse = usePulse();
  const [params] = useSearchParams<{ source?: string }>();

  onMount(() => {
    const source = params.source;
    if (typeof source === 'string' && SOURCE_BY_ID[source as SourceId]) {
      pulse.setFilters({
        sources: [source as SourceId],
        query: '',
        window: null,
        kind: 'all',
      });
    }
  });

  const resetKey = () =>
    [
      pulse.filters.sources.join(','),
      pulse.filters.window,
      pulse.filters.query,
      pulse.filters.sort,
      pulse.filters.kind,
    ].join('|');

  return (
    <>
      <Title>The wire — Planet Pulse</Title>
      <Meta
        name="description"
        content="Every live signal in one searchable, filterable feed."
      />

      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="eyebrow text-faint">The wire</p>
          <h1 class="display mt-2 text-4xl leading-[0.95] tracking-tight sm:text-5xl">
            Every signal, <em class="text-accent">in sequence.</em>
          </h1>
          <p class="mt-2 max-w-xl text-xs leading-relaxed text-muted">
            Continuous observations and discrete events share one timeline.
            Search across places, assets, teams and headlines.
          </p>
        </div>
        <p class="font-mono text-[9px] uppercase tracking-wider text-faint">
          {pulse.filtered().length} visible · {pulse.events().length} total
        </p>
      </div>

      <div class="mt-5">
        <FilterBar />
      </div>

      <div class="mt-4 grid gap-4 lg:grid-cols-12">
        <div class="lg:col-span-8">
          <Panel
            eyebrow="Live feed"
            title="Signals"
            action={
              <span class="font-mono text-[9px] uppercase tracking-wider text-faint">
                {pulse.filters.sort === 'newest' ? 'newest first' : 'impact first'}
              </span>
            }
            bodyClass="p-2"
          >
            <PagedEventList
              events={pulse.filtered()}
              resetKey={resetKey()}
              pageSize={40}
            />
          </Panel>
        </div>

        <aside class="flex flex-col gap-4 lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
          <SourceMix />
          <BriefPanel />
        </aside>
      </div>
    </>
  );
}

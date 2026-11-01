import { onMount } from 'solid-js';
import { useSearchParams } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { usePulse } from '../stores/pulse';
import { SOURCES, SOURCE_BY_ID } from '../data/sources';
import type { SourceId } from '../types';
import { FilterBar } from '../components/FilterBar';
import { PagedEventList } from '../components/PagedEventList';
import { SourceMix } from '../components/SourceMix';
import { BriefPanel } from '../components/BriefPanel';
import { Panel } from '../components/UI';

export default function Feed() {
  const pulse = usePulse();
  const [params] = useSearchParams<{ source?: string; q?: string }>();

  onMount(() => {
    const sourceParam = params.source;
    const source =
      typeof sourceParam === 'string' &&
      SOURCE_BY_ID[sourceParam as SourceId]
        ? (sourceParam as SourceId)
        : null;
    const query = typeof params.q === 'string' ? params.q.trim() : '';

    if (!source && !query) return;

    pulse.setFilters({
      sources: source ? [source] : SOURCES.map((item) => item.id),
      query,
      window: null,
      kind: 'all',
    });
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
      <Title>Event log — Planet Pulse</Title>
      <Meta
        name="description"
        content="Every live event and reading in one searchable, filterable feed."
      />

      <header class="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <p class="eyebrow text-faint">All sources</p>
          <h1 class="display mt-1 text-3xl text-ink">Event log</h1>
          <p class="mt-2 max-w-xl text-xs leading-relaxed text-muted">
            Search and filter every event and reading. Newest first unless you
            switch to priority.
          </p>
        </div>
        <p class="font-mono text-[9px] uppercase tracking-wider text-faint">
          {pulse.filtered().length} visible · {pulse.events().length} total
        </p>
      </header>

      <div class="mt-4">
        <FilterBar />
      </div>

      <div class="mt-4 grid gap-4 lg:grid-cols-12">
        <div class="lg:col-span-8">
          <Panel
            eyebrow="Live"
            title="Events"
            action={
              <span class="font-mono text-[9px] uppercase tracking-wider text-faint">
                {pulse.filters.sort === 'newest' ? 'newest first' : 'priority first'}
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

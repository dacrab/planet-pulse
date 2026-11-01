import { For } from 'solid-js';
import { A } from '@solidjs/router';
import { usePulse } from '../stores/pulse';
import { SOURCES } from '../data/sources';
import { timeAgoLabel } from '../lib/format';
import type { SourceId } from '../types';
import { Panel, SourceDot } from './UI';

export function Vitals() {
  const pulse = usePulse();

  const statusLabel = (id: SourceId) => {
    if (!pulse.online()) return 'offline';
    if (pulse.paused()) return 'paused';

    const runtime = pulse.sources[id];
    switch (runtime.status()) {
      case 'error':
        return 'error';
      case 'stale':
        return 'stale';
      case 'loading':
        return 'loading';
      case 'refreshing':
        return 'syncing';
      case 'ready':
        return timeAgoLabel(runtime.fetchedAt(), pulse.now());
      default:
        return 'idle';
    }
  };

  return (
    <Panel
      eyebrow="Feeds"
      title="Live vitals"
      action={
        <span class="font-mono text-[9px] uppercase tracking-wider text-faint">
          {pulse.events().length} signals
        </span>
      }
      bodyClass="grid grid-cols-2 gap-1 p-2"
    >
      <For each={SOURCES}>
        {(source) => (
          <A
            href={`/sources/${source.id}`}
            class="focus-ring group rounded-xl border border-transparent p-2.5 transition-colors hover:border-line hover:bg-panel-2/70"
          >
            <div class="flex items-center justify-between gap-2">
              <SourceDot source={source.id} size={6} />
              <span class="font-mono text-[10px] tabular-nums text-faint">
                {pulse.counts()[source.id]}
              </span>
            </div>
            <p class="mt-2 text-[11px] font-medium text-ink">{source.short}</p>
            <p class="mt-0.5 truncate font-mono text-[9px] uppercase tracking-wide text-faint">
              {statusLabel(source.id)}
            </p>
          </A>
        )}
      </For>
    </Panel>
  );
}

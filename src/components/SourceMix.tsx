import { For } from 'solid-js';
import { usePulse } from '../stores/pulse';
import { SOURCES } from '../data/sources';
import type { SourceId } from '../types';
import { Panel, SourceDot } from './UI';

export function SourceMix() {
  const pulse = usePulse();
  const max = () => Math.max(1, ...SOURCES.map((source) => pulse.counts()[source.id]));

  const toggle = (id: SourceId) => {
    const active = pulse.filters.sources.includes(id);
    pulse.setFilters(
      'sources',
      active
        ? pulse.filters.sources.filter((source) => source !== id)
        : [...pulse.filters.sources, id]
    );
  };

  return (
    <Panel
      eyebrow="Composition"
      title="Source mix"
      action={
        <span class="font-mono text-[9px] uppercase tracking-wider text-faint">
          {pulse.filtered().length} visible
        </span>
      }
      bodyClass="p-2"
    >
      <For each={SOURCES}>
        {(source) => {
          const count = () => pulse.counts()[source.id];
          const active = () => pulse.filters.sources.includes(source.id);

          return (
            <button
              type="button"
              onClick={() => toggle(source.id)}
              class="focus-ring flex w-full items-center gap-2 rounded px-2 py-1.5 text-left transition-opacity"
              classList={{ 'opacity-40': !active() }}
              aria-pressed={active()}
              title={`Toggle ${source.label}`}
            >
              <SourceDot source={source.id} size={5} />
              <span class="w-14 shrink-0 text-[11px] text-muted">{source.short}</span>
              <span class="relative h-1.5 flex-1 overflow-hidden rounded-sm bg-line/60">
                <span
                  class="absolute inset-y-0 left-0 rounded-sm transition-[width] duration-500"
                  style={{
                    width: `${Math.max(2, (count() / max()) * 100)}%`,
                    'background-color': source.color,
                  }}
                />
              </span>
              <span class="w-6 shrink-0 text-right font-mono text-[10px] tabular-nums text-faint">
                {count()}
              </span>
            </button>
          );
        }}
      </For>
      <div class="mt-2 border-t border-line/60 px-2 pb-1 pt-2 font-mono text-[9px] uppercase tracking-wider text-faint">
        {pulse.events().length} total items
      </div>
    </Panel>
  );
}

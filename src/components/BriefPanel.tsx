import { For, Show } from 'solid-js';
import { A } from '@solidjs/router';
import { usePulse } from '../stores/pulse';
import { Icon } from './Icon';
import { Panel, SourceDot } from './UI';

export function BriefPanel() {
  const pulse = usePulse();

  return (
    <Panel
      eyebrow="Summary"
      title="Daily brief"
      action={
        <A
          href="/intelligence"
          class="focus-ring inline-flex items-center gap-1 rounded text-[10px] text-faint transition-colors hover:text-ink"
        >
          Method <Icon name="arrow-right" size={12} />
        </A>
      }
      bodyClass="p-0"
    >
      <Show
        when={pulse.brief().length}
        fallback={
          <p class="px-5 py-8 text-center text-xs text-muted">
            Building the first summary…
          </p>
        }
      >
        <div class="divide-y divide-line/60">
          <For each={pulse.brief()}>
            {(item) => (
              <div class="flex items-start gap-3 px-5 py-3">
                <SourceDot source={item.source} class="mt-1" />
                <div class="min-w-0 flex-1">
                  <p class="eyebrow text-[8px] text-faint">{item.label}</p>
                  <p class="mt-1 line-clamp-1 text-[13px] font-medium text-ink">
                    {item.value}
                  </p>
                  <p class="mt-0.5 line-clamp-1 text-[10px] text-muted">
                    {item.detail}
                  </p>
                </div>
              </div>
            )}
          </For>
        </div>
        <div class="border-t border-line/60 px-5 py-2.5 font-mono text-[9px] uppercase tracking-wider text-faint">
          Derived from the last 24 hours
        </div>
      </Show>
    </Panel>
  );
}

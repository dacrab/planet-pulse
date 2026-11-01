import { For, Show } from 'solid-js';
import { A } from '@solidjs/router';
import { usePulse } from '../stores/pulse';
import { Icon } from './Icon';
import { AlertCard } from './AlertCard';
import { Panel } from './UI';

export function IntelligencePreview() {
  const pulse = usePulse();

  return (
    <Panel
      eyebrow="Intelligence"
      title={pulse.alerts().length ? 'Active alerts' : 'Cross-signal watch'}
      action={
        <A
          href="/intelligence"
          class="focus-ring inline-flex items-center gap-1 rounded text-[10px] text-faint transition-colors hover:text-ink"
        >
          All <Icon name="arrow-right" size={12} />
        </A>
      }
      bodyClass="p-2"
    >
      <Show
        when={pulse.alerts().length}
        fallback={
          <div class="px-3 py-6 text-center">
            <p class="text-xs font-medium text-ink">No alerts above threshold</p>
            <p class="mx-auto mt-1 max-w-[28ch] text-[10px] leading-relaxed text-muted">
              {pulse.activeCorrelations().length
                ? `${pulse.activeCorrelations().length} correlations are being watched, but none cross the alert line yet.`
                : 'Seismic, market and orbital correlations will appear here as feeds update.'}
            </p>
            <A
              href="/intelligence"
              class="focus-ring mt-3 inline-flex items-center gap-1 rounded font-mono text-[9px] uppercase tracking-wider text-accent"
            >
              Read the method <Icon name="arrow-right" size={11} />
            </A>
          </div>
        }
      >
        <div class="space-y-2">
          <For each={pulse.alerts().slice(0, 2)}>
            {(alert) => <AlertCard alert={alert} compact />}
          </For>
        </div>
      </Show>
    </Panel>
  );
}

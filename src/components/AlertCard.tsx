import { For, Show } from 'solid-js';
import { usePulse } from '../stores/pulse';
import { timeAgoLabel } from '../lib/format';
import type { Alert, AlertTier } from '../types';
import { Button, SourceTag } from './UI';

const TIER: Record<
  AlertTier,
  { label: string; color: string; border: string; background: string }
> = {
  action: {
    label: 'Action',
    color: 'var(--danger)',
    border: 'color-mix(in srgb, var(--danger) 28%, transparent)',
    background: 'color-mix(in srgb, var(--danger) 6%, transparent)',
  },
  watch: {
    label: 'Watch',
    color: 'var(--warning)',
    border: 'color-mix(in srgb, var(--warning) 28%, transparent)',
    background: 'color-mix(in srgb, var(--warning) 6%, transparent)',
  },
};

export function AlertCard(props: { alert: Alert; compact?: boolean }) {
  const pulse = usePulse();
  const tier = () => TIER[props.alert.tier];

  return (
    <article
      class="relative overflow-hidden rounded border p-4"
      style={{
        'border-color': tier().border,
        'background-color': tier().background,
      }}
    >
      <div
        class="absolute inset-y-0 left-0 w-1"
        style={{ 'background-color': tier().color }}
      />

      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p
            class="text-[9px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: tier().color }}
          >
            {tier().label} · {props.alert.kind}
          </p>
          <h3 class="mt-1 text-sm font-semibold leading-snug text-ink">
            {props.alert.title}
          </h3>
          <p class="mt-1 text-xs leading-relaxed text-muted">
            {props.alert.description}
          </p>
        </div>
        <span
          class="display shrink-0 text-3xl leading-none"
          style={{ color: tier().color }}
          title="Score"
        >
          {Math.round(props.alert.significance)}
        </span>
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-2">
        <For each={props.alert.sourceIds}>
          {(source) => <SourceTag source={source} />}
        </For>
        <span class="ml-auto font-mono text-[9px] uppercase tracking-wider text-faint">
          {timeAgoLabel(props.alert.timestamp, pulse.now())}
        </span>
      </div>

      <Show when={!props.compact}>
        <div class="mt-3 flex items-center gap-2">
          <Show when={props.alert.eventIds[0]}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => pulse.openEvent(props.alert.eventIds[0])}
            >
              View evidence
            </Button>
          </Show>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => pulse.dismissAlert(props.alert.id)}
          >
            Dismiss
          </Button>
        </div>
      </Show>
    </article>
  );
}

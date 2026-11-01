import {
  For,
  Show,
  createSelector,
  type Accessor,
} from 'solid-js';
import { usePulse } from '../stores/pulse';
import { timeAgo } from '../lib/format';
import type { PulseEvent } from '../types';
import { Icon } from './Icon';
import { EmptyState, SourceTag } from './UI';

export function EventRow(props: {
  event: PulseEvent;
  selected?: Accessor<boolean>;
  compact?: boolean;
}) {
  const pulse = usePulse();

  return (
    <button
      type="button"
      onClick={() => pulse.openEvent(props.event.id)}
      class="focus-ring group grid w-full grid-cols-[2.4rem_1fr_auto] items-start gap-2.5 rounded-xl border border-transparent px-2.5 py-2.5 text-left transition-colors hover:border-line hover:bg-panel-2/70 sm:gap-3 sm:px-3"
      classList={{ 'border-line bg-panel-2/70': props.selected?.() }}
      aria-label={`Open ${props.event.title}`}
    >
      <span
        class="pt-0.5 text-right font-mono text-[10px] tabular-nums text-faint"
        title={new Date(props.event.timestamp).toLocaleString()}
      >
        {timeAgo(props.event.timestamp, pulse.now())}
      </span>

      <span class="min-w-0">
        <span class="flex min-w-0 items-center gap-2">
          <SourceTag source={props.event.source} />
          <span class="truncate text-[13px] leading-snug text-ink">
            {props.event.title}
          </span>
        </span>
        <span class="mt-0.5 flex min-w-0 items-center gap-2 text-[11px] leading-snug text-muted">
          <span class="truncate">{props.event.subtitle}</span>
          <Show when={props.event.tags[0]}>
            <span class="hidden shrink-0 font-mono text-[9px] uppercase tracking-wider text-faint sm:inline">
              {props.event.tags[0]}
            </span>
          </Show>
        </span>
      </span>

      <span class="flex items-center gap-2 pt-0.5">
        <Show when={!props.compact}>
          <span class="hidden font-mono text-[9px] tabular-nums text-faint sm:inline">
            {Math.round(props.event.score)}
          </span>
        </Show>
        <Icon
          name="arrow-up-right"
          size={13}
          class="text-faint opacity-0 transition-opacity group-hover:opacity-100"
        />
      </span>
    </button>
  );
}

export function EventList(props: {
  events: PulseEvent[];
  class?: string;
  emptyTitle?: string;
  emptyMessage?: string;
}) {
  const pulse = usePulse();
  const isSelected = createSelector(() => pulse.selectedEvent()?.id ?? '');

  return (
    <Show
      when={props.events.length}
      fallback={
        <EmptyState
          icon="search"
          title={props.emptyTitle ?? 'No signals match'}
          message={
            props.emptyMessage ??
            'Try widening the time range, enabling another source, or clearing the search.'
          }
        />
      }
    >
      <div class={`space-y-0.5 ${props.class ?? ''}`}>
        <For each={props.events}>
          {(event) => (
            <EventRow event={event} selected={() => isSelected(event.id)} />
          )}
        </For>
      </div>
    </Show>
  );
}

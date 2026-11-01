import { Match, Switch } from 'solid-js';
import type { SourceStatus } from '../types';

export function SourceStatusPill(props: {
  status: SourceStatus;
  paused: boolean;
  online: boolean;
  class?: string;
}) {
  return (
    <Switch
      fallback={
        <Pill class={props.class} dot="bg-success" text="text-success" label="Live" />
      }
    >
      <Match when={!props.online}>
        <Pill class={props.class} dot="bg-danger" text="text-danger" label="Offline" />
      </Match>
      <Match when={props.paused}>
        <Pill class={props.class} dot="bg-faint" text="text-muted" label="Paused" />
      </Match>
      <Match when={props.status === 'error'}>
        <Pill class={props.class} dot="bg-danger" text="text-danger" label="Error" />
      </Match>
      <Match when={props.status === 'stale'}>
        <Pill class={props.class} dot="bg-warning" text="text-warning" label="Stale" />
      </Match>
      <Match when={props.status === 'loading'}>
        <Pill class={props.class} dot="bg-warning" text="text-warning" label="Loading" pulse />
      </Match>
      <Match when={props.status === 'refreshing'}>
        <Pill class={props.class} dot="bg-sky" text="text-sky" label="Syncing" pulse />
      </Match>
      <Match when={props.status === 'idle'}>
        <Pill class={props.class} dot="bg-faint" text="text-faint" label="Idle" />
      </Match>
    </Switch>
  );
}

function Pill(props: {
  dot: string;
  text: string;
  label: string;
  pulse?: boolean;
  class?: string;
}) {
  return (
    <span
      class={`inline-flex items-center gap-1.5 rounded-sm border border-line bg-panel-2 px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-wider ${props.class ?? ''}`}
    >
      <span
        class={`h-1.5 w-1.5 rounded-full ${props.dot} ${props.pulse ? 'animate-pulse' : ''}`}
      />
      <span class={props.text}>{props.label}</span>
    </span>
  );
}

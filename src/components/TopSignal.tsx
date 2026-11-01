import { Show } from 'solid-js';
import { usePulse } from '../stores/pulse';
import { SOURCE_COLORS } from '../data/sources';
import { Icon } from './Icon';
import { Button, Panel, ScoreMeter, SourceTag } from './UI';

export function TopSignal() {
  const pulse = usePulse();

  return (
    <Panel
      eyebrow="Signal of the hour"
      title="What matters now"
      class="relative overflow-hidden"
      action={
        <Show when={pulse.top()}>
          {(event) => <SourceTag source={event().source} />}
        </Show>
      }
    >
      <Show
        when={pulse.top()}
        keyed
        fallback={
          <div class="py-8 text-center">
            <p class="text-sm text-muted">Listening for the strongest signal…</p>
            <p class="mt-1 text-xs text-faint">
              The feed ranks events by a transparent editorial score.
            </p>
          </div>
        }
      >
        {(event) => (
          <>
            <div
              class="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full opacity-10 blur-3xl"
              style={{ 'background-color': SOURCE_COLORS[event.source] }}
            />
            <div class="relative">
              <p class="display line-clamp-3 text-[2.1rem] leading-[1.02] tracking-tight text-ink">
                {event.title}
              </p>
              <p class="mt-2 text-xs leading-relaxed text-muted">{event.subtitle}</p>

              <div class="mt-5 flex items-end justify-between gap-4">
                <div class="min-w-0 flex-1">
                  <ScoreMeter
                    value={event.score}
                    color={SOURCE_COLORS[event.source]}
                  />
                  <p class="eyebrow mt-1.5 text-[8px] text-faint">
                    editorial weight
                  </p>
                </div>
                <span class="display text-4xl leading-none text-accent">
                  {Math.round(event.score)}
                </span>
              </div>

              <Button
                variant="subtle"
                size="sm"
                class="mt-4 w-full justify-between"
                onClick={() => pulse.openEvent(event.id)}
              >
                Inspect signal
                <Icon name="arrow-right" size={14} />
              </Button>
            </div>
          </>
        )}
      </Show>
    </Panel>
  );
}

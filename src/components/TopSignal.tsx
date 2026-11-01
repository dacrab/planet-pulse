import { Show } from 'solid-js';
import { usePulse } from '../stores/pulse';
import { SOURCE_COLORS } from '../data/sources';
import { Icon } from './Icon';
import { Button, Panel, ScoreMeter, SourceTag } from './UI';

export function TopSignal() {
  const pulse = usePulse();

  return (
    <Panel
      eyebrow="Priority"
      title="Top event"
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
            <p class="text-sm text-muted">Waiting for events…</p>
            <p class="mt-1 text-xs text-faint">
              Events are ranked by a fixed priority score.
            </p>
          </div>
        }
      >
        {(event) => (
          <div>
            <p class="display line-clamp-3 text-xl leading-tight text-ink">
              {event.title}
            </p>
            <p class="mt-2 text-xs leading-relaxed text-muted">{event.subtitle}</p>

            <div class="mt-4 flex items-end justify-between gap-4">
              <div class="min-w-0 flex-1">
                <ScoreMeter
                  value={event.score}
                  color={SOURCE_COLORS[event.source]}
                />
                <p class="eyebrow mt-1.5 text-[8px] text-faint">score</p>
              </div>
              <span class="display text-3xl leading-none text-accent">
                {Math.round(event.score)}
              </span>
            </div>

            <Button
              variant="subtle"
              size="sm"
              class="mt-4 w-full justify-between"
              onClick={() => pulse.openEvent(event.id)}
            >
              Open event
              <Icon name="arrow-right" size={14} />
            </Button>
          </div>
        )}
      </Show>
    </Panel>
  );
}

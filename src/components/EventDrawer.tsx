import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  onCleanup,
} from 'solid-js';
import { Portal } from 'solid-js/web';
import { A } from '@solidjs/router';
import { usePulse } from '../stores/pulse';
import { SOURCE_BY_ID, SOURCE_COLORS } from '../data/sources';
import { timeAgoLabel } from '../lib/format';
import { Icon } from './Icon';
import { Button, ScoreMeter, SourceTag } from './UI';
import { EventRow } from './EventRow';

export function EventDrawer() {
  const pulse = usePulse();
  const titleId = createUniqueId();
  const [copied, setCopied] = createSignal(false);
  let copyTimer: ReturnType<typeof setTimeout> | undefined;
  onCleanup(() => clearTimeout(copyTimer));

  const event = () => pulse.selectedEvent();

  const related = createMemo(() => {
    const selected = event();
    if (!selected) return [];
    return pulse
      .events()
      .filter(
        (candidate) =>
          candidate.source === selected.source && candidate.id !== selected.id
      )
      .slice(0, 4);
  });

  createEffect(() => {
    if (!event()) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    onCleanup(() => {
      document.body.style.overflow = previous;
    });
  });

  createEffect(() => {
    if (!event()) return;
    setCopied(false);
  });

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => setCopied(false), 1_600);
    } catch {
      // Clipboard access can be blocked; fail quietly.
    }
  };

  return (
    <Show when={event()}>
      {(selected) => (
        <Portal>
          <div class="fixed inset-0 z-[60]">
            <button
              type="button"
              class="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={pulse.closeEvent}
              aria-label="Close event details"
            />

            <aside
              class="drawer-panel absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto border-l border-line bg-bg shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
            >
              <header class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-bg/90 px-5 py-3.5 backdrop-blur-xl">
                <div class="flex min-w-0 items-center gap-2">
                  <SourceTag source={selected().source} />
                  <span class="font-mono text-[9px] uppercase tracking-wider text-faint">
                    {timeAgoLabel(selected().timestamp, pulse.now())}
                  </span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={pulse.closeEvent}
                  aria-label="Close event details"
                  ref={(element) => queueMicrotask(() => element.focus())}
                >
                  <Icon name="x" size={17} />
                </Button>
              </header>

              <div class="flex-1 px-5 py-5">
                <div class="flex items-center justify-between gap-3">
                  <p class="eyebrow text-faint">
                    {SOURCE_BY_ID[selected().source].label}
                  </p>
                  <span class="font-mono text-[9px] uppercase tracking-wider text-faint">
                    score {Math.round(selected().score)}
                  </span>
                </div>

                <h2
                  id={titleId}
                  class="display mt-2 text-3xl leading-[1.05] tracking-tight text-ink"
                >
                  {selected().title}
                </h2>
                <p class="mt-2 text-xs leading-relaxed text-muted">
                  {selected().subtitle}
                </p>

                <ScoreMeter
                  value={selected().score}
                  color={SOURCE_COLORS[selected().source]}
                  class="mt-4"
                />

                <Show when={selected().image}>
                  <img
                    src={selected().image}
                    alt=""
                    loading="lazy"
                    class="mt-5 aspect-video w-full rounded-xl border border-line object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                </Show>

                <div class="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line/60">
                  <For each={selected().metrics}>
                    {(metric) => (
                      <div class="bg-panel px-3 py-2.5">
                        <p class="eyebrow text-[8px] text-faint">{metric.label}</p>
                        <p
                          class="mt-1 text-[12px] font-medium text-ink"
                          classList={{
                            'text-success': metric.tone === 'up',
                            'text-danger': metric.tone === 'down',
                          }}
                        >
                          {metric.value}
                        </p>
                      </div>
                    )}
                  </For>
                </div>

                <Show when={selected().tags.length}>
                  <div class="mt-4 flex flex-wrap gap-1.5">
                    <For each={selected().tags}>
                      {(tag) => (
                        <span class="rounded-full border border-line bg-panel-2 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-faint">
                          {tag}
                        </span>
                      )}
                    </For>
                  </div>
                </Show>

                <Show
                  when={
                    selected().lat !== undefined && selected().lon !== undefined
                  }
                >
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${selected().lat}&mlon=${
                      selected().lon
                    }#map=5/${selected().lat}/${selected().lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="focus-ring mt-4 flex items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-[11px] text-muted transition-colors hover:border-line-strong hover:text-ink"
                  >
                    <Icon name="map-pin" size={14} class="text-accent" />
                    <span class="font-mono tabular-nums">
                      {selected().lat!.toFixed(3)}, {selected().lon!.toFixed(3)}
                    </span>
                    <span class="ml-auto font-mono text-[9px] uppercase tracking-wider text-faint">
                      open map
                    </span>
                  </a>
                </Show>

                <div class="mt-5 flex flex-wrap items-center gap-2">
                  <Show when={selected().href}>
                    <a
                      href={selected().href}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-accent px-3.5 text-[13px] font-medium text-accent-ink transition-[filter] hover:brightness-105"
                    >
                      Open original
                      <Icon name="external" size={14} />
                    </a>
                  </Show>
                  <Button size="md" variant="outline" onClick={copyLink}>
                    <Icon name={copied() ? 'check' : 'copy'} size={14} />
                    {copied() ? 'Copied' : 'Copy link'}
                  </Button>
                </div>

                <div class="mt-6 flex items-center justify-between border-t border-line pt-3">
                  <p class="eyebrow text-[8px] text-faint">Source</p>
                  <A
                    href={`/sources/${selected().source}`}
                    onClick={pulse.closeEvent}
                    class="focus-ring inline-flex items-center gap-1 rounded text-[11px] text-muted transition-colors hover:text-ink"
                  >
                    {SOURCE_BY_ID[selected().source].label}
                    <Icon name="arrow-right" size={12} />
                  </A>
                </div>
              </div>

              <Show when={related().length}>
                <div class="border-t border-line bg-panel/40 px-5 py-4">
                  <p class="eyebrow text-[8px] text-faint">More from this source</p>
                  <div class="mt-2">
                    <For each={related()}>
                      {(relatedEvent) => (
                        <EventRow event={relatedEvent} compact />
                      )}
                    </For>
                  </div>
                </div>
              </Show>
            </aside>
          </div>
        </Portal>
      )}
    </Show>
  );
}

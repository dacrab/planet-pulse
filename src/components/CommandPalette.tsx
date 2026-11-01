import {
  For,
  Show,
  createDeferred,
  createEffect,
  createMemo,
  createSignal,
  on,
  onCleanup,
} from 'solid-js';
import { Portal } from 'solid-js/web';
import { useNavigate } from '@solidjs/router';
import { usePulse } from '../stores/pulse';
import { SOURCES, SOURCE_BY_ID } from '../data/sources';
import { Icon } from './Icon';
import { EmptyState, Kbd } from './UI';
import { focus } from '../directives';
import type { IconName } from '../types';

interface Command {
  id: string;
  label: string;
  hint: string;
  icon: IconName;
  group: 'Navigate' | 'Sources' | 'Actions' | 'Events';
  run: () => void;
}

export function CommandPalette() {
  const pulse = usePulse();
  const navigate = useNavigate();
  const [query, setQuery] = createSignal('');
  const deferredQuery = createDeferred(query);
  const [active, setActive] = createSignal(0);

  const close = () => pulse.setCommandOpen(false);

  const commands = createMemo<Command[]>(() => {
    const run = (fn: () => void) => () => {
      close();
      fn();
    };

    const base: Command[] = [
      {
        id: 'nav-overview',
        label: 'Overview',
        hint: 'Map, feed status and summary',
        icon: 'globe',
        group: 'Navigate',
        run: run(() => navigate('/')),
      },
      {
        id: 'nav-feed',
        label: 'Event log',
        hint: 'Search and filter all events',
        icon: 'feed',
        group: 'Navigate',
        run: run(() => navigate('/feed')),
      },
      {
        id: 'nav-sources',
        label: 'Sources',
        hint: 'Inspect all six public feeds',
        icon: 'layers',
        group: 'Navigate',
        run: run(() => navigate('/sources')),
      },
      {
        id: 'nav-intelligence',
        label: 'Intelligence',
        hint: 'Correlations, alerts and method',
        icon: 'spark',
        group: 'Navigate',
        run: run(() => navigate('/intelligence')),
      },
      {
        id: 'action-theme',
        label: `Switch to ${pulse.theme() === 'dark' ? 'light' : 'dark'} theme`,
        hint: 'Toggle light or dark',
        icon: pulse.theme() === 'dark' ? 'sun' : 'moon',
        group: 'Actions',
        run: run(pulse.toggleTheme),
      },
      {
        id: 'action-pause',
        label: pulse.paused() ? 'Resume live feeds' : 'Pause live feeds',
        hint: 'Stop or restart automatic polling',
        icon: pulse.paused() ? 'play' : 'pause',
        group: 'Actions',
        run: run(pulse.togglePaused),
      },
      {
        id: 'action-refresh',
        label: 'Refresh all feeds',
        hint: 'Fetch every source now',
        icon: 'refresh',
        group: 'Actions',
        run: run(pulse.refreshAll),
      },
      ...SOURCES.map<Command>((source) => ({
        id: `source-${source.id}`,
        label: `Open ${source.label}`,
        hint: source.blurb,
        icon: source.icon,
        group: 'Sources',
        run: run(() => navigate(`/sources/${source.id}`)),
      })),
    ];

    const search = deferredQuery().trim().toLowerCase();
    if (!search) return base;
    return base.filter((command) =>
      `${command.label} ${command.hint} ${command.group}`.toLowerCase().includes(search)
    );
  });

  const eventResults = createMemo<Command[]>(() => {
    const search = deferredQuery().trim().toLowerCase();
    const all = pulse.events();
    const pool = search
      ? all.filter((event) => event.search.includes(search))
      : pulse.top()
        ? [pulse.top()!]
        : [];

    return pool.slice(0, 8).map((event) => {
      const source = SOURCE_BY_ID[event.source];
      return {
        id: `event-${event.id}`,
        label: event.title,
        hint: `${source.label} · ${event.subtitle}`,
        icon: source.icon,
        group: 'Events',
        run: () => pulse.openEvent(event.id),
      };
    });
  });

  const results = createMemo<Command[]>(() => [...commands(), ...eventResults()]);

  createEffect(() => {
    if (!pulse.commandOpen()) return;
    setQuery('');
    setActive(0);
  });

  createEffect(
    on(
      deferredQuery,
      () => setActive(0),
      { defer: true }
    )
  );

  createEffect(() => {
    if (!pulse.commandOpen()) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    onCleanup(() => {
      document.body.style.overflow = previous;
    });
  });

  const move = (direction: 1 | -1) => {
    const total = results().length;
    if (!total) return;
    setActive((index) => (index + direction + total) % total);
  };

  const runActive = () => {
    results()[active()]?.run();
  };

  return (
    <Show when={pulse.commandOpen()}>
      <Portal>
        <div
          class="fixed inset-0 z-[70] flex items-start justify-center bg-black/55 px-4 pt-[10vh] sm:pt-[14vh]"
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
          role="presentation"
        >
          <div
            class="palette-panel w-full max-w-xl overflow-hidden rounded border border-line-strong bg-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <div class="flex items-center gap-3 border-b border-line px-4">
              <Icon name="search" size={16} class="shrink-0 text-faint" />
              <input
                type="text"
                value={query()}
                onInput={(event) => setQuery(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    move(1);
                  } else if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    move(-1);
                  } else if (event.key === 'Enter') {
                    event.preventDefault();
                    runActive();
                  } else if (event.key === 'Escape') {
                    event.preventDefault();
                    close();
                  }
                }}
                placeholder="Search events, sources, actions…"
                class="h-14 w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
                use:focus
                aria-label="Search commands and events"
              />
              <Kbd>esc</Kbd>
            </div>

            <div class="max-h-[55vh] overflow-y-auto p-2" role="listbox">
              <Show
                when={results().length}
                fallback={
                  <EmptyState
                    icon="search"
                    title="No matches"
                    message="Try a place, asset, team, source label or command."
                  />
                }
              >
                <For each={results()}>
                  {(command, index) => (
                    <>
                      <Show
                        when={
                          index() === 0 ||
                          results()[index() - 1]?.group !== command.group
                        }
                      >
                        <p class="eyebrow px-2 pb-1 pt-3 text-[8px] text-faint first:pt-1">
                          {command.group}
                        </p>
                      </Show>

                      <button
                        type="button"
                        role="option"
                        aria-selected={active() === index()}
                        onMouseEnter={() => setActive(index())}
                        onClick={command.run}
                        class="focus-ring flex w-full items-center gap-3 rounded px-2.5 py-2 text-left transition-colors"
                        classList={{
                          'bg-panel-2': active() === index(),
                          'hover:bg-panel-2': active() !== index(),
                        }}
                      >
                        <span
                          class="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-line bg-panel text-faint"
                          classList={{ 'text-accent': active() === index() }}
                        >
                          <Icon name={command.icon} size={15} />
                        </span>
                        <span class="min-w-0 flex-1">
                          <span class="block truncate text-[13px] text-ink">
                            {command.label}
                          </span>
                          <span class="block truncate text-[10px] text-faint">
                            {command.hint}
                          </span>
                        </span>
                        <Show when={active() === index()}>
                          <Kbd>↵</Kbd>
                        </Show>
                      </button>
                    </>
                  )}
                </For>
              </Show>
            </div>

            <div class="flex items-center gap-3 border-t border-line bg-panel-2 px-4 py-2.5 font-mono text-[9px] uppercase tracking-wider text-faint">
              <span class="flex items-center gap-1.5">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                navigate
              </span>
              <span class="flex items-center gap-1.5">
                <Kbd>↵</Kbd>
                open
              </span>
              <span class="ml-auto flex items-center gap-1.5">
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
                anywhere
              </span>
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  );
}

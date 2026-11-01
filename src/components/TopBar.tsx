import { For } from 'solid-js';
import { A } from '@solidjs/router';
import { usePulse } from '../stores/pulse';
import { clockTime } from '../lib/format';
import { Icon } from './Icon';
import { Button, Kbd } from './UI';
import type { GlobalStatus, IconName } from '../types';

const NAV: Array<{ href: string; label: string; icon: IconName }> = [
  { href: '/', label: 'Overview', icon: 'globe' },
  { href: '/feed', label: 'The wire', icon: 'feed' },
  { href: '/sources', label: 'Sources', icon: 'layers' },
  { href: '/intelligence', label: 'Intelligence', icon: 'spark' },
];

const STATUS: Record<
  GlobalStatus,
  { label: string; dot: string; text: string; pulse: boolean }
> = {
  live: { label: 'Live', dot: 'bg-success', text: 'text-success', pulse: true },
  syncing: { label: 'Syncing', dot: 'bg-sky', text: 'text-sky', pulse: true },
  connecting: { label: 'Connecting', dot: 'bg-warning', text: 'text-warning', pulse: true },
  degraded: { label: 'Degraded', dot: 'bg-warning', text: 'text-warning', pulse: false },
  error: { label: 'Error', dot: 'bg-danger', text: 'text-danger', pulse: false },
  paused: { label: 'Paused', dot: 'bg-faint', text: 'text-muted', pulse: false },
  offline: { label: 'Offline', dot: 'bg-danger', text: 'text-danger', pulse: false },
};

export function TopBar() {
  const pulse = usePulse();
  const status = () => STATUS[pulse.status()];

  return (
    <header class="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-xl">
      <div class="mx-auto flex h-16 w-full max-w-[1500px] items-center gap-3 px-4 sm:px-6">
        <A
          href="/"
          end
          class="focus-ring group flex shrink-0 items-center gap-2.5 rounded-xl"
          aria-label="Planet Pulse — overview"
        >
          <span class="relative flex h-8 w-8 items-center justify-center rounded-full border border-line-strong bg-panel-2 text-accent">
            <Icon name="pulse" size={16} />
            <span class="pulse-dot absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent" />
          </span>
          <span class="leading-none">
            <span class="display block text-lg leading-none text-ink">Planet Pulse</span>
            <span class="eyebrow mt-1 hidden text-[8px] text-faint sm:block">
              Live observatory
            </span>
          </span>
        </A>

        <nav class="ml-4 hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          <For each={NAV}>
            {(item) => (
              <A
                href={item.href}
                end={item.href === '/'}
                class="focus-ring rounded-lg px-3 py-2 text-[13px] text-muted transition-colors hover:text-ink"
                activeClass="!text-ink bg-panel-2"
              >
                {item.label}
              </A>
            )}
          </For>
        </nav>

        <div class="ml-auto flex items-center gap-1.5">
          <div class="mr-1 hidden items-center gap-2 rounded-lg px-2 py-1 xl:flex">
            <Icon name="clock" size={13} class="text-faint" />
            <span class="font-mono text-[11px] tabular-nums text-muted">
              {clockTime(pulse.now())}
            </span>
            <span class="eyebrow text-[8px] text-faint">local</span>
          </div>

          <div
            class="hidden items-center gap-1.5 rounded-full border border-line bg-panel-2/70 px-2.5 py-1 text-[10px] font-medium sm:flex"
            aria-live="polite"
            title={`Feed status: ${status().label}`}
          >
            <span
              class={`h-1.5 w-1.5 rounded-full ${status().dot} ${status().pulse ? 'animate-pulse' : ''}`}
            />
            <span class={status().text}>{status().label}</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            class="gap-2"
            onClick={() => pulse.setCommandOpen(true)}
            aria-label="Search events and actions"
          >
            <Icon name="search" size={14} />
            <span class="hidden md:inline">Search</span>
            <Kbd>
              <span class="hidden md:inline">⌘</span>K
            </Kbd>
          </Button>

          <Button
            size="icon"
            variant="ghost"
            class="hidden sm:inline-flex"
            onClick={() => pulse.refreshAll()}
            aria-label="Refresh all feeds"
            title="Refresh all feeds"
          >
            <Icon
              name="refresh"
              size={16}
              class={pulse.status() === 'syncing' ? 'animate-spin' : ''}
            />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={pulse.togglePaused}
            aria-label={pulse.paused() ? 'Resume live feeds' : 'Pause live feeds'}
            title={pulse.paused() ? 'Resume live feeds' : 'Pause live feeds'}
          >
            <Icon name={pulse.paused() ? 'play' : 'pause'} size={15} />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={pulse.toggleTheme}
            aria-label={`Switch to ${pulse.theme() === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${pulse.theme() === 'dark' ? 'light' : 'dark'} theme`}
          >
            <Icon name={pulse.theme() === 'dark' ? 'sun' : 'moon'} size={16} />
          </Button>
        </div>
      </div>
    </header>
  );
}

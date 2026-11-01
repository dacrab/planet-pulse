import { For } from 'solid-js';
import { A } from '@solidjs/router';
import { Icon } from './Icon';
import type { IconName } from '../types';

const ITEMS: Array<{ href: string; label: string; icon: IconName }> = [
  { href: '/', label: 'Overview', icon: 'globe' },
  { href: '/feed', label: 'Wire', icon: 'feed' },
  { href: '/sources', label: 'Sources', icon: 'layers' },
  { href: '/intelligence', label: 'Alerts', icon: 'spark' },
];

export function MobileNav() {
  return (
    <nav
      class="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      aria-label="Primary"
    >
      <div class="mx-auto flex max-w-lg">
        <For each={ITEMS}>
          {(item) => (
            <A
              href={item.href}
              end={item.href === '/'}
              class="focus-ring flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-faint transition-colors"
              activeClass="!text-accent"
            >
              <Icon name={item.icon} size={18} />
              {item.label}
            </A>
          )}
        </For>
      </div>
    </nav>
  );
}

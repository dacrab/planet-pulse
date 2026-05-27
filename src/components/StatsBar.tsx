import { Index } from 'solid-js';
import { useStore } from '../stores/context';
import { eventColors } from '../utils/colors';
import { SOURCES } from '../config/sources';

export const StatsBar = () => {
  const { aggregator } = useStore();

  return (
    <div class="hidden md:flex items-center gap-1">
      <Index each={SOURCES}>
        {(src) => {
          const enabled = () => aggregator.filters.sources.has(src().id);
          const count = () => aggregator.stats().bySource[src().id];
          return (
            <div class={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${enabled() ? 'text-content' : 'text-content-subtle'}`}>
              <div class={`w-1.5 h-1.5 rounded-full transition-opacity ${eventColors[src().id].bg} ${enabled() ? '' : 'opacity-30'}`} />
              <span class="text-xs font-medium">{src().shortLabel}</span>
              <span class="text-xs tabular-nums text-content-subtle">{count()}</span>
            </div>
          );
        }}
      </Index>
    </div>
  );
};

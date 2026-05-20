import { Show } from 'solid-js';
import { useStore } from '../stores/context';

export function InsightsPanel() {
  const { insights } = useStore();

  return (
    <Show when={insights.topEvent()}>
      {(top) => (
        <div class="bg-card border border-border rounded-lg p-4">
          <h3 class="text-[10px] font-semibold uppercase tracking-widest text-content-subtle mb-2">Top Event</h3>
          <p class="text-sm text-content leading-snug">{top().description}</p>
          <div class="flex items-center gap-2 mt-2.5">
            <div class="flex-1 h-1 bg-surface rounded-full overflow-hidden">
              <div class="h-full bg-warning rounded-full" style={`width: ${Math.min(100, top().score)}%`} />
            </div>
            <span class="text-xs font-semibold tabular-nums text-content-muted">{Math.round(top().score)}</span>
          </div>
        </div>
      )}
    </Show>
  );
}

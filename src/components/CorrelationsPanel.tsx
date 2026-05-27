import { Index, Show } from 'solid-js';
import { useStore } from '../stores/context';
import { eventColors } from '../utils/colors';

export function CorrelationsPanel() {
  const { intelligence } = useStore();

  return (
    <Show when={intelligence.geoCorrelations().length > 0}>
      <div class="p-5">
        <p class="text-xs font-semibold text-content-muted uppercase tracking-widest mb-3">Correlations</p>
        <div class="space-y-2">
          <Index each={intelligence.geoCorrelations()}>
            {(c) => (
              <div class="bg-surface rounded-lg p-3 border border-border">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-[11px] font-semibold uppercase tracking-wider text-accent">{c().type}</span>
                  <span class="text-xs font-bold tabular-nums text-content-muted">{Math.round(c().significance)}</span>
                </div>
                <p class="text-xs text-content leading-snug mb-2">{c().description}</p>
                <div class="flex flex-wrap gap-1">
                  <Index each={c().events}>
                    {(ev) => (
                      <span class={`text-[10px] px-1.5 py-0.5 rounded font-medium capitalize ${eventColors[ev().source].text} bg-current/10`}>
                        {ev().source}
                      </span>
                    )}
                  </Index>
                </div>
              </div>
            )}
          </Index>
        </div>
      </div>
    </Show>
  );
}

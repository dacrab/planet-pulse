import { Index, Show } from 'solid-js';
import { useStore } from '../stores/context';

export function CorrelationsPanel() {
  const store = useStore();
  const correlations = () => store.intelligence.geoCorrelations();

  return (
    <div class="bg-card border border-border rounded-lg p-4">
      <h3 class="text-[10px] font-semibold uppercase tracking-widest text-content-subtle mb-3">Correlations</h3>

      <Show
        when={correlations().length > 0}
        fallback={<p class="text-xs text-content-subtle text-center py-4">No patterns detected</p>}
      >
        <div class="space-y-2">
          <Index each={correlations()}>
            {(c) => (
              <div class="bg-surface rounded-md p-3">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-[10px] font-semibold uppercase tracking-wider text-accent">{c().type}</span>
                  <span class="text-xs font-bold text-accent tabular-nums">{Math.round(c().significance)}</span>
                </div>
                <p class="text-xs text-content-muted leading-snug mb-2">{c().description}</p>
                <div class="flex flex-wrap gap-1">
                  <Index each={c().events}>
                    {(ev) => (
                      <span class="text-[10px] px-1.5 py-0.5 bg-border/50 rounded text-content-subtle capitalize">
                        {ev().source}
                      </span>
                    )}
                  </Index>
                </div>
              </div>
            )}
          </Index>
        </div>
      </Show>
    </div>
  );
}

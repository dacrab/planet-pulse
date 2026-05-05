import { Index, Show } from 'solid-js';
import { useStore } from '../stores/context';

export function CorrelationsPanel() {
  const store = useStore();
  const correlations = () => store.intelligence.geoCorrelations();

  return (
    <div class="bg-card border border-border rounded-xl p-5">
      <h3 class="text-xs font-semibold uppercase tracking-widest text-content-subtle mb-4">Correlations</h3>

      <Show
        when={correlations().length > 0}
        fallback={
          <p class="text-xs text-content-subtle text-center py-6">No cross-source patterns detected</p>
        }
      >
        <div class="flex flex-col gap-3">
          <Index each={correlations()}>
            {(c) => (
              <div class="bg-surface border border-border rounded-lg p-3">
                <div class="flex items-start justify-between gap-2 mb-2">
                  <p class="text-[10px] font-semibold uppercase tracking-widest text-accent">{c().type}</p>
                  <span class="text-sm font-bold text-accent tabular-nums">{Math.round(c().significance)}</span>
                </div>
                <p class="text-xs text-content-muted leading-relaxed mb-2">{c().description}</p>
                <div class="flex flex-wrap gap-1">
                  <Index each={c().events}>
                    {(ev) => (
                      <span class="text-[10px] px-1.5 py-0.5 bg-border/40 rounded text-content-subtle capitalize">
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

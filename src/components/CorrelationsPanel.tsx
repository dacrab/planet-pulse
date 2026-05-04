import { Index, Show } from 'solid-js';
import { useStore } from '../stores/context';

export function CorrelationsPanel() {
  const store = useStore();
  const correlations = () => store.intelligence.geoCorrelations();

  return (
    <div class="p-6 rounded-xl border border-border bg-card">
      <h3 class="text-sm font-semibold text-content mb-4">
        Correlations
      </h3>
      
      <Show 
        when={correlations().length > 0}
        fallback={
          <div class="text-center py-8 text-sm text-content-subtle">
            No cross-source patterns detected
          </div>
        }
      >
        <div class="flex flex-col gap-4">
          <Index each={correlations()}>
            {(correlation) => (
              <div class="p-4 rounded-lg bg-sidebar border border-border">
                <div class="flex justify-between items-start mb-3">
                  <div class="flex-1">
                    <div class="text-[0.6875rem] uppercase tracking-wider text-accent font-semibold mb-1">
                      {correlation().type}
                    </div>
                    <p class="text-sm leading-relaxed text-content-muted">
                      {correlation().description}
                    </p>
                  </div>
                  <div class="text-right ml-3 shrink-0">
                    <div class="text-[0.6875rem] text-content-subtle mb-0.5">
                      Impact
                    </div>
                    <div class="text-xl font-bold text-accent">
                      {Math.round(correlation().significance)}
                    </div>
                  </div>
                </div>
                
                <div class="flex flex-wrap gap-1.5">
                  <Index each={correlation().events}>
                    {(event) => (
                      <span class="text-[0.6875rem] px-2 py-1 bg-border/50 rounded text-content-subtle capitalize">
                        {event().source}
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

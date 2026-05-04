import { For, Show } from 'solid-js';
import { useStore } from '../stores/context';

export function CorrelationsPanel() {
  const store = useStore();
  const correlations = () => store.intelligence.geographicCorrelations();

  return (
    <div class="correlations-panel">
      <h3 style="font-size: 0.875rem; font-weight: 600; color: var(--text-primary); margin-bottom: 1rem;">
        🔗 Correlations
      </h3>
      
      <Show 
        when={correlations().length > 0}
        fallback={
          <div style="text-align: center; padding: 2rem 1rem; color: var(--text-tertiary); font-size: 0.8125rem;">
            No cross-source patterns detected
          </div>
        }
      >
        <div style="display: flex; flex-direction: column; gap: 0.875rem;">
          <For each={correlations()}>
            {(correlation) => (
              <div class="correlation-card">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.625rem;">
                  <div style="flex: 1;">
                    <div style="font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent-primary); font-weight: 600; margin-bottom: 0.25rem;">
                      {correlation.type}
                    </div>
                    <p style="font-size: 0.8125rem; line-height: 1.5; color: var(--text-secondary);">
                      {correlation.description}
                    </p>
                  </div>
                  <div style="text-align: right; margin-left: 0.75rem;">
                    <div style="font-size: 0.6875rem; color: var(--text-tertiary); margin-bottom: 0.125rem;">
                      Impact
                    </div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: var(--accent-primary);">
                      {Math.round(correlation.significance)}
                    </div>
                  </div>
                </div>
                
                <div style="display: flex; flex-wrap: wrap; gap: 0.375rem;">
                  <For each={correlation.events}>
                    {(event) => (
                      <span style="font-size: 0.6875rem; padding: 0.25rem 0.5rem; background: var(--bg-sidebar); border-radius: 4px; color: var(--text-tertiary);">
                        {event.source}
                      </span>
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}

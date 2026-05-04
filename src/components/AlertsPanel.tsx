import { For, Show } from 'solid-js';
import { useStore } from '../stores/context';

export function AlertsPanel() {
  const store = useStore();
  const alerts = () => store.intelligence.activeAlerts();

  return (
    <Show when={alerts().length > 0}>
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <For each={alerts()}>
          {(alert) => (
            <div 
              class="alert-card"
              classList={{
                'alert-action': alert.tier === 'action',
                'alert-watch': alert.tier === 'watch',
                'alert-fyi': alert.tier === 'fyi',
              }}
            >
              <div style="display: flex; justify-content: space-between; align-items: start; gap: 1rem;">
                <div style="flex: 1;">
                  <div style="font-weight: 600; font-size: 0.875rem; margin-bottom: 0.375rem;">
                    {alert.title}
                  </div>
                  <div style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5;">
                    {alert.message}
                  </div>
                  <Show when={alert.events.length > 0}>
                    <div style="margin-top: 0.625rem; font-size: 0.75rem; color: var(--text-tertiary);">
                      📍 {alert.events.length} related event{alert.events.length > 1 ? 's' : ''}
                    </div>
                  </Show>
                </div>
                <button
                  class="alert-dismiss"
                  onClick={() => store.intelligence.dismissAlert(alert.id)}
                  aria-label="Dismiss alert"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </For>
      </div>
    </Show>
  );
}

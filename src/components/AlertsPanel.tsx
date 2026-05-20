import { Index, Show } from 'solid-js';
import { useStore } from '../stores/context';

const tierColor = {
  action: 'border-l-danger text-danger',
  watch:  'border-l-warning text-warning',
  fyi:    'border-l-info text-info',
};

export function AlertsPanel() {
  const store = useStore();
  const alerts = () => store.intelligence.activeAlerts();

  return (
    <Show when={alerts().length > 0}>
      <div class="space-y-2">
        <Index each={alerts()}>
          {(alert) => (
            <div class={`flex items-start gap-3 px-4 py-2.5 bg-surface rounded-lg border-l-2 ${tierColor[alert().tier]}`}>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-content">{alert().title}</p>
                <p class="text-xs text-content-muted mt-0.5">{alert().message}</p>
              </div>
              <button
                onClick={() => store.intelligence.dismissAlert(alert().id)}
                class="text-content-subtle hover:text-content text-xs shrink-0"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          )}
        </Index>
      </div>
    </Show>
  );
}

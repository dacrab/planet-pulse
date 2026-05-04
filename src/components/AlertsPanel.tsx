import { Index, Show } from 'solid-js';
import { useStore } from '../stores/context';

const alertStyles = {
  action: 'border-l-4 border-l-danger bg-danger/5 border-border',
  watch: 'border-l-4 border-l-warning bg-warning/5 border-border',
  fyi: 'border-l-4 border-l-info bg-info/5 border-border',
};

export function AlertsPanel() {
  const store = useStore();
  const alerts = () => store.intelligence.activeAlerts();

  return (
    <Show when={alerts().length > 0}>
      <div class="flex flex-col gap-3">
        <Index each={alerts()}>
          {(alert) => (
            <div class={`p-4 rounded-lg border transition-all ${alertStyles[alert().tier]}`}>
              <div class="flex justify-between items-start gap-4">
                <div class="flex-1">
                  <div class="font-semibold text-sm mb-1 text-content">
                    {alert().title}
                  </div>
                  <div class="text-sm text-content-muted leading-relaxed">
                    {alert().message}
                  </div>
                  <Show when={alert().events.length > 0}>
                    <div class="mt-2 text-xs text-content-subtle">
                      {alert().events.length} related event{alert().events.length > 1 ? 's' : ''}
                    </div>
                  </Show>
                </div>
                <button
                  class="text-content-subtle hover:text-content transition-colors p-1"
                  onClick={() => store.intelligence.dismissAlert(alert().id)}
                  aria-label="Dismiss alert"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </Index>
      </div>
    </Show>
  );
}

import { Index, Show } from 'solid-js';
import { useStore } from '../stores/context';

const tierStyle = {
  action: 'border-danger/30 bg-danger/5',
  watch:  'border-warning/30 bg-warning/5',
  fyi:    'border-info/30 bg-info/5',
};

const tierDot = {
  action: 'bg-danger',
  watch:  'bg-warning',
  fyi:    'bg-info',
};

export function AlertsPanel() {
  const store = useStore();
  const alerts = () => store.intelligence.activeAlerts();

  return (
    <Show when={alerts().length > 0}>
      <div class="flex flex-col gap-2">
        <Index each={alerts()}>
          {(alert) => (
            <div class={`flex items-start gap-3 px-4 py-3 rounded-xl border transition-all ${tierStyle[alert().tier]}`}>
              <div class={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${tierDot[alert().tier]}`} />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-content">{alert().title}</p>
                <p class="text-xs text-content-muted mt-0.5 leading-relaxed">{alert().message}</p>
                <Show when={alert().events.length > 0}>
                  <p class="text-xs text-content-subtle mt-1">
                    {alert().events.length} related event{alert().events.length > 1 ? 's' : ''}
                  </p>
                </Show>
              </div>
              <button
                onClick={() => store.intelligence.dismissAlert(alert().id)}
                class="text-content-subtle hover:text-content transition-colors text-xs mt-0.5 shrink-0"
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

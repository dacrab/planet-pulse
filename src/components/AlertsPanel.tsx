import { Index, Show } from 'solid-js';
import { useStore } from '../stores/context';

const tierStyle = {
  action: { bar: 'bg-danger',  text: 'text-danger',  bg: 'bg-danger/8',  border: 'border-danger/20' },
  watch:  { bar: 'bg-warning', text: 'text-warning', bg: 'bg-warning/8', border: 'border-warning/20' },
  fyi:    { bar: 'bg-info',    text: 'text-info',    bg: 'bg-info/8',    border: 'border-info/20' },
};

export function AlertsPanel() {
  const { intelligence } = useStore();

  return (
    <Show when={intelligence.activeAlerts().length > 0}>
      <div class="px-5 pt-3 pb-1 space-y-2">
        <Index each={intelligence.activeAlerts()}>
          {(alert) => {
            const s = () => tierStyle[alert().tier];
            return (
              <div class={`flex items-start gap-3 px-4 py-3 rounded-lg border ${s().bg} ${s().border}`}>
                <div class={`w-1 self-stretch rounded-full shrink-0 ${s().bar}`} />
                <div class="flex-1 min-w-0">
                  <p class={`text-sm font-semibold ${s().text}`}>{alert().title}</p>
                  <p class="text-xs text-content-muted mt-0.5">{alert().message}</p>
                </div>
                <button
                  onClick={() => intelligence.dismissAlert(alert().id)}
                  class="text-content-subtle hover:text-content text-sm leading-none shrink-0 mt-0.5"
                  aria-label="Dismiss"
                >
                  ✕
                </button>
              </div>
            );
          }}
        </Index>
      </div>
    </Show>
  );
}

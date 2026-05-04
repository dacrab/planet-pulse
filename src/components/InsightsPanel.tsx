import { Show } from 'solid-js';
import { useStore } from '../stores/context';

export function InsightsPanel() {
  const store = useStore();
  const insights = store.insights;

  return (
    <div class="p-6 rounded-xl border border-border bg-card">
      <h3 class="text-sm font-semibold text-content mb-4">
        Intelligence
      </h3>

      <div class="flex flex-col gap-4">
        <div class="p-4 rounded-lg bg-sidebar border border-border">
          <div class="text-[0.6875rem] uppercase tracking-wider text-content-subtle mb-2 font-semibold">
            Trend
          </div>
          <div class="flex items-center gap-3">
            <span class="text-2xl">
              {insights.trend().trend === 'increasing' ? '📈' : 
               insights.trend().trend === 'decreasing' ? '📉' : '➡️'}
            </span>
            <div>
              <div class="text-sm font-medium text-content">
                {insights.trend().trend === 'stable' ? 'Stable' :
                 insights.trend().trend === 'increasing' ? 'Rising' : 'Declining'}
              </div>
              <div class="text-xs text-content-subtle mt-0.5">
                {Math.abs(insights.trend().change).toFixed(0)}% vs 15min ago
              </div>
            </div>
          </div>
        </div>

        <Show when={insights.topEvent()}>
          {(top) => (
            <div class="p-4 rounded-lg bg-sidebar border border-border border-l-4 border-l-warning">
              <div class="text-[0.6875rem] uppercase tracking-wider text-warning mb-2 font-semibold">
                Event of the Hour
              </div>
              <p class="text-sm leading-relaxed text-content-muted mb-3">
                {top().description}
              </p>
              <div class="flex items-center gap-2">
                <span class="text-[0.6875rem] text-content-subtle">Impact:</span>
                <div class="flex-1 h-1 bg-border rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-gradient-to-r from-warning to-danger transition-all duration-300"
                    style={`width: ${Math.min(100, top().score)}%`}
                  />
                </div>
                <span class="text-xs font-semibold text-content">
                  {Math.round(top().score)}
                </span>
              </div>
            </div>
          )}
        </Show>
      </div>
    </div>
  );
}

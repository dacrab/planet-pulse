import { Show } from 'solid-js';
import { useStore } from '../stores/context';

export function InsightsPanel() {
  const store = useStore();
  const insights = store.insights;

  const trendIcon = () => {
    const t = insights.trend().trend;
    return t === 'increasing' ? '↑' : t === 'decreasing' ? '↓' : '→';
  };

  const trendColor = () => {
    const t = insights.trend().trend;
    return t === 'increasing' ? 'text-success' : t === 'decreasing' ? 'text-danger' : 'text-content-subtle';
  };

  return (
    <div class="bg-card border border-border rounded-xl p-5">
      <h3 class="text-xs font-semibold uppercase tracking-widest text-content-subtle mb-4">Intelligence</h3>

      <div class="flex flex-col gap-3">
        {/* Trend */}
        <div class="bg-surface border border-border rounded-lg px-4 py-3 flex items-center gap-3">
          <span class={`text-2xl font-bold leading-none ${trendColor()}`}>{trendIcon()}</span>
          <div>
            <p class="text-sm font-medium text-content capitalize">{insights.trend().trend}</p>
            <p class="text-xs text-content-subtle mt-0.5">
              {Math.abs(insights.trend().change).toFixed(0)}% vs 15 min ago
            </p>
          </div>
        </div>

        {/* Top event */}
        <Show when={insights.topEvent()}>
          {(top) => (
            <div class="bg-surface border border-border border-l-2 border-l-warning rounded-lg px-4 py-3">
              <p class="text-[10px] font-semibold uppercase tracking-widest text-warning mb-2">Top Event</p>
              <p class="text-xs text-content-muted leading-relaxed mb-3">{top().description}</p>
              <div class="flex items-center gap-2">
                <div class="flex-1 h-0.5 bg-border rounded-full overflow-hidden">
                  <div
                    class="h-full bg-warning transition-all duration-500"
                    style={`width: ${Math.min(100, top().score)}%`}
                  />
                </div>
                <span class="text-xs font-semibold text-content tabular-nums">{Math.round(top().score)}</span>
              </div>
            </div>
          )}
        </Show>
      </div>
    </div>
  );
}

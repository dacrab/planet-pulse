import { Show } from 'solid-js';
import { useStore } from '../stores/context';

export function InsightsPanel() {
  const store = useStore();
  const insights = store.insights;

  return (
    <div class="insights-panel">
      <h3 style="font-size: 0.875rem; font-weight: 600; color: var(--text-primary); margin-bottom: 1rem;">
        🧠 Intelligence
      </h3>

      <div style="display: flex; flex-direction: column; gap: 0.875rem;">
        {/* What's Happening */}
        <div class="insight-card" style="border-left: 3px solid var(--accent-primary);">
          <div style="font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent-primary); margin-bottom: 0.5rem; font-weight: 600;">
            Right Now
          </div>
          <p style="font-size: 0.8125rem; line-height: 1.5; color: var(--text-secondary);">
            {insights.whatsHappeningNow()}
          </p>
        </div>

        {/* Activity Trend */}
        <div class="insight-card">
          <div style="font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-tertiary); margin-bottom: 0.5rem; font-weight: 600;">
            Trend
          </div>
          <div style="display: flex; align-items: center; gap: 0.625rem;">
            <span style="font-size: 1.5rem;">
              {insights.activityTrend().trend === 'increasing' ? '📈' : 
               insights.activityTrend().trend === 'decreasing' ? '📉' : '➡️'}
            </span>
            <div>
              <div style="font-size: 0.875rem; font-weight: 500; color: var(--text-primary);">
                {insights.activityTrend().trend === 'stable' ? 'Stable' :
                 insights.activityTrend().trend === 'increasing' ? 'Rising' : 'Declining'}
              </div>
              <div style="font-size: 0.75rem; color: var(--text-tertiary);">
                {Math.abs(insights.activityTrend().change).toFixed(0)}% vs 15min ago
              </div>
            </div>
          </div>
        </div>

        {/* Top Event */}
        <Show when={insights.topEvent()}>
          {(top) => (
            <div class="insight-card" style="border-left: 3px solid var(--warning);">
              <div style="font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--warning); margin-bottom: 0.5rem; font-weight: 600;">
                Event of the Hour
              </div>
              <p style="font-size: 0.8125rem; line-height: 1.5; color: var(--text-secondary); margin-bottom: 0.625rem;">
                {top().description}
              </p>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 0.6875rem; color: var(--text-tertiary);">Impact:</span>
                <div style="flex: 1; height: 4px; background: var(--bg-sidebar); border-radius: 2px; overflow: hidden;">
                  <div 
                    style={`width: ${Math.min(100, top().score)}%; height: 100%; background: linear-gradient(90deg, var(--warning), var(--danger)); transition: width 0.3s ease;`}
                  />
                </div>
                <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-primary);">
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

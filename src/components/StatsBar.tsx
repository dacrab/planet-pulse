import { Component, Index } from 'solid-js';
import { useStore } from '../stores/context';
import { eventColors } from '../utils/colors';

export const StatsBar: Component = () => {
  const store = useStore();
  const stats = () => store.aggregator.stats();

  const sourceData = () => {
    const s = stats();
    return [
      { label: 'Earthquakes', count: s.bySource.earthquake, color: eventColors.earthquake },
      { label: 'News', count: s.bySource.news, color: eventColors.news },
      { label: 'Space', count: s.bySource.space, color: eventColors.space },
      { label: 'Weather', count: s.bySource.weather, color: eventColors.weather },
      { label: 'Crypto', count: s.bySource.crypto, color: eventColors.crypto },
      { label: 'Sports', count: s.bySource.sports, color: eventColors.sports },
    ];
  };

  return (
    <div class="flex items-center gap-6 px-6 py-4 bg-card border border-border rounded-xl overflow-x-auto">
      <Index each={sourceData()}>
        {(item) => (
          <div class="flex items-center gap-2 whitespace-nowrap">
            <div class={`w-2 h-2 rounded-full ${item().color.bg}`} />
            <span class={`text-lg font-semibold tabular-nums ${item().color.text}`}>{item().count}</span>
            <span class="text-xs text-content-muted">{item().label}</span>
          </div>
        )}
      </Index>
    </div>
  );
};

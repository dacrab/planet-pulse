import { createMemo } from 'solid-js';
import { useStore } from '../stores/context';
import { eventColors } from '../utils/colors';

export const StatsBar = () => {
  const { aggregator } = useStore();
  const sourceData = createMemo(() => {
    const s = aggregator.stats().bySource;
    return [
      { label: 'Earthquakes', count: s.earthquake, color: eventColors.earthquake },
      { label: 'News',        count: s.news,       color: eventColors.news },
      { label: 'Space',       count: s.space,      color: eventColors.space },
      { label: 'Weather',     count: s.weather,    color: eventColors.weather },
      { label: 'Crypto',      count: s.crypto,     color: eventColors.crypto },
      { label: 'Sports',      count: s.sports,     color: eventColors.sports },
    ];
  });

  return (
    <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {sourceData().map(item => (
        <div class="bg-card border border-border rounded-xl px-4 py-3 flex flex-col gap-1">
          <div class={`text-xl font-bold tabular-nums ${item.color.text}`}>{item.count}</div>
          <div class="text-xs text-content-subtle">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

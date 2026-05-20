import { createMemo } from 'solid-js';
import { useStore } from '../stores/context';
import { eventColors } from '../utils/colors';

export const StatsBar = () => {
  const { aggregator } = useStore();
  const sources = createMemo(() => {
    const s = aggregator.stats().bySource;
    return [
      { key: 'earthquake', count: s.earthquake, color: eventColors.earthquake },
      { key: 'news',       count: s.news,       color: eventColors.news },
      { key: 'space',      count: s.space,      color: eventColors.space },
      { key: 'weather',    count: s.weather,    color: eventColors.weather },
      { key: 'crypto',     count: s.crypto,     color: eventColors.crypto },
      { key: 'sports',     count: s.sports,     color: eventColors.sports },
    ];
  });

  return (
    <div class="hidden sm:flex items-center gap-3">
      {sources().map(s => (
        <div class="flex items-center gap-1.5">
          <div class={`w-1.5 h-1.5 rounded-full ${s.color.bg}`} />
          <span class={`text-xs font-medium tabular-nums ${s.count > 0 ? 'text-content' : 'text-content-subtle'}`}>
            {s.count}
          </span>
        </div>
      ))}
    </div>
  );
};

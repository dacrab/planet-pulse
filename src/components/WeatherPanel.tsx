import { Index, Show } from 'solid-js';
import { createMemo } from 'solid-js';
import { useStore } from '../stores/context';
import { WeatherEvent } from '../types/events';

const conditionIcon: Record<string, string> = {
  Clear: '☀️', Cloudy: '☁️', Rainy: '🌧️', Snowy: '❄️', Stormy: '⛈️',
};

export function WeatherPanel() {
  const { aggregator } = useStore();
  const cities = createMemo(() =>
    aggregator.allEvents().filter(e => e.source === 'weather') as WeatherEvent[]
  );

  return (
    <Show when={cities().length > 0}>
      <div class="p-5 border-b border-border">
        <p class="text-xs font-semibold text-content-muted uppercase tracking-widest mb-3">Weather</p>
        <div class="grid grid-cols-2 gap-2">
          <Index each={cities()}>
            {(city) => (
              <div class="bg-surface rounded-lg px-3 py-2.5 border border-border">
                <p class="text-[11px] text-content-muted mb-1">{city().location}</p>
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-content">{city().temperature.toFixed(0)}°C</span>
                  <span class="text-base leading-none">{conditionIcon[city().condition] ?? '🌡️'}</span>
                </div>
              </div>
            )}
          </Index>
        </div>
      </div>
    </Show>
  );
}

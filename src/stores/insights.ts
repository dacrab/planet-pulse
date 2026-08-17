import { createMemo, Accessor } from 'solid-js';
import { Event } from '../types/events';
import { getRecentEvents, calculateEventScore } from '../utils/formatters';

export function createInsightsStore(allEvents: Accessor<Event[]>) {
  const topEvent = createMemo(() => {
    const recent = getRecentEvents(allEvents(), 60);
    if (!recent.length) return null;

    const best = recent.reduce((max, e) => {
      const s = calculateEventScore(e);
      return s > max.score ? { event: e, score: s } : max;
    }, { event: recent[0], score: calculateEventScore(recent[0]) });

    const { event } = best;
    let description = '';
    if (event.source === 'earthquake') {
      description = `M${event.magnitude} earthquake in ${event.place}`;
    } else if (event.source === 'crypto') {
      description = `${event.symbol} ${event.change_24h > 0 ? 'up' : 'down'} ${Math.abs(event.change_24h).toFixed(1)}% in 24h`;
    } else if (event.source === 'news') {
      description = event.title;
    } else if (event.source === 'space') {
      description = `ISS at ${event.altitude.toLocaleString()} km altitude, ${event.velocity.toLocaleString()} km/h`;
    } else if (event.source === 'weather') {
      description = `${event.condition} in ${event.location} at ${event.temperature.toFixed(0)}°C`;
    } else if (event.source === 'sports') {
      description = `${event.home_team} vs ${event.away_team} (${event.league})`;
    }

    return { event, description, score: best.score };
  });

  return { topEvent };
}

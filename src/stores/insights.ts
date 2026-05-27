import { createMemo, Accessor } from 'solid-js';
import { Event, EarthquakeEvent, CryptoEvent, NewsEvent } from '../types/events';
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
      const eq = event as EarthquakeEvent;
      description = `M${eq.magnitude} earthquake in ${eq.place}`;
    } else if (event.source === 'crypto') {
      const c = event as CryptoEvent;
      description = `${c.symbol} ${c.change_24h > 0 ? 'up' : 'down'} ${Math.abs(c.change_24h).toFixed(1)}% in 24h`;
    } else if (event.source === 'news') {
      description = (event as NewsEvent).title;
    }

    return { event, description, score: best.score };
  });

  return { topEvent };
}

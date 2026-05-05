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

    if (best.score === 0) return null;

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

  const trend = createMemo(() => {
    const now = Date.now();
    const last15 = allEvents().filter(e => e.timestamp > now - 15 * 60_000).length;
    const prev15 = allEvents().filter(e => e.timestamp > now - 30 * 60_000 && e.timestamp <= now - 15 * 60_000).length;
    // On cold start prev15 is 0; fall back to comparing against total as baseline
    const baseline = prev15 || allEvents().length;
    if (!baseline) return { trend: 'stable', change: 0 };
    const change = ((last15 - (prev15 || last15)) / baseline) * 100;
    return { trend: change > 20 ? 'increasing' : change < -20 ? 'decreasing' : 'stable', change };
  });

  return { topEvent, trend };
}

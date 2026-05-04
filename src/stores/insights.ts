import { createMemo, Accessor } from 'solid-js';
import { Event, EarthquakeEvent, CryptoEvent, NewsEvent } from '../types/events';
import { getRecentEvents, calculateEventScore } from '../utils/formatters';

export function createInsightsStore(allEvents: Accessor<Event[]>) {
  
  const statusSummary = createMemo(() => {
    const recent = getRecentEvents(allEvents(), 15);
    if (recent.length === 0) return "Quiet period - monitoring all sources...";

    const bySource = recent.reduce((acc, e) => {
      acc[e.source] = (acc[e.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const parts: string[] = [];
    
    if (bySource.earthquake) {
      const quakes = recent.filter(e => e.source === 'earthquake') as EarthquakeEvent[];
      const maxMag = Math.max(...quakes.map(q => q.magnitude));
      parts.push(`${bySource.earthquake} earthquake${bySource.earthquake > 1 ? 's' : ''} (max M${maxMag.toFixed(1)})`);
    }
    
    if (bySource.flight) parts.push(`${bySource.flight} news articles`);
    
    if (bySource.crypto) {
      const cryptos = recent.filter(e => e.source === 'crypto') as CryptoEvent[];
      const volatile = cryptos.filter(c => Math.abs(c.change_24h) > 3).length;
      parts.push(volatile > 0 ? `${volatile} volatile crypto assets` : `${bySource.crypto} crypto updates`);
    }

    if (bySource.github) parts.push(`${bySource.github} GitHub events`);

    return parts.length > 0 ? parts.join(' • ') : "Monitoring global activity...";
  });

  const topEvent = createMemo(() => {
    const recent = getRecentEvents(allEvents(), 60);
    if (recent.length === 0) return null;

    const scored = recent.map(event => ({ event, score: calculateEventScore(event) }));
    const best = scored.reduce((max, curr) => curr.score > max.score ? curr : max, scored[0]);
    
    if (!best || best.score === 0) return null;

    let description = '';
    const { event } = best;
    
    if (event.source === 'earthquake') {
      const eq = event as EarthquakeEvent;
      description = `M${eq.magnitude} earthquake in ${eq.place}`;
    } else if (event.source === 'crypto') {
      const crypto = event as CryptoEvent;
      const dir = crypto.change_24h > 0 ? 'up' : 'down';
      description = `${crypto.symbol} ${dir} ${Math.abs(crypto.change_24h).toFixed(1)}% in 24h`;
    } else if (event.source === 'news') {
      description = (event as NewsEvent).title;
    }

    return { event, description, score: best.score };
  });

  const trend = createMemo(() => {
    const now = Date.now();
    const last15 = allEvents().filter(e => e.timestamp > now - 15 * 60 * 1000).length;
    const prev15 = allEvents().filter(e => e.timestamp > now - 30 * 60 * 1000 && e.timestamp <= now - 15 * 60 * 1000).length;

    if (prev15 === 0) return { trend: 'stable', change: 0 };

    const change = ((last15 - prev15) / prev15) * 100;
    
    if (change > 20) return { trend: 'increasing', change };
    if (change < -20) return { trend: 'decreasing', change };
    return { trend: 'stable', change };
  });

  return { statusSummary, topEvent, trend };
}

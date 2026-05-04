import { createMemo, Accessor } from 'solid-js';
import { Event, EarthquakeEvent, CryptoEvent, FlightEvent } from '../types/events';

export function createInsightsStore(allEvents: Accessor<Event[]>) {
  
  const whatsHappeningNow = createMemo(() => {
    const events = allEvents();
    const recentThreshold = Date.now() - 15 * 60 * 1000; // 15 min
    const recent = events.filter(e => e.timestamp > recentThreshold);

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
    
    if (bySource.flight) {
      parts.push(`${bySource.flight} flights tracked`);
    }
    
    if (bySource.crypto) {
      const cryptos = recent.filter(e => e.source === 'crypto') as CryptoEvent[];
      const volatile = cryptos.filter(c => Math.abs(c.change_24h) > 3).length;
      if (volatile > 0) {
        parts.push(`${volatile} volatile crypto assets`);
      } else {
        parts.push(`${bySource.crypto} crypto updates`);
      }
    }

    if (bySource.github) {
      parts.push(`${bySource.github} GitHub events`);
    }

    return parts.length > 0 ? parts.join(' • ') : "Monitoring global activity...";
  });

  const topEvent = createMemo(() => {
    const events = allEvents();
    const recentThreshold = Date.now() - 60 * 60 * 1000; // 1 hour
    const recent = events.filter(e => e.timestamp > recentThreshold);

    if (recent.length === 0) return null;

    // Find most significant event
    let topEvent: Event | null = null;
    let topScore = 0;

    recent.forEach(event => {
      let score = 0;
      
      if (event.source === 'earthquake') {
        const eq = event as EarthquakeEvent;
        score = eq.magnitude * 15;
      } else if (event.source === 'crypto') {
        const crypto = event as CryptoEvent;
        score = Math.abs(crypto.change_24h) * 8;
      } else if (event.source === 'flight') {
        const flight = event as FlightEvent;
        score = flight.velocity > 800 ? 40 : 20;
      }

      if (score > topScore) {
        topScore = score;
        topEvent = event;
      }
    });

    if (!topEvent) return null;

    let description = '';
    if (topEvent.source === 'earthquake') {
      const eq = topEvent as EarthquakeEvent;
      description = `M${eq.magnitude} earthquake in ${eq.place}`;
    } else if (topEvent.source === 'crypto') {
      const crypto = topEvent as CryptoEvent;
      const direction = crypto.change_24h > 0 ? 'up' : 'down';
      description = `${crypto.symbol} ${direction} ${Math.abs(crypto.change_24h).toFixed(1)}% in 24h`;
    } else if (topEvent.source === 'flight') {
      const flight = topEvent as FlightEvent;
      description = `${flight.callsign} flying at ${flight.velocity.toFixed(0)} km/h`;
    }

    return { event: topEvent, description, score: topScore };
  });

  const activityTrend = createMemo(() => {
    const events = allEvents();
    const now = Date.now();
    const last15min = events.filter(e => e.timestamp > now - 15 * 60 * 1000).length;
    const prev15min = events.filter(e => 
      e.timestamp > now - 30 * 60 * 1000 && e.timestamp <= now - 15 * 60 * 1000
    ).length;

    if (prev15min === 0) return { trend: 'stable', change: 0 };

    const change = ((last15min - prev15min) / prev15min) * 100;
    
    if (change > 20) return { trend: 'increasing', change };
    if (change < -20) return { trend: 'decreasing', change };
    return { trend: 'stable', change };
  });

  return {
    whatsHappeningNow,
    topEvent,
    activityTrend,
  };
}

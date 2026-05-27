import { createMemo, createSignal, Accessor } from 'solid-js';
import { Event, EarthquakeEvent, WeatherEvent, CryptoEvent } from '../types/events';
import { Alert, Correlation } from '../types/intelligence';
import { calculateDistance, getRecentEvents } from '../utils/formatters';

export function createIntelligenceStore(allEvents: Accessor<Event[]>) {
  const [dismissed, setDismissed] = createSignal(new Set<string>());

  // Correlate earthquakes with nearby weather stations (both have lat/lon)
  const geoCorrelations = createMemo<Correlation[]>(() => {
    const quakes = getRecentEvents(allEvents().filter(e => e.source === 'earthquake') as EarthquakeEvent[], 60)
      .filter(eq => eq.magnitude >= 4.0);
    const weather = getRecentEvents(allEvents().filter(e => e.source === 'weather') as WeatherEvent[], 60);

    return quakes.flatMap(eq => {
      const nearby = weather.filter(w => calculateDistance(eq.lat, eq.lon, w.lat, w.lon) < 1000);
      if (!nearby.length) return [];
      return [{
        id: `geo-${eq.id}`,
        type: 'geographic' as const,
        events: [eq, ...nearby],
        significance: Math.min(100, eq.magnitude * 15 + nearby.length * 5),
        description: `M${eq.magnitude.toFixed(1)} quake near ${nearby.map(w => w.location).join(', ')}`,
        timestamp: Date.now(),
      }];
    });
  });

  const activeAlerts = createMemo<Alert[]>(() => {
    const alerts: Alert[] = [];

    for (const corr of geoCorrelations()) {
      if (dismissed().has(corr.id) || corr.significance <= 40) continue;
      alerts.push({
        id: corr.id,
        tier: corr.significance > 70 ? 'action' : 'watch',
        title: 'Seismic Activity Near Monitored City',
        message: corr.description,
        timestamp: corr.timestamp,
        events: corr.events,
      });
    }

    const recent = getRecentEvents(allEvents().filter(e => e.source === 'crypto') as CryptoEvent[], 60);
    if (recent.length >= 5) {
      const avgChange = recent.reduce((s, e) => s + Math.abs(e.change_24h), 0) / recent.length;
      const volatile = recent.filter(e => Math.abs(e.change_24h) > 5).length;
      const score = Math.min(100, avgChange * 20 + volatile * 10);
      const volId = 'crypto-vol';
      if (score > 60 && !dismissed().has(volId)) {
        alerts.push({
          id: volId,
          tier: score > 80 ? 'action' : 'watch',
          title: 'High Crypto Volatility',
          message: `${volatile} coins moving >5%, avg change ${avgChange.toFixed(1)}%`,
          timestamp: Date.now(),
          events: [],
        });
      }
    }

    return alerts;
  });

  return {
    geoCorrelations,
    activeAlerts,
    dismissAlert: (id: string) => setDismissed(prev => new Set([...prev, id])),
  };
}

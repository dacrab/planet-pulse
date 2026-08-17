import { createMemo, createSignal, Accessor } from 'solid-js';
import { Event, EarthquakeEvent, WeatherEvent, CryptoEvent } from '../types/events';
import { Alert, Correlation } from '../types/intelligence';
import { calculateDistance, getRecentEvents } from '../utils/formatters';

const MIN_QUAKE_MAGNITUDE = 4.0;
const PROXIMITY_KM = 1000;
const MAG_SIGNIFICANCE_FACTOR = 15;
const NEARBY_WEATHER_BONUS = 5;
const ALERT_MIN_SIGNIFICANCE = 40;
const ACTION_TIER_THRESHOLD = 70;
const AVG_CHANGE_FACTOR = 20;
const VOLATILE_FACTOR = 10;
const VOLATILE_COIN_THRESHOLD_PCT = 5;
const VOLATILITY_MIN_SCORE = 60;
const VOLATILITY_ACTION_THRESHOLD = 80;

const isEarthquake = (e: Event): e is EarthquakeEvent => e.source === 'earthquake';
const isWeather = (e: Event): e is WeatherEvent => e.source === 'weather';
const isCrypto = (e: Event): e is CryptoEvent => e.source === 'crypto';

export function createIntelligenceStore(allEvents: Accessor<Event[]>) {
  const [dismissed, setDismissed] = createSignal(new Set<string>());

  // Correlate earthquakes with nearby weather stations (both have lat/lon)
  const geoCorrelations = createMemo<Correlation[]>(() => {
    const quakes = getRecentEvents(allEvents().filter(isEarthquake), 60)
      .filter(eq => eq.magnitude >= MIN_QUAKE_MAGNITUDE);
    const weather = getRecentEvents(allEvents().filter(isWeather), 60);

    return quakes.flatMap(eq => {
      const nearby = weather.filter(w => calculateDistance(eq.lat, eq.lon, w.lat, w.lon) < PROXIMITY_KM);
      if (!nearby.length) return [];
      return [{
        id: `geo-${eq.id}`,
        type: 'geographic' as const,
        events: [eq, ...nearby],
        significance: Math.min(100, eq.magnitude * MAG_SIGNIFICANCE_FACTOR + nearby.length * NEARBY_WEATHER_BONUS),
        description: `M${eq.magnitude.toFixed(1)} quake near ${nearby.map(w => w.location).join(', ')}`,
        timestamp: Date.now(),
      }];
    });
  });

  const activeAlerts = createMemo<Alert[]>(() => {
    const alerts: Alert[] = [];

    for (const corr of geoCorrelations()) {
      if (dismissed().has(corr.id) || corr.significance <= ALERT_MIN_SIGNIFICANCE) continue;
      alerts.push({
        id: corr.id,
        tier: corr.significance > ACTION_TIER_THRESHOLD ? 'action' : 'watch',
        title: 'Seismic Activity Near Monitored City',
        message: corr.description,
        timestamp: corr.timestamp,
        events: corr.events,
      });
    }

    const recent = getRecentEvents(allEvents().filter(isCrypto), 60);
    if (recent.length >= 5) {
      const avgChange = recent.reduce((s, e) => s + Math.abs(e.change_24h), 0) / recent.length;
      const volatile = recent.filter(e => Math.abs(e.change_24h) > VOLATILE_COIN_THRESHOLD_PCT).length;
      const score = Math.min(100, avgChange * AVG_CHANGE_FACTOR + volatile * VOLATILE_FACTOR);
      const volId = 'crypto-vol';
      if (score > VOLATILITY_MIN_SCORE && !dismissed().has(volId)) {
        alerts.push({
          id: volId,
          tier: score > VOLATILITY_ACTION_THRESHOLD ? 'action' : 'watch',
          title: 'High Crypto Volatility',
          message: `${volatile} coins moving >${VOLATILE_COIN_THRESHOLD_PCT}%, avg change ${avgChange.toFixed(1)}%`,
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

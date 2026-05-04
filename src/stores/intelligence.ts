import { createMemo, Accessor } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Event, EarthquakeEvent, SpaceEvent, CryptoEvent } from '../types/events';
import { Alert, Correlation, AnomalyScore, AlertTier } from '../types/intelligence';
import { calculateDistance, getRecentEvents, calculateEventScore } from '../utils/formatters';

export function createIntelligenceStore(allEvents: Accessor<Event[]>) {
  const [dismissedAlertIds, setDismissedAlertIds] = createStore<Set<string>>(new Set());

  const geoCorrelations = createMemo<Correlation[]>(() => {
    const recentQuakes = getRecentEvents(
      allEvents().filter(e => e.source === 'earthquake') as EarthquakeEvent[],
      30
    ).filter(eq => eq.magnitude >= 4.5);
    
    const recentFlights = getRecentEvents(
      allEvents().filter(e => e.source === 'space') as SpaceEvent[],
      30
    );

    return recentQuakes.flatMap(eq => {
      const nearby = recentFlights.filter(f => calculateDistance(eq.lat, eq.lon, f.lat, f.lon) < 200);
      if (nearby.length === 0) return [];

      return [{
        id: `geo-${eq.id}`,
        type: 'geographic' as const,
        events: [eq, ...nearby.slice(0, 5)],
        significance: Math.min(100, eq.magnitude * 15 + nearby.length * 2),
        description: `M${eq.magnitude} earthquake near ${nearby.length} active flights`,
        timestamp: Date.now(),
      }];
    });
  });

  const cryptoVolatility = createMemo<AnomalyScore | null>(() => {
    const recent = getRecentEvents(
      allEvents().filter(e => e.source === 'crypto') as CryptoEvent[],
      60
    );

    if (recent.length < 5) return null;

    const avgChange = recent.reduce((sum, e) => sum + Math.abs(e.change_24h), 0) / recent.length;
    const volatile = recent.filter(e => Math.abs(e.change_24h) > 5).length;

    if (avgChange > 3 || volatile > 3) {
      return {
        source: 'crypto',
        score: Math.min(100, avgChange * 20 + volatile * 10),
        reason: `High volatility: ${volatile} coins moving >5%, avg change ${avgChange.toFixed(1)}%`,
        timestamp: Date.now(),
      };
    }
    return null;
  });

  const topEvents = createMemo(() => {
    return getRecentEvents(allEvents(), 60)
      .map(event => ({ event, score: calculateEventScore(event) }))
      .filter(({ score }) => score > 60)
      .sort((a, b) => b.score - a.score);
  });

  const activeAlerts = createMemo<Alert[]>(() => {
    const alerts: Alert[] = [];
    
    geoCorrelations().forEach(corr => {
      if (dismissedAlertIds.has(corr.id)) return;
      
      if (corr.significance > 70) {
        alerts.push({
          id: corr.id,
          tier: 'action',
          title: 'Seismic Activity Near Flights',
          message: corr.description,
          timestamp: corr.timestamp,
          events: corr.events,
          dismissed: false,
          correlationType: 'geographic',
        });
      } else if (corr.significance > 50) {
        alerts.push({
          id: corr.id,
          tier: 'watch',
          title: 'Earthquake Near Flight Path',
          message: corr.description,
          timestamp: corr.timestamp,
          events: corr.events,
          dismissed: false,
          correlationType: 'geographic',
        });
      }
    });

    const vol = cryptoVolatility();
    if (vol && vol.score > 60 && !dismissedAlertIds.has(`crypto-vol-${Math.floor(Date.now() / 60000)}`)) {
      alerts.push({
        id: `crypto-vol-${Math.floor(Date.now() / 60000)}`,
        tier: vol.score > 80 ? 'action' : 'watch',
        title: 'High Crypto Volatility',
        message: vol.reason,
        timestamp: vol.timestamp,
        events: [],
        dismissed: false,
        correlationType: 'pattern',
      });
    }

    return alerts;
  });

  return {
    geoCorrelations,
    cryptoVolatility,
    topEvents,
    activeAlerts,
    dismissAlert: (id: string) => setDismissedAlertIds(prev => new Set([...prev, id])),
  };
}

import { createMemo, Accessor } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Event, EarthquakeEvent, FlightEvent, CryptoEvent } from '../types/events';
import { Alert, Correlation, AnomalyScore, AlertTier } from '../types/intelligence';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function createIntelligenceStore(allEvents: Accessor<Event[]>) {
  const [alerts, setAlerts] = createStore<Alert[]>([]);
  const [dismissedAlertIds, setDismissedAlertIds] = createStore<Set<string>>(new Set());

  // Geographic correlations: earthquakes near flights
  const geographicCorrelations = createMemo<Correlation[]>(() => {
    const events = allEvents();
    const correlations: Correlation[] = [];
    const recentThreshold = Date.now() - 30 * 60 * 1000; // 30 min
    
    const recentEarthquakes = events.filter(e => 
      e.source === 'earthquake' && e.timestamp > recentThreshold
    ) as EarthquakeEvent[];
    
    const recentFlights = events.filter(e => 
      e.source === 'flight' && e.timestamp > recentThreshold
    ) as FlightEvent[];

    recentEarthquakes.forEach(eq => {
      if (eq.magnitude < 4.5) return;
      
      const nearbyFlights = recentFlights.filter(flight => 
        calculateDistance(eq.lat, eq.lon, flight.lat, flight.lon) < 200
      );

      if (nearbyFlights.length > 0) {
        correlations.push({
          id: `geo-${eq.id}`,
          type: 'geographic',
          events: [eq, ...nearbyFlights.slice(0, 5)],
          significance: Math.min(100, eq.magnitude * 15 + nearbyFlights.length * 2),
          description: `M${eq.magnitude} earthquake near ${nearbyFlights.length} active flights`,
          timestamp: Date.now(),
        });
      }
    });

    return correlations;
  });

  // Crypto volatility detection
  const cryptoVolatility = createMemo<AnomalyScore | null>(() => {
    const events = allEvents();
    const recentCrypto = events.filter(e => 
      e.source === 'crypto' && e.timestamp > Date.now() - 60 * 60 * 1000
    ) as CryptoEvent[];

    if (recentCrypto.length < 5) return null;

    const avgChange = recentCrypto.reduce((sum, e) => sum + Math.abs(e.change_24h), 0) / recentCrypto.length;
    const volatileCoins = recentCrypto.filter(e => Math.abs(e.change_24h) > 5).length;

    if (avgChange > 3 || volatileCoins > 3) {
      return {
        source: 'crypto',
        score: Math.min(100, avgChange * 20 + volatileCoins * 10),
        reason: `High volatility: ${volatileCoins} coins moving >5%, avg change ${avgChange.toFixed(1)}%`,
        timestamp: Date.now(),
      };
    }
    return null;
  });

  // Event significance scoring
  const significantEvents = createMemo(() => {
    const events = allEvents();
    const recentThreshold = Date.now() - 60 * 60 * 1000;
    
    return events
      .filter(e => e.timestamp > recentThreshold)
      .map(event => {
        let score = 50; // base score
        
        if (event.source === 'earthquake') {
          const eq = event as EarthquakeEvent;
          score = Math.min(100, eq.magnitude * 15);
        } else if (event.source === 'crypto') {
          const crypto = event as CryptoEvent;
          score = Math.min(100, Math.abs(crypto.change_24h) * 10);
        } else if (event.source === 'flight') {
          score = 30; // flights are common
        }
        
        return { event, score };
      })
      .filter(({ score }) => score > 60)
      .sort((a, b) => b.score - a.score);
  });

  // Generate alerts from correlations
  const activeAlerts = createMemo<Alert[]>(() => {
    const newAlerts: Alert[] = [];
    const correlations = geographicCorrelations();
    const volatility = cryptoVolatility();

    correlations.forEach(corr => {
      if (corr.significance > 70 && !dismissedAlertIds.has(corr.id)) {
        newAlerts.push({
          id: corr.id,
          tier: 'action' as AlertTier,
          title: '⚠️ Seismic Activity Near Flights',
          message: corr.description,
          timestamp: corr.timestamp,
          events: corr.events,
          dismissed: false,
          correlationType: 'geographic',
        });
      } else if (corr.significance > 50 && !dismissedAlertIds.has(corr.id)) {
        newAlerts.push({
          id: corr.id,
          tier: 'watch' as AlertTier,
          title: '👀 Earthquake Near Flight Path',
          message: corr.description,
          timestamp: corr.timestamp,
          events: corr.events,
          dismissed: false,
          correlationType: 'geographic',
        });
      }
    });

    if (volatility && volatility.score > 60 && !dismissedAlertIds.has(`crypto-vol-${Date.now()}`)) {
      newAlerts.push({
        id: `crypto-vol-${Math.floor(Date.now() / 60000)}`,
        tier: volatility.score > 80 ? 'action' : 'watch',
        title: '📈 High Crypto Volatility',
        message: volatility.reason,
        timestamp: volatility.timestamp,
        events: [],
        dismissed: false,
        correlationType: 'pattern',
      });
    }

    return newAlerts;
  });

  const dismissAlert = (id: string) => {
    setDismissedAlertIds(prev => new Set([...prev, id]));
  };

  return {
    geographicCorrelations,
    cryptoVolatility,
    significantEvents,
    activeAlerts,
    dismissAlert,
  };
}

import type {
  Alert,
  BriefItem,
  Correlation,
  PulseEvent,
  SourceId,
} from '../types';
import {
  clamp,
  kickoffTime,
  percent,
  price,
  round,
  timeAgoLabel,
} from './format';

const EARTH_RADIUS_KM = 6_371;
const HOUR = 3_600_000;
const DAY = 86_400_000;

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const within = (event: PulseEvent, now: number, window: number) =>
  now - event.timestamp <= window;

export function detectCorrelations(
  events: PulseEvent[],
  now: number
): Correlation[] {
  const correlations: Correlation[] = [];
  const cities = events.filter(
    (event) =>
      event.source === 'weather' &&
      event.lat !== undefined &&
      event.lon !== undefined &&
      event.place
  );
  const recent = events.filter(
    (event) => within(event, now, 2 * HOUR) && event.timestamp <= now + 5 * 60_000
  );
  const day = events.filter(
    (event) => within(event, now, DAY) && event.timestamp <= now + 5 * 60_000
  );

  // Seismic activity near a monitored city over the feed's 24-hour window.
  const quakes = day.filter(
    (event) =>
      event.source === 'earthquake' &&
      (event.value ?? 0) >= 3.5 &&
      event.lat !== undefined &&
      event.lon !== undefined
  );

  for (const quake of quakes) {
    let nearest: { city: PulseEvent; distance: number } | undefined;

    for (const city of cities) {
      const distance = haversineKm(
        quake.lat!,
        quake.lon!,
        city.lat!,
        city.lon!
      );
      if (!nearest || distance < nearest.distance) {
        nearest = { city, distance };
      }
    }

    if (!nearest || nearest.distance > 1_500) continue;

    const proximity = 1 - nearest.distance / 1_500;
    const significance = clamp((quake.value ?? 0) * 14 + proximity * 30, 0, 99);

    correlations.push({
      id: `seismic:${quake.id}:${nearest.city.id}`,
      kind: 'seismic',
      title: `Seismic activity near ${nearest.city.place}`,
      description: `M${(quake.value ?? 0).toFixed(1)} quake ${round(
        nearest.distance
      )} km from ${nearest.city.place}. ${quake.subtitle}.`,
      significance,
      timestamp: quake.timestamp,
      eventIds: [quake.id, nearest.city.id],
      sourceIds: ['earthquake', 'weather'],
    });
  }

  // Broad volatility across the market feed.
  const coins = recent.filter(
    (event) => event.source === 'crypto' && event.delta !== undefined
  );
  const volatile = coins.filter((event) => Math.abs(event.delta!) >= 4);

  if (volatile.length >= 4) {
    const average =
      volatile.reduce((sum, event) => sum + Math.abs(event.delta!), 0) /
      volatile.length;
    const significance = clamp(volatile.length * 7 + average * 5, 0, 99);

    correlations.push({
      id: `market:${Math.floor(now / HOUR)}`,
      kind: 'market',
      title: 'Volatility across digital assets',
      description: `${volatile.length} assets are moving more than 4% in 24h, averaging ${average.toFixed(
        1
      )}% absolute movement.`,
      significance,
      timestamp: Math.max(...volatile.map((event) => event.timestamp)),
      eventIds: volatile.slice(0, 6).map((event) => event.id),
      sourceIds: ['crypto'],
    });
  }

  // The ISS passing near a monitored city.
  const iss = events.find((event) => event.source === 'space');
  if (iss?.lat !== undefined && iss.lon !== undefined) {
    for (const city of cities) {
      const distance = haversineKm(iss.lat, iss.lon, city.lat!, city.lon!);
      if (distance > 1_000) continue;

      correlations.push({
        id: `orbit:${city.id}`,
        kind: 'orbit',
        title: `ISS overhead ${city.place}`,
        description: `The station is ${round(
          distance
        )} km from ${city.place} at ${round(iss.value ?? 0)} km altitude.`,
        significance: clamp(58 + (1 - distance / 1_000) * 34, 0, 99),
        timestamp: iss.timestamp,
        eventIds: [iss.id, city.id],
        sourceIds: ['space', 'weather'],
      });
    }
  }

  // Keep the strongest correlation per situation rather than listing every
  // quake that happens to share the same nearby city.
  const distinct = new Map<string, Correlation>();
  for (const correlation of correlations) {
    const current = distinct.get(correlation.title);
    if (!current || correlation.significance > current.significance) {
      distinct.set(correlation.title, correlation);
    }
  }

  return [...distinct.values()]
    .sort((a, b) => b.significance - a.significance)
    .slice(0, 6);
}

export function toAlerts(correlations: Correlation[]): Alert[] {
  return correlations
    .filter((correlation) => correlation.significance >= 55)
    .map((correlation) => ({
      ...correlation,
      tier: correlation.significance >= 75 ? 'action' : 'watch',
    }));
}

export function topSignal(events: PulseEvent[], now: number): PulseEvent | null {
  const candidates = events.filter(
    (event) => event.timestamp <= now + 5 * 60_000 && within(event, now, 2 * HOUR)
  );
  if (!candidates.length) return null;

  return candidates.reduce((best, event) => {
    if (event.score !== best.score) return event.score > best.score ? event : best;
    return event.timestamp > best.timestamp ? event : best;
  });
}

export function buildBrief(events: PulseEvent[], now: number): BriefItem[] {
  const items: BriefItem[] = [];
  const day = events.filter(
    (event) =>
      event.timestamp <= now + 5 * 60_000 && within(event, now, DAY)
  );

  const biggestQuake = day
    .filter((event) => event.source === 'earthquake')
    .reduce<PulseEvent | null>(
      (best, event) => (!best || (event.value ?? 0) > (best.value ?? 0) ? event : best),
      null
    );

  if (biggestQuake) {
    items.push({
      label: 'Largest quake',
      value: `M${(biggestQuake.value ?? 0).toFixed(1)}`,
      detail: `${biggestQuake.place ?? biggestQuake.subtitle} · ${timeAgoLabel(
        biggestQuake.timestamp,
        now
      )}`,
      source: 'earthquake',
    });
  }

  const marketLeader = day
    .filter((event) => event.source === 'crypto')
    .reduce<PulseEvent | null>(
      (best, event) =>
        !best || Math.abs(event.delta ?? 0) > Math.abs(best.delta ?? 0) ? event : best,
      null
    );

  if (marketLeader) {
    items.push({
      label: 'Market mover',
      value: `${marketLeader.title.split(' · ')[0]} ${percent(
        marketLeader.delta ?? 0
      )}`,
      detail: `$${price(marketLeader.value ?? 0)} · 24h change`,
      source: 'crypto',
    });
  }

  const cities = day.filter(
    (event) => event.source === 'weather' && event.value !== undefined
  );
  const warmest = cities.reduce<PulseEvent | null>(
    (best, event) => (!best || event.value! > best.value! ? event : best),
    null
  );

  if (warmest) {
    items.push({
      label: 'Warmest city',
      value: `${warmest.place} ${Math.round(warmest.value!)}°`,
      detail: warmest.subtitle,
      source: 'weather',
    });
  }

  const nextFixture = day
    .filter((event) => event.source === 'sports')
    .sort((a, b) => a.timestamp - b.timestamp)
    .find((event) => event.timestamp >= now);

  if (nextFixture) {
    items.push({
      label: 'Next fixture',
      value: nextFixture.title,
      detail: `${nextFixture.subtitle} · ${kickoffTime(nextFixture.timestamp)}`,
      source: 'sports',
    });
  }

  if (!items.length) {
    const latest = events[0];
    if (latest) {
      items.push({
        label: 'Latest signal',
        value: latest.title,
        detail: latest.subtitle,
        source: latest.source,
      });
    }
  }

  return items.slice(0, 4);
}

export function sourceCounts(events: PulseEvent[]): Record<SourceId, number> {
  const counts: Record<SourceId, number> = {
    earthquake: 0,
    news: 0,
    space: 0,
    weather: 0,
    crypto: 0,
    sports: 0,
  };

  for (const event of events) counts[event.source] += 1;
  return counts;
}

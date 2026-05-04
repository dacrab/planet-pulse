export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getRecentEvents<T extends { timestamp: number }>(events: T[], minutes: number): T[] {
  const threshold = Date.now() - minutes * 60 * 1000;
  return events.filter(e => e.timestamp > threshold);
}

import { Event, EarthquakeEvent, CryptoEvent } from '../types/events';

export function calculateEventScore(event: Event): number {
  if (event.source === 'earthquake') {
    return Math.min(100, (event as EarthquakeEvent).magnitude * 15);
  }
  if (event.source === 'crypto') {
    return Math.min(100, Math.abs((event as CryptoEvent).change_24h) * 10);
  }
  if (event.source === 'news') return 30;
  return 20;
}

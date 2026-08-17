import { Event } from '../types/events';

export function formatTimestamp(timestamp: number, now = Date.now()): string {
  const diff = Math.max(0, now - timestamp);
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getRecentEvents<T extends { timestamp: number }>(events: T[], minutes: number): T[] {
  return events.filter(e => e.timestamp > Date.now() - minutes * 60_000);
}

export function calculateEventScore(event: Event): number {
  if (event.source === 'earthquake') return Math.min(100, event.magnitude * 15);
  if (event.source === 'crypto') return Math.min(100, Math.abs(event.change_24h) * 10);
  if (event.source === 'news') return 30;
  return 20;
}

import { API_CONFIG } from '../config/api';
import { SpaceEvent } from '../types/events';
import { fetchWithTimeout } from './base';

interface SpaceItem {
  timestamp: number;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
}

export async function fetchSpace(): Promise<SpaceEvent[]> {
  const res = await fetchWithTimeout(API_CONFIG.space.url);
  const data: SpaceItem = await res.json();
  return [{
    id: `iss-${Date.now()}`,
    source: 'space' as const,
    timestamp: data.timestamp * 1000,
    lat: data.latitude,
    lon: data.longitude,
    altitude: Math.round(data.altitude),
    velocity: Math.round(data.velocity),
  }];
}

import { SpaceEvent } from '../types/events';
import { fetchWithTimeout } from './base';

export async function fetchSpace(): Promise<SpaceEvent[]> {
  const res = await fetchWithTimeout('https://api.wheretheiss.at/v1/satellites/25544');
  const data = await res.json();
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

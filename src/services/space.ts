import { API_CONFIG } from '../config/api';
import { SpaceEvent } from '../types/events';
import { fetchWithTimeout } from './base';

export async function fetchSpace(): Promise<SpaceEvent[]> {
  try {
    const response = await fetchWithTimeout(API_CONFIG.space.url);
    const data = await response.json();

    return [{
      id: `iss-${Date.now()}`,
      source: 'space' as const,
      timestamp: data.timestamp * 1000,
      lat: parseFloat(data.iss_position.latitude),
      lon: parseFloat(data.iss_position.longitude),
      altitude: 408,
      velocity: 27600,
    }];
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch space data');
  }
}

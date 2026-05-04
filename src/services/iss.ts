import { API_CONFIG } from '../config/api';
import { ISSEvent } from '../types/events';
import { fetchWithTimeout, APIError } from './base';

export async function fetchISS(): Promise<ISSEvent[]> {
  try {
    const response = await fetchWithTimeout(API_CONFIG.iss.url);
    const data = await response.json();

    return [{
      id: `iss-${data.timestamp}`,
      source: 'iss' as const,
      timestamp: data.timestamp * 1000,
      lat: parseFloat(data.iss_position.latitude),
      lon: parseFloat(data.iss_position.longitude),
      altitude: 408, // ISS orbit altitude in km
      velocity: 7.66, // ISS orbital velocity in km/s
    }];
  } catch (error) {
    throw new APIError(
      error instanceof Error ? error.message : 'Failed to fetch ISS position',
      undefined,
      'iss'
    );
  }
}

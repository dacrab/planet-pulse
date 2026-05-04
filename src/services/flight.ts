import { API_CONFIG } from '../config/api';
import { FlightEvent } from '../types/events';
import { fetchWithTimeout, APIError } from './base';

export async function fetchFlights(): Promise<FlightEvent[]> {
  try {
    const response = await fetchWithTimeout(API_CONFIG.flight.url);
    const data = await response.json();

    if (!data.states) return [];

    return data.states
      .filter((state: any[]) => state[5] && state[6]) // has lat/lon
      .slice(0, 50) // limit to 50 flights
      .map((state: any[]) => ({
        id: state[0] + state[3], // icao24 + time_position
        source: 'flight' as const,
        timestamp: state[3] * 1000,
        callsign: state[1]?.trim() || 'Unknown',
        origin_country: state[2],
        velocity: state[9] || 0,
        altitude: state[7] || 0,
        lat: state[6],
        lon: state[5],
      }));
  } catch (error) {
    throw new APIError(
      error instanceof Error ? error.message : 'Failed to fetch flights',
      undefined,
      'flight'
    );
  }
}

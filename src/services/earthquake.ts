import { API_CONFIG } from '../config/api';
import { EarthquakeEvent } from '../types/events';
import { fetchWithTimeout, APIError } from './base';

interface USGSFeature {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
  };
  geometry: {
    coordinates: [number, number, number];
  };
}

export async function fetchEarthquakes(): Promise<EarthquakeEvent[]> {
  try {
    const response = await fetchWithTimeout(API_CONFIG.earthquake.url);
    const data = await response.json();

    return data.features.map((feature: USGSFeature) => ({
      id: feature.id,
      source: 'earthquake' as const,
      timestamp: feature.properties.time,
      magnitude: feature.properties.mag,
      place: feature.properties.place,
      depth: feature.geometry.coordinates[2],
      lat: feature.geometry.coordinates[1],
      lon: feature.geometry.coordinates[0],
    }));
  } catch (error) {
    throw new APIError(
      error instanceof Error ? error.message : 'Failed to fetch earthquakes',
      undefined,
      'earthquake'
    );
  }
}

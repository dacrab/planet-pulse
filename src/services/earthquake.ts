import { API_CONFIG } from '../config/api';
import { EarthquakeEvent } from '../types/events';
import { fetchWithTimeout } from './base';

interface USGSFeature {
  id: string;
  properties: { mag: number; place: string; time: number };
  geometry: { coordinates: [number, number, number] };
}

export async function fetchEarthquakes(): Promise<EarthquakeEvent[]> {
  const res = await fetchWithTimeout(API_CONFIG.earthquake.url);
  const data = await res.json();
  return data.features.map((f: USGSFeature) => ({
    id: f.id,
    source: 'earthquake' as const,
    timestamp: f.properties.time,
    magnitude: f.properties.mag,
    place: f.properties.place,
    depth: f.geometry.coordinates[2],
    lat: f.geometry.coordinates[1],
    lon: f.geometry.coordinates[0],
  }));
}

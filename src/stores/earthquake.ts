import { EarthquakeEvent } from '../types/events';
import { PollingStore } from '../types/store';
import { fetchEarthquakes } from '../services/earthquake';
import { API_CONFIG } from '../config/api';
import { createPollingStore } from './polling-factory';

export function createEarthquakeStore(): PollingStore<EarthquakeEvent> {
  return createPollingStore(fetchEarthquakes, API_CONFIG.earthquake.interval);
}

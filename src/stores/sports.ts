import { SportsEvent } from '../types/events';
import { PollingStore } from '../types/store';
import { fetchSports } from '../services/sports';
import { API_CONFIG } from '../config/api';
import { createPollingStore } from './polling-factory';

export function createSportsStore(): PollingStore<SportsEvent> {
  return createPollingStore(fetchSports, API_CONFIG.sports.interval);
}

import { SpaceEvent } from '../types/events';
import { PollingStore } from '../types/store';
import { fetchSpace } from '../services/space';
import { API_CONFIG } from '../config/api';
import { createPollingStore } from './polling-factory';

export function createSpaceStore(): PollingStore<SpaceEvent> {
  return createPollingStore(fetchSpace, API_CONFIG.space.interval);
}

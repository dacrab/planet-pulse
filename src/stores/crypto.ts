import { CryptoEvent } from '../types/events';
import { PollingStore } from '../types/store';
import { fetchCrypto } from '../services/crypto';
import { API_CONFIG } from '../config/api';
import { createPollingStore } from './polling-factory';

export function createCryptoStore(): PollingStore<CryptoEvent> {
  return createPollingStore(fetchCrypto, API_CONFIG.crypto.interval);
}

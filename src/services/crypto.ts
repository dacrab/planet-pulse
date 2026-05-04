import { API_CONFIG } from '../config/api';
import { CryptoEvent } from '../types/events';
import { fetchWithTimeout } from './base';

export async function fetchCrypto(): Promise<CryptoEvent[]> {
  try {
    const response = await fetchWithTimeout(API_CONFIG.crypto.url);
    const data = await response.json();

    return data.map((coin: any) => ({
      id: coin.id,
      source: 'crypto' as const,
      timestamp: Date.now(),
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change_24h: coin.price_change_percentage_24h || 0,
      market_cap: coin.market_cap,
    }));
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch crypto');
  }
}

import { API_CONFIG } from '../config/api';
import { CryptoEvent } from '../types/events';
import { fetchWithTimeout } from './base';

// Binance public market data API: no key, no auth, CORS-enabled, generous limits
const SYMBOLS = [
  'BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT',
  'DOGEUSDT','ADAUSDT','TRXUSDT','AVAXUSDT','SHIBUSDT',
  'DOTUSDT','LINKUSDT','LTCUSDT','UNIUSDT','ATOMUSDT',
  'NEARUSDT','SUIUSDT','APTUSDT','FILUSDT','MATICUSDT',
];

interface CryptoItem {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
}

const NAMES: Record<string, string> = {
  BTC:'Bitcoin', ETH:'Ethereum', BNB:'BNB', SOL:'Solana', XRP:'XRP',
  DOGE:'Dogecoin', ADA:'Cardano', TRX:'TRON', AVAX:'Avalanche', SHIB:'Shiba Inu',
  DOT:'Polkadot', LINK:'Chainlink', LTC:'Litecoin', UNI:'Uniswap', ATOM:'Cosmos',
  NEAR:'NEAR', SUI:'Sui', APT:'Aptos', FIL:'Filecoin', MATIC:'Polygon',
};

export async function fetchCrypto(): Promise<CryptoEvent[]> {
  const url = `${API_CONFIG.crypto.url}?symbols=${encodeURIComponent(JSON.stringify(SYMBOLS))}`;
  const res = await fetchWithTimeout(url);
  const data: CryptoItem[] = await res.json();
  return data.map(t => {
    const symbol = t.symbol.replace('USDT', '');
    return {
      id: symbol.toLowerCase(),
      source: 'crypto' as const,
      timestamp: Date.now(),
      symbol,
      name: NAMES[symbol] ?? symbol,
      price: parseFloat(t.lastPrice),
      change_24h: parseFloat(t.priceChangePercent),
      market_cap: 0, // Binance doesn't provide market cap
    };
  });
}

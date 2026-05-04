import { API_CONFIG } from '../config/api';
import { CryptoEvent } from '../types/events';

export class CryptoWebSocket {
  private ws: WebSocket | null = null;
  private reconnectTimeout: number | null = null;
  private onDataCallback: ((events: CryptoEvent[]) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  connect(
    onData: (events: CryptoEvent[]) => void,
    onError: (error: string) => void
  ) {
    this.onDataCallback = onData;
    this.onErrorCallback = onError;
    this.createConnection();
  }

  private createConnection() {
    try {
      this.ws = new WebSocket(API_CONFIG.crypto.wsUrl);

      this.ws.onopen = () => {
        console.log('Crypto WebSocket connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const events: CryptoEvent[] = data
            .filter((ticker: any) => ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'].includes(ticker.s))
            .map((ticker: any) => ({
              id: `crypto-${ticker.s}-${Date.now()}`,
              source: 'crypto' as const,
              timestamp: Date.now(),
              symbol: ticker.s,
              price: parseFloat(ticker.c),
              change_24h: parseFloat(ticker.P),
              volume: parseFloat(ticker.v),
            }));

          if (events.length > 0 && this.onDataCallback) {
            this.onDataCallback(events);
          }
        } catch (error) {
          this.handleError('Failed to parse crypto data');
        }
      };

      this.ws.onerror = () => {
        this.handleError('WebSocket connection error');
      };

      this.ws.onclose = () => {
        this.reconnect();
      };
    } catch (error) {
      this.handleError('Failed to create WebSocket connection');
    }
  }

  private handleError(message: string) {
    if (this.onErrorCallback) {
      this.onErrorCallback(message);
    }
  }

  private reconnect() {
    if (this.reconnectTimeout) return;

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.createConnection();
    }, 5000) as unknown as number;
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

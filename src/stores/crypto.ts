import { createSignal, onCleanup } from 'solid-js';
import { CryptoEvent } from '../types/events';
import { WebSocketStore } from '../types/store';
import { CryptoWebSocket } from '../services/crypto';

export function createCryptoStore(): WebSocketStore<CryptoEvent> {
  const [data, setData] = createSignal<CryptoEvent[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const ws = new CryptoWebSocket();

  const connect = () => {
    setLoading(true);
    setError(null);
    ws.connect(
      (events) => {
        setData(events);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
  };

  const disconnect = () => {
    ws.disconnect();
  };

  onCleanup(disconnect);

  return { data, loading, error, connect, disconnect };
}

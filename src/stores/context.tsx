import { createContext, useContext, onCleanup, createEffect, createMemo, JSX } from 'solid-js';
import { createPollingStore } from './polling-factory';
import { createEventAggregator } from './aggregator';
import { createIntelligenceStore } from './intelligence';
import { createInsightsStore } from './insights';
import { fetchEarthquakes } from '../services/earthquake';
import { fetchNews } from '../services/news';
import { fetchSpace } from '../services/space';
import { fetchWeather } from '../services/weather';
import { fetchCrypto } from '../services/crypto';
import { fetchSports } from '../services/sports';
import { API_CONFIG } from '../config/api';
import { useVisibility } from '../hooks/useVisibility';

function createGlobalStore() {
  const stores = [
    createPollingStore(fetchEarthquakes, API_CONFIG.earthquake.interval),
    createPollingStore(fetchNews,        API_CONFIG.news.interval),
    createPollingStore(fetchSpace,       API_CONFIG.space.interval),
    createPollingStore(fetchWeather,     API_CONFIG.weather.interval),
    createPollingStore(fetchCrypto,      API_CONFIG.crypto.interval),
    createPollingStore(fetchSports,      API_CONFIG.sports.interval),
  ] as const;

  const [earthquakeStore, newsStore, spaceStore, weatherStore, cryptoStore, sportsStore] = stores;

  const aggregator = createEventAggregator(
    earthquakeStore.data, newsStore.data, spaceStore.data,
    weatherStore.data, cryptoStore.data, sportsStore.data,
  );
  const intelligence = createIntelligenceStore(aggregator.allEvents);
  const insights = createInsightsStore(aggregator.allEvents);

  const status = createMemo(() => {
    const allFailed = stores.every(s => s.error() !== null);
    const isLoading = stores.some(s => s.loading());
    const hasData = stores.some(s => s.data().length > 0);
    if (allFailed) return 'error' as const;
    if (!hasData && isLoading) return 'connecting' as const;
    return 'connected' as const;
  });

  return { aggregator, intelligence, insights, stores, status };
}

type GlobalStore = ReturnType<typeof createGlobalStore>;
const StoreContext = createContext<GlobalStore>();

export function StoreProvider(props: { children: JSX.Element }) {
  const store = createGlobalStore();
  const isVisible = useVisibility();

  onCleanup(() => store.stores.forEach(s => s.unsubscribe()));
  createEffect(() => store.stores.forEach(s => isVisible() ? s.subscribe() : s.unsubscribe()));

  return <StoreContext.Provider value={store}>{props.children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

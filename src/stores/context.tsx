import { createContext, useContext, onMount, onCleanup, createEffect, JSX } from 'solid-js';
import { createEarthquakeStore } from './earthquake';
import { createNewsStore } from './news';
import { createSpaceStore } from './space';
import { createWeatherStore } from './weather';
import { createCryptoStore } from './crypto';
import { createSportsStore } from './sports';
import { createEventAggregator } from './aggregator';
import { createIntelligenceStore } from './intelligence';
import { createAchievementsStore } from './achievements';
import { createInsightsStore } from './insights';
import { useVisibility } from '../hooks/useVisibility';

export function createGlobalStore() {
  const earthquakeStore = createEarthquakeStore();
  const newsStore = createNewsStore();
  const spaceStore = createSpaceStore();
  const weatherStore = createWeatherStore();
  const cryptoStore = createCryptoStore();
  const sportsStore = createSportsStore();

  const aggregator = createEventAggregator(
    earthquakeStore.data,
    newsStore.data,
    spaceStore.data,
    weatherStore.data,
    cryptoStore.data,
    sportsStore.data
  );

  const intelligence = createIntelligenceStore(aggregator.allEvents);
  const insights = createInsightsStore(aggregator.allEvents);
  const achievements = createAchievementsStore(
    aggregator.allEvents,
    () => intelligence.geoCorrelations().length
  );

  return {
    earthquakeStore,
    newsStore,
    spaceStore,
    weatherStore,
    cryptoStore,
    sportsStore,
    aggregator,
    intelligence,
    insights,
    achievements,
  };
}

type GlobalStore = ReturnType<typeof createGlobalStore>;

const StoreContext = createContext<GlobalStore>();

export function StoreProvider(props: { children: JSX.Element }) {
  const store = createGlobalStore();
  const isVisible = useVisibility();

  const pollingStores = [
    store.earthquakeStore,
    store.weatherStore,
    store.cryptoStore,
    store.newsStore,
    store.sportsStore,
    store.spaceStore,
  ];

  const subscribeAll = () => pollingStores.forEach(s => s.subscribe());
  const unsubscribeAll = () => pollingStores.forEach(s => s.unsubscribe());

  onMount(subscribeAll);
  createEffect(() => isVisible() ? subscribeAll() : unsubscribeAll());
  onCleanup(unsubscribeAll);

  return (
    <StoreContext.Provider value={store}>
      {props.children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
}

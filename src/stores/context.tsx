import { createContext, useContext, onMount, onCleanup, createEffect, JSX } from 'solid-js';
import { createEarthquakeStore } from './earthquake';
import { createFlightStore } from './flight';
import { createISSStore } from './iss';
import { createWeatherStore } from './weather';
import { createCryptoStore } from './crypto';
import { createGitHubStore } from './github';
import { createEventAggregator } from './aggregator';
import { createIntelligenceStore } from './intelligence';
import { createAchievementsStore } from './achievements';
import { createInsightsStore } from './insights';
import { useVisibility } from '../hooks';

export function createGlobalStore() {
  const earthquakeStore = createEarthquakeStore();
  const flightStore = createFlightStore();
  const issStore = createISSStore();
  const weatherStore = createWeatherStore();
  const cryptoStore = createCryptoStore();
  const githubStore = createGitHubStore();

  const aggregator = createEventAggregator(
    earthquakeStore.data,
    flightStore.data,
    issStore.data,
    weatherStore.data,
    cryptoStore.data,
    githubStore.data
  );

  const intelligence = createIntelligenceStore(aggregator.allEvents);
  const insights = createInsightsStore(aggregator.allEvents);
  const achievements = createAchievementsStore(
    aggregator.allEvents,
    () => intelligence.geographicCorrelations().length
  );

  return {
    earthquakeStore,
    flightStore,
    issStore,
    weatherStore,
    cryptoStore,
    githubStore,
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

  onMount(() => {
    // Start all polling stores
    store.earthquakeStore.subscribe();
    store.flightStore.subscribe();
    store.issStore.subscribe();
    store.weatherStore.subscribe();
    store.githubStore.subscribe();
    
    // Connect WebSocket
    store.cryptoStore.connect();
  });

  // Pause/resume polling based on visibility
  createEffect(() => {
    if (!isVisible()) {
      // Pause polling when tab is hidden
      store.earthquakeStore.unsubscribe();
      store.flightStore.unsubscribe();
      store.issStore.unsubscribe();
      store.weatherStore.unsubscribe();
      store.githubStore.unsubscribe();
    } else {
      // Resume polling when tab becomes visible
      store.earthquakeStore.subscribe();
      store.flightStore.subscribe();
      store.issStore.subscribe();
      store.weatherStore.subscribe();
      store.githubStore.subscribe();
    }
  });

  onCleanup(() => {
    // Clean up all stores
    store.earthquakeStore.unsubscribe();
    store.flightStore.unsubscribe();
    store.issStore.unsubscribe();
    store.weatherStore.unsubscribe();
    store.githubStore.unsubscribe();
    store.cryptoStore.disconnect();
  });

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

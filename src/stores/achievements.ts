import { createEffect, Accessor } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Event, EarthquakeEvent, FlightEvent, CryptoEvent } from '../types/events';
import { Achievement } from '../types/intelligence';

const ACHIEVEMENTS_KEY = 'global-events-achievements';

const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
  { id: 'first-visit', name: 'First Steps', description: 'Opened the dashboard', icon: '👋', target: 1 },
  { id: 'earthquake-witness', name: 'Earthquake Witness', description: 'Viewed during M5.0+ earthquake', icon: '🌍', target: 1 },
  { id: 'flight-tracker', name: 'Flight Tracker', description: 'Monitored 1000+ flights', icon: '✈️', target: 1000 },
  { id: 'crypto-whale', name: 'Crypto Whale Spotter', description: 'Caught 10+ major price movements (>5%)', icon: '🐋', target: 10 },
  { id: 'pattern-detective', name: 'Pattern Detective', description: 'Witnessed 5 cross-source correlations', icon: '🔍', target: 5 },
  { id: 'night-owl', name: 'Night Owl', description: 'Used dashboard during 3+ overnight sessions', icon: '🦉', target: 3 },
  { id: 'data-explorer', name: 'Data Explorer', description: 'Viewed events from all 6 sources', icon: '🗺️', target: 6 },
];

export function createAchievementsStore(allEvents: Accessor<Event[]>, correlationCount: Accessor<number>) {
  // Load from localStorage
  const saved = localStorage.getItem(ACHIEVEMENTS_KEY);
  const initial: Achievement[] = ACHIEVEMENT_DEFINITIONS.map(def => {
    const savedData = saved ? JSON.parse(saved).find((a: Achievement) => a.id === def.id) : null;
    return {
      ...def,
      unlocked: savedData?.unlocked || false,
      unlockedAt: savedData?.unlockedAt,
      progress: savedData?.progress || 0,
    };
  });

  const [achievements, setAchievements] = createStore<Achievement[]>(initial);
  const [stats, setStats] = createStore({
    flightsSeen: 0,
    cryptoSpikes: 0,
    nightSessions: 0,
    sourcesViewed: new Set<string>(),
  });

  // Save to localStorage on changes
  createEffect(() => {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
  });

  // Track first visit
  const unlockAchievement = (id: string) => {
    const index = achievements.findIndex(a => a.id === id);
    if (index !== -1 && !achievements[index].unlocked) {
      setAchievements(index, {
        unlocked: true,
        unlockedAt: Date.now(),
      });
    }
  };

  const updateProgress = (id: string, progress: number) => {
    const index = achievements.findIndex(a => a.id === id);
    if (index !== -1) {
      setAchievements(index, 'progress', progress);
      if (progress >= (achievements[index].target || 1)) {
        unlockAchievement(id);
      }
    }
  };

  // First visit
  unlockAchievement('first-visit');

  // Track events
  createEffect(() => {
    const events = allEvents();
    
    // Track flights
    const flights = events.filter(e => e.source === 'flight').length;
    if (flights > stats.flightsSeen) {
      setStats('flightsSeen', flights);
      updateProgress('flight-tracker', flights);
    }

    // Track crypto spikes
    const cryptoSpikes = events.filter(e => 
      e.source === 'crypto' && Math.abs((e as CryptoEvent).change_24h) > 5
    ).length;
    if (cryptoSpikes > stats.cryptoSpikes) {
      setStats('cryptoSpikes', cryptoSpikes);
      updateProgress('crypto-whale', cryptoSpikes);
    }

    // Track earthquake witness
    const bigQuakes = events.filter(e => 
      e.source === 'earthquake' && (e as EarthquakeEvent).magnitude >= 5.0
    );
    if (bigQuakes.length > 0) {
      unlockAchievement('earthquake-witness');
    }

    // Track sources viewed
    events.forEach(e => {
      if (!stats.sourcesViewed.has(e.source)) {
        setStats('sourcesViewed', prev => new Set([...prev, e.source]));
      }
    });
    updateProgress('data-explorer', stats.sourcesViewed.size);

    // Track night sessions (10pm - 6am)
    const hour = new Date().getHours();
    if ((hour >= 22 || hour < 6) && stats.nightSessions < 3) {
      const lastNightSession = localStorage.getItem('last-night-session');
      const today = new Date().toDateString();
      if (lastNightSession !== today) {
        localStorage.setItem('last-night-session', today);
        const newCount = stats.nightSessions + 1;
        setStats('nightSessions', newCount);
        updateProgress('night-owl', newCount);
      }
    }
  });

  // Track correlations
  createEffect(() => {
    const count = correlationCount();
    updateProgress('pattern-detective', count);
  });

  const unlockedCount = () => achievements.filter(a => a.unlocked).length;
  const totalCount = () => achievements.length;

  return {
    achievements,
    unlockedCount,
    totalCount,
  };
}

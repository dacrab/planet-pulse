import { createEffect, Accessor, batch } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Event, EarthquakeEvent, CryptoEvent } from '../types/events';
import { Achievement } from '../types/intelligence';
import { ACHIEVEMENT_DEFINITIONS } from '../config/achievements';

const STORAGE_KEY = 'global-events-achievements';

export function createAchievementsStore(allEvents: Accessor<Event[]>, correlationCount: Accessor<number>) {
  const saved = localStorage.getItem(STORAGE_KEY);
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
    newsSeen: 0,
    cryptoSpikes: 0,
    nightSessions: 0,
    sourcesViewed: new Set<string>(),
  });

  createEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements)));

  const unlock = (id: string) => {
    const idx = achievements.findIndex(a => a.id === id);
    if (idx !== -1 && !achievements[idx].unlocked) {
      batch(() => {
        setAchievements(idx, { unlocked: true, unlockedAt: Date.now() });
      });
    }
  };

  const updateProgress = (id: string, progress: number) => {
    const idx = achievements.findIndex(a => a.id === id);
    if (idx !== -1) {
      setAchievements(idx, 'progress', progress);
      if (progress >= (achievements[idx].target || 1)) unlock(id);
    }
  };

  unlock('first-visit');

  createEffect(() => {
    const events = allEvents();
    
    const flights = events.filter(e => e.source === 'news').length;
    if (flights > stats.newsSeen) {
      setStats('newsSeen', flights);
      updateProgress('flight-tracker', flights);
    }

    const cryptoSpikes = events.filter(e => e.source === 'crypto' && Math.abs((e as CryptoEvent).change_24h) > 5).length;
    if (cryptoSpikes > stats.cryptoSpikes) {
      setStats('cryptoSpikes', cryptoSpikes);
      updateProgress('crypto-whale', cryptoSpikes);
    }

    if (events.some(e => e.source === 'earthquake' && (e as EarthquakeEvent).magnitude >= 5.0)) {
      unlock('earthquake-witness');
    }

    events.forEach(e => {
      if (!stats.sourcesViewed.has(e.source)) {
        setStats('sourcesViewed', prev => new Set([...prev, e.source]));
      }
    });
    updateProgress('data-explorer', stats.sourcesViewed.size);

    const hour = new Date().getHours();
    if ((hour >= 22 || hour < 6) && stats.nightSessions < 3) {
      const lastSession = localStorage.getItem('last-night-session');
      const today = new Date().toDateString();
      if (lastSession !== today) {
        localStorage.setItem('last-night-session', today);
        const newCount = stats.nightSessions + 1;
        setStats('nightSessions', newCount);
        updateProgress('night-owl', newCount);
      }
    }
  });

  createEffect(() => updateProgress('pattern-detective', correlationCount()));

  return {
    achievements,
    unlockedCount: () => achievements.filter(a => a.unlocked).length,
    totalCount: () => achievements.length,
  };
}

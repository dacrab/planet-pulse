import { createEffect, createMemo, Accessor } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Event, EarthquakeEvent, CryptoEvent } from '../types/events';
import { Achievement } from '../types/intelligence';
import { ACHIEVEMENT_DEFINITIONS } from '../config/achievements';

const STORAGE_KEY = 'global-events-achievements';

export function createAchievementsStore(allEvents: Accessor<Event[]>, correlationCount: Accessor<number>) {
  const saved = localStorage.getItem(STORAGE_KEY);
  const savedList: Achievement[] = saved ? JSON.parse(saved) : [];

  const [achievements, setAchievements] = createStore<Achievement[]>(
    ACHIEVEMENT_DEFINITIONS.map(def => {
      const s = savedList.find(a => a.id === def.id);
      return { ...def, unlocked: s?.unlocked ?? false, unlockedAt: s?.unlockedAt, progress: s?.progress ?? 0 };
    })
  );

  createEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements)));

  const unlock = (id: string) => {
    const i = achievements.findIndex(a => a.id === id);
    if (i !== -1 && !achievements[i].unlocked) setAchievements(i, { unlocked: true, unlockedAt: Date.now() });
  };

  const progress = (id: string, value: number) => {
    const i = achievements.findIndex(a => a.id === id);
    if (i === -1) return;
    setAchievements(i, 'progress', value);
    if (value >= (achievements[i].target ?? 1)) unlock(id);
  };

  unlock('first-visit');

  createEffect(() => {
    const events = allEvents();
    progress('news-reader', events.filter(e => e.source === 'news').length);
    progress('crypto-whale', events.filter(e => e.source === 'crypto' && Math.abs((e as CryptoEvent).change_24h) > 5).length);
    if (events.some(e => e.source === 'earthquake' && (e as EarthquakeEvent).magnitude >= 5.0)) unlock('earthquake-witness');
    progress('data-explorer', new Set(events.map(e => e.source)).size);

    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) {
      const today = new Date().toDateString();
      if (localStorage.getItem('last-night-session') !== today) {
        localStorage.setItem('last-night-session', today);
        const prev = achievements.find(a => a.id === 'night-owl')?.progress ?? 0;
        progress('night-owl', prev + 1);
      }
    }
  });

  createEffect(() => progress('pattern-detective', correlationCount()));

  return {
    achievements,
    unlockedCount: createMemo(() => achievements.filter(a => a.unlocked).length),
    totalCount: achievements.length,
  };
}

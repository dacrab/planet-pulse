import { Achievement } from '../types/intelligence';

export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
  { id: 'first-visit', name: 'First Steps', description: 'Opened the dashboard', icon: '👋', target: 1 },
  { id: 'earthquake-witness', name: 'Earthquake Witness', description: 'Viewed during M5.0+ earthquake', icon: '🌍', target: 1 },
  { id: 'flight-tracker', name: 'Flight Tracker', description: 'Monitored 1000+ flights', icon: '✈️', target: 1000 },
  { id: 'crypto-whale', name: 'Crypto Whale Spotter', description: 'Caught 10+ major price movements (>5%)', icon: '🐋', target: 10 },
  { id: 'pattern-detective', name: 'Pattern Detective', description: 'Witnessed 5 cross-source correlations', icon: '🔍', target: 5 },
  { id: 'night-owl', name: 'Night Owl', description: 'Used dashboard during 3+ overnight sessions', icon: '🦉', target: 3 },
  { id: 'data-explorer', name: 'Data Explorer', description: 'Viewed events from all 6 sources', icon: '🗺️', target: 6 },
];

import { API_CONFIG } from '../config/api';
import { SportsEvent } from '../types/events';
import { fetchWithTimeout } from './base';

interface SportsItem {
  idEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  strLeague: string;
  dateEvent: string;
}

function isSportsItem(e: unknown): e is SportsItem {
  return (
    typeof e === 'object' && e !== null &&
    typeof (e as SportsItem).idEvent === 'string' &&
    typeof (e as SportsItem).strEvent === 'string'
  );
}

export async function fetchSports(): Promise<SportsEvent[]> {
  const today = new Date().toISOString().split('T')[0];
  const res = await fetchWithTimeout(`${API_CONFIG.sports.url}?d=${today}&s=Soccer`);
  const data: { events?: unknown } = await res.json();
  if (!Array.isArray(data.events)) return [];
  return data.events.filter(isSportsItem).slice(0, 10).map(e => ({
    id: e.idEvent,
    source: 'sports' as const,
    timestamp: Date.now(),
    event_name: e.strEvent,
    home_team: e.strHomeTeam,
    away_team: e.strAwayTeam,
    league: e.strLeague,
    date: e.dateEvent,
  }));
}

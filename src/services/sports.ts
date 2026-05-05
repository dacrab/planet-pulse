import { SportsEvent } from '../types/events';
import { fetchWithTimeout } from './base';

export async function fetchSports(): Promise<SportsEvent[]> {
  const today = new Date().toISOString().split('T')[0];
  const res = await fetchWithTimeout(`https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${today}&s=Soccer`);
  const data = await res.json();
  if (!data.events) return [];
  return data.events.slice(0, 10).map((e: any) => ({
    id: e.idEvent,
    source: 'sports' as const,
    timestamp: e.strTimestamp ? new Date(e.strTimestamp + 'Z').getTime() : new Date(e.dateEvent).getTime(),
    event_name: e.strEvent,
    home_team: e.strHomeTeam,
    away_team: e.strAwayTeam,
    league: e.strLeague,
    date: e.dateEvent,
  }));
}

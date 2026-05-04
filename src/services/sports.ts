import { API_CONFIG } from '../config/api';
import { SportsEvent } from '../types/events';
import { fetchWithTimeout } from './base';

export async function fetchSports(): Promise<SportsEvent[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const url = `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${today}&s=Soccer`;
    const response = await fetchWithTimeout(url);
    const data = await response.json();

    if (!data.events) return [];

    return data.events.slice(0, 10).map((event: any) => {
      const timestamp = event.strTimestamp 
        ? new Date(event.strTimestamp + 'Z').getTime()
        : new Date(event.dateEvent).getTime();
      
      return {
        id: event.idEvent,
        source: 'sports' as const,
        timestamp,
        event_name: event.strEvent,
        home_team: event.strHomeTeam,
        away_team: event.strAwayTeam,
        league: event.strLeague,
        date: event.dateEvent,
      };
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch sports');
  }
}

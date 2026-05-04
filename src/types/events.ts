export type EventSource = 'earthquake' | 'news' | 'space' | 'weather' | 'crypto' | 'sports';

export interface BaseEvent {
  id: string;
  source: EventSource;
  timestamp: number;
  lat?: number;
  lon?: number;
}

export interface EarthquakeEvent extends BaseEvent {
  source: 'earthquake';
  magnitude: number;
  place: string;
  depth: number;
  lat: number;
  lon: number;
}

export interface NewsEvent extends BaseEvent {
  source: 'news';
  title: string;
  description: string;
  url: string;
  source_name: string;
  image?: string;
}

export interface SpaceEvent extends BaseEvent {
  source: 'space';
  lat: number;
  lon: number;
  altitude: number;
  velocity: number;
}

export interface WeatherEvent extends BaseEvent {
  source: 'weather';
  location: string;
  temperature: number;
  condition: string;
  lat: number;
  lon: number;
}

export interface CryptoEvent extends BaseEvent {
  source: 'crypto';
  symbol: string;
  name: string;
  price: number;
  change_24h: number;
  market_cap: number;
}

export interface SportsEvent extends BaseEvent {
  source: 'sports';
  event_name: string;
  home_team: string;
  away_team: string;
  league: string;
  date: string;
}

export type Event = EarthquakeEvent | NewsEvent | SpaceEvent | WeatherEvent | CryptoEvent | SportsEvent;

export type EventSource = 'earthquake' | 'flight' | 'iss' | 'weather' | 'crypto' | 'github';

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

export interface FlightEvent extends BaseEvent {
  source: 'flight';
  callsign: string;
  origin_country: string;
  velocity: number;
  altitude: number;
  lat: number;
  lon: number;
}

export interface ISSEvent extends BaseEvent {
  source: 'iss';
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
  price: number;
  change_24h: number;
  volume: number;
}

export interface GitHubEvent extends BaseEvent {
  source: 'github';
  type: string;
  repo: string;
  actor: string;
  action: string;
}

export type Event = EarthquakeEvent | FlightEvent | ISSEvent | WeatherEvent | CryptoEvent | GitHubEvent;

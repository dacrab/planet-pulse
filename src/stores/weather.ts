import { WeatherEvent } from '../types/events';
import { PollingStore } from '../types/store';
import { fetchWeather } from '../services/weather';
import { API_CONFIG } from '../config/api';
import { createPollingStore } from './polling-factory';

export function createWeatherStore(): PollingStore<WeatherEvent> {
  return createPollingStore(fetchWeather, API_CONFIG.weather.interval);
}

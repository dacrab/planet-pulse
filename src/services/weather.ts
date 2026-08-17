import { API_CONFIG } from '../config/api';
import { WeatherEvent } from '../types/events';
import { fetchWithTimeout } from './base';

const CITIES = [
  { name: 'New York', lat: 40.7128, lon: -74.0060 },
  { name: 'London',   lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo',    lat: 35.6762, lon: 139.6503 },
  { name: 'Sydney',   lat: -33.8688, lon: 151.2093 },
];

interface WeatherItem {
  current_weather: { temperature: number; weathercode: number };
}

function weatherCondition(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 3)  return 'Cloudy';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snowy';
  return 'Stormy';
}

export async function fetchWeather(): Promise<WeatherEvent[]> {
  const results = await Promise.allSettled(CITIES.map(async city => {
    const res = await fetchWithTimeout(`${API_CONFIG.weather.url}?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`);
    const data: WeatherItem = await res.json();
    return {
      id: `weather-${city.name}`,
      source: 'weather' as const,
      timestamp: Date.now(),
      location: city.name,
      temperature: data.current_weather.temperature,
      condition: weatherCondition(data.current_weather.weathercode),
      lat: city.lat,
      lon: city.lon,
    } satisfies WeatherEvent;
  }));
  return results.filter(r => r.status === 'fulfilled').map(r => (r as PromiseFulfilledResult<WeatherEvent>).value);
}

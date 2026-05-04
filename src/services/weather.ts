import { API_CONFIG } from '../config/api';
import { WeatherEvent } from '../types/events';
import { fetchWithTimeout } from './base';

const MAJOR_CITIES = [
  { name: 'New York', lat: 40.7128, lon: -74.0060 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
];

export async function fetchWeather(): Promise<WeatherEvent[]> {
  try {
    const events: WeatherEvent[] = [];

    for (const city of MAJOR_CITIES) {
      const url = `${API_CONFIG.weather.url}?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`;
      const response = await fetchWithTimeout(url);
      const data = await response.json();

      events.push({
        id: `weather-${city.name}-${Date.now()}`,
        source: 'weather' as const,
        timestamp: Date.now(),
        location: city.name,
        temperature: data.current_weather.temperature,
        condition: getWeatherCondition(data.current_weather.weathercode),
        lat: city.lat,
        lon: city.lon,
      });
    }

    return events;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch weather');
  }
}

function getWeatherCondition(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Cloudy';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snowy';
  return 'Stormy';
}

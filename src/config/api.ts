export const API_CONFIG = {
  earthquake: {
    url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson',
    interval: 60000, // 60s
  },
  flight: {
    url: 'https://opensky-network.org/api/states/all',
    interval: 30000, // 30s
    limit: 100, // requests per day
  },
  iss: {
    url: 'http://api.open-notify.org/iss-now.json',
    interval: 10000, // 10s
  },
  weather: {
    url: 'https://api.open-meteo.com/v1/forecast',
    interval: 300000, // 300s
  },
  crypto: {
    wsUrl: 'wss://stream.binance.com:9443/ws/!ticker@arr',
  },
  github: {
    url: 'https://api.github.com/events',
    interval: 60000, // 60s
    limit: 60, // requests per hour
  },
} as const;

export const MAP_CONFIG = {
  center: [0, 0] as [number, number],
  zoom: 2,
  maxZoom: 18,
  minZoom: 1,
};

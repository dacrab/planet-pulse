export const API_CONFIG = {
  earthquake: { url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson', interval: 60000 },
  news:       { interval: 300000 },
  crypto:     { interval: 15000 },
  weather:    { url: 'https://api.open-meteo.com/v1/forecast', interval: 300000 },
  sports:     { interval: 300000 },
  space:      { interval: 10000 },
} as const;

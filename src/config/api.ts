export const API_CONFIG = {
  earthquake: { url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson', interval: 60000 },
  news:       { url: 'https://ok.surf/api/v1/cors/news-feed', interval: 300000 },
  crypto:     { url: 'https://data-api.binance.vision/api/v3/ticker/24hr', interval: 15000 },
  weather:    { url: 'https://api.open-meteo.com/v1/forecast', interval: 300000 },
  sports:     { url: 'https://www.thesportsdb.com/api/v1/json/3/eventsday.php', interval: 300000 },
  space:      { url: 'https://api.wheretheiss.at/v1/satellites/25544', interval: 10000 },
} as const;

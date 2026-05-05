export const API_CONFIG = {
  earthquake: { url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson', interval: 60000 },
  news:       { url: 'https://www.reddit.com/r/worldnews/top.json?limit=20',                       interval: 300000 },
  crypto:     { url: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&sparkline=false', interval: 60000 },
  weather:    { url: 'https://api.open-meteo.com/v1/forecast',                                     interval: 300000 },
  sports:     { interval: 300000 },
  space:      { interval: 10000 },
} as const;

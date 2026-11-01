import type {
  EventMetric,
  PulseEvent,
  SourceId,
  SourceMeta,
} from '../types';
import {
  clamp,
  compactNumber,
  kickoffTime,
  percent,
  price,
  round,
} from '../lib/format';

export interface SourceDefinition extends SourceMeta {
  color: string;
  fetch: () => Promise<PulseEvent[]>;
}

export interface City {
  name: string;
  lat: number;
  lon: number;
}

export const CITIES: City[] = [
  { name: 'New York', lat: 40.7128, lon: -74.006 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
  { name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
  { name: 'Nairobi', lat: -1.2921, lon: 36.8219 },
];

const makeSearch = (...parts: Array<string | number | undefined>) =>
  parts.filter(Boolean).join(' ').toLowerCase();

async function fetchJson<T>(url: string, timeout = 12_000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/* -------------------------------------------------------------------------- */
/* Earthquakes — USGS                                                          */
/* -------------------------------------------------------------------------- */

interface QuakeFeature {
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number;
    url?: string;
  };
  geometry: { coordinates: [number, number, number] };
}

async function fetchEarthquakes(): Promise<PulseEvent[]> {
  const data = await fetchJson<{ features: QuakeFeature[] }>(
    'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
  );
  const cutoff = Date.now() - 24 * 3_600_000;

  return data.features
    .filter(
      (feature) =>
        feature.properties.mag !== null && feature.properties.time >= cutoff
    )
    .map((feature) => {
      const { mag, place, time, url } = feature.properties;
      const [lon, lat, depth] = feature.geometry.coordinates;
      const magnitude = mag ?? 0;
      const label = place ?? 'Unknown region';

      return {
        id: `quake:${feature.id}`,
        source: 'earthquake',
        timestamp: time,
        title: `M${magnitude.toFixed(1)} · ${label}`,
        subtitle: `${round(depth)} km deep · ${round(lat)}, ${round(lon)}`,
        href: url ?? `https://earthquake.usgs.gov/earthquakes/eventpage/${feature.id}`,
        lat,
        lon,
        place: label,
        score: clamp(magnitude * 15 + 5, 4, 100),
        value: magnitude,
        unit: 'M',
        tags: [
          'seismic',
          magnitude >= 5 ? 'major' : magnitude >= 3 ? 'felt' : 'minor',
        ],
        metrics: [
          { label: 'Magnitude', value: `M${magnitude.toFixed(1)}` },
          { label: 'Depth', value: `${round(depth)} km` },
          { label: 'Coordinates', value: `${lat.toFixed(2)}, ${lon.toFixed(2)}` },
          { label: 'Region', value: label },
        ],
        search: makeSearch(label, 'earthquake', `magnitude ${magnitude}`, 'seismic'),
      } satisfies PulseEvent;
    })
    .sort((a, b) => b.timestamp - a.timestamp);
}

/* -------------------------------------------------------------------------- */
/* News — ok.surf / Google News                                                */
/* -------------------------------------------------------------------------- */

interface NewsItem {
  title?: string;
  link?: string;
  source?: string;
  og?: string;
}

type NewsFeed = Record<string, NewsItem[]>;

const SECTION_SCORES: Record<string, number> = {
  World: 48,
  US: 43,
  Science: 45,
  Health: 42,
  Business: 40,
  Technology: 40,
  Sports: 34,
  Entertainment: 30,
};

async function fetchNews(): Promise<PulseEvent[]> {
  const data = await fetchJson<NewsFeed>('https://ok.surf/api/v1/cors/news-feed');
  const seen = new Set<string>();
  const events: PulseEvent[] = [];
  const timestamp = Date.now();

  for (const [section, sectionItems] of Object.entries(data ?? {})) {
    if (!Array.isArray(sectionItems)) continue;

    for (const item of sectionItems) {
      if (!item.title || seen.has(item.title)) continue;
      seen.add(item.title);

      const source = item.source ?? 'Google News';
      events.push({
        id: `news:${events.length}:${item.title.slice(0, 24)}`,
        source: 'news',
        timestamp,
        title: item.title,
        subtitle: `${source} · ${section}`,
        href: item.link,
        image:
          typeof item.og === 'string' && item.og.startsWith('http')
            ? item.og
            : undefined,
        score: SECTION_SCORES[section] ?? 32,
        tags: ['headline', section.toLowerCase(), source.toLowerCase()],
        metrics: [
          { label: 'Outlet', value: source },
          { label: 'Section', value: section },
          { label: 'Status', value: 'Fetched live' },
        ],
        search: makeSearch(item.title, source, section, 'news headline'),
      });

      if (events.length >= 28) return events;
    }
  }

  return events;
}

/* -------------------------------------------------------------------------- */
/* Space — Where the ISS at?                                                   */
/* -------------------------------------------------------------------------- */

interface IssResponse {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  visibility: string;
  footprint: number;
  timestamp: number;
}

async function fetchSpace(): Promise<PulseEvent[]> {
  const data = await fetchJson<IssResponse>(
    'https://api.wheretheiss.at/v1/satellites/25544'
  );
  const altitude = Math.round(data.altitude);
  const velocity = Math.round(data.velocity);

  return [
    {
      id: `space:iss:${Math.floor(data.timestamp / 30)}`,
      source: 'space',
      timestamp: data.timestamp * 1_000,
      title: `ISS · ${round(altitude)} km above Earth`,
      subtitle: `${round(velocity)} km/h · ${data.visibility}`,
      href: 'https://wheretheiss.at/',
      lat: data.latitude,
      lon: data.longitude,
      place: 'Low Earth orbit',
      score: 24,
      value: altitude,
      unit: 'km',
      tags: ['orbital', data.visibility],
      metrics: [
        { label: 'Altitude', value: `${round(altitude)} km` },
        { label: 'Velocity', value: `${round(velocity)} km/h` },
        { label: 'Footprint', value: `${round(data.footprint)} km` },
        { label: 'Coordinates', value: `${data.latitude.toFixed(2)}, ${data.longitude.toFixed(2)}` },
      ],
      search: makeSearch(
        'international space station iss orbit orbital altitude velocity',
        data.visibility
      ),
    },
  ];
}

/* -------------------------------------------------------------------------- */
/* Weather — Open-Meteo                                                        */
/* -------------------------------------------------------------------------- */

interface WeatherResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current?: {
    time: string;
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    is_day: number;
  };
}

const WMO: Record<number, string> = {
  0: 'Clear',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Rime fog',
  51: 'Drizzle',
  53: 'Drizzle',
  55: 'Drizzle',
  61: 'Rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Showers',
  81: 'Showers',
  82: 'Violent showers',
  85: 'Snow showers',
  86: 'Snow showers',
  95: 'Thunderstorm',
  96: 'Storm with hail',
  99: 'Storm with hail',
};

const conditionLabel = (code: number) => WMO[code] ?? 'Variable';

const conditionScore = (code: number, temperature: number) => {
  let score = 12;
  if (code >= 95) score = 68;
  else if (code >= 80) score = 44;
  else if (code >= 61) score = 36;
  else if (code >= 45) score = 30;
  if (temperature >= 35 || temperature <= -10) score += 18;
  return clamp(score, 8, 100);
};

async function fetchWeather(): Promise<PulseEvent[]> {
  const latitudes = CITIES.map((city) => city.lat).join(',');
  const longitudes = CITIES.map((city) => city.lon).join(',');
  const data = await fetchJson<WeatherResponse[]>(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitudes}&longitude=${longitudes}&current=temperature_2m,weather_code,wind_speed_10m,is_day&timezone=auto`
  );
  const timestamp = Date.now();

  return (Array.isArray(data) ? data : [data])
    .map((entry, index): PulseEvent | null => {
      const city = CITIES[index];
      const current = entry.current;
      if (!city || !current) return null;

      const condition = conditionLabel(current.weather_code);
      const isDay = current.is_day === 1;

      return {
        id: `weather:${city.name}`,
        source: 'weather',
        timestamp,
        title: `${city.name} · ${Math.round(current.temperature_2m)}°`,
        subtitle: `${condition} · ${Math.round(current.wind_speed_10m)} km/h wind`,
        href: 'https://open-meteo.com/',
        lat: city.lat,
        lon: city.lon,
        place: city.name,
        score: conditionScore(current.weather_code, current.temperature_2m),
        value: current.temperature_2m,
        unit: '°C',
        tags: [
          condition.toLowerCase(),
          isDay ? 'day' : 'night',
          current.weather_code >= 61 ? 'wet' : 'dry',
        ],
        metrics: [
          { label: 'Temperature', value: `${current.temperature_2m.toFixed(1)}°C` },
          { label: 'Conditions', value: condition },
          { label: 'Wind', value: `${Math.round(current.wind_speed_10m)} km/h` },
          { label: 'Local time', value: current.time.replace('T', ' ') },
        ],
        search: makeSearch(
          city.name,
          condition,
          `temperature ${Math.round(current.temperature_2m)}`,
          'weather'
        ),
      } satisfies PulseEvent;
    })
    .filter((event): event is PulseEvent => event !== null);
}

/* -------------------------------------------------------------------------- */
/* Crypto — Binance public market data                                         */
/* -------------------------------------------------------------------------- */

const COINS: Array<{ symbol: string; name: string }> = [
  { symbol: 'BTCUSDT', name: 'Bitcoin' },
  { symbol: 'ETHUSDT', name: 'Ethereum' },
  { symbol: 'SOLUSDT', name: 'Solana' },
  { symbol: 'BNBUSDT', name: 'BNB' },
  { symbol: 'XRPUSDT', name: 'XRP' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin' },
  { symbol: 'ADAUSDT', name: 'Cardano' },
  { symbol: 'AVAXUSDT', name: 'Avalanche' },
  { symbol: 'LINKUSDT', name: 'Chainlink' },
  { symbol: 'DOTUSDT', name: 'Polkadot' },
  { symbol: 'LTCUSDT', name: 'Litecoin' },
  { symbol: 'SUIUSDT', name: 'Sui' },
  { symbol: 'NEARUSDT', name: 'NEAR' },
  { symbol: 'APTUSDT', name: 'Aptos' },
  { symbol: 'UNIUSDT', name: 'Uniswap' },
  { symbol: 'ATOMUSDT', name: 'Cosmos' },
];

interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
  quoteVolume: string;
}

async function fetchCrypto(): Promise<PulseEvent[]> {
  const symbols = COINS.map((coin) => coin.symbol);
  const data = await fetchJson<BinanceTicker[]>(
    `https://data-api.binance.vision/api/v3/ticker/24hr?symbols=${encodeURIComponent(
      JSON.stringify(symbols)
    )}`
  );
  const timestamp = Date.now();
  const names = new Map(COINS.map((coin) => [coin.symbol, coin.name]));

  return data
    .map((ticker): PulseEvent | null => {
      const symbol = ticker.symbol.replace('USDT', '');
      const name = names.get(ticker.symbol) ?? symbol;
      const lastPrice = Number(ticker.lastPrice);
      const change = Number(ticker.priceChangePercent);
      if (!Number.isFinite(lastPrice) || lastPrice <= 0 || !Number.isFinite(change)) {
        return null;
      }

      const metrics: EventMetric[] = [
        { label: 'Price', value: `$${price(lastPrice)}` },
        {
          label: '24h change',
          value: percent(change),
          tone: change >= 0 ? 'up' : 'down',
        },
        { label: '24h high', value: `$${price(Number(ticker.highPrice))}` },
        { label: '24h low', value: `$${price(Number(ticker.lowPrice))}` },
        { label: 'Volume', value: `$${compactNumber(Number(ticker.quoteVolume))}` },
      ];

      return {
        id: `crypto:${symbol.toLowerCase()}`,
        source: 'crypto',
        timestamp,
        title: `${symbol} · $${price(lastPrice)}`,
        subtitle: `${percent(change)} · 24h`,
        href: `https://www.binance.com/en/trade/${symbol}_USDT`,
        place: name,
        score: clamp(Math.abs(change) * 7 + 8, 8, 98),
        value: lastPrice,
        delta: change,
        unit: 'USD',
        tags: ['markets', change >= 0 ? 'gain' : 'loss', name.toLowerCase()],
        metrics,
        search: makeSearch(name, symbol, 'crypto market price', change >= 0 ? 'gain' : 'loss'),
      } satisfies PulseEvent;
    })
    .filter((event): event is PulseEvent => event !== null)
    .sort((a, b) => Math.abs(b.delta ?? 0) - Math.abs(a.delta ?? 0))
    .slice(0, 16);
}

/* -------------------------------------------------------------------------- */
/* Sports — TheSportsDB                                                        */
/* -------------------------------------------------------------------------- */

interface SportsItem {
  idEvent: string;
  strEvent: string;
  strHomeTeam?: string;
  strAwayTeam?: string;
  strLeague?: string;
  strTimestamp?: string;
  strVenue?: string;
  intRound?: string;
}

async function fetchSports(): Promise<PulseEvent[]> {
  const today = new Date().toISOString().slice(0, 10);
  const data = await fetchJson<{ events?: SportsItem[] | null }>(
    `https://www.thesportsdb.com/api/v1/json/123/eventsday.php?d=${today}&s=Soccer`
  );
  const now = Date.now();

  return (data.events ?? [])
    .map((item): PulseEvent | null => {
      if (!item.strEvent) return null;
      const timestamp = item.strTimestamp
        ? Date.parse(`${item.strTimestamp}Z`)
        : Number.NaN;
      if (!Number.isFinite(timestamp)) return null;

      const home = item.strHomeTeam ?? 'Home';
      const away = item.strAwayTeam ?? 'Away';
      const league = item.strLeague ?? 'Football';

      return {
        id: `sports:${item.idEvent}`,
        source: 'sports',
        timestamp,
        title: `${home} vs ${away}`,
        subtitle: league,
        href: `https://www.thesportsdb.com/event/${item.idEvent}`,
        place: item.strVenue,
        score: 20,
        tags: ['fixture', league.toLowerCase()],
        metrics: [
          { label: 'Kickoff', value: kickoffTime(timestamp) },
          { label: 'League', value: league },
          { label: 'Venue', value: item.strVenue ?? 'To be confirmed' },
          { label: 'Round', value: item.intRound ?? '—' },
        ],
        search: makeSearch(home, away, league, 'football soccer fixture', item.strVenue),
      } satisfies PulseEvent;
    })
    .filter((event): event is PulseEvent => event !== null)
    .sort((a, b) => Math.abs(a.timestamp - now) - Math.abs(b.timestamp - now))
    .slice(0, 12);
}

/* -------------------------------------------------------------------------- */
/* Registry                                                                    */
/* -------------------------------------------------------------------------- */

export const SOURCES: readonly SourceDefinition[] = [
  {
    id: 'earthquake',
    label: 'Earthquakes',
    short: 'Quakes',
    kind: 'event',
    icon: 'activity',
    color: 'var(--src-earthquake)',
    blurb: 'USGS seismic events from the last 24 hours.',
    interval: 60_000,
    docs: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php',
    fetch: fetchEarthquakes,
  },
  {
    id: 'news',
    label: 'World news',
    short: 'News',
    kind: 'event',
    icon: 'feed',
    color: 'var(--src-news)',
    blurb: 'Headlines from Google News via the ok.surf feed.',
    interval: 300_000,
    docs: 'https://ok.surf/',
    fetch: fetchNews,
  },
  {
    id: 'space',
    label: 'Orbital',
    short: 'Orbit',
    kind: 'signal',
    icon: 'orbit',
    color: 'var(--src-space)',
    blurb: 'Live position, altitude and velocity of the ISS.',
    interval: 10_000,
    docs: 'https://wheretheiss.at/',
    fetch: fetchSpace,
  },
  {
    id: 'weather',
    label: 'Weather',
    short: 'Weather',
    kind: 'signal',
    icon: 'cloud',
    color: 'var(--src-weather)',
    blurb: 'Current conditions across six monitored cities.',
    interval: 600_000,
    docs: 'https://open-meteo.com/',
    fetch: fetchWeather,
  },
  {
    id: 'crypto',
    label: 'Markets',
    short: 'Markets',
    kind: 'signal',
    icon: 'coin',
    color: 'var(--src-crypto)',
    blurb: '24-hour price action from Binance public market data.',
    interval: 20_000,
    docs: 'https://binance-docs.github.io/apidocs/spot/en/',
    fetch: fetchCrypto,
  },
  {
    id: 'sports',
    label: 'Fixtures',
    short: 'Sports',
    kind: 'event',
    icon: 'trophy',
    color: 'var(--src-sports)',
    blurb: "Today's football fixtures from TheSportsDB.",
    interval: 900_000,
    docs: 'https://www.thesportsdb.com/free_sports_api',
    fetch: fetchSports,
  },
];

export const SOURCE_BY_ID = Object.fromEntries(
  SOURCES.map((source) => [source.id, source])
) as Record<SourceId, SourceDefinition>;

export const SOURCE_COLORS = Object.fromEntries(
  SOURCES.map((source) => [source.id, source.color])
) as Record<SourceId, string>;

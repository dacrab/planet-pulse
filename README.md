# Planet Pulse

Real-time global event monitoring dashboard. Aggregates 6 live data streams into a single feed with filtering, alerts, and cross-source correlation detection.

## Data Sources

- **Earthquakes** — USGS seismic feed (worldwide, updated every 60s)
- **News** — Reddit /r/worldnews top posts
- **Space** — ISS position tracking (10s interval)
- **Weather** — Open-Meteo for New York, London, Tokyo, Sydney
- **Crypto** — CoinGecko top 20 by market cap
- **Sports** — TheSportsDB daily soccer matches

## Features

- Live feed with automatic polling and visibility-aware pausing
- Filter by source, time range, or free-text search
- Cross-source correlation detection (e.g. earthquakes near monitored cities)
- Alert system with tiered severity (action / watch)
- Reactive connection status indicator
- Full-viewport layout with independent scrolling panels

## Setup

```bash
bun install
bun dev
```

Production build:

```bash
bun run build
```

## Stack

- SolidJS (fine-grained reactivity, Suspense, ErrorBoundary)
- TypeScript
- Tailwind CSS v4
- Vite

## Architecture

```
src/
  components/   UI components (Dashboard, EventFeed, FilterPanel, etc.)
  stores/       Reactive state (polling factory, aggregator, intelligence)
  services/     API fetch functions (one per data source)
  types/        TypeScript interfaces
  utils/        Formatters, color mapping
  hooks/        useVisibility (page visibility API)
  config/       API endpoints and intervals
```

All data flows through a polling factory that creates independent reactive stores per source. The aggregator merges and filters them. Intelligence and insights layers derive alerts and correlations from the combined event stream.

## License

MIT

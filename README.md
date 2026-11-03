# Planet Pulse

Six live feeds on one screen: earthquakes, world headlines, the ISS, weather, markets, football.

**Live demo:** https://planet-pulse-pi.vercel.app

It's a dashboard for the planet's current mood. The overview maps the last day of seismic activity, names the biggest signal, shows a panel per domain and lists what just happened. From there you can search the whole timeline, open any event for its numbers, or check whether a source is healthy or sulking.

## On the dashboard

- A world map you can zoom and pan, with events pinned to it
- A filterable, paged timeline across all six sources
- Per-source latency and cadence, so silence has an explanation
- An "intelligence" page that lines sources up against each other
- City sheets: weather, nearest quake, ISS distance, related headlines
- `⌘K` / `Ctrl K` for the command palette

## Running it

```bash
bun install
bun dev        # http://localhost:5173
```

## About the feeds

No keys, no proxy, no server of its own — every request goes from your browser to a public API: USGS for quakes, Google News via ok.surf, wheretheiss.at, Open-Meteo, Binance and TheSportsDB.

Each polls at its own pace, and all of them stop while the tab is hidden or you're offline. A broken feed keeps its last data on screen instead of blanking the panel. Headlines are matched to cities by text, so those links are approximate. Prices are informational, not financial advice.

SolidJS and Vite, hosted on Vercel. MIT.

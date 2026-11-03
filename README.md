# Planet Pulse

A live dashboard of what's happening on Earth right now.

**Live demo:** https://planet-pulse-pi.vercel.app

Earthquakes, world headlines, the space station, weather in six cities, crypto prices, and football fixtures — all in one place. Open any event for the details, search the whole timeline, or check how each feed is doing. Everything runs in your browser, with no accounts and no tracking.

## Features

- Earthquakes from the last 24 hours, mapped and listed
- World headlines, refreshed every few minutes
- The ISS tracked in real time, with altitude and speed
- Current weather for six cities around the world
- Live prices for 16 cryptocurrencies
- Today's football fixtures with league and venue
- One searchable timeline across every source
- `⌘K` / `Ctrl K` to jump anywhere

## Run it locally

You'll need [Bun](https://bun.sh) installed.

```bash
bun install
bun dev        # http://localhost:5173
```

To build for production:

```bash
bun run build
```

## Good to know

- All data comes from free, public APIs (USGS, Google News via ok.surf, wheretheiss.at, Open-Meteo, Binance, TheSportsDB) and loads straight from your browser.
- Feeds refresh at their own pace, and polling pauses when the tab is hidden or you're offline.
- If a source goes down, its last data stays on screen while it retries.
- Matching headlines to cities is approximate — the news feed has no place metadata.
- Prices are for information only, not financial advice.

## Built with

SolidJS, TypeScript, Vite, and Tailwind CSS. Hosted on Vercel.

## License

MIT

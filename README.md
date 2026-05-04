# 🌍 Planet Pulse

Real-time global event monitoring dashboard built with SolidJS.

## What It Does

Monitors 6 live data streams and surfaces interesting patterns:
- 🌍 **Earthquakes** - Seismic activity worldwide
- 📰 **News** - Top stories from Reddit
- 🛰️ **Space** - ISS location tracking
- 🌤️ **Weather** - Conditions in major cities
- 💰 **Crypto** - Top 20 cryptocurrency prices
- ⚽ **Sports** - Today's soccer matches

## Features

- **Live Updates** - All data refreshes automatically
- **Smart Filtering** - Filter by source, time range, or search
- **Insights** - Activity trends and notable events
- **Achievements** - Track your monitoring milestones

## Quick Start

```bash
bun install
bun dev
```

Build for production:
```bash
bun run build
```

## Tech Stack

- **SolidJS** - Fine-grained reactivity
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## Why SolidJS?

- Fine-grained reactivity - only affected DOM nodes update
- No virtual DOM - direct updates to real DOM
- Handles 100+ events updating simultaneously without lag
- Smaller bundle size than React

## License

MIT

# 🌍 Planet Pulse

**Real-time intelligence platform** that analyzes 6 global data streams to surface actionable insights and cross-source correlations.

Built with **SolidJS** for fine-grained reactivity.

## Purpose

Monitor global events and detect patterns that matter:
- **Earthquakes near flight paths** - Safety-critical geographic correlations
- **Crypto market volatility** - Unusual price movements across multiple assets
- **Activity trends** - Rising or declining event rates
- **Significant events** - Prioritized by impact, not just time

## Features

### Intelligence Layer
- **Smart Alerts**: Action/Watch/FYI tiers for earthquakes near flights, crypto volatility spikes
- **Cross-Source Correlations**: Geographic proximity detection, multi-source pattern matching
- **Real-Time Insights**: "What's happening now" summaries, activity trend analysis
- **Significance Scoring**: Events ranked by actual impact

### Data Sources
- 🌍 **Earthquakes** (USGS) - M2.5+ seismic events
- ✈️ **Flights** (OpenSky Network) - Live aircraft positions
- 🛰️ **ISS** (Open Notify) - Space station tracking
- 🌤️ **Weather** (Open-Meteo) - Major city conditions
- 💰 **Crypto** (Binance WebSocket) - Top 20 coins
- 💻 **GitHub** (GitHub API) - Public repository activity

## Stack

- **SolidJS** - Fine-grained reactivity
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Binance WebSocket** - Real-time crypto prices
- **Free Public APIs** - No authentication required

## Quick Start

```bash
bun install
bun dev
```

Build for production:

```bash
bun run build
```

## Architecture

### Data Flow
```
External APIs → Services → Stores → Aggregator → Components
                    ↓
              (Polling/WebSocket)
```

### Store Pattern
- **Individual stores** per data source (signals for state)
- **Polling stores** with subscribe/unsubscribe lifecycle
- **WebSocket store** with auto-reconnect for crypto
- **Aggregator store** with memos for filtering and stats
- **Context API** for global state distribution

### File Structure
```
src/
├── types/           # Event and store interfaces
├── services/        # API clients (REST + WebSocket)
├── stores/          # State management (signals + stores)
├── hooks/           # Custom hooks (visibility)
├── utils/           # Formatters, async utilities
├── config/          # API endpoints and intervals
└── components/      # UI components
```

## Why SolidJS?

This project demonstrates SolidJS's strengths:

- **Fine-grained reactivity** - Only affected DOM nodes update when data changes
- **No virtual DOM** - Direct updates to real DOM
- **Memos** - Efficient derived state (filtering, stats calculations)
- **Stores** - Nested reactivity for complex state
- **Performance** - Handles 100+ events updating simultaneously without lag

## License

MIT

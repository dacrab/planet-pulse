# Planet Pulse

A live world monitor: six public feeds — earthquakes, world news, the ISS, weather, markets and football fixtures — merged into one reactive timeline.

Built as a deliberate showcase of SolidJS. No API keys, no proxy, no backend, no tracking.

## Run it

```bash
bun install
bun dev        # http://localhost:5173
bun run typecheck
bun run build
bun run preview
```

## Routes

| Route | What it is |
| --- | --- |
| `/` | Overview: world map, top event, feed status, three domain panels, latest events |
| `/feed` | Searchable, filterable, paged timeline across every source |
| `/sources` | Per-source health, latency, cadence and sparklines |
| `/sources/:source` | Detail view for one feed with its own search |
| `/intelligence` | Derived cross-source correlations, alerts, range checks and method |
| `*` | 404 |

Open an event from anywhere and the drawer is encoded in the URL (`?event=…`), so it can be linked and survives reloads.

## Data sources

Every request runs in the browser against a public, CORS-enabled endpoint.

| Source | Endpoint | Cadence |
| --- | --- | --- |
| Earthquakes | USGS `all_day.geojson` | 60s |
| World news | ok.surf Google News feed | 5m |
| Orbital | wheretheiss.at ISS position | 10s |
| Weather | Open-Meteo, six cities | 10m |
| Markets | Binance public 24h tickers | 20s |
| Fixtures | TheSportsDB daily soccer | 15m |

Polling pauses when the tab is hidden, when the feeds are paused, or when the browser is offline. A failed source is isolated: its last data stays visible while the next poll retries.

## SolidJS features used

- **Fine-grained reactivity** — signals, memos, `createEffect`, `batch`, `untrack`
- **Stores** — a single `createStore` for filters and a `produce`-updated ISS trail
- **Async** — `createResource` per source, `Suspense` route fallback, `ErrorBoundary`
- **Scheduling** — `createDeferred` search input, `useTransition` for filters
- **Selection** — `createSelector` for event-row highlighting
- **Composition** — `Show`, `For`, `Index`, `Switch`/`Match`, `Dynamic`
- **Props** — `mergeProps`, `splitProps`, `children`
- **Lifecycle** — `onMount`, `onCleanup`, custom hooks
- **DOM** — `ref`, `classList`, `Portal`, custom directives (`use:focus`, `use:reveal`)
- **Router/meta** — lazy routes, `@solidjs/router`, title/meta tags, URL search params
- **Context** — one `PulseProvider` reactive core instead of stacked stores

## Architecture

```
src/
  App.tsx                 router + lazy routes
  index.tsx               entry
  index.css               design tokens, themes, component CSS
  types.ts                PulseEvent, filters, correlations, alerts
  data/
    sources.ts            six adapters + source registry
    world.ts              map projection helpers
    land.ts               Natural Earth land path (generated)
  lib/
    format.ts             clock, relative time, prices, numbers
    analysis.ts           correlations, alerts, brief, rankings
  hooks/                  now, online, visibility, persisted signal
  stores/pulse.tsx        the reactive core (PulseProvider / usePulse)
  directives.ts           focus + reveal
  components/             shell, map, panels, command palette, drawer
  routes/                 overview, feed, sources, source detail, intelligence, 404
```

The old layered stores/services/config split was replaced with one provider that owns source runtimes, filters, derived analysis, theme, playback state and URL selection. Source adapters normalize everything into one `PulseEvent` shape with optional metrics, geo and search text.

## Design

A flat instrument-panel look: warm paper and charcoal surfaces, one safety-orange accent, Archivo for display and UI type, and IBM Plex Mono for data. Panels are square-edged and divided by hairline borders instead of shadows or glass. The world map is generated offline from Natural Earth 110m land polygons and drawn as a single SVG path. Motion respects `prefers-reduced-motion`.

## License

MIT

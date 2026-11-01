import {
  batch,
  createComputed,
  createContext,
  createDeferred,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  on,
  onCleanup,
  untrack,
  useContext,
  type Accessor,
  type JSX,
  type Setter,
} from 'solid-js';
import { createStore, produce, type SetStoreFunction } from 'solid-js/store';
import { useSearchParams } from '@solidjs/router';
import {
  SOURCES,
  SOURCE_BY_ID,
  type SourceDefinition,
} from '../data/sources';
import {
  buildBrief,
  detectCorrelations,
  sourceCounts,
  toAlerts,
  topSignal,
} from '../lib/analysis';
import { timeAgoLabel } from '../lib/format';
import { useNow } from '../hooks/useNow';
import { useOnline } from '../hooks/useOnline';
import { usePersistedSignal } from '../hooks/usePersistedSignal';
import { useVisibility } from '../hooks/useVisibility';
import type {
  Alert,
  BriefItem,
  Correlation,
  Filters,
  GlobalStatus,
  PulseEvent,
  SourceId,
  SourceStatus,
  Theme,
  TrailPoint,
} from '../types';

interface SourceResult {
  events: PulseEvent[];
  fetchedAt: number;
  latency: number;
}

export interface SourceRuntime {
  meta: SourceDefinition;
  events: Accessor<PulseEvent[]>;
  status: Accessor<SourceStatus>;
  error: Accessor<string | null>;
  fetchedAt: Accessor<number>;
  latency: Accessor<number>;
  refresh: () => void;
}

const ALL_SOURCE_IDS = SOURCES.map((source) => source.id);

const defaultFilters: Filters = {
  sources: [...ALL_SOURCE_IDS],
  window: null,
  query: '',
  sort: 'newest',
  kind: 'all',
};

function createSourceRuntime(
  meta: SourceDefinition,
  options: {
    paused: Accessor<boolean>;
    visible: Accessor<boolean>;
    online: Accessor<boolean>;
  }
): SourceRuntime {
  const [tick, setTick] = createSignal(0);
  const [data, setData] = createSignal<SourceResult | null>(null);
  const [failure, setFailure] = createSignal<string | null>(null);

  const [resource] = createResource(tick, async () => {
    const started = performance.now();
    try {
      const events = await meta.fetch();
      batch(() => {
        setData({
          events,
          fetchedAt: Date.now(),
          latency: Math.round(performance.now() - started),
        });
        setFailure(null);
      });
      return true;
    } catch (error) {
      // Catch inside the fetcher so a failed source never reaches the route
      // ErrorBoundary. Its last good data stays on screen.
      setFailure(error instanceof Error ? error.message : String(error));
      return false;
    }
  });

  createEffect(() => {
    if (options.paused() || !options.visible() || !options.online()) return;
    const timer = setInterval(() => setTick((value) => value + 1), meta.interval);
    onCleanup(() => clearInterval(timer));
  });

  // When polling resumes after a pause, a hidden tab or a dropped connection,
  // refresh immediately instead of waiting for the next interval.
  createEffect(
    on(
      [options.paused, options.visible, options.online],
      ([paused, visible, online]) => {
        if (paused || !visible || !online) return;
        const last = untrack(() => data()?.fetchedAt ?? 0);
        const staleAfter = Math.min(meta.interval, 30_000);
        if (!last || Date.now() - last > staleAfter) {
          setTick((value) => value + 1);
        }
      },
      { defer: true }
    )
  );

  const status = createMemo<SourceStatus>(() => {
    switch (resource.state) {
      case 'pending':
        return 'loading';
      case 'refreshing':
        return 'refreshing';
      case 'ready':
        if (failure()) return data() ? 'stale' : 'error';
        return 'ready';
      default:
        return 'idle';
    }
  });

  return {
    meta,
    events: () => data()?.events ?? [],
    status,
    error: failure,
    fetchedAt: () => data()?.fetchedAt ?? 0,
    latency: () => data()?.latency ?? 0,
    refresh: () => setTick((value) => value + 1),
  };
}

export interface PulseStore {
  sources: Record<SourceId, SourceRuntime>;
  events: Accessor<PulseEvent[]>;
  filters: Filters;
  setFilters: SetStoreFunction<Filters>;
  filtered: Accessor<PulseEvent[]>;
  counts: Accessor<Record<SourceId, number>>;
  top: Accessor<PulseEvent | null>;
  brief: Accessor<BriefItem[]>;
  correlations: Accessor<Correlation[]>;
  activeCorrelations: Accessor<Correlation[]>;
  alerts: Accessor<Alert[]>;
  dismissed: Accessor<string[]>;
  dismissAlert: (id: string) => void;
  restoreAlerts: () => void;
  status: Accessor<GlobalStatus>;
  paused: Accessor<boolean>;
  togglePaused: () => void;
  refreshAll: () => void;
  now: Accessor<number>;
  theme: Accessor<Theme>;
  toggleTheme: () => void;
  commandOpen: Accessor<boolean>;
  setCommandOpen: Setter<boolean>;
  selectedEvent: Accessor<PulseEvent | null>;
  openEvent: (id: string) => void;
  closeEvent: () => void;
  issTrail: Accessor<TrailPoint[]>;
  online: Accessor<boolean>;
  lastUpdateLabel: Accessor<string>;
}

const PulseContext = createContext<PulseStore>();

export function PulseProvider(props: { children: JSX.Element }) {
  const now = useNow();
  const visible = useVisibility();
  const online = useOnline();
  const [paused, setPaused] = createSignal(false);
  const [commandOpen, setCommandOpen] = createSignal(false);
  const [dismissed, setDismissed] = createSignal<string[]>([]);

  const prefersLight =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: light)').matches;

  const [theme, setTheme] = usePersistedSignal<Theme>(
    'pulse:theme',
    prefersLight ? 'light' : 'dark'
  );

  createComputed(() => {
    if (typeof document === 'undefined') return;
    const value = theme();
    document.documentElement.dataset.theme = value;
    document.documentElement.style.colorScheme = value;
  });

  const runtimes = Object.fromEntries(
    SOURCES.map((source) => [
      source.id,
      createSourceRuntime(source, { paused, visible, online }),
    ])
  ) as Record<SourceId, SourceRuntime>;

  const events = createMemo(() => {
    const all: PulseEvent[] = [];
    for (const source of SOURCES) all.push(...runtimes[source.id].events());
    return all.sort(
      (a, b) => b.timestamp - a.timestamp || b.score - a.score
    );
  });

  const eventById = createMemo(
    () => new Map(events().map((event) => [event.id, event]))
  );

  const [filters, setFilters] = createStore<Filters>({ ...defaultFilters });
  const deferredQuery = createDeferred(() => filters.query);

  const allowedSources = createMemo(() => new Set(filters.sources));

  const filtered = createMemo(() => {
    const query = deferredQuery().trim().toLowerCase();
    const allowed = allowedSources();
    const cutoff =
      filters.window === null
        ? Number.NEGATIVE_INFINITY
        : now() - filters.window * 60_000;
    const kind = filters.kind;

    const result = events().filter((event) => {
      if (!allowed.has(event.source)) return false;
      if (kind !== 'all' && SOURCE_BY_ID[event.source].kind !== kind) return false;
      if (event.timestamp < cutoff) return false;
      if (query && !event.search.includes(query)) return false;
      return true;
    });

    if (filters.sort === 'impact') {
      result.sort((a, b) => b.score - a.score || b.timestamp - a.timestamp);
    }

    return result;
  });

  const counts = createMemo(() => sourceCounts(events()));
  const top = createMemo(() => topSignal(events(), now()));
  const brief = createMemo(() => buildBrief(events(), now()));
  const correlations = createMemo(() => detectCorrelations(events(), now()));
  const activeCorrelations = createMemo(() =>
    correlations().filter((correlation) => !dismissed().includes(correlation.id))
  );
  const alerts = createMemo(() => toAlerts(activeCorrelations()));

  const status = createMemo<GlobalStatus>(() => {
    if (!online()) return 'offline';
    if (paused()) return 'paused';

    const states = SOURCES.map((source) => runtimes[source.id].status());

    if (states.every((state) => state === 'error')) return 'error';
    if (events().length === 0 && states.some((state) => state === 'loading')) {
      return 'connecting';
    }
    if (states.some((state) => state === 'error' || state === 'stale')) {
      return 'degraded';
    }
    if (states.some((state) => state === 'refreshing' || state === 'loading')) {
      return 'syncing';
    }
    return 'live';
  });

  const [trail, setTrail] = createStore<{ points: TrailPoint[] }>({
    points: [],
  });

  createEffect(() => {
    const iss = runtimes.space.events()[0];
    if (iss?.lat === undefined || iss.lon === undefined) return;

    const last = untrack(() => trail.points[trail.points.length - 1]);
    if (last && last.timestamp === iss.timestamp) return;

    const lat = iss.lat;
    const lon = iss.lon;
    const timestamp = iss.timestamp;

    setTrail(
      produce((state) => {
        state.points.push({ lat, lon, timestamp });
        if (state.points.length > 18) state.points.shift();
      })
    );
  });

  const [searchParams, setSearchParams] = useSearchParams<{ event?: string }>();

  const selectedEvent = createMemo(() => {
    const id = searchParams.event;
    return id ? eventById().get(id) ?? null : null;
  });

  const openEvent = (id: string) => {
    batch(() => {
      setCommandOpen(false);
      setSearchParams({ ...searchParams, event: id });
    });
  };

  const closeEvent = () => {
    setSearchParams({ ...searchParams, event: undefined });
  };

  const dismissAlert = (id: string) =>
    setDismissed((current) =>
      current.includes(id) ? current : [...current, id]
    );

  const restoreAlerts = () => setDismissed([]);

  const togglePaused = () => setPaused((value) => !value);
  const toggleTheme = () =>
    setTheme((value) => (value === 'dark' ? 'light' : 'dark'));

  const refreshAll = () =>
    batch(() => SOURCES.forEach((source) => runtimes[source.id].refresh()));

  const lastUpdateLabel = createMemo(() => {
    const stamps = SOURCES.map((source) => runtimes[source.id].fetchedAt()).filter(
      (stamp) => stamp > 0
    );
    if (!stamps.length) return 'waiting';
    return timeAgoLabel(Math.max(...stamps), now());
  });

  const store: PulseStore = {
    sources: runtimes,
    events,
    filters,
    setFilters,
    filtered,
    counts,
    top,
    brief,
    correlations,
    activeCorrelations,
    alerts,
    dismissed,
    dismissAlert,
    restoreAlerts,
    status,
    paused,
    togglePaused,
    refreshAll,
    now,
    theme,
    toggleTheme,
    commandOpen,
    setCommandOpen,
    selectedEvent,
    openEvent,
    closeEvent,
    issTrail: () => trail.points,
    online,
    lastUpdateLabel,
  };

  return (
    <PulseContext.Provider value={store}>
      {props.children}
    </PulseContext.Provider>
  );
}

export function usePulse() {
  const store = useContext(PulseContext);
  if (!store) throw new Error('usePulse must be used inside <PulseProvider>');
  return store;
}

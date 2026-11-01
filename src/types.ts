export type SourceId =
  | 'earthquake'
  | 'news'
  | 'space'
  | 'weather'
  | 'crypto'
  | 'sports';

export type SourceKind = 'event' | 'signal';

export type Theme = 'dark' | 'light';

export type GlobalStatus =
  | 'live'
  | 'syncing'
  | 'connecting'
  | 'degraded'
  | 'error'
  | 'paused'
  | 'offline';

export type SourceStatus =
  | 'idle'
  | 'loading'
  | 'refreshing'
  | 'ready'
  | 'stale'
  | 'error';

export type IconName =
  | 'activity'
  | 'alert'
  | 'arrow-right'
  | 'arrow-up-right'
  | 'check'
  | 'clock'
  | 'cloud'
  | 'coin'
  | 'copy'
  | 'external'
  | 'feed'
  | 'globe'
  | 'layers'
  | 'map-pin'
  | 'moon'
  | 'orbit'
  | 'pause'
  | 'play'
  | 'pulse'
  | 'rain'
  | 'refresh'
  | 'search'
  | 'sliders'
  | 'snow'
  | 'spark'
  | 'storm'
  | 'sun'
  | 'trophy'
  | 'x';

export interface EventMetric {
  label: string;
  value: string;
  tone?: 'up' | 'down' | 'neutral';
}

export interface PulseEvent {
  id: string;
  source: SourceId;
  timestamp: number;
  title: string;
  subtitle: string;
  href?: string;
  image?: string;
  lat?: number;
  lon?: number;
  place?: string;
  /** 0–100 priority score, used for ranking and the score meter. */
  score: number;
  /** Primary numeric value: magnitude, price, temperature, altitude. */
  value?: number;
  /** Signed change where relevant (markets). */
  delta?: number;
  unit?: string;
  tags: string[];
  metrics: EventMetric[];
  search: string;
}

export interface SourceMeta {
  id: SourceId;
  label: string;
  short: string;
  kind: SourceKind;
  icon: IconName;
  blurb: string;
  interval: number;
  docs: string;
}

export interface Filters {
  sources: SourceId[];
  window: number | null;
  query: string;
  sort: 'newest' | 'impact';
  kind: 'all' | SourceKind;
}

export type AlertTier = 'watch' | 'action';

export interface Correlation {
  id: string;
  kind: 'seismic' | 'market' | 'orbit';
  title: string;
  description: string;
  significance: number;
  timestamp: number;
  eventIds: string[];
  sourceIds: SourceId[];
}

export interface Alert extends Correlation {
  tier: AlertTier;
}

export interface BriefItem {
  label: string;
  value: string;
  detail: string;
  source: SourceId;
}

export interface TrailPoint {
  lat: number;
  lon: number;
  timestamp: number;
}

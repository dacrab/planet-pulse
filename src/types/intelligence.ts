import { Event, EventSource } from './events';

export type AlertTier = 'fyi' | 'watch' | 'action';

export interface Alert {
  id: string;
  tier: AlertTier;
  title: string;
  message: string;
  timestamp: number;
  events: Event[];
  dismissed: boolean;
  correlationType?: string;
}

export interface Correlation {
  id: string;
  type: 'geographic' | 'temporal' | 'pattern';
  events: Event[];
  significance: number; // 0-100
  description: string;
  timestamp: number;
}

export interface AnomalyScore {
  source: EventSource;
  score: number; // 0-100, higher = more unusual
  reason: string;
  timestamp: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress?: number;
  target?: number;
}

export interface TrendData {
  source: EventSource;
  direction: 'up' | 'down' | 'stable';
  change: number; // percentage
  prediction?: string;
}

import { EventSource } from './events';

export type AlertTier = 'fyi' | 'watch' | 'action';

export interface Alert {
  id: string;
  tier: AlertTier;
  title: string;
  message: string;
  timestamp: number;
  events: import('./events').Event[];
  dismissed: boolean;
  correlationType?: string;
}

export interface Correlation {
  id: string;
  type: 'geographic' | 'temporal' | 'pattern';
  events: import('./events').Event[];
  significance: number;
  description: string;
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

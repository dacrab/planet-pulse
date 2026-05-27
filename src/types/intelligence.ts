export type AlertTier = 'fyi' | 'watch' | 'action';

export interface Alert {
  id: string;
  tier: AlertTier;
  title: string;
  message: string;
  timestamp: number;
  events: import('./events').Event[];
}

export interface Correlation {
  id: string;
  type: 'geographic' | 'temporal' | 'pattern';
  events: import('./events').Event[];
  significance: number;
  description: string;
  timestamp: number;
}

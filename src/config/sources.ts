import { EventSource } from '../types/events';

export const SOURCES: { id: EventSource; label: string; shortLabel: string }[] = [
  { id: 'earthquake', label: 'Earthquakes', shortLabel: 'Quakes' },
  { id: 'news',       label: 'News',        shortLabel: 'News' },
  { id: 'space',      label: 'Space',       shortLabel: 'Space' },
  { id: 'weather',    label: 'Weather',     shortLabel: 'Weather' },
  { id: 'crypto',     label: 'Crypto',      shortLabel: 'Crypto' },
  { id: 'sports',     label: 'Sports',      shortLabel: 'Sports' },
];

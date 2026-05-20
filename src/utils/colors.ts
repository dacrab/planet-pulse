import { EventSource } from '../types/events';

export const eventColors: Record<EventSource, { bg: string; text: string }> = {
  earthquake: { bg: 'bg-earthquake', text: 'text-earthquake' },
  news:       { bg: 'bg-news',      text: 'text-news' },
  space:      { bg: 'bg-space',     text: 'text-space' },
  weather:    { bg: 'bg-weather',   text: 'text-weather' },
  crypto:     { bg: 'bg-crypto',    text: 'text-crypto' },
  sports:     { bg: 'bg-sports',    text: 'text-sports' },
};

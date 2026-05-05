import { EventSource } from '../types/events';

export const eventColors: Record<EventSource, { bg: string; text: string }> = {
  earthquake: { bg: 'bg-red-500',    text: 'text-red-500' },
  news:       { bg: 'bg-blue-500',   text: 'text-blue-500' },
  space:      { bg: 'bg-purple-500', text: 'text-purple-500' },
  weather:    { bg: 'bg-cyan-500',   text: 'text-cyan-500' },
  crypto:     { bg: 'bg-yellow-500', text: 'text-yellow-500' },
  sports:     { bg: 'bg-green-500',  text: 'text-green-500' },
};

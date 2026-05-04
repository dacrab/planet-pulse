import { EventSource } from './types/events';

export const eventColors: Record<EventSource, { bg: string; text: string; bg10: string }> = {
  earthquake: { bg: 'bg-red-500', text: 'text-red-500', bg10: 'bg-red-500/10' },
  news: { bg: 'bg-blue-500', text: 'text-blue-500', bg10: 'bg-blue-500/10' },
  space: { bg: 'bg-purple-500', text: 'text-purple-500', bg10: 'bg-purple-500/10' },
  weather: { bg: 'bg-cyan-500', text: 'text-cyan-500', bg10: 'bg-cyan-500/10' },
  crypto: { bg: 'bg-yellow-500', text: 'text-yellow-500', bg10: 'bg-yellow-500/10' },
  sports: { bg: 'bg-green-500', text: 'text-green-500', bg10: 'bg-green-500/10' },
};

// Event source color mapping (CSS classes defined in app.css)
export const eventColors = {
  earthquake: 'earthquake',
  flight: 'flight',
  iss: 'iss',
  weather: 'weather',
  crypto: 'crypto',
  github: 'github',
} as const;

export type EventColorKey = keyof typeof eventColors;

const clockFormatter = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});

const kickoffFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const compactFormatter = new Intl.NumberFormat(undefined, {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function timeAgo(timestamp: number, now = Date.now()): string {
  const diff = now - timestamp;

  if (diff < 0) {
    const ahead = Math.abs(diff);
    if (ahead < 60_000) return 'soon';
    if (ahead < 3_600_000) return `in ${Math.floor(ahead / 60_000)}m`;
    if (ahead < 86_400_000) return `in ${Math.floor(ahead / 3_600_000)}h`;
    return `in ${Math.floor(ahead / 86_400_000)}d`;
  }

  if (diff < 10_000) return 'now';
  if (diff < 60_000) return `${Math.floor(diff / 1_000)}s`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
}

/** Human label with a natural suffix: "just now", "4m ago", "in 2h". */
export function timeAgoLabel(timestamp: number, now = Date.now()): string {
  const value = timeAgo(timestamp, now);
  if (value === 'now') return 'just now';
  if (value.startsWith('in ') || value === 'soon') return value;
  return `${value} ago`;
}

export const clockTime = (timestamp: number) => clockFormatter.format(timestamp);

export const calendarDate = (timestamp: number) => dateFormatter.format(timestamp);

export const kickoffTime = (timestamp: number) => kickoffFormatter.format(timestamp);

export const compactNumber = (value: number) => compactFormatter.format(value);

export function price(value: number): string {
  if (!Number.isFinite(value)) return '—';
  if (value >= 1_000) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
  if (value >= 1) {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export const percent = (value: number) =>
  `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

export const round = (value: number) => Math.round(value).toLocaleString();

export const intervalLabel = (ms: number) => {
  if (ms < 60_000) return `${Math.round(ms / 1_000)}s`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m`;
  return `${Math.round(ms / 3_600_000)}h`;
};

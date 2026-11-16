const DAY = 86_400_000;

const startOfDay = (ts: number) => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export const isSameDay = (a: number, b: number) => startOfDay(a) === startOfDay(b);

export const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

const daysAgo = (ts: number, now: number) => Math.round((startOfDay(now) - startOfDay(ts)) / DAY);

/** Label for date separators inside a conversation. */
export function formatDayLabel(ts: number, now = Date.now()) {
  const diff = daysAgo(ts, now);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return new Date(ts).toLocaleDateString(undefined, { weekday: 'long' });
  return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Compact timestamp for the conversation list. */
export function formatListTimestamp(ts: number, now = Date.now()) {
  const diff = daysAgo(ts, now);
  if (diff === 0) return formatTime(ts);
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return new Date(ts).toLocaleDateString(undefined, { weekday: 'short' });
  return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function formatLastSeen(ts: number, now = Date.now()) {
  const mins = Math.round((now - ts) / 60_000);
  if (mins < 1) return 'last seen just now';
  if (mins < 60) return `last seen ${mins}m ago`;
  if (isSameDay(ts, now)) return `last seen today at ${formatTime(ts)}`;
  return `last seen ${formatListTimestamp(ts, now)}`;
}

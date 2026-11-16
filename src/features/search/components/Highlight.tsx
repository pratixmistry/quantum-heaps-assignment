import { useMemo } from 'react';
import { escapeRegExp } from '@/utils/format';

/** Wraps case-insensitive matches of `query` in <mark>. */
export function Highlight({ text, query }: { text: string; query: string }) {
  const parts = useMemo(() => {
    const q = query.trim();
    return q ? text.split(new RegExp(`(${escapeRegExp(q)})`, 'gi')) : [text];
  }, [text, query]);

  if (parts.length === 1) return <>{text}</>;
  // split() with a capture group puts matches at odd indices.
  return <>{parts.map((p, i) => (i % 2 ? <mark key={i}>{p}</mark> : p))}</>;
}

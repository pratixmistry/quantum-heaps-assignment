import { useEffect, useMemo, useState } from 'react';
import { useDebouncedValue } from '@/features/search/hooks/useDebouncedValue';
import { useChatStore } from '@/store/chatStore';
import type { Message } from '@/types/chat';

const EMPTY: Message[] = [];

/** In-conversation search with debounced query and next/previous navigation (newest match first). */
export function useMessageSearch(conversationId: string, rawQuery: string) {
  const messages = useChatStore((s) => s.messages[conversationId] ?? EMPTY);
  const hasMore = useChatStore((s) => s.hasMore[conversationId]);
  const loadingOlder = useChatStore((s) => s.loadingOlder[conversationId]);
  const loadOlder = useChatStore((s) => s.loadOlderMessages);
  const query = useDebouncedValue(rawQuery.trim(), 250);
  const [index, setIndex] = useState(0);

  const matchIds = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return messages.filter((m) => !m.deleted && m.text.toLowerCase().includes(q)).map((m) => m.id).reverse();
  }, [messages, query]);

  // Search should cover the whole history, so pull remaining pages while a query is active.
  useEffect(() => {
    if (query && hasMore && !loadingOlder) void loadOlder(conversationId);
  }, [query, hasMore, loadingOlder, loadOlder, conversationId]);

  useEffect(() => setIndex(0), [query]);

  const count = matchIds.length;
  return {
    query,
    count,
    index: count ? Math.min(index, count - 1) : -1,
    currentId: count ? matchIds[Math.min(index, count - 1)] : undefined,
    next: () => count && setIndex((i) => (i + 1) % count),
    prev: () => count && setIndex((i) => (i - 1 + count) % count),
  };
}

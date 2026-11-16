import { useMemo } from 'react';
import { useDebouncedValue } from '@/features/search/hooks/useDebouncedValue';
import { useChatStore } from '@/store/chatStore';
import { useUiStore } from '@/store/uiStore';
import { buildConversationSummaries, filterConversations } from '../utils/conversationSummary';

export function useConversationList(rawQuery: string) {
  const conversations = useChatStore((s) => s.conversations);
  const messages = useChatStore((s) => s.messages);
  const users = useChatStore((s) => s.users);
  const currentUserId = useChatStore((s) => s.currentUserId);
  const filter = useUiStore((s) => s.filter);
  const query = useDebouncedValue(rawQuery, 250);

  const summaries = useMemo(
    () => buildConversationSummaries({ conversations, messages, users, currentUserId }),
    [conversations, messages, users, currentUserId],
  );
  const items = useMemo(() => filterConversations(summaries, filter, query), [summaries, filter, query]);

  return { items, query, filter };
}

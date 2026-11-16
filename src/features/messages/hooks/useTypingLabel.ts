import { useMemo } from 'react';
import { useChatStore } from '@/store/chatStore';

/** Human-readable typing label, e.g. "Priya is typing…" or "typing…" for direct chats. */
export function useTypingLabel(conversationId: string, isGroup: boolean) {
  const typingIds = useChatStore((s) => s.typing[conversationId]);
  const users = useChatStore((s) => s.users);

  return useMemo(() => {
    if (!typingIds?.length) return null;
    if (!isGroup) return 'typing…';
    const names = typingIds.map((id) => users[id]?.name.split(' ')[0] ?? 'Someone');
    if (names.length === 1) return `${names[0]} is typing…`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing…`;
    return 'Several people are typing…';
  }, [typingIds, users, isGroup]);
}

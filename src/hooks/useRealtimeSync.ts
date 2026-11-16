import { useEffect } from 'react';
import { realtime, type ServerEvent } from '@/services/mockApi/realtime';
import { useChatStore } from '@/store/chatStore';

function dispatch(event: ServerEvent) {
  const s = useChatStore.getState();
  switch (event.type) {
    case 'message:new':
      return s.receiveMessage(event.message);
    case 'message:status':
      return s.setMessageStatus(event.conversationId, event.messageId, event.status);
    case 'typing':
      return s.setTyping(event.conversationId, event.userId, event.isTyping);
    case 'presence':
      return s.setPresence(event.userId, event.status);
  }
}

/** Bridges the (mock) realtime channel into the store for the lifetime of the app. */
export function useRealtimeSync(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    return realtime.connect(dispatch, () => {
      const { currentUserId, conversations } = useChatStore.getState();
      return { currentUserId, conversations };
    });
  }, [enabled]);
}

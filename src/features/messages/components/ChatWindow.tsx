import { useEffect, useState } from 'react';
import { MessagesSquare } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useChatStore } from '@/store/chatStore';
import { getConversationTitle, getPeer, selectActiveConversation } from '@/store/selectors';
import { useUiStore } from '@/store/uiStore';
import { useMessageSearch } from '../hooks/useMessageSearch';
import { useTypingLabel } from '../hooks/useTypingLabel';
import { ChatHeader } from './ChatHeader';
import { Composer } from './Composer';
import { MessageList } from './MessageList';
import { MessageSearchBar } from './MessageSearchBar';
import { TypingIndicator } from './TypingIndicator';

export function ChatWindow() {
  const conversation = useChatStore(selectActiveConversation);
  if (!conversation) {
    return (
      <EmptyState icon={<MessagesSquare />} title="Select a conversation" description="Pick a chat from the list to start messaging. Press Ctrl+K to search." />
    );
  }
  // Keying by id resets local state (search query, composer draft) when switching conversations.
  return <ActiveChat key={conversation.id} conversationId={conversation.id} />;
}

function ActiveChat({ conversationId }: { conversationId: string }) {
  const conversation = useChatStore((s) => s.conversations[conversationId]!);
  const users = useChatStore((s) => s.users);
  const me = useChatStore((s) => s.currentUserId);
  const searchOpen = useUiStore((s) => s.messageSearchOpen);
  const setSearchOpen = useUiStore((s) => s.setMessageSearchOpen);
  const [query, setQuery] = useState('');
  const search = useMessageSearch(conversationId, searchOpen ? query : '');
  const isGroup = conversation.type === 'group';
  const typingLabel = useTypingLabel(conversationId, isGroup);
  const title = getConversationTitle(conversation, users, me);
  const peer = getPeer(conversation, users, me);

  // Reset transient UI owned by the previous conversation.
  useEffect(() => {
    useUiStore.getState().setComposerContext(null);
    return () => useUiStore.getState().setMessageSearchOpen(false);
  }, []);

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <ChatHeader conversation={conversation} title={title} peer={peer} typingLabel={typingLabel} />
      {searchOpen && (
        <MessageSearchBar
          value={query}
          onChange={setQuery}
          onClose={() => {
            setQuery('');
            setSearchOpen(false);
          }}
          count={search.count}
          index={search.index}
          hasQuery={!!search.query}
          onNext={search.next}
          onPrev={search.prev}
        />
      )}
      <MessageList conversation={conversation} title={title} searchQuery={search.query} currentMatchId={search.currentId} />
      <div className="relative">
        <TypingIndicator label={typingLabel} />
        <Composer conversation={conversation} />
      </div>
    </div>
  );
}

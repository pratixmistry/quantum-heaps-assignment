import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ArrowDown, Loader2, MessageCircle } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useChatStore } from '@/store/chatStore';
import { toast } from '@/store/feedbackStore';
import type { Conversation, Message } from '@/types/chat';
import { useChatScroll } from '../hooks/useChatScroll';
import { groupMessagesByDay } from '../utils/groupMessages';
import { MessageBubble } from './MessageBubble';
import { DateSeparator } from './MessageParts';

const EMPTY: Message[] = [];

interface MessageListProps {
  conversation: Conversation;
  title: string;
  searchQuery: string;
  currentMatchId?: string;
}

export function MessageList({ conversation, title, searchQuery, currentMatchId }: MessageListProps) {
  const { id } = conversation;
  const containerRef = useRef<HTMLDivElement>(null);
  const messages = useChatStore((s) => s.messages[id] ?? EMPTY);
  const hasMore = useChatStore((s) => !!s.hasMore[id]);
  const loadingOlder = useChatStore((s) => !!s.loadingOlder[id]);
  const currentUserId = useChatStore((s) => s.currentUserId);
  const loadOlderMessages = useChatStore((s) => s.loadOlderMessages);

  const loadOlder = useCallback(
    () => loadOlderMessages(id).catch(() => toast.error('Couldn’t load older messages')),
    [id, loadOlderMessages],
  );

  const { onScroll, unseen, scrollToBottom } = useChatScroll({
    containerRef, conversationId: id, messages, currentUserId, canLoadOlder: hasMore && !loadingOlder, loadOlder,
  });

  const sections = useMemo(() => groupMessagesByDay(messages), [messages]);

  useEffect(() => {
    if (currentMatchId) document.getElementById(`msg-${currentMatchId}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [currentMatchId]);

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={containerRef} onScroll={onScroll} role="log" aria-label={`Messages with ${title}`} className="h-full overflow-x-hidden overflow-y-auto pt-2 pb-8">
        {hasMore ? (
          <div className="flex h-10 items-center justify-center text-fg-muted">
            {loadingOlder && <Loader2 className="size-4 animate-spin" aria-label="Loading older messages" />}
          </div>
        ) : (
          messages.length > 0 && <p className="py-4 text-center text-xs text-fg-muted">This is the beginning of your conversation with {title}.</p>
        )}

        {messages.length === 0 ? (
          <div className="flex h-full">
            <EmptyState
              icon={<MessageCircle />}
              title="No messages yet"
              description={conversation.type === 'group' ? `Start the conversation in ${title}.` : `Say hello to ${title} 👋`}
            />
          </div>
        ) : (
          sections.map((section) => (
            <section key={section.key} aria-label={section.label}>
              <DateSeparator label={section.label} />
              {section.rows.map(({ message, startsRun }) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  startsRun={startsRun}
                  isGroup={conversation.type === 'group'}
                  highlight={searchQuery}
                  isCurrentMatch={message.id === currentMatchId}
                />
              ))}
            </section>
          ))
        )}
      </div>

      {unseen > 0 && (
        <button
          type="button"
          onClick={() => scrollToBottom('smooth')}
          className="animate-slide-up absolute bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium text-white shadow-lg"
        >
          <ArrowDown className="size-3.5" aria-hidden />
          {unseen} new {unseen === 1 ? 'message' : 'messages'}
        </button>
      )}
    </div>
  );
}

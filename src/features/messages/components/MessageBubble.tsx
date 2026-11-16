import { memo, useState } from 'react';
import { RotateCw } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Highlight } from '@/features/search/components/Highlight';
import { useChatStore } from '@/store/chatStore';
import type { Message } from '@/types/chat';
import { cn } from '@/utils/cn';
import { formatTime } from '@/utils/date';
import { useMessageActions } from '../hooks/useMessageActions';
import { AttachmentView, ReactionBar, ReplyQuote, StatusIcon } from './MessageParts';
import { MessageToolbar } from './MessageToolbar';

interface MessageBubbleProps {
  message: Message;
  startsRun: boolean;
  isGroup: boolean;
  highlight: string;
  isCurrentMatch: boolean;
}

const isTouch = () => window.matchMedia?.('(hover: none)').matches;

/** Memoised: store updates replace only the changed message object, so siblings skip re-rendering. */
export const MessageBubble = memo(function MessageBubble({ message, startsRun, isGroup, highlight, isCurrentMatch }: MessageBubbleProps) {
  const actions = useMessageActions(message);
  const { isOwn } = actions;
  const sender = useChatStore((s) => s.users[message.senderId]);
  const replyTo = useChatStore((s) =>
    message.replyToId ? s.messages[message.conversationId]?.find((m) => m.id === message.replyToId) : undefined,
  );
  const [touchActive, setTouchActive] = useState(false);
  const showIdentity = isGroup && !isOwn;

  return (
    <div id={`msg-${message.id}`} className={cn('flex gap-2 px-4', isOwn ? 'justify-end' : 'justify-start', startsRun ? 'mt-3' : 'mt-0.5')}>
      {showIdentity && (startsRun ? <Avatar name={sender?.name ?? '?'} src={sender?.avatarUrl} size="sm" className="mt-5" /> : <span className="w-8 shrink-0" />)}

      <div className={cn('group relative flex max-w-[min(85%,36rem)] min-w-0 flex-col', isOwn ? 'items-end' : 'items-start')}>
        {showIdentity && startsRun && <span className="mb-1 ml-1 text-xs font-semibold text-fg-muted">{sender?.name}</span>}

        <div
          onClick={() => isTouch() && setTouchActive((v) => !v)}
          className={cn(
            'relative min-w-0 rounded-2xl border px-3.5 py-2 text-[15px] leading-relaxed transition-shadow',
            isOwn ? 'rounded-br-md border-accent/30 bg-bubble-out' : 'rounded-bl-md border-line bg-bubble-in',
            isCurrentMatch && 'ring-2 ring-highlight',
            message.status === 'sending' && 'opacity-70',
          )}
        >
          {message.replyToId && <ReplyQuote message={replyTo} className="mb-1.5" />}

          {message.deleted ? (
            <p className="text-sm text-fg-muted italic">This message was deleted</p>
          ) : (
            <>
              {message.attachments?.length ? (
                <div className="mb-1 flex flex-col gap-1.5">
                  {message.attachments.map((a) => (
                    <AttachmentView key={a.id} attachment={a} />
                  ))}
                </div>
              ) : null}
              {message.text && (
                <p className="break-words whitespace-pre-wrap">
                  <Highlight text={message.text} query={highlight} />
                </p>
              )}
            </>
          )}

          <span className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-fg-muted select-none">
            {message.editedAt && !message.deleted && <span>edited ·</span>}
            <time dateTime={new Date(message.createdAt).toISOString()}>{formatTime(message.createdAt)}</time>
            {isOwn && !message.deleted && <StatusIcon status={message.status} />}
          </span>
        </div>

        {message.status === 'failed' && (
          <button type="button" onClick={actions.retry} className="mt-1 flex items-center gap-1 text-xs font-medium text-red-500 hover:underline">
            <RotateCw className="size-3" aria-hidden /> Not sent — tap to retry
          </button>
        )}

        {message.reactions.length > 0 && <ReactionBar reactions={message.reactions} onToggle={actions.react} align={isOwn ? 'end' : 'start'} />}

        {!message.deleted && message.status !== 'sending' && (
          <MessageToolbar actions={actions} hasText={!!message.text} visible={touchActive} />
        )}
      </div>
    </div>
  );
});

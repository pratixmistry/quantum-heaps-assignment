import { AlertCircle, Check, CheckCheck, Clock, FileText } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import type { Attachment, Message, MessageStatus, Reaction } from '@/types/chat';
import { cn } from '@/utils/cn';
import { formatBytes } from '@/utils/format';

/** Small presentational pieces of a message bubble. */

const STATUS_LABEL: Record<MessageStatus, string> = {
  sending: 'Sending', sent: 'Sent', delivered: 'Delivered', read: 'Read', failed: 'Failed to send',
};

export function StatusIcon({ status }: { status: MessageStatus }) {
  const cls = 'size-3.5';
  const icon = {
    sending: <Clock className={cls} />,
    sent: <Check className={cls} />,
    delivered: <CheckCheck className={cls} />,
    read: <CheckCheck className={cn(cls, 'text-accent')} />,
    failed: <AlertCircle className={cn(cls, 'text-red-500')} />,
  }[status];
  return (
    <span role="img" aria-label={STATUS_LABEL[status]} title={STATUS_LABEL[status]}>
      {icon}
    </span>
  );
}

export function DateSeparator({ label }: { label: string }) {
  return (
    <div className="sticky top-2 z-10 my-4 flex justify-center" role="separator" aria-label={label}>
      <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-fg-muted shadow-sm">{label}</span>
    </div>
  );
}

/** Quoted message shown inside a bubble or above the composer. */
export function ReplyQuote({ message, className }: { message: Message | undefined; className?: string }) {
  const author = useChatStore((s) => (message ? (message.senderId === s.currentUserId ? 'You' : s.users[message.senderId]?.name) : undefined));
  const body = !message ? 'Original message not loaded' : message.deleted ? 'Message deleted' : message.text || message.attachments?.[0]?.name || '';

  const jump = () => document.getElementById(`msg-${message?.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <button
      type="button"
      onClick={jump}
      disabled={!message}
      className={cn('block w-full min-w-0 rounded-lg border-l-2 border-accent bg-accent/10 px-2.5 py-1.5 text-left', className)}
    >
      {author && <span className="block text-xs font-semibold text-accent">{author}</span>}
      <span className="line-clamp-2 text-xs text-fg-muted">{body}</span>
    </button>
  );
}

export function AttachmentView({ attachment }: { attachment: Attachment }) {
  if (attachment.kind === 'image' && attachment.url) {
    return (
      <img
        src={attachment.url}
        alt={attachment.name}
        loading="lazy"
        className="h-44 w-full max-w-72 rounded-lg border border-line bg-elevated object-cover"
      />
    );
  }
  return (
    <div className="flex max-w-72 items-center gap-3 rounded-lg border border-line bg-bg/50 p-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
        <FileText className="size-4" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{attachment.name}</span>
        <span className="block text-xs text-fg-muted">{formatBytes(attachment.size)}</span>
      </span>
    </div>
  );
}

export function ReactionBar({ reactions, onToggle, align }: { reactions: Reaction[]; onToggle: (emoji: string) => void; align: 'start' | 'end' }) {
  const me = useChatStore((s) => s.currentUserId);
  const users = useChatStore((s) => s.users);
  return (
    <div className={cn('mt-1 flex flex-wrap gap-1', align === 'end' && 'justify-end')}>
      {reactions.map((r) => {
        const mine = r.userIds.includes(me);
        const names = r.userIds.map((id) => (id === me ? 'You' : users[id]?.name.split(' ')[0])).join(', ');
        return (
          <button
            key={r.emoji}
            type="button"
            onClick={() => onToggle(r.emoji)}
            aria-pressed={mine}
            aria-label={`${r.emoji} ${r.userIds.length}, reacted by ${names}`}
            title={names}
            className={cn(
              'flex h-6 items-center gap-1 rounded-full border px-2 text-xs transition-colors',
              mine ? 'border-accent/60 bg-accent/15 text-fg' : 'border-line bg-surface text-fg-muted hover:border-fg-muted',
            )}
          >
            <span>{r.emoji}</span>
            <span className="font-medium">{r.userIds.length}</span>
          </button>
        );
      })}
    </div>
  );
}

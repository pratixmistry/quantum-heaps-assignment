import { memo } from 'react';
import { BellOff } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Highlight } from '@/features/search/components/Highlight';
import { useChatStore } from '@/store/chatStore';
import { cn } from '@/utils/cn';
import { formatListTimestamp } from '@/utils/date';
import type { ConversationSummary } from '../utils/conversationSummary';

interface ConversationItemProps {
  summary: ConversationSummary;
  active: boolean;
  query: string;
  onSelect: (id: string) => void;
}

export const ConversationItem = memo(function ConversationItem({ summary, active, query, onSelect }: ConversationItemProps) {
  const { conversation: c, title, preview, lastActivity, peer } = summary;
  const isTyping = useChatStore((s) => (s.typing[c.id]?.length ?? 0) > 0);
  const unread = c.unreadCount > 0;

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(c.id)}
        aria-current={active ? 'true' : undefined}
        className={cn(
          'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
          active ? 'bg-elevated' : 'hover:bg-elevated/60',
        )}
      >
        {active && <span className="absolute top-3 bottom-3 left-0 w-0.5 rounded-full bg-accent" aria-hidden />}
        <Avatar name={title} src={peer?.avatarUrl} status={peer?.status} isGroup={c.type === 'group'} />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className={cn('truncate text-sm', unread ? 'font-semibold text-fg' : 'font-medium text-fg')}>
              <Highlight text={title} query={query} />
            </span>
            <time className={cn('shrink-0 text-xs', unread ? 'text-accent' : 'text-fg-muted')} dateTime={new Date(lastActivity).toISOString()}>
              {formatListTimestamp(lastActivity)}
            </time>
          </span>
          <span className="mt-0.5 flex items-center justify-between gap-2">
            <span className={cn('truncate text-[13px]', isTyping ? 'text-accent italic' : unread ? 'text-fg' : 'text-fg-muted')}>
              {isTyping ? 'typing…' : <Highlight text={preview} query={query} />}
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              {c.muted && <BellOff className="size-3.5 text-fg-muted" aria-label="Muted" />}
              {unread && (
                <span
                  className={cn('min-w-5 rounded-full px-1.5 text-center text-[11px] leading-5 font-semibold', c.muted ? 'bg-fg-muted/30 text-fg' : 'bg-accent text-white')}
                  aria-label={`${c.unreadCount} unread messages`}
                >
                  {c.unreadCount > 99 ? '99+' : c.unreadCount}
                </span>
              )}
            </span>
          </span>
        </span>
      </button>
    </li>
  );
});

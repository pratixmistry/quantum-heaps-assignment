import { useCallback, useState } from 'react';
import { Inbox, SearchX, WifiOff } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/features/search/components/SearchInput';
import { useChatStore } from '@/store/chatStore';
import { useUiStore } from '@/store/uiStore';
import { useConversationList } from '../hooks/useConversationList';
import { ConversationItem } from './ConversationItem';

const FILTER_TITLES = { all: 'All messages', unread: 'Unread', groups: 'Groups' } as const;

export const CONVERSATION_SEARCH_ID = 'conversation-search';

function ListSkeleton() {
  return (
    <ul className="space-y-1 px-2" aria-hidden>
      {Array.from({ length: 7 }, (_, i) => (
        <li key={i} className="flex animate-pulse items-center gap-3 px-3 py-2.5">
          <span className="size-10 rounded-full bg-elevated" />
          <span className="flex-1 space-y-2">
            <span className="block h-3 w-2/5 rounded bg-elevated" />
            <span className="block h-3 w-4/5 rounded bg-elevated" />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function ConversationList() {
  const [query, setQuery] = useState('');
  const { items, query: debouncedQuery, filter } = useConversationList(query);
  const status = useChatStore((s) => s.status);
  const activeId = useChatStore((s) => s.activeConversationId);
  const select = useChatStore((s) => s.selectConversation);
  const bootstrap = useChatStore((s) => s.bootstrap);
  const setFilter = useUiStore((s) => s.setFilter);
  const onSelect = useCallback((id: string) => select(id), [select]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex h-16 shrink-0 items-center px-4">
        <Logo />
      </header>
      <div className="px-3 pb-3">
        <SearchInput id={CONVERSATION_SEARCH_ID} value={query} onChange={setQuery} label="Search conversations" placeholder="Search conversations  (Ctrl K)" />
      </div>
      <div className="flex items-center justify-between px-4 pb-2">
        <h2 className="text-xs font-semibold tracking-wider text-fg-muted uppercase">{FILTER_TITLES[filter]}</h2>
        <span className="text-xs text-fg-muted">{status === 'ready' && items.length}</span>
      </div>

      <nav aria-label="Conversations" className="min-h-0 flex-1 overflow-y-auto pb-3">
        {status === 'loading' || status === 'idle' ? (
          <ListSkeleton />
        ) : status === 'error' ? (
          <EmptyState icon={<WifiOff />} title="Couldn’t load conversations" description="Check your connection and try again." action={<Button size="sm" onClick={bootstrap}>Retry</Button>} />
        ) : items.length === 0 ? (
          debouncedQuery ? (
            <EmptyState icon={<SearchX />} title="No matches" description={`Nothing found for “${debouncedQuery}”.`} />
          ) : (
            <EmptyState
              icon={<Inbox />}
              title={filter === 'unread' ? 'You’re all caught up' : 'No conversations'}
              description={filter === 'unread' ? 'No unread messages right now.' : undefined}
              action={filter !== 'all' && <Button size="sm" variant="secondary" onClick={() => setFilter('all')}>Show all</Button>}
            />
          )
        ) : (
          <ul className="space-y-0.5 px-2">
            {items.map((s) => (
              <ConversationItem key={s.conversation.id} summary={s} active={s.conversation.id === activeId} query={debouncedQuery} onSelect={onSelect} />
            ))}
          </ul>
        )}
      </nav>
    </div>
  );
}

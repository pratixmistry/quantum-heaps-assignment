import { Clock, Mail, X } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { IconButton } from '@/components/ui/Button';
import { useChatStore } from '@/store/chatStore';
import { getConversationTitle, getPeer, selectActiveConversation } from '@/store/selectors';
import { useUiStore } from '@/store/uiStore';
import { formatLastSeen } from '@/utils/date';
import { MemberList } from './MemberList';
import { SharedContent } from './SharedContent';

/** Inline column on xl screens, slide-over drawer below that (see AppShell). */
export function InfoPanel() {
  const conversation = useChatStore(selectActiveConversation);
  const users = useChatStore((s) => s.users);
  const me = useChatStore((s) => s.currentUserId);
  const close = () => useUiStore.getState().setInfoPanelOpen(false);
  if (!conversation) return null;

  const isGroup = conversation.type === 'group';
  const peer = getPeer(conversation, users, me);
  const title = getConversationTitle(conversation, users, me);
  const localTime = peer && new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', timeZone: peer.timezone });

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
        <h2 className="font-display font-semibold">{isGroup ? 'Group info' : 'Contact info'}</h2>
        <IconButton label="Close info panel" size="sm" onClick={close}>
          <X />
        </IconButton>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <section className="flex flex-col items-center gap-2 p-6 text-center">
          <Avatar name={title} src={peer?.avatarUrl} status={peer?.status} isGroup={isGroup} size="xl" />
          <h3 className="mt-2 font-display text-xl font-semibold">{title}</h3>
          {isGroup ? (
            <p className="text-sm text-fg-muted">{conversation.description}</p>
          ) : (
            peer && (
              <>
                <p className="text-sm text-fg-muted">{peer.title}</p>
                <p className="text-xs font-medium capitalize text-fg-muted">{peer.status === 'offline' ? formatLastSeen(peer.lastSeenAt) : peer.status}</p>
              </>
            )
          )}
        </section>

        {peer && (
          <section className="space-y-3 border-t border-line p-5 text-sm">
            <p className="flex items-center gap-3">
              <Mail className="size-4 text-fg-muted" aria-hidden />
              <a href={`mailto:${peer.email}`} className="truncate text-accent hover:underline">{peer.email}</a>
            </p>
            <p className="flex items-center gap-3">
              <Clock className="size-4 text-fg-muted" aria-hidden />
              <span>{localTime} local time</span>
            </p>
          </section>
        )}

        {isGroup && <MemberList conversation={conversation} />}
        <SharedContent conversationId={conversation.id} />
      </div>
    </div>
  );
}

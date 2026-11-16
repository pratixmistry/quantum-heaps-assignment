import { ArrowLeft, Bell, BellOff, Eraser, Info, MailOpen, MoreVertical, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { IconButton } from '@/components/ui/Button';
import { Menu } from '@/components/ui/Menu';
import { useChatStore } from '@/store/chatStore';
import { confirm, toast } from '@/store/feedbackStore';
import { useUiStore } from '@/store/uiStore';
import type { Conversation, User } from '@/types/chat';
import { formatLastSeen } from '@/utils/date';
import { TypingDots } from './TypingIndicator';

interface ChatHeaderProps {
  conversation: Conversation;
  title: string;
  peer?: User;
  typingLabel: string | null;
}

export function ChatHeader({ conversation, title, peer, typingLabel }: ChatHeaderProps) {
  const users = useChatStore((s) => s.users);
  const { selectConversation, toggleMute, markAsUnread, clearConversation } = useChatStore.getState();
  const { infoPanelOpen, setInfoPanelOpen, messageSearchOpen, setMessageSearchOpen, sidebarCollapsed, toggleSidebar } = useUiStore();
  const isGroup = conversation.type === 'group';

  const onlineCount = conversation.memberIds.filter((id) => users[id]?.status === 'online').length;
  const subtitle = isGroup
    ? `${conversation.memberIds.length} members · ${onlineCount} online`
    : peer?.status === 'online'
      ? 'Online'
      : peer?.status === 'away'
        ? 'Away'
        : peer
          ? formatLastSeen(peer.lastSeenAt)
          : '';

  const onClear = async () => {
    const ok = await confirm({
      title: 'Clear all messages?',
      description: `Messages in “${title}” will be removed from this device.`,
      confirmLabel: 'Clear messages',
      destructive: true,
    });
    if (ok) {
      clearConversation(conversation.id);
      toast.success('Conversation cleared');
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-line px-2 sm:px-4">
      <IconButton label="Back to conversations" className="md:hidden" onClick={() => selectConversation(null)}>
        <ArrowLeft />
      </IconButton>
      <IconButton label={sidebarCollapsed ? 'Show conversation list' : 'Hide conversation list'} className="max-md:hidden" onClick={toggleSidebar}>
        {sidebarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
      </IconButton>

      <button type="button" onClick={() => setInfoPanelOpen(!infoPanelOpen)} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 text-left hover:bg-elevated/60">
        <Avatar name={title} src={peer?.avatarUrl} status={peer?.status} isGroup={isGroup} />
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-display text-[15px] font-semibold">{title}</span>
            {conversation.muted && <BellOff className="size-3.5 shrink-0 text-fg-muted" aria-label="Muted" />}
          </span>
          <span className="flex items-center gap-1.5 truncate text-xs text-fg-muted" aria-live="polite">
            {typingLabel ? (
              <span className="flex items-center gap-1.5 text-accent">
                <TypingDots /> {typingLabel}
              </span>
            ) : (
              subtitle
            )}
          </span>
        </span>
      </button>

      <IconButton label="Search messages (Ctrl+Shift+F)" active={messageSearchOpen} onClick={() => setMessageSearchOpen(!messageSearchOpen)}>
        <Search />
      </IconButton>
      <IconButton label="Conversation info" active={infoPanelOpen} onClick={() => setInfoPanelOpen(!infoPanelOpen)}>
        <Info />
      </IconButton>
      <Menu
        items={[
          {
            label: conversation.muted ? 'Unmute notifications' : 'Mute notifications',
            icon: conversation.muted ? <Bell /> : <BellOff />,
            onSelect: () => {
              toggleMute(conversation.id);
              toast.info(conversation.muted ? 'Notifications unmuted' : 'Notifications muted');
            },
          },
          { label: 'Mark as unread', icon: <MailOpen />, onSelect: () => markAsUnread(conversation.id) },
          { label: 'Clear messages', icon: <Eraser />, onSelect: onClear, destructive: true },
        ]}
        trigger={(props) => (
          <IconButton label="More actions" {...props}>
            <MoreVertical />
          </IconButton>
        )}
      />
    </header>
  );
}

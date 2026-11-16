import { Circle, Keyboard, MessageSquare, MessageSquareDot, RotateCcw, Users } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Menu } from '@/components/ui/Menu';
import { ThemeToggle } from '@/features/theme/components/ThemeToggle';
import { useChatStore } from '@/store/chatStore';
import { confirm } from '@/store/feedbackStore';
import { selectTotalUnread } from '@/store/selectors';
import { useUiStore } from '@/store/uiStore';
import type { ConversationFilter, PresenceStatus } from '@/types/chat';
import { cn } from '@/utils/cn';
import { resetDemoData } from '@/utils/storage';
import { LogoMark } from './Logo';

const NAV: { filter: ConversationFilter; label: string; icon: typeof MessageSquare }[] = [
  { filter: 'all', label: 'All messages', icon: MessageSquare },
  { filter: 'unread', label: 'Unread', icon: MessageSquareDot },
  { filter: 'groups', label: 'Groups', icon: Users },
];

const STATUSES: PresenceStatus[] = ['online', 'away', 'offline'];
const STATUS_DOT = { online: 'text-online', away: 'text-highlight', offline: 'text-fg-muted' };

function ProfileMenu() {
  const me = useChatStore((s) => s.users[s.currentUserId]);
  const setPresence = useChatStore((s) => s.setPresence);
  const openShortcuts = useUiStore((s) => s.setShortcutsOpen);
  if (!me) return null;

  return (
    <Menu
      popupClassName="right-0 bottom-full mb-2 md:right-auto md:left-0"
      header={
        <div className="mb-1 border-b border-line px-3 pt-2 pb-3">
          <p className="text-sm font-semibold">{me.name}</p>
          <p className="text-xs text-fg-muted">{me.title}</p>
        </div>
      }
      items={[
        ...STATUSES.map((status) => ({
          label: `${status[0]!.toUpperCase()}${status.slice(1)}${me.status === status ? '  ✓' : ''}`,
          icon: <Circle className={cn('fill-current', STATUS_DOT[status])} />,
          onSelect: () => setPresence(me.id, status),
        })),
        { label: 'Keyboard shortcuts', icon: <Keyboard />, onSelect: () => openShortcuts(true) },
        {
          label: 'Reset demo data',
          icon: <RotateCcw />,
          destructive: true,
          onSelect: async () => {
            const ok = await confirm({
              title: 'Reset demo data?',
              description: 'All sent messages, reactions and membership changes will be discarded and the app will reload.',
              confirmLabel: 'Reset',
              destructive: true,
            });
            if (ok) resetDemoData();
          },
        },
      ]}
      trigger={(props) => (
        <button type="button" aria-label={`Profile: ${me.name}, ${me.status}`} className="rounded-full" {...props}>
          <Avatar name={me.name} src={me.avatarUrl} status={me.status} size="sm" />
        </button>
      )}
    />
  );
}

/** Vertical rail on md+, bottom tab bar on mobile — same component, CSS-driven. */
export function NavRail({ className }: { className?: string }) {
  const filter = useUiStore((s) => s.filter);
  const setFilter = useUiStore((s) => s.setFilter);
  const totalUnread = useChatStore(selectTotalUnread);

  return (
    <div
      className={cn(
        'flex shrink-0 items-center border-line bg-bg px-3 md:w-16 md:flex-col md:border-r md:px-0 md:py-4',
        'h-16 border-t md:h-auto md:border-t-0',
        className,
      )}
    >
      <LogoMark className="mb-6 hidden size-8 md:block" />
      <nav aria-label="Primary" className="flex flex-1 justify-around md:flex-none md:flex-col md:gap-2">
        {NAV.map(({ filter: f, label, icon: Icon }) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            title={label}
            className={cn(
              'relative flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors md:size-11 md:justify-center md:p-0',
              filter === f ? 'text-accent md:bg-accent/15' : 'text-fg-muted hover:text-fg md:hover:bg-elevated',
            )}
          >
            <Icon className="size-5" aria-hidden />
            <span className="md:sr-only">{label}</span>
            {f === 'unread' && totalUnread > 0 && (
              <span className="absolute top-0 right-1 min-w-4 rounded-full bg-accent px-1 text-[10px] leading-4 font-semibold text-white md:top-1 md:right-1" aria-label={`${totalUnread} unread`}>
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-2 md:mt-auto md:flex-col md:gap-3">
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </div>
  );
}

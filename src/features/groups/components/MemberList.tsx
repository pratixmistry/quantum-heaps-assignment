import { useMemo, useState } from 'react';
import { UserMinus, UserPlus } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button, IconButton } from '@/components/ui/Button';
import { useChatStore } from '@/store/chatStore';
import { confirm, toast } from '@/store/feedbackStore';
import type { Conversation, PresenceStatus } from '@/types/chat';
import { AddMembersDialog } from './AddMembersDialog';

const ORDER: Record<PresenceStatus, number> = { online: 0, away: 1, offline: 2 };

export function MemberList({ conversation }: { conversation: Conversation }) {
  const users = useChatStore((s) => s.users);
  const me = useChatStore((s) => s.currentUserId);
  const removeMember = useChatStore((s) => s.removeMember);
  const [adding, setAdding] = useState(false);

  const members = useMemo(
    () =>
      conversation.memberIds
        .map((id) => users[id])
        .filter((u) => !!u)
        .sort((a, b) => (a.id === me ? -1 : b.id === me ? 1 : ORDER[a.status] - ORDER[b.status] || a.name.localeCompare(b.name))),
    [conversation.memberIds, users, me],
  );

  const onRemove = async (userId: string, name: string) => {
    const ok = await confirm({
      title: `Remove ${name}?`,
      description: `${name} will no longer see new messages in ${conversation.name}.`,
      confirmLabel: 'Remove',
      destructive: true,
    });
    if (!ok) return;
    try {
      await removeMember(conversation.id, userId);
      toast.success(`${name} was removed`);
    } catch {
      toast.error(`Couldn’t remove ${name}`);
    }
  };

  return (
    <section className="border-t border-line p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-wider text-fg-muted uppercase">Members · {members.length}</h3>
        <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>
          <UserPlus className="size-4" aria-hidden /> Add
        </Button>
      </div>
      <ul className="space-y-0.5">
        {members.map((u) => (
          <li key={u.id} className="group flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-elevated/60">
            <Avatar name={u.name} src={u.avatarUrl} status={u.status} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {u.name} {u.id === me && <span className="text-fg-muted">(you)</span>}
              </span>
              <span className="block truncate text-xs text-fg-muted">{u.title}</span>
            </span>
            {u.id !== me && (
              <IconButton
                label={`Remove ${u.name}`}
                size="sm"
                onClick={() => onRemove(u.id, u.name)}
                className="opacity-100 group-hover:opacity-100 focus-visible:opacity-100 hover:text-red-500 [@media(hover:hover)]:opacity-0"
              >
                <UserMinus />
              </IconButton>
            )}
          </li>
        ))}
      </ul>
      <AddMembersDialog conversation={conversation} open={adding} onClose={() => setAdding(false)} />
    </section>
  );
}

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { SearchInput } from '@/features/search/components/SearchInput';
import { useChatStore } from '@/store/chatStore';
import { toast } from '@/store/feedbackStore';
import type { Conversation } from '@/types/chat';

interface AddMembersForm {
  userIds: string[];
}

export function AddMembersDialog({ conversation, open, onClose }: { conversation: Conversation; open: boolean; onClose: () => void }) {
  const users = useChatStore((s) => s.users);
  const addMembers = useChatStore((s) => s.addMembers);
  const [query, setQuery] = useState('');
  const { register, handleSubmit, watch, reset, formState } = useForm<AddMembersForm>({ defaultValues: { userIds: [] } });
  const selected = watch('userIds');

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return Object.values(users).filter(
      (u) => !conversation.memberIds.includes(u.id) && (!q || u.name.toLowerCase().includes(q) || u.title.toLowerCase().includes(q)),
    );
  }, [users, conversation.memberIds, query]);

  const close = () => {
    reset();
    setQuery('');
    onClose();
  };

  const onSubmit = handleSubmit(async ({ userIds }) => {
    try {
      await addMembers(conversation.id, userIds);
      toast.success(`Added ${userIds.length} ${userIds.length === 1 ? 'member' : 'members'} to ${conversation.name}`);
      close();
    } catch {
      toast.error('Couldn’t add members. Please try again.');
    }
  });

  return (
    <Modal open={open} title={`Add members to ${conversation.name}`} onClose={close}>
      <form onSubmit={onSubmit} className="space-y-3">
        <SearchInput value={query} onChange={setQuery} label="Search people" placeholder="Search by name or role" />
        <fieldset className="max-h-72 space-y-0.5 overflow-y-auto">
          <legend className="sr-only">People</legend>
          {candidates.length === 0 && <p className="py-6 text-center text-sm text-fg-muted">Everyone matching is already in this group.</p>}
          {candidates.map((u) => (
            <label key={u.id} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 hover:bg-elevated">
              <input type="checkbox" value={u.id} {...register('userIds', { validate: (v) => v.length > 0 })} className="size-4 accent-accent" />
              <Avatar name={u.name} src={u.avatarUrl} status={u.status} size="sm" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{u.name}</span>
                <span className="block truncate text-xs text-fg-muted">{u.title}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={!selected.length || formState.isSubmitting}>
            Add {selected.length > 0 && selected.length}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

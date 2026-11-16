import { useChatStore } from '@/store/chatStore';
import { confirm, toast } from '@/store/feedbackStore';
import { useUiStore } from '@/store/uiStore';
import type { Message } from '@/types/chat';

/** Bundles every per-message interaction so bubbles stay presentational. */
export function useMessageActions(message: Message) {
  const { id, conversationId } = message;
  const isOwn = useChatStore((s) => s.currentUserId === message.senderId);
  const setComposerContext = useUiStore((s) => s.setComposerContext);

  return {
    isOwn,
    canEdit: isOwn && !message.deleted && !!message.text && message.status !== 'sending' && message.status !== 'failed',
    react: (emoji: string) => useChatStore.getState().toggleReaction(conversationId, id, emoji),
    reply: () => setComposerContext({ conversationId, mode: 'reply', messageId: id }),
    edit: () => setComposerContext({ conversationId, mode: 'edit', messageId: id }),
    retry: () => useChatStore.getState().retryMessage(conversationId, id),
    copy: async () => {
      try {
        await navigator.clipboard.writeText(message.text);
        toast.success('Message copied');
      } catch {
        toast.error('Clipboard is unavailable');
      }
    },
    remove: async () => {
      const ok = await confirm({
        title: 'Delete message?',
        description: 'This message will be removed for everyone in the conversation. This can’t be undone.',
        confirmLabel: 'Delete',
        destructive: true,
      });
      if (!ok) return;
      try {
        await useChatStore.getState().deleteMessage(conversationId, id);
        toast.success('Message deleted');
      } catch {
        toast.error('Couldn’t delete message. Please try again.');
      }
    },
  };
}

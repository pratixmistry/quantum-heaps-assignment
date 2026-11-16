import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { chatApi } from '@/services/mockApi/chatApi';
import type { Attachment, Conversation, ID, Message, MessageStatus, PresenceStatus, User } from '@/types/chat';
import { createId } from '@/utils/id';
import { safeStorage } from '@/utils/storage';

export interface ChatState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
  currentUserId: ID;
  users: Record<ID, User>;
  conversations: Record<ID, Conversation>;
  /** Loaded messages per conversation, oldest first. */
  messages: Record<ID, Message[]>;
  hasMore: Record<ID, boolean>;
  loadingOlder: Record<ID, boolean>;
  activeConversationId: ID | null;
  /** conversationId -> userIds currently typing. Ephemeral, never persisted. */
  typing: Record<ID, ID[]>;
}

export interface SendMessageInput {
  conversationId: ID;
  text: string;
  replyToId?: ID;
  attachments?: Attachment[];
}

interface ChatActions {
  bootstrap: () => Promise<void>;
  selectConversation: (id: ID | null) => void;
  loadOlderMessages: (conversationId: ID) => Promise<void>;
  sendMessage: (input: SendMessageInput) => Promise<void>;
  retryMessage: (conversationId: ID, messageId: ID) => Promise<void>;
  editMessage: (conversationId: ID, messageId: ID, text: string) => Promise<void>;
  deleteMessage: (conversationId: ID, messageId: ID) => Promise<void>;
  toggleReaction: (conversationId: ID, messageId: ID, emoji: string) => void;
  receiveMessage: (message: Message) => void;
  setMessageStatus: (conversationId: ID, messageId: ID, status: MessageStatus) => void;
  setTyping: (conversationId: ID, userId: ID, isTyping: boolean) => void;
  setPresence: (userId: ID, status: PresenceStatus) => void;
  markAsUnread: (conversationId: ID) => void;
  toggleMute: (conversationId: ID) => void;
  clearConversation: (conversationId: ID) => void;
  addMembers: (conversationId: ID, userIds: ID[]) => Promise<void>;
  removeMember: (conversationId: ID, userId: ID) => Promise<void>;
}

export type ChatStore = ChatState & ChatActions;

export const initialChatState: ChatState = {
  status: 'idle',
  error: null,
  currentUserId: '',
  users: {},
  conversations: {},
  messages: {},
  hasMore: {},
  loadingOlder: {},
  activeConversationId: null,
  typing: {},
};

const STATUS_RANK: Record<MessageStatus, number> = { failed: 0, sending: 1, sent: 2, delivered: 3, read: 4 };

type Patch = (m: Message) => Message;

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => {
      /** Immutable update of a single message; other conversations keep referential equality. */
      const patchMessage = (conversationId: ID, messageId: ID, patch: Patch) =>
        set((s) => ({
          messages: {
            ...s.messages,
            [conversationId]: (s.messages[conversationId] ?? []).map((m) => (m.id === messageId ? patch(m) : m)),
          },
        }));

      const patchConversation = (id: ID, patch: Partial<Conversation>) =>
        set((s) => (s.conversations[id] ? { conversations: { ...s.conversations, [id]: { ...s.conversations[id]!, ...patch } } } : s));

      const findMessage = (conversationId: ID, messageId: ID) =>
        get().messages[conversationId]?.find((m) => m.id === messageId);

      const deliver = async (message: Message) => {
        try {
          const saved = await chatApi.sendMessage(message);
          // Realtime events may already have advanced the status; never downgrade it.
          patchMessage(message.conversationId, message.id, (m) =>
            STATUS_RANK[m.status] >= STATUS_RANK[saved.status] ? m : { ...m, status: saved.status },
          );
        } catch {
          patchMessage(message.conversationId, message.id, (m) => ({ ...m, status: 'failed' }));
        }
      };

      return {
        ...initialChatState,

        bootstrap: async () => {
          const { conversations, status } = get();
          if (status === 'loading') return;
          if (Object.keys(conversations).length) {
            // Rehydrated from storage: anything mid-flight when the tab closed is now failed.
            set((s) => ({
              status: 'ready',
              messages: Object.fromEntries(
                Object.entries(s.messages).map(([id, list]) => [
                  id,
                  list.map((m) => (m.status === 'sending' ? { ...m, status: 'failed' as const } : m)),
                ]),
              ),
            }));
            return;
          }
          set({ status: 'loading', error: null });
          try {
            const data = await chatApi.fetchBootstrap();
            set({ ...data, status: 'ready' });
          } catch (e) {
            set({ status: 'error', error: (e as Error).message });
          }
        },

        selectConversation: (id) => {
          set({ activeConversationId: id });
          if (id) patchConversation(id, { unreadCount: 0 });
        },

        loadOlderMessages: async (conversationId) => {
          const { hasMore, loadingOlder, messages } = get();
          if (!hasMore[conversationId] || loadingOlder[conversationId]) return;
          const oldest = messages[conversationId]?.[0];
          set((s) => ({ loadingOlder: { ...s.loadingOlder, [conversationId]: true } }));
          try {
            const page = await chatApi.fetchMessagesBefore(conversationId, oldest?.createdAt ?? Date.now());
            set((s) => ({
              messages: { ...s.messages, [conversationId]: [...page.messages, ...(s.messages[conversationId] ?? [])] },
              hasMore: { ...s.hasMore, [conversationId]: page.hasMore },
            }));
          } finally {
            set((s) => ({ loadingOlder: { ...s.loadingOlder, [conversationId]: false } }));
          }
        },

        sendMessage: async ({ conversationId, text, replyToId, attachments }) => {
          const message: Message = {
            id: createId('m'),
            conversationId,
            senderId: get().currentUserId,
            text: text.trim(),
            createdAt: Date.now(),
            status: 'sending',
            replyToId,
            reactions: [],
            attachments: attachments?.length ? attachments : undefined,
          };
          // Optimistic insert: the bubble renders immediately with a "sending" indicator.
          set((s) => ({ messages: { ...s.messages, [conversationId]: [...(s.messages[conversationId] ?? []), message] } }));
          await deliver(message);
        },

        retryMessage: async (conversationId, messageId) => {
          const message = findMessage(conversationId, messageId);
          if (!message || message.status !== 'failed') return;
          patchMessage(conversationId, messageId, (m) => ({ ...m, status: 'sending' }));
          await deliver({ ...message, status: 'sending' });
        },

        editMessage: async (conversationId, messageId, text) => {
          const previous = findMessage(conversationId, messageId);
          if (!previous || previous.senderId !== get().currentUserId) return;
          patchMessage(conversationId, messageId, (m) => ({ ...m, text: text.trim(), editedAt: Date.now() }));
          try {
            const { editedAt } = await chatApi.editMessage(messageId, text);
            patchMessage(conversationId, messageId, (m) => ({ ...m, editedAt }));
          } catch (e) {
            patchMessage(conversationId, messageId, () => previous);
            throw e;
          }
        },

        deleteMessage: async (conversationId, messageId) => {
          const previous = findMessage(conversationId, messageId);
          if (!previous) return;
          // Soft delete keeps the timeline and any replies pointing at it intact.
          patchMessage(conversationId, messageId, (m) => ({ ...m, deleted: true, text: '', attachments: undefined, reactions: [], replyToId: undefined }));
          try {
            await chatApi.deleteMessage(messageId);
          } catch (e) {
            patchMessage(conversationId, messageId, () => previous);
            throw e;
          }
        },

        toggleReaction: (conversationId, messageId, emoji) => {
          const me = get().currentUserId;
          patchMessage(conversationId, messageId, (m) => {
            const existing = m.reactions.find((r) => r.emoji === emoji);
            const reactions = existing
              ? m.reactions
                  .map((r) =>
                    r.emoji !== emoji ? r : { ...r, userIds: r.userIds.includes(me) ? r.userIds.filter((u) => u !== me) : [...r.userIds, me] },
                  )
                  .filter((r) => r.userIds.length > 0)
              : [...m.reactions, { emoji, userIds: [me] }];
            return { ...m, reactions };
          });
        },

        receiveMessage: (message) => {
          const { conversations, activeConversationId, messages } = get();
          const conversation = conversations[message.conversationId];
          if (!conversation || messages[message.conversationId]?.some((m) => m.id === message.id)) return;
          set((s) => ({
            messages: { ...s.messages, [message.conversationId]: [...(s.messages[message.conversationId] ?? []), message] },
          }));
          if (activeConversationId !== message.conversationId) {
            patchConversation(message.conversationId, { unreadCount: conversation.unreadCount + 1 });
          }
        },

        setMessageStatus: (conversationId, messageId, status) =>
          patchMessage(conversationId, messageId, (m) => (STATUS_RANK[status] > STATUS_RANK[m.status] ? { ...m, status } : m)),

        setTyping: (conversationId, userId, isTyping) =>
          set((s) => {
            const current = (s.typing[conversationId] ?? []).filter((id) => id !== userId);
            return { typing: { ...s.typing, [conversationId]: isTyping ? [...current, userId] : current } };
          }),

        setPresence: (userId, status) =>
          set((s) => {
            const user = s.users[userId];
            if (!user) return s;
            return { users: { ...s.users, [userId]: { ...user, status, lastSeenAt: Date.now() } } };
          }),

        markAsUnread: (conversationId) => {
          patchConversation(conversationId, { unreadCount: Math.max(1, get().conversations[conversationId]?.unreadCount ?? 0) });
          if (get().activeConversationId === conversationId) set({ activeConversationId: null });
        },

        toggleMute: (conversationId) =>
          patchConversation(conversationId, { muted: !get().conversations[conversationId]?.muted }),

        clearConversation: (conversationId) =>
          set((s) => ({
            messages: { ...s.messages, [conversationId]: [] },
            hasMore: { ...s.hasMore, [conversationId]: false },
          })),

        addMembers: async (conversationId, userIds) => {
          const before = get().conversations[conversationId]?.memberIds ?? [];
          patchConversation(conversationId, { memberIds: [...new Set([...before, ...userIds])] });
          try {
            await chatApi.addMembers(conversationId, userIds);
          } catch (e) {
            patchConversation(conversationId, { memberIds: before });
            throw e;
          }
        },

        removeMember: async (conversationId, userId) => {
          const before = get().conversations[conversationId]?.memberIds ?? [];
          patchConversation(conversationId, { memberIds: before.filter((id) => id !== userId) });
          try {
            await chatApi.removeMember(conversationId, userId);
          } catch (e) {
            patchConversation(conversationId, { memberIds: before });
            throw e;
          }
        },
      };
    },
    {
      name: 'qc-chat',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        currentUserId: s.currentUserId,
        users: s.users,
        conversations: s.conversations,
        messages: s.messages,
        hasMore: s.hasMore,
        activeConversationId: s.activeConversationId,
      }),
    },
  ),
);

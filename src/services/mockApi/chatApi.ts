import type { Conversation, ID, Message, User } from '@/types/chat';
import { getDb } from './db';
import { realtime } from './realtime';
import { mockConfig, request } from './request';

export const PAGE_SIZE = 30;

export interface BootstrapPayload {
  currentUserId: ID;
  users: Record<ID, User>;
  conversations: Record<ID, Conversation>;
  messages: Record<ID, Message[]>;
  hasMore: Record<ID, boolean>;
}

export interface MessagePage {
  messages: Message[];
  hasMore: boolean;
}

/**
 * Mock REST-ish API. Components never call this directly — only stores do —
 * so the UI is unaware the backend is fake.
 */
export const chatApi = {
  fetchBootstrap: () =>
    request<BootstrapPayload>(() => {
      const db = getDb();
      const messages: Record<ID, Message[]> = {};
      const hasMore: Record<ID, boolean> = {};
      for (const [id, list] of Object.entries(db.history)) {
        messages[id] = list.slice(-PAGE_SIZE);
        hasMore[id] = list.length > PAGE_SIZE;
      }
      return { currentUserId: db.currentUserId, users: db.users, conversations: db.conversations, messages, hasMore };
    }),

  /** Cursor pagination: returns up to `limit` messages strictly older than `before`. */
  fetchMessagesBefore: (conversationId: ID, before: number, limit = PAGE_SIZE) =>
    request<MessagePage>(() => {
      const older = (getDb().history[conversationId] ?? []).filter((m) => m.createdAt < before);
      return { messages: older.slice(-limit), hasMore: older.length > limit };
    }),

  sendMessage: async (message: Message) => {
    const saved = await request<Message>(() => ({ ...message, status: 'sent' }), mockConfig.sendFailureRate);
    realtime.onClientMessage(saved);
    return saved;
  },

  editMessage: (_messageId: ID, _text: string) => request(() => ({ editedAt: Date.now() })),

  deleteMessage: (_messageId: ID) => request(() => ({ ok: true as const })),

  addMembers: (_conversationId: ID, userIds: ID[]) => request(() => userIds),

  removeMember: (_conversationId: ID, userId: ID) => request(() => userId),
};

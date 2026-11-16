export type ID = string;

export type PresenceStatus = 'online' | 'away' | 'offline';

export interface User {
  id: ID;
  name: string;
  title: string;
  email: string;
  avatarUrl?: string;
  status: PresenceStatus;
  lastSeenAt: number;
  timezone: string;
}

/** Lifecycle of an outgoing message. `sending` is the optimistic state. */
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Reaction {
  emoji: string;
  userIds: ID[];
}

export interface Attachment {
  id: ID;
  kind: 'image' | 'file';
  name: string;
  size: number;
  mimeType: string;
  /** Remote URL or data URL. Absent for files whose content is not kept. */
  url?: string;
}

export interface Message {
  id: ID;
  conversationId: ID;
  senderId: ID;
  text: string;
  createdAt: number;
  editedAt?: number;
  deleted?: boolean;
  status: MessageStatus;
  replyToId?: ID;
  reactions: Reaction[];
  attachments?: Attachment[];
}

export type ConversationType = 'direct' | 'group';

export interface Conversation {
  id: ID;
  type: ConversationType;
  /** Groups only; direct chats derive name/avatar from the other member. */
  name?: string;
  description?: string;
  memberIds: ID[];
  unreadCount: number;
  muted: boolean;
  createdAt: number;
}

export type ConversationFilter = 'all' | 'unread' | 'groups';

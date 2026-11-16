import type { Conversation, ID, Message, User } from '@/types/chat';
import type { ChatState } from './chatStore';

/** The other participant in a direct conversation. */
export const getPeer = (c: Conversation, users: Record<ID, User>, me: ID) =>
  c.type === 'direct' ? users[c.memberIds.find((id) => id !== me) ?? ''] : undefined;

export const getConversationTitle = (c: Conversation, users: Record<ID, User>, me: ID) =>
  c.type === 'group' ? (c.name ?? 'Untitled group') : (getPeer(c, users, me)?.name ?? 'Unknown user');

export const getLastMessage = (messages: Message[] | undefined) => messages?.[messages.length - 1];

export const getLastActivity = (c: Conversation, messages: Message[] | undefined) =>
  getLastMessage(messages)?.createdAt ?? c.createdAt;

export function getMessagePreview(m: Message | undefined, users: Record<ID, User>, me: ID, isGroup: boolean) {
  if (!m) return 'No messages yet';
  if (m.deleted) return 'Message deleted';
  const body = m.text || (m.attachments?.[0] ? `📎 ${m.attachments[0].name}` : '');
  const author = m.senderId === me ? 'You' : isGroup ? users[m.senderId]?.name.split(' ')[0] : undefined;
  return author ? `${author}: ${body}` : body;
}

export const selectActiveConversation = (s: ChatState) =>
  s.activeConversationId ? s.conversations[s.activeConversationId] : undefined;

export const selectTotalUnread = (s: ChatState) =>
  Object.values(s.conversations).reduce((n, c) => n + (c.muted ? 0 : c.unreadCount), 0);

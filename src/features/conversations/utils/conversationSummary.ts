import { getConversationTitle, getLastActivity, getLastMessage, getMessagePreview, getPeer } from '@/store/selectors';
import type { Conversation, ConversationFilter, ID, Message, User } from '@/types/chat';

export interface ConversationSummary {
  conversation: Conversation;
  title: string;
  preview: string;
  lastActivity: number;
  peer?: User;
}

interface SummaryInput {
  conversations: Record<ID, Conversation>;
  messages: Record<ID, Message[]>;
  users: Record<ID, User>;
  currentUserId: ID;
}

/** Derives display data for the sidebar, most recent activity first. */
export function buildConversationSummaries({ conversations, messages, users, currentUserId }: SummaryInput): ConversationSummary[] {
  return Object.values(conversations)
    .map((c) => ({
      conversation: c,
      title: getConversationTitle(c, users, currentUserId),
      preview: getMessagePreview(getLastMessage(messages[c.id]), users, currentUserId, c.type === 'group'),
      lastActivity: getLastActivity(c, messages[c.id]),
      peer: getPeer(c, users, currentUserId),
    }))
    .sort((a, b) => b.lastActivity - a.lastActivity);
}

export function filterConversations(items: ConversationSummary[], filter: ConversationFilter, query: string) {
  const q = query.trim().toLowerCase();
  return items.filter(({ conversation: c, title, preview }) => {
    if (filter === 'unread' && c.unreadCount === 0) return false;
    if (filter === 'groups' && c.type !== 'group') return false;
    return !q || title.toLowerCase().includes(q) || preview.toLowerCase().includes(q);
  });
}

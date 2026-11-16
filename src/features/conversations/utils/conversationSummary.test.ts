import { describe, expect, it } from 'vitest';
import { buildDb } from '@/services/mockApi/db';
import { buildConversationSummaries, filterConversations } from './conversationSummary';

const db = buildDb(Date.UTC(2026, 10, 16, 12));
const summaries = buildConversationSummaries({ ...db, messages: db.history });
const ids = (items: typeof summaries) => items.map((s) => s.conversation.id);

describe('buildConversationSummaries', () => {
  it('sorts by most recent activity and derives direct-chat titles from the peer', () => {
    expect(ids(summaries).slice(0, 2)).toEqual(['c-priya', 'c-design']);
    expect(summaries.find((s) => s.conversation.id === 'c-priya')!.title).toBe('Priya Sharma');
  });

  it('prefixes previews with the author', () => {
    expect(summaries.find((s) => s.conversation.id === 'c-design')!.preview).toMatch(/^Sofia: /);
    expect(summaries.find((s) => s.conversation.id === 'c-marcus')!.preview).toMatch(/^You: /);
    expect(summaries.find((s) => s.conversation.id === 'c-emma')!.preview).toBe('No messages yet');
  });
});

describe('filterConversations', () => {
  it('returns only conversations with unread messages', () => {
    const unread = filterConversations(summaries, 'unread', '');
    expect(unread.length).toBeGreaterThan(0);
    expect(unread.every((s) => s.conversation.unreadCount > 0)).toBe(true);
  });

  it('returns only groups', () => {
    expect(filterConversations(summaries, 'groups', '').every((s) => s.conversation.type === 'group')).toBe(true);
  });

  it('searches titles and previews case-insensitively', () => {
    expect(ids(filterConversations(summaries, 'all', 'MARCUS'))).toEqual(['c-marcus']);
    expect(ids(filterConversations(summaries, 'all', 'audit review'))).toEqual(['c-design']);
    expect(filterConversations(summaries, 'all', 'no-such-thing')).toEqual([]);
  });

  it('combines filter and query', () => {
    expect(ids(filterConversations(summaries, 'groups', 'priya'))).toEqual([]);
    expect(ids(filterConversations(summaries, 'unread', 'engineering'))).toEqual(['c-eng']);
  });
});

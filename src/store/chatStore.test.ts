import { beforeEach, describe, expect, it } from 'vitest';
import { resetDb } from '@/services/mockApi/db';
import { configureMockApi } from '@/services/mockApi/request';
import type { Message } from '@/types/chat';
import { initialChatState, useChatStore } from './chatStore';

const store = () => useChatStore.getState();
const messagesOf = (id: string) => store().messages[id] ?? [];
const lastOf = (id: string) => messagesOf(id).at(-1)!;

const incoming = (conversationId: string, id = 'm-in-1'): Message => ({
  id, conversationId, senderId: 'u-priya', text: 'Ping', createdAt: Date.now(), status: 'delivered', reactions: [],
});

beforeEach(async () => {
  resetDb();
  useChatStore.setState({ ...initialChatState });
  await store().bootstrap();
});

describe('chatStore', () => {
  it('bootstraps conversations, users and the latest page of messages', () => {
    expect(store().status).toBe('ready');
    expect(Object.keys(store().conversations)).toContain('c-design');
    expect(messagesOf('c-priya')).toHaveLength(30);
    expect(store().hasMore['c-priya']).toBe(true);
  });

  describe('sending', () => {
    it('inserts optimistically, then confirms as sent', async () => {
      const pending = store().sendMessage({ conversationId: 'c-emma', text: '  Hello Emma  ' });
      expect(lastOf('c-emma')).toMatchObject({ text: 'Hello Emma', status: 'sending', senderId: 'u-me' });
      await pending;
      expect(lastOf('c-emma').status).toBe('sent');
    });

    it('marks the message failed on network error and can retry it', async () => {
      configureMockApi({ sendFailureRate: 1 });
      await store().sendMessage({ conversationId: 'c-emma', text: 'Flaky' });
      expect(lastOf('c-emma').status).toBe('failed');

      configureMockApi({ sendFailureRate: 0 });
      await store().retryMessage('c-emma', lastOf('c-emma').id);
      expect(lastOf('c-emma').status).toBe('sent');
    });

    it('keeps reply references', async () => {
      const target = lastOf('c-priya');
      await store().sendMessage({ conversationId: 'c-priya', text: 'Re', replyToId: target.id });
      expect(lastOf('c-priya').replyToId).toBe(target.id);
    });
  });

  it('edits own messages and stamps editedAt', async () => {
    await store().sendMessage({ conversationId: 'c-emma', text: 'Typo' });
    const { id } = lastOf('c-emma');
    await store().editMessage('c-emma', id, 'Fixed');
    expect(lastOf('c-emma')).toMatchObject({ text: 'Fixed', editedAt: expect.any(Number) });
  });

  it('does not edit messages sent by others', async () => {
    const theirs = lastOf('c-priya');
    await store().editMessage('c-priya', theirs.id, 'Hijacked');
    expect(lastOf('c-priya').text).toBe(theirs.text);
  });

  it('soft-deletes messages, clearing content but keeping the timeline', async () => {
    const before = messagesOf('c-design').length;
    const target = messagesOf('c-design').find((m) => m.attachments)!;
    await store().deleteMessage('c-design', target.id);
    const deleted = messagesOf('c-design').find((m) => m.id === target.id)!;
    expect(deleted).toMatchObject({ deleted: true, text: '', attachments: undefined, reactions: [] });
    expect(messagesOf('c-design')).toHaveLength(before);
  });

  it('toggles emoji reactions for the current user', () => {
    const { id } = lastOf('c-priya');
    store().toggleReaction('c-priya', id, '🎉');
    expect(lastOf('c-priya').reactions).toContainEqual({ emoji: '🎉', userIds: ['u-me'] });
    store().toggleReaction('c-priya', id, '🎉');
    expect(lastOf('c-priya').reactions.find((r) => r.emoji === '🎉')).toBeUndefined();
  });

  it('adds the current user to an existing reaction from someone else', () => {
    const msg = messagesOf('c-design').find((m) => m.reactions.some((r) => r.emoji === '🔥'))!;
    store().toggleReaction('c-design', msg.id, '🔥');
    const fire = messagesOf('c-design').find((m) => m.id === msg.id)!.reactions.find((r) => r.emoji === '🔥')!;
    expect(fire.userIds).toEqual(['u-marcus', 'u-me']);
  });

  describe('unread counts', () => {
    it('increments for incoming messages in background conversations', () => {
      store().selectConversation('c-design');
      const before = store().conversations['c-eng']!.unreadCount;
      store().receiveMessage(incoming('c-eng'));
      expect(store().conversations['c-eng']!.unreadCount).toBe(before + 1);
    });

    it('does not increment for the open conversation and ignores duplicates', () => {
      store().selectConversation('c-priya');
      store().receiveMessage(incoming('c-priya'));
      store().receiveMessage(incoming('c-priya'));
      expect(store().conversations['c-priya']!.unreadCount).toBe(0);
      expect(messagesOf('c-priya').filter((m) => m.id === 'm-in-1')).toHaveLength(1);
    });

    it('resets when switching to a conversation', () => {
      expect(store().conversations['c-eng']!.unreadCount).toBe(4);
      store().selectConversation('c-eng');
      expect(store().activeConversationId).toBe('c-eng');
      expect(store().conversations['c-eng']!.unreadCount).toBe(0);
    });

    it('can mark a conversation as unread again', () => {
      store().selectConversation('c-marcus');
      store().markAsUnread('c-marcus');
      expect(store().conversations['c-marcus']!.unreadCount).toBe(1);
      expect(store().activeConversationId).toBeNull();
    });
  });

  it('never downgrades delivery status', async () => {
    await store().sendMessage({ conversationId: 'c-emma', text: 'Hi' });
    const { id } = lastOf('c-emma');
    store().setMessageStatus('c-emma', id, 'read');
    store().setMessageStatus('c-emma', id, 'delivered');
    expect(lastOf('c-emma').status).toBe('read');
  });

  it('tracks typing users per conversation', () => {
    store().setTyping('c-eng', 'u-liam', true);
    store().setTyping('c-eng', 'u-kenji', true);
    store().setTyping('c-eng', 'u-liam', false);
    expect(store().typing['c-eng']).toEqual(['u-kenji']);
  });

  it('paginates older messages until history is exhausted', async () => {
    const firstPageOldest = messagesOf('c-priya')[0]!.createdAt;
    await store().loadOlderMessages('c-priya');
    expect(messagesOf('c-priya')).toHaveLength(60);
    expect(messagesOf('c-priya')[0]!.createdAt).toBeLessThan(firstPageOldest);
    while (store().hasMore['c-priya']) await store().loadOlderMessages('c-priya');
    expect(messagesOf('c-priya')).toHaveLength(97);
  });

  it('adds and removes group members', async () => {
    await store().addMembers('c-design', ['u-liam', 'u-noah']);
    expect(store().conversations['c-design']!.memberIds).toEqual(expect.arrayContaining(['u-liam', 'u-noah']));
    await store().removeMember('c-design', 'u-liam');
    expect(store().conversations['c-design']!.memberIds).not.toContain('u-liam');
  });
});

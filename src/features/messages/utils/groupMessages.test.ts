import { describe, expect, it } from 'vitest';
import type { Message } from '@/types/chat';
import { groupMessagesByDay } from './groupMessages';

const now = new Date(2026, 10, 16, 15, 0).getTime();
const msg = (id: string, senderId: string, minutesAgo: number): Message => ({
  id, conversationId: 'c', senderId, text: id, createdAt: now - minutesAgo * 60_000, status: 'read', reactions: [],
});

describe('groupMessagesByDay', () => {
  it('splits messages into labelled day sections', () => {
    const sections = groupMessagesByDay([msg('a', 'u1', 2 * 1440), msg('b', 'u1', 1440), msg('c', 'u2', 10)], now);
    expect(sections.map((s) => s.label)).toEqual([expect.any(String), 'Yesterday', 'Today']);
  });

  it('starts a new run on sender change or a gap over five minutes', () => {
    const [today] = groupMessagesByDay([msg('a', 'u1', 30), msg('b', 'u1', 29), msg('c', 'u2', 28), msg('d', 'u2', 10)], now);
    expect(today!.rows.map((r) => r.startsRun)).toEqual([true, false, true, true]);
  });
});

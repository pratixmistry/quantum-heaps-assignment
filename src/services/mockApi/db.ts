import { seedConversations, fillerLines } from '@/data/conversations';
import { seedUsers, CURRENT_USER_ID } from '@/data/users';
import type { Conversation, ID, Message, Reaction, User } from '@/types/chat';

const ANCHOR_KEY = 'qc-seed-anchor';

/**
 * Seed timestamps are relative ("5 minutes ago"). We pin them to a stored anchor so
 * persisted messages and lazily fetched older pages stay on the same timeline across reloads.
 */
function getAnchor() {
  try {
    const stored = Number(localStorage.getItem(ANCHOR_KEY));
    if (stored) return stored;
    const now = Date.now();
    localStorage.setItem(ANCHOR_KEY, String(now));
    return now;
  } catch {
    return Date.now();
  }
}

export interface MockDb {
  currentUserId: ID;
  users: Record<ID, User>;
  conversations: Record<ID, Conversation>;
  /** Full server-side history per conversation, oldest first. */
  history: Record<ID, Message[]>;
}

const toReactions = (map?: Record<string, string[]>): Reaction[] =>
  Object.entries(map ?? {}).map(([emoji, userIds]) => ({ emoji, userIds }));

export function buildDb(anchor = getAnchor()): MockDb {
  const at = (minutesAgo: number) => anchor - minutesAgo * 60_000;

  const users = Object.fromEntries(
    seedUsers.map((u): [ID, User] => [
      u.id,
      {
        id: u.id, name: u.name, title: u.title, status: u.status, timezone: u.timezone,
        email: `${u.name.split(' ')[0]!.toLowerCase()}@quantumchat.dev`,
        avatarUrl: `https://i.pravatar.cc/150?img=${u.avatar}`,
        lastSeenAt: at(u.lastSeenMinutesAgo),
      },
    ]),
  );

  const conversations: Record<ID, Conversation> = {};
  const history: Record<ID, Message[]> = {};

  for (const c of seedConversations) {
    conversations[c.id] = {
      id: c.id, type: c.type, name: c.name, description: c.description,
      memberIds: [...c.memberIds], unreadCount: c.unreadCount, muted: c.muted ?? false,
      createdAt: at(c.createdDaysAgo * 1440),
    };

    const firstAgo = c.script[0]?.ago ?? 0;
    const filler: Message[] = Array.from({ length: c.fillerCount ?? 0 }, (_, i) => ({
      id: `${c.id}-f${i}`,
      conversationId: c.id,
      senderId: c.memberIds[i % c.memberIds.length]!,
      text: fillerLines[(i * 7) % fillerLines.length]!,
      createdAt: at(firstAgo + ((c.fillerCount ?? 0) - i) * 47),
      status: 'read',
      reactions: [],
    }));

    const scripted: Message[] = c.script.map((s, i) => ({
      id: `${c.id}-s${i}`,
      conversationId: c.id,
      senderId: s.from,
      text: s.text,
      createdAt: at(s.ago),
      status: s.status ?? 'read',
      replyToId: s.replyTo !== undefined ? `${c.id}-s${s.replyTo}` : undefined,
      reactions: toReactions(s.reactions),
      attachments: s.attachments?.map((a, j) => ({ ...a, id: `${c.id}-s${i}-a${j}` })),
    }));

    history[c.id] = [...filler, ...scripted];
  }

  return { currentUserId: CURRENT_USER_ID, users, conversations, history };
}

let db: MockDb | null = null;
export const getDb = () => (db ??= buildDb());
export const resetDb = () => {
  db = null;
};

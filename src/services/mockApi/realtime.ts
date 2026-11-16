import { replyLines } from '@/data/conversations';
import type { Conversation, ID, Message, MessageStatus, PresenceStatus } from '@/types/chat';
import { createId } from '@/utils/id';

export type ServerEvent =
  | { type: 'message:new'; message: Message }
  | { type: 'message:status'; conversationId: ID; messageId: ID; status: MessageStatus }
  | { type: 'typing'; conversationId: ID; userId: ID; isTyping: boolean }
  | { type: 'presence'; userId: ID; status: PresenceStatus };

export interface RealtimeSnapshot {
  currentUserId: ID;
  conversations: Record<ID, Conversation>;
}

interface ConnectOptions {
  /** Interval for unsolicited incoming messages; 0 disables them. */
  ambientIntervalMs?: number;
  replyProbability?: number;
}

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]!;
const PRESENCE: PresenceStatus[] = ['online', 'away', 'offline'];

/**
 * Stand-in for a WebSocket connection. The UI only sees `ServerEvent`s, so swapping
 * this for a real socket would not touch components or stores.
 */
class RealtimeChannel {
  private handler: ((event: ServerEvent) => void) | null = null;
  private snapshot: (() => RealtimeSnapshot) | null = null;
  private timers = new Set<ReturnType<typeof setTimeout>>();
  private interval: ReturnType<typeof setInterval> | null = null;
  private replyProbability = 0.65;

  connect(handler: (e: ServerEvent) => void, snapshot: () => RealtimeSnapshot, opts: ConnectOptions = {}) {
    this.disconnect();
    this.handler = handler;
    this.snapshot = snapshot;
    this.replyProbability = opts.replyProbability ?? 0.65;
    const every = opts.ambientIntervalMs ?? 25_000;
    if (every > 0) this.interval = setInterval(() => this.ambientTick(), every);
    return () => this.disconnect();
  }

  disconnect() {
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
    this.handler = null;
    this.snapshot = null;
  }

  /** Called by the API after the "server" accepted an outgoing message. */
  onClientMessage(message: Message) {
    const others = this.otherMembers(message.conversationId);
    if (!others.length) return;
    const { conversationId, id: messageId } = message;
    this.later(700, () => this.emit({ type: 'message:status', conversationId, messageId, status: 'delivered' }));
    this.later(1900, () => this.emit({ type: 'message:status', conversationId, messageId, status: 'read' }));
    if (Math.random() < this.replyProbability) this.simulateIncoming(conversationId, pick(others), 2400);
  }

  private simulateIncoming(conversationId: ID, userId: ID, startDelay: number) {
    this.later(startDelay, () => this.emit({ type: 'typing', conversationId, userId, isTyping: true }));
    this.later(startDelay + 2000 + Math.random() * 1500, () => {
      this.emit({ type: 'typing', conversationId, userId, isTyping: false });
      this.emit({
        type: 'message:new',
        message: {
          id: createId('m'), conversationId, senderId: userId, text: pick(replyLines),
          createdAt: Date.now(), status: 'delivered', reactions: [],
        },
      });
    });
  }

  private ambientTick() {
    const snap = this.snapshot?.();
    if (!snap) return;
    const candidates = Object.values(snap.conversations).filter((c) => this.otherMembers(c.id).length);
    if (!candidates.length) return;
    const conversation = pick(candidates);
    this.simulateIncoming(conversation.id, pick(this.otherMembers(conversation.id)), 0);
    if (Math.random() < 0.4) {
      const userId = pick(this.otherMembers(pick(candidates).id));
      this.emit({ type: 'presence', userId, status: pick(PRESENCE) });
    }
  }

  private otherMembers(conversationId: ID) {
    const snap = this.snapshot?.();
    const conversation = snap?.conversations[conversationId];
    return conversation ? conversation.memberIds.filter((id) => id !== snap!.currentUserId) : [];
  }

  private later(ms: number, fn: () => void) {
    const t = setTimeout(() => {
      this.timers.delete(t);
      fn();
    }, ms);
    this.timers.add(t);
  }

  private emit(event: ServerEvent) {
    this.handler?.(event);
  }
}

export const realtime = new RealtimeChannel();

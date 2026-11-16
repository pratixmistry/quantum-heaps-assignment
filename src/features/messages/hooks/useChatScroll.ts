import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import type { Message } from '@/types/chat';

const NEAR_BOTTOM_PX = 120;
const NEAR_TOP_PX = 80;

interface Options {
  containerRef: RefObject<HTMLDivElement | null>;
  conversationId: string;
  messages: Message[];
  currentUserId: string;
  canLoadOlder: boolean;
  loadOlder: () => Promise<void>;
}

/**
 * Owns all scroll behaviour of the message list:
 * - jumps to the bottom when a conversation opens,
 * - follows new messages only if the user is near the bottom (or sent it themselves),
 * - keeps the viewport anchored when older messages are prepended,
 * - triggers pagination near the top.
 */
export function useChatScroll({ containerRef, conversationId, messages, currentUserId, canLoadOlder, loadOlder }: Options) {
  const atBottomRef = useRef(true);
  const prependAnchor = useRef<{ height: number; top: number } | null>(null);
  const [unseen, setUnseen] = useState(0);
  const firstId = messages[0]?.id;
  const last = messages[messages.length - 1];

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'auto') => {
      const el = containerRef.current;
      if (!el) return;
      el.scrollTo?.({ top: el.scrollHeight, behavior });
      atBottomRef.current = true;
      setUnseen(0);
    },
    [containerRef],
  );

  useLayoutEffect(() => scrollToBottom(), [conversationId, scrollToBottom]);

  // Older page prepended: restore the previous visual position.
  useLayoutEffect(() => {
    const el = containerRef.current;
    const anchor = prependAnchor.current;
    if (!el || !anchor) return;
    el.scrollTop = el.scrollHeight - anchor.height + anchor.top;
    prependAnchor.current = null;
  }, [firstId, containerRef]);

  // New message appended — keyed on the last message's identity only.
  const lastId = last?.id;
  const lastIsOwn = last?.senderId === currentUserId;
  useLayoutEffect(() => {
    if (!lastId) return;
    if (atBottomRef.current || lastIsOwn) scrollToBottom('smooth');
    else setUnseen((n) => n + 1);
  }, [lastId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => setUnseen(0), [conversationId]);

  // Composer growth (reply banner, attachments, multi-line text) shrinks the viewport; stay pinned if at bottom.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => atBottomRef.current && (el.scrollTop = el.scrollHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  const onScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
    if (atBottomRef.current) setUnseen(0);
    if (canLoadOlder && el.scrollTop < NEAR_TOP_PX && !prependAnchor.current) {
      prependAnchor.current = { height: el.scrollHeight, top: el.scrollTop };
      // If nothing was prepended (error), drop the anchor so the next attempt can run.
      void loadOlder().finally(() => setTimeout(() => (prependAnchor.current = null)));
    }
  }, [containerRef, canLoadOlder, loadOlder]);

  return { onScroll, unseen, scrollToBottom };
}

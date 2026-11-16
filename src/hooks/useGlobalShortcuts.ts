import { useEffect } from 'react';
import { CONVERSATION_SEARCH_ID } from '@/features/conversations/components/ConversationList';
import { buildConversationSummaries, filterConversations } from '@/features/conversations/utils/conversationSummary';
import { useChatStore } from '@/store/chatStore';
import { useUiStore } from '@/store/uiStore';

export const SHORTCUTS: [keys: string, description: string][] = [
  ['Ctrl / ⌘ + K', 'Search conversations'],
  ['Alt + ↑ / ↓', 'Previous / next conversation'],
  ['Ctrl / ⌘ + Shift + F', 'Search messages in conversation'],
  ['Enter', 'Send message'],
  ['Shift + Enter', 'New line'],
  ['↑ (empty composer)', 'Edit your last message'],
  ['Esc', 'Cancel reply or edit · close panels'],
];

/** App-wide keyboard shortcuts. Composer-specific keys live in the Composer. */
export function useGlobalShortcuts() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const chat = useChatStore.getState();
      const ui = useUiStore.getState();

      if (mod && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (window.innerWidth < 768) chat.selectConversation(null);
        requestAnimationFrame(() => document.getElementById(CONVERSATION_SEARCH_ID)?.focus());
      } else if (mod && e.shiftKey && e.key.toLowerCase() === 'f' && chat.activeConversationId) {
        e.preventDefault();
        ui.setMessageSearchOpen(true);
      } else if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        const ids = filterConversations(buildConversationSummaries(chat), ui.filter, '').map((s) => s.conversation.id);
        if (!ids.length) return;
        const i = ids.indexOf(chat.activeConversationId ?? '');
        const next = e.key === 'ArrowDown' ? (i + 1) % ids.length : (i - 1 + ids.length) % ids.length;
        chat.selectConversation(ids[i === -1 ? 0 : next]!);
      } else if (e.key === 'Escape' && !e.defaultPrevented) {
        if (ui.messageSearchOpen) ui.setMessageSearchOpen(false);
        else if (ui.infoPanelOpen) ui.setInfoPanelOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}

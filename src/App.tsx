import { useEffect, useRef } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ShortcutsDialog } from '@/components/shared/ShortcutsDialog';
import { Toaster } from '@/components/shared/Toaster';
import { buildConversationSummaries } from '@/features/conversations/utils/conversationSummary';
import { useApplyTheme } from '@/features/theme/hooks/useApplyTheme';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { useChatStore } from '@/store/chatStore';
import { selectTotalUnread } from '@/store/selectors';

export default function App() {
  const status = useChatStore((s) => s.status);
  const totalUnread = useChatStore(selectTotalUnread);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  useApplyTheme();
  useGlobalShortcuts();
  useRealtimeSync(status === 'ready');

  useEffect(() => {
    void useChatStore.getState().bootstrap();
  }, []);

  // On wider screens, open the most recent conversation once on launch so the app never looks empty.
  const autoSelected = useRef(false);
  useEffect(() => {
    const s = useChatStore.getState();
    if (status !== 'ready' || autoSelected.current) return;
    autoSelected.current = true;
    if (isDesktop && !s.activeConversationId) {
      const first = buildConversationSummaries(s)[0];
      if (first) s.selectConversation(first.conversation.id);
    }
  }, [status, isDesktop]);

  useEffect(() => {
    document.title = totalUnread ? `(${totalUnread}) Quantum Chat` : 'Quantum Chat';
  }, [totalUnread]);

  return (
    <>
      <AppShell />
      <Toaster />
      <ConfirmDialog />
      <ShortcutsDialog />
    </>
  );
}

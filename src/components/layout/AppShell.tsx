import { ConversationList } from '@/features/conversations/components/ConversationList';
import { InfoPanel } from '@/features/groups/components/InfoPanel';
import { ChatWindow } from '@/features/messages/components/ChatWindow';
import { useChatStore } from '@/store/chatStore';
import { useUiStore } from '@/store/uiStore';
import { cn } from '@/utils/cn';
import { NavRail } from './NavRail';

/**
 * Responsive three-panel layout, driven purely by CSS breakpoints:
 * - mobile (<768): list OR chat full-screen, nav as a bottom bar, info panel as full-screen sheet
 * - tablet (768–1279): rail + collapsible list + chat, info panel as a drawer
 * - desktop (≥1280): rail + list + chat + inline info panel
 */
export function AppShell() {
  const hasActive = useChatStore((s) => !!s.activeConversationId);
  const infoOpen = useUiStore((s) => s.infoPanelOpen && hasActive);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const closeInfo = () => useUiStore.getState().setInfoPanelOpen(false);

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden md:flex-row">
      <NavRail className={cn('order-last md:order-first', hasActive && 'max-md:hidden')} />

      <aside
        aria-label="Conversation list"
        className={cn(
          'min-h-0 flex-1 border-line bg-surface md:w-80 md:flex-none md:border-r lg:w-[22rem]',
          hasActive ? 'hidden' : 'flex flex-col',
          collapsed ? 'md:hidden' : 'md:flex md:flex-col',
        )}
      >
        <ConversationList />
      </aside>

      <main className={cn('min-h-0 min-w-0 flex-1 flex-col bg-bg', hasActive ? 'flex' : 'hidden md:flex')}>
        <ChatWindow />
      </main>

      {infoOpen && (
        <>
          <button type="button" aria-label="Close info panel" onClick={closeInfo} className="fixed inset-0 z-30 bg-black/50 xl:hidden" />
          <aside
            aria-label="Conversation details"
            className="animate-slide-up fixed inset-y-0 right-0 z-40 w-full border-line bg-surface shadow-2xl sm:w-96 sm:border-l xl:static xl:z-auto xl:w-[22rem] xl:shadow-none"
          >
            <InfoPanel />
          </aside>
        </>
      )}
    </div>
  );
}

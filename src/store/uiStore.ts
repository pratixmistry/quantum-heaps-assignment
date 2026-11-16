import { create } from 'zustand';
import type { ConversationFilter, ID } from '@/types/chat';

export interface ComposerContext {
  conversationId: ID;
  mode: 'reply' | 'edit';
  messageId: ID;
}

interface UiState {
  filter: ConversationFilter;
  infoPanelOpen: boolean;
  sidebarCollapsed: boolean;
  messageSearchOpen: boolean;
  shortcutsOpen: boolean;
  composerContext: ComposerContext | null;
  setFilter: (filter: ConversationFilter) => void;
  setInfoPanelOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setMessageSearchOpen: (open: boolean) => void;
  setShortcutsOpen: (open: boolean) => void;
  setComposerContext: (ctx: ComposerContext | null) => void;
}

/** Purely presentational state; intentionally not persisted. */
export const useUiStore = create<UiState>()((set) => ({
  filter: 'all',
  infoPanelOpen: false,
  sidebarCollapsed: false,
  messageSearchOpen: false,
  shortcutsOpen: false,
  composerContext: null,
  setFilter: (filter) => set({ filter }),
  setInfoPanelOpen: (infoPanelOpen) => set({ infoPanelOpen }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setMessageSearchOpen: (messageSearchOpen) => set({ messageSearchOpen }),
  setShortcutsOpen: (shortcutsOpen) => set({ shortcutsOpen }),
  setComposerContext: (composerContext) => set({ composerContext }),
}));

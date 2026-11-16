import { create } from 'zustand';
import { createId } from '@/utils/id';

export type ToastTone = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  tone: ToastTone;
  message: string;
}

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
}

interface FeedbackState {
  toasts: Toast[];
  confirmRequest: (ConfirmOptions & { resolve: (ok: boolean) => void }) | null;
  pushToast: (tone: ToastTone, message: string) => void;
  dismissToast: (id: string) => void;
  resolveConfirm: (ok: boolean) => void;
}

/** Toasts and the confirm dialog — global feedback channels usable outside React. */
export const useFeedbackStore = create<FeedbackState>()((set, get) => ({
  toasts: [],
  confirmRequest: null,
  pushToast: (tone, message) => set((s) => ({ toasts: [...s.toasts.slice(-3), { id: createId('t'), tone, message }] })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  resolveConfirm: (ok) => {
    get().confirmRequest?.resolve(ok);
    set({ confirmRequest: null });
  },
}));

export const toast = {
  success: (m: string) => useFeedbackStore.getState().pushToast('success', m),
  error: (m: string) => useFeedbackStore.getState().pushToast('error', m),
  info: (m: string) => useFeedbackStore.getState().pushToast('info', m),
};

/** Promise-based confirm: `if (await confirm({...})) doDestructiveThing()`. */
export const confirm = (options: ConfirmOptions) =>
  new Promise<boolean>((resolve) => {
    useFeedbackStore.getState().confirmRequest?.resolve(false);
    useFeedbackStore.setState({ confirmRequest: { ...options, resolve } });
  });

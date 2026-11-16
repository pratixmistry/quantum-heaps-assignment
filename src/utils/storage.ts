import type { StateStorage } from 'zustand/middleware';

/** localStorage wrapper that never throws (quota exceeded, private mode). */
export const safeStorage: StateStorage = {
  getItem: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  setItem: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch (e) {
      console.warn('[storage] could not persist state', e);
    }
  },
  removeItem: (k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  },
};

export function resetDemoData() {
  ['qc-chat', 'qc-theme', 'qc-seed-anchor'].forEach((k) => safeStorage.removeItem(k));
  window.location.reload();
}

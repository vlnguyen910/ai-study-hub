import { create } from "zustand";

interface PendingDocumentsState {
  /** Number of pending documents waiting for moderator review */
  pendingCount: number;
  /** Increment count when a new document arrives via WebSocket */
  increment: () => void;
  /** Decrement count (e.g. after a document is approved/rejected) */
  decrement: () => void;
  /** Replace the entire count (e.g. after loading the initial list) */
  setCount: (count: number) => void;
}

export const usePendingDocumentsStore = create<PendingDocumentsState>(
  (set) => ({
    pendingCount: 0,
    increment: () => set((state) => ({ pendingCount: state.pendingCount + 1 })),
    decrement: () =>
      set((state) => ({
        pendingCount: Math.max(0, state.pendingCount - 1),
      })),
    setCount: (count) => set({ pendingCount: count }),
  }),
);

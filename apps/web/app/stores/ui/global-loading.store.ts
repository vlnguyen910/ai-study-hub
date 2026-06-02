import { create } from "zustand";

interface GlobalLoadingState {
  pendingCount: number;
  isVisible: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  resetLoading: () => void;
}

export const useGlobalLoadingStore = create<GlobalLoadingState>((set) => ({
  pendingCount: 0,
  isVisible: false,
  startLoading: () =>
    set((state) => ({
      pendingCount: state.pendingCount + 1,
      isVisible: true,
    })),
  stopLoading: () =>
    set((state) => {
      const nextPending = Math.max(0, state.pendingCount - 1);
      return {
        pendingCount: nextPending,
        isVisible: nextPending > 0,
      };
    }),
  resetLoading: () => set({ pendingCount: 0, isVisible: false }),
}));

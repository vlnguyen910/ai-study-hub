import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { UserRole } from "@/shared/types";
import type { User } from "./types";

interface AuthState {
  accessToken: string | null;
  role: UserRole | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoginPromptOpen: boolean;
  setAuth: (accessToken: string | null, role: UserRole, user?: User) => void;
  logout: () => void;
  setLoginPromptOpen: (open: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      role: null,
      user: null,
      isAuthenticated: false,
      isLoginPromptOpen: false,
      setAuth: (accessToken, role, user) =>
        set({
          accessToken,
          role,
          user,
          isAuthenticated: true,
        }),
      logout: () => {
        set({
          accessToken: null,
          role: null,
          user: null,
          isAuthenticated: false,
        });
        localStorage.removeItem("auth-storage");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_info");
      },
      setLoginPromptOpen: (open) => set({ isLoginPromptOpen: open }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        role: state.role,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

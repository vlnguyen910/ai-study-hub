import { isAxiosError } from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { API_ENDPOINTS } from "@/constants/endpoints";
import { fetchMyProfile } from "@/features/profile/services/profile.service";
import type { AccountProfile } from "@/features/profile/types/profile.types";
import { apiClient } from "@/services/api-client";
import { getAccessToken, getRefreshToken, removeTokens } from "@/utils/storage";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

interface SessionContextValue {
  readonly status: SessionStatus;
  readonly isAuthenticated: boolean;
  readonly user: AccountProfile | null;
  readonly refreshSession: () => Promise<AccountProfile | null>;
  readonly signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [user, setUser] = useState<AccountProfile | null>(null);

  const refreshSession =
    useCallback(async (): Promise<AccountProfile | null> => {
      const [accessToken, refreshToken] = await Promise.all([
        getAccessToken(),
        getRefreshToken(),
      ]);

      if (!accessToken && !refreshToken) {
        setUser(null);
        setStatus("unauthenticated");
        return null;
      }

      try {
        const profile = await fetchMyProfile();
        setUser(profile);
        setStatus("authenticated");
        return profile;
      } catch (error) {
        const isRejectedCredential =
          isAxiosError(error) &&
          (error.response?.status === 401 || error.response?.status === 403);
        const [remainingAccessToken, remainingRefreshToken] = await Promise.all(
          [getAccessToken(), getRefreshToken()],
        );

        if (
          isRejectedCredential ||
          (!remainingAccessToken && !remainingRefreshToken)
        ) {
          await removeTokens();
          setUser(null);
          setStatus("unauthenticated");
          return null;
        }

        // Preserve an existing local session during a temporary network outage.
        setStatus("authenticated");
        return null;
      }
    }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Local credentials must still be cleared if the server is unavailable.
    } finally {
      await removeTokens();
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      isAuthenticated: status === "authenticated",
      user,
      refreshSession,
      signOut,
    }),
    [refreshSession, signOut, status, user],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const session = useContext(SessionContext);

  if (!session) {
    throw new Error("useSession must be used inside SessionProvider");
  }

  return session;
}

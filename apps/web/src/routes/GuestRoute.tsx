/**
 * GuestRoute Component
 * Wrapper component for protecting routes that should ONLY be accessed by unauthenticated users (e.g. login, register)
 */

"use client";

import { useRouter } from "next/navigation";
import { useEffect, type FC, type ReactNode } from "react";
import { decodeJwtPayload } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth/store";
import { ROUTE_PATHS } from "./router.const";
import type { UserRole } from "@/shared/types";

export interface GuestRouteProps {
  children: ReactNode;
}

type AccessTokenPayload = {
  exp?: number;
};

const isAccessTokenUsable = (accessToken: string | null): boolean => {
  if (!accessToken?.trim()) {
    return false;
  }

  const payload = decodeJwtPayload<AccessTokenPayload>(accessToken);
  if (!payload) {
    return false;
  }

  if (typeof payload.exp !== "number" || !Number.isFinite(payload.exp)) {
    return false;
  }

  return payload.exp * 1000 > Date.now();
};

const getAuthenticatedRedirect = (role: UserRole | null): string => {
  if (role === "admin") {
    return ROUTE_PATHS.ADMIN_ROUTES.DASHBOARD;
  }

  if (role === "moderator") {
    return ROUTE_PATHS.MODERATOR_ROUTES.DASHBOARD;
  }

  return ROUTE_PATHS.PROTECTED_ROUTES.HOME;
};

export const GuestRoute: FC<GuestRouteProps> = ({
  children,
}): React.JSX.Element | null => {
  const router = useRouter();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const role = useAuthStore((state) => state.role);
  const shouldRedirect = hasHydrated && isAccessTokenUsable(accessToken);

  useEffect(() => {
    if (shouldRedirect) {
      router.replace(getAuthenticatedRedirect(role));
    }
  }, [role, router, shouldRedirect]);

  if (!hasHydrated || shouldRedirect) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-foreground">
        <div className="size-8 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />
      </div>
    );
  }

  return <>{children}</>;
};

export default GuestRoute;

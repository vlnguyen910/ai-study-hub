/**
 * GuestRoute Component
 * Wrapper component for protecting routes that should ONLY be accessed by unauthenticated users (e.g. login, register)
 */

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FC, type ReactNode } from "react";
import { getAuthToken, getAuthUser } from "./guards/auth.guard";

export interface GuestRouteProps {
  children: ReactNode;
}

export const GuestRoute: FC<GuestRouteProps> = ({
  children,
}): React.JSX.Element | null => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const token = getAuthToken();
  const user = getAuthUser();
  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.replace("/");
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted) {
    return null;
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default GuestRoute;

"use client";

import Link from "next/link";
import { useEffect, useRef, type FC } from "react";

import type { UserRole } from "@/shared/types";
import { useAuthStore } from "@/stores/auth/store";
import { ROUTE_PATHS } from "@/routes";
import { isDefaultAvatar } from "@/shared/constants";
import { getCurrentUser } from "@/modules/auth-api";
import { Avatar } from "./Avatar";

const getProfileHref = (role?: UserRole): string => {
  switch (role) {
    case "admin":
      return ROUTE_PATHS.ADMIN_ROUTES.SETTINGS;
    case "moderator":
      return ROUTE_PATHS.MODERATOR_ROUTES.SETTINGS;
    case "student":
    case "teacher":
    case "guest":
    default:
      return ROUTE_PATHS.PROTECTED_ROUTES.PROFILE;
  }
};

export const UserInfo: FC = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const hasRequestedProfileRef = useRef(false);

  useEffect(() => {
    if (
      !isAuthenticated ||
      !user ||
      hasRequestedProfileRef.current ||
      (user.avatar && !isDefaultAvatar(user.avatar))
    ) {
      return;
    }

    let isMounted = true;
    hasRequestedProfileRef.current = true;

    getCurrentUser()
      .then((currentUser) => {
        if (isMounted && useAuthStore.getState().isAuthenticated) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        // Sidebar profile is decorative; keep the existing local user fallback.
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, setUser, user]);

  const initials = (() => {
    if (!user?.name) return "?";
    const parts = user.name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
    return (first + last).toUpperCase();
  })();

  return (
    <Link
      href={getProfileHref(user?.role)}
      className="group flex items-center gap-3 rounded-2xl border border-outline-variant bg-surface-container-high/80 p-3 backdrop-blur-[15px] transition-colors hover:bg-surface-container-high"
    >
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 ring-2 ring-primary/20">
        <Avatar
          className="h-full w-full text-sm"
          imageUrl={user?.avatar}
          initials={initials}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-label-md text-label-md font-semibold text-on-surface">
          {user?.name ?? "Người dùng"}
        </p>
        <p className="truncate font-label-sm text-label-sm text-on-surface-variant">
          {user?.email ?? user?.role ?? ""}
        </p>
      </div>

      <span className="material-symbols-outlined shrink-0 text-[18px] text-on-surface-variant transition-colors group-hover:text-primary">
        chevron_right
      </span>
    </Link>
  );
};

"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { LogoutConfirmDialog } from "@/components/auth/LogoutConfirmDialog";
import { SideNav } from "@/components/layout/SideNav";
import { UserInfo } from "@/components/ui/UserInfo";
import { MODERATOR_NAV_ITEMS } from "@/constants/nav.const";
import { logoutCurrentSession } from "@/modules/auth-api";
import { ROUTE_PATHS } from "@/routes/router.const";
import { useAuthStore } from "@/stores/auth/store";

export function ModeratorShell({
  children,
}: {
  readonly children: ReactNode;
}): React.JSX.Element {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logoutCurrentSession();
    } finally {
      logout();
      setIsLogoutConfirmOpen(false);
      setIsLoggingOut(false);
      router.replace(ROUTE_PATHS.HOME);
    }
  };

  const navItems = MODERATOR_NAV_ITEMS.map((item) =>
    item.href === "#"
      ? { ...item, action: () => setIsLogoutConfirmOpen(true) }
      : item,
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SideNav
        title="Moderator Portal"
        subtitle="Cổng kiểm duyệt"
        items={navItems}
        footerContent={<UserInfo />}
      />

      <main className="min-h-screen overflow-x-hidden px-margin-mobile py-8 lg:ml-72 lg:px-margin-desktop">
        <div className="mx-auto w-full min-w-0 max-w-container-max">
          {children}
        </div>
      </main>
      <LogoutConfirmDialog
        open={isLogoutConfirmOpen}
        isSubmitting={isLoggingOut}
        onCancel={() => {
          if (!isLoggingOut) {
            setIsLogoutConfirmOpen(false);
          }
        }}
        onConfirm={() => void handleLogout()}
      />
    </div>
  );
}

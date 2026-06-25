"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, type ReactNode } from "react";

import { LogoutConfirmDialog } from "@/components/auth/LogoutConfirmDialog";
import { SideNav } from "@/components/layout/SideNav";
import { UserInfo } from "@/components/ui/UserInfo";
import { MODERATOR_NAV_ITEMS } from "@/constants/nav.const";
import { logoutCurrentSession } from "@/modules/auth-api";
import { ROUTE_PATHS } from "@/routes/router.const";
import { useAuthStore } from "@/stores/auth/store";
import { usePendingDocumentsStore } from "@/stores/pendingDocuments/store";
import {
  DocumentSocketProvider,
  useDocumentSocketContext,
} from "../context/DocumentSocketContext";

/**
 * Inner shell — must be a child of DocumentSocketProvider so it can subscribe.
 */
function ModeratorShellInner({
  children,
}: {
  readonly children: ReactNode;
}): React.JSX.Element {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { increment, pendingCount } = usePendingDocumentsStore();

  // Increment the badge count whenever any new document arrives
  useDocumentSocketContext(
    useCallback(() => {
      increment();
    }, [increment]),
  );

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

  const navItems = MODERATOR_NAV_ITEMS.map((item) => {
    if (item.href === "#") {
      return { ...item, action: () => setIsLogoutConfirmOpen(true) };
    }
    // Attach live badge count to the "Duyệt tài liệu" nav item
    if (item.href === ROUTE_PATHS.MODERATOR_ROUTES.DOCUMENTS) {
      return { ...item, badge: pendingCount > 0 ? pendingCount : undefined };
    }
    return item;
  });

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

/**
 * Wraps the moderator portal in the DocumentSocketProvider so all child
 * components (shell badge + documents page list) share one WebSocket connection.
 */
export function ModeratorShell({
  children,
}: {
  readonly children: ReactNode;
}): React.JSX.Element {
  return (
    <DocumentSocketProvider>
      <ModeratorShellInner>{children}</ModeratorShellInner>
    </DocumentSocketProvider>
  );
}

"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { SideNav } from "@/components/layout/SideNav";
import { InfoSection } from "@/components/ui/InfoSection";
import { MODERATOR_NAV_ITEMS } from "../../../constants/nav.constants";
import { ROUTE_PATHS } from "../../../routes/router.const";
import { useAuthStore } from "../../../stores/auth/store";

export function ModeratorShell({
  children,
}: {
  readonly children: ReactNode;
}): React.JSX.Element {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push(ROUTE_PATHS.AUTH_ROUTES.LOGIN);
  };

  const navItems = MODERATOR_NAV_ITEMS.map((item) =>
    item.href === "#" ? { ...item, action: handleLogout } : item,
  );

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <SideNav
        title="Moderator Portal"
        subtitle="Cổng kiểm duyệt"
        items={navItems}
        footerContent={<InfoSection />}
      />

      <main className="min-h-screen overflow-x-hidden px-margin-mobile py-8 lg:ml-72 lg:px-margin-desktop">
        <div className="mx-auto w-full min-w-0 max-w-container-max">
          {children}
        </div>
      </main>
    </div>
  );
}

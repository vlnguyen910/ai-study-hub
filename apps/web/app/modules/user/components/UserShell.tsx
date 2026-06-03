"use client";

import { useRouter } from "next/navigation";
import type { FC, ReactNode } from "react";

import { SideNav } from "@/components/layout/SideNav";
import { ROUTE_PATHS } from "../../../routes/router.const";
import { useAuthStore } from "../../../stores/auth/store";
import { USER_NAV_ITEMS } from "@/constants/nav.const";
import { UserInfo } from "@/components/ui/UserInfo";

export interface UserShellProps {
  readonly children: ReactNode;
  readonly title: string;
  readonly subtitle: string;
}

export const UserShell: FC<UserShellProps> = ({
  children,
  title,
  subtitle,
}) => {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push(ROUTE_PATHS.AUTH_ROUTES.LOGIN);
  };

  const navItems = USER_NAV_ITEMS.map((item) =>
    item.href === "#" ? { ...item, action: handleLogout } : item,
  );

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <SideNav
        title={title}
        subtitle={subtitle}
        items={navItems}
        footerContent={<UserInfo />}
      />

      <main className="min-h-screen overflow-x-hidden px-4 py-6 sm:px-6 lg:ml-72 lg:px-8">
        <div className="min-w-0">{children}</div>
      </main>
    </div>
  );
};

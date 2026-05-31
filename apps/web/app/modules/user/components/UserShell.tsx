"use client";

import type { FC, ReactNode } from "react";

import { SideNav } from "@/components/layout/SideNav";
import type { SideNavItem } from "../../../types/sideNav";
import { userRouterConfig } from "../../../routes/user/user.routes";

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
  const navItems: SideNavItem[] = [
    {
      label: userRouterConfig.HOME.title,
      icon: "home",
      href: userRouterConfig.HOME.path,
      section: "main",
    },
    {
      label: userRouterConfig.MY_DOCUMENTS.title,
      icon: "description",
      href: userRouterConfig.MY_DOCUMENTS.path,
      section: "main",
    },
    {
      label: userRouterConfig.UPLOADS.title,
      icon: "cloud_upload",
      href: userRouterConfig.UPLOADS.path,
      section: "main",
    },
    {
      label: userRouterConfig.FAVORITES.title,
      icon: "favorite",
      href: userRouterConfig.FAVORITES.path,
      section: "main",
    },
    {
      label: userRouterConfig.SETTINGS.title,
      icon: "settings",
      href: userRouterConfig.SETTINGS.path,
      section: "secondary",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <div className="flex">
        <SideNav title={title} subtitle={subtitle} items={navItems} />

        <main className="min-w-0 flex-1">
          <div className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

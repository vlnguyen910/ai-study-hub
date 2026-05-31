"use client";

import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { adminProfile } from "../mockData";
import type { AdminNavSection } from "../types";
import { MaterialIcon } from "./AdminPrimitives";
import { SideNav } from "@/components/layout/SideNav";
import type { SideNavItem } from "../../../types/sideNav";
import { adminRouterConfig } from "../../../routes/admin/admin.routes";

const adminNavItems: SideNavItem[] = [
  {
    label: adminRouterConfig.DASHBOARD.title,
    href: adminRouterConfig.DASHBOARD.path,
    icon: "dashboard",
    section: "main",
  },
  {
    label: adminRouterConfig.USERS.title,
    href: adminRouterConfig.USERS.path,
    icon: "group",
    section: "main",
  },
  {
    label: adminRouterConfig.DOCUMENTS.title,
    href: adminRouterConfig.DOCUMENTS.path,
    icon: "description",
    section: "main",
  },
  {
    label: adminRouterConfig.CATEGORIES.title,
    href: adminRouterConfig.CATEGORIES.path,
    icon: "category",
    section: "main",
  },
  {
    label: adminRouterConfig.REPORTS.title,
    href: adminRouterConfig.REPORTS.path,
    icon: "report",
    section: "main",
  },
  {
    label: adminRouterConfig.SETTINGS.title,
    href: adminRouterConfig.SETTINGS.path,
    icon: "settings",
    section: "secondary",
  },
];

export function AdminShell({
  children,
  activeSection,
  searchPlaceholder = "Tìm kiếm người dùng, hoạt động hoặc cấu hình...",
}: {
  readonly children: ReactNode;
  readonly activeSection: AdminNavSection;
  readonly searchPlaceholder?: string;
}): React.JSX.Element {
  const pathname = usePathname();

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-on-surface">
      <SideNav
        title="Admin Portal"
        subtitle="Cổng quản trị"
        items={adminNavItems}
        footerContent={
          <div className="space-y-4">
            <button
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-on-primary transition hover:bg-on-primary-fixed-variant"
              type="button"
            >
              <MaterialIcon name="download" />
              Tải báo cáo
            </button>

            <div className="space-y-2 rounded-3xl border border-outline-variant bg-surface-container-high p-4">
              <button
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-on-surface-variant transition hover:bg-surface-container-high"
                type="button"
              >
                <MaterialIcon name="admin_panel_settings" />
                Quyền truy cập
              </button>
              <button
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-on-surface-variant transition hover:bg-surface-container-high"
                type="button"
              >
                <MaterialIcon name="logout" />
                Đăng xuất
              </button>
              <div className="mt-2 flex items-center gap-3 rounded-2xl bg-surface p-3">
                <Avatar
                  imageUrl={adminProfile.avatarUrl}
                  size="sm"
                  className="border border-outline-variant"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-on-surface">
                    {adminProfile.name}
                  </p>
                  <p className="truncate text-[11px] uppercase text-on-surface-variant">
                    {adminProfile.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        }
      />

      <header className="fixed left-0 right-0 top-0 z-40 flex h-[76px] items-center justify-between border-b border-outline-variant bg-surface px-margin-mobile lg:left-64 lg:px-margin-desktop">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Link
            className="min-w-0 truncate font-headline-md text-headline-md font-bold text-primary lg:hidden"
            href="/admin"
          >
            AcademiShare
          </Link>
          <div className="relative hidden w-full max-w-md sm:block">
            <MaterialIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              name="search"
            />
            <input
              aria-label="Tìm kiếm trong admin portal"
              className="w-full rounded border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 font-label-md text-label-md outline-none transition-colors focus:border-2 focus:border-primary focus:py-[7px]"
              placeholder={searchPlaceholder}
              type="search"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            aria-label="Notifications"
            className="relative rounded p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
            type="button"
          >
            <MaterialIcon name="notifications" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error" />
          </button>
          <button
            aria-label="Language"
            className="hidden rounded p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary sm:block"
            type="button"
          >
            <MaterialIcon name="translate" />
          </button>
          <button
            aria-label="Theme"
            className="hidden rounded p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary sm:block"
            type="button"
          >
            <MaterialIcon name="dark_mode" />
          </button>
        </div>
      </header>

      <main className="min-h-screen overflow-x-hidden px-margin-mobile pb-12 pt-28 lg:ml-64 lg:px-margin-desktop">
        <nav
          aria-label="Admin mobile navigation"
          className="mb-6 flex max-w-[calc(100vw-32px)] gap-2 overflow-x-auto lg:hidden"
        >
          {adminNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex min-w-max items-center gap-2 rounded border px-3 py-2 font-label-sm text-label-sm ${
                  isActive
                    ? "border-primary bg-primary text-on-primary"
                    : "border-outline-variant bg-surface text-on-surface-variant"
                }`}
                href={item.href}
                key={item.href}
              >
                <MaterialIcon className="text-[18px]" name={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mx-auto w-full min-w-0 max-w-full lg:max-w-container-max">
          {children}
        </div>
      </main>
    </div>
  );
}

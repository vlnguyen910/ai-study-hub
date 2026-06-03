"use client";

import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";
import type { ReactNode } from "react";
import { adminProfile } from "../mockData";
import type { AdminNavSection } from "../types";
import { MaterialIcon } from "./AdminPrimitives";

const adminNavItems: readonly {
  label: string;
  href: string;
  icon: string;
  section: AdminNavSection;
}[] = [
  {
    label: "Bảng điều khiển",
    href: "/admin",
    icon: "dashboard",
    section: "dashboard",
  },
  {
    label: "Quản lý người dùng",
    href: "/admin/users",
    icon: "group",
    section: "users",
  },
  {
    label: "Cài đặt hệ thống",
    href: "/admin/settings",
    icon: "settings",
    section: "settings",
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
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-on-surface">
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col border-r border-outline-variant bg-surface-container-low py-base lg:flex">
        <div className="px-6 py-4">
          <Link
            className="font-headline-md text-headline-md font-bold text-primary"
            href="/"
          >
            AcademiShare
          </Link>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Cổng quản trị
          </p>
        </div>

        <nav className="mt-6 flex-1 px-3" aria-label="Admin navigation">
          <div className="space-y-1">
            {adminNavItems.map((item) => {
              const isActive = activeSection === item.section;

              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 rounded px-4 py-3 font-label-md text-label-md transition-colors ${
                    isActive
                      ? "border-l-2 border-primary bg-secondary-container text-on-secondary-container"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  <MaterialIcon filled={isActive} name={item.icon} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="px-4 py-4">
          <button
            className="flex w-full items-center justify-center gap-2 rounded bg-primary px-4 py-3 font-label-md text-label-md text-on-primary transition-colors hover:bg-on-primary-fixed-variant"
            type="button"
          >
            <MaterialIcon name="download" />
            Tải báo cáo
          </button>
        </div>

        <div className="border-t border-outline-variant px-3 py-4">
          <button
            className="flex w-full items-center gap-3 rounded px-4 py-3 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high"
            type="button"
          >
            <MaterialIcon name="admin_panel_settings" />
            Quyền truy cập
          </button>
          <button
            className="flex w-full items-center gap-3 rounded px-4 py-3 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high"
            type="button"
          >
            <MaterialIcon name="logout" />
            Đăng xuất
          </button>
          <div className="mt-2 flex items-center gap-3 px-4 py-4">
            <Avatar
              imageUrl={adminProfile.avatarUrl}
              size="sm"
              className="border border-outline-variant"
            />
            <div className="min-w-0">
              <p className="truncate font-label-md text-label-md">
                {adminProfile.name}
              </p>
              <p className="truncate text-[10px] uppercase text-on-surface-variant">
                {adminProfile.role}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-h-screen overflow-x-hidden px-margin-mobile pb-12 pt-12 lg:ml-64 lg:px-margin-desktop">
        <nav
          aria-label="Admin mobile navigation"
          className="mb-6 flex max-w-[calc(100vw-32px)] gap-2 overflow-x-auto lg:hidden"
        >
          {adminNavItems.map((item) => {
            const isActive = activeSection === item.section;

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

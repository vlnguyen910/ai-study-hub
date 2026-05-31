"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { moderatorProfile } from "../mockData";
import type { ModeratorNavSection } from "../types";
import { MaterialIcon } from "./ModeratorPrimitives";
import { SideNav } from "@/components/layout/SideNav";
import type { SideNavItem } from "../../../types/sideNav";
import { moderatorRouterConfig } from "../../../routes/moderator/moderator.routes";

const sideNavItems: SideNavItem[] = [
  {
    label: moderatorRouterConfig.DASHBOARD.title,
    href: moderatorRouterConfig.DASHBOARD.path,
    icon: "dashboard",
    section: "main",
  },
  {
    label: moderatorRouterConfig.DOCUMENTS.title,
    href: moderatorRouterConfig.DOCUMENTS.path,
    icon: "description",
    section: "main",
  },
  {
    label: moderatorRouterConfig.POSTS.title,
    href: moderatorRouterConfig.POSTS.path,
    icon: "gavel",
    section: "main",
  },
];

const topNavItems = [
  { label: "Dashboard", href: "/moderator" },
  { label: "Analytics", href: "/moderator/documents" },
  { label: "Reports", href: "/moderator/posts" },
] as const;

export function ModeratorShell({
  children,
  activeSection,
  searchPlaceholder = "Tìm kiếm tài liệu hoặc báo cáo...",
}: {
  readonly children: ReactNode;
  readonly activeSection: ModeratorNavSection;
  readonly searchPlaceholder?: string;
}): React.JSX.Element {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <SideNav
        title="Moderator Portal"
        subtitle="Cổng kiểm duyệt"
        items={sideNavItems}
        footerContent={
          <div className="space-y-4">
            <Link
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-on-primary transition hover:bg-on-primary-fixed-variant"
              href="/moderator/documents"
            >
              <MaterialIcon name="rate_review" />
              Duyệt tài liệu tải lên
            </Link>

            <div className="space-y-2 rounded-3xl border border-outline-variant bg-surface-container-high p-4">
              <button
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-on-surface-variant transition hover:bg-surface-container-high"
                type="button"
              >
                <MaterialIcon name="settings" />
                Cài đặt
              </button>
              <button
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-on-surface-variant transition hover:bg-surface-container-high"
                type="button"
              >
                <MaterialIcon name="help" />
                Hỗ trợ
              </button>
              <div className="mt-2 flex items-center gap-3 rounded-2xl bg-surface p-3">
                <img
                  alt={`Ảnh đại diện của ${moderatorProfile.name}`}
                  className="h-10 w-10 rounded-full border border-outline object-cover"
                  height={40}
                  src={moderatorProfile.avatarUrl}
                  width={40}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-on-surface">
                    {moderatorProfile.name}
                  </p>
                  <p className="truncate text-[11px] uppercase text-on-surface-variant">
                    {moderatorProfile.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        }
      />

      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-outline-variant bg-surface px-margin-mobile lg:left-64 lg:px-margin-desktop">
        <div className="flex min-w-0 flex-1 items-center gap-6">
          <div className="relative hidden w-full max-w-md sm:block">
            <MaterialIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              name="search"
            />
            <input
              aria-label="Tìm kiếm trong cổng kiểm duyệt"
              className="w-full rounded border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 font-label-md text-label-md outline-none transition-colors focus:border-2 focus:border-primary focus:py-[7px]"
              placeholder={searchPlaceholder}
              type="search"
            />
          </div>

          <nav
            aria-label="Moderator top navigation"
            className="hidden items-center gap-6 xl:flex"
          >
            {topNavItems.map((item) => {
              const isActive =
                item.href === "/moderator"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={`pb-1 font-label-md text-label-md transition-colors ${
                    isActive
                      ? "border-b-2 border-primary text-primary"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            aria-label="Thông báo"
            className="rounded p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
            type="button"
          >
            <MaterialIcon name="notifications" />
          </button>
          <button
            aria-label="Ngôn ngữ"
            className="rounded p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
            type="button"
          >
            <MaterialIcon name="translate" />
          </button>
          <button
            aria-label="Giao diện"
            className="rounded p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
            type="button"
          >
            <MaterialIcon name="dark_mode" />
          </button>
          <Link
            className="hidden rounded bg-primary px-4 py-2 font-label-md text-label-md text-on-primary transition-colors hover:bg-on-primary-fixed-variant sm:inline-flex"
            href="/moderator/documents"
          >
            Hàng đợi duyệt
          </Link>
        </div>
      </header>

      <main className="min-h-screen px-margin-mobile pb-12 pt-24 lg:ml-64 lg:px-margin-desktop">
        <div className="mx-auto max-w-container-max">{children}</div>
      </main>
    </div>
  );
}

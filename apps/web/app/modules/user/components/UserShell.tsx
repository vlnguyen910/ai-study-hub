"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC, ReactNode } from "react";

import { sideNavItems } from "../../../constants/user-side-nav.const";

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
  const pathname = usePathname();

  const mainItems = sideNavItems.filter((item) => item.section === "main");

  const secondaryItems = sideNavItems.filter(
    (item) => item.section === "secondary",
  );

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <div className="flex">
        {/* SIDEBAR */}
        <aside
          className="
            fixed
            left-0
            top-0
            z-40
            hidden
            h-screen
            w-72
            flex-col
            border-r
            border-outline-variant
            bg-background
            px-6
            py-8
            lg:flex
          "
        >
          {/* Header */}
          <div className="mb-8">
            <h2 className="mb-2 font-headline-md text-headline-md font-bold text-primary">
              {title}
            </h2>

            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {subtitle}
            </p>
          </div>

          {/* Main nav */}
          <nav className="mb-auto flex flex-col gap-2">
            {mainItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 font-label-md transition-all ${
                    isActive
                      ? "bg-secondary-container font-bold text-on-secondary-container"
                      : "text-on-surface-variant hover:bg-surface-variant"
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={
                      isActive
                        ? {
                            fontVariationSettings: '"FILL" 1',
                          }
                        : undefined
                    }
                  >
                    {item.icon}
                  </span>

                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Secondary nav */}
          <div className="mt-8 border-t border-outline-variant pt-6">
            <div className="flex flex-col gap-2">
              {secondaryItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 font-label-md transition-all ${
                      isActive
                        ? "bg-secondary-container font-bold text-on-secondary-container"
                        : "text-on-surface-variant hover:bg-surface-variant"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={
                        isActive
                          ? {
                              fontVariationSettings: '"FILL" 1',
                            }
                          : undefined
                      }
                    >
                      {item.icon}
                    </span>

                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        {/* CONTENT */}
        <main
          className="
            min-w-0
            flex-1
            lg:ml-72
          "
        >
          <div
            className="
              min-w-0
              px-4
              py-6
              sm:px-6
              lg:px-8
            "
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

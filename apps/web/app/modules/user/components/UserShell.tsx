import type { FC, ReactNode } from "react";
import { TopNav } from "../layout/TopNav";
import { SideNav } from "../layout/SideNav";
import { Footer } from "../layout/Footer";
import { styleGuideLayout } from "@/data/mockData";
import { sideNavItems } from "../../../constants/sideNav.const";
import { SideNavItem } from "../../../types/sideNav";
import { PageShellProps } from "@/components/patterns/PageShell";

export interface SideNavProps {
  readonly title: string;
  readonly subtitle: string;
  readonly ctaLabel: string;
  readonly items: readonly SideNavItem[];
}

export const SideNav: FC<SideNavProps> = ({
  title,
  subtitle,
  ctaLabel,
  items,
}) => {
  const mainItems = items.filter((item) => item.section === "main");

  const secondaryItems = items.filter((item) => item.section === "secondary");

  return (
    <aside className="hidden lg:flex min-h-[calc(100vh-64px)] w-64 flex-col border-r border-outline-variant pr-8 mr-8">
      <div className="mb-8">
        <h2 className="mb-2 font-headline-md text-headline-md font-bold text-primary">
          {title}
        </h2>

        <p className="font-label-sm text-label-sm text-on-surface-variant">
          {subtitle}
        </p>
      </div>

      <nav className="mb-auto flex flex-col gap-2">
        {mainItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="
              flex items-center gap-3 rounded-xl px-4 py-2
              font-label-md text-on-surface-variant
              transition-all hover:bg-surface-variant
            "
          >
            <span className="material-symbols-outlined">{item.icon}</span>

            {item.label}
          </a>
        ))}
      </nav>

      <div className="mt-8 flex flex-col gap-2 border-t border-outline-variant pt-8">
        {secondaryItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="
              flex items-center gap-3 rounded-xl px-4 py-2
              font-label-md text-on-surface-variant
              transition-all hover:bg-surface-variant
            "
          >
            <span className="material-symbols-outlined">{item.icon}</span>

            {item.label}
          </a>
        ))}

        <button
          className="
            mt-4 w-full rounded-xl bg-primary px-4 py-2
            text-center font-label-md text-on-primary
            transition-colors hover:bg-on-primary-fixed-variant
          "
        >
          {ctaLabel}
        </button>
      </div>
    </aside>
  );
};

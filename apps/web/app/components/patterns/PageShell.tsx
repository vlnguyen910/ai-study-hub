import type { FC, ReactNode } from "react";
import { TopNav } from "../layout/TopNav";
import { SideNav } from "../layout/SideNav";
import { Footer } from "../layout/Footer";
import { styleGuideLayout } from "@/data/mockData";

export interface PageShellProps {
  readonly children: ReactNode;
}

export const PageShell: FC<PageShellProps> = ({ children }) => {
  return (
    <div className="bg-surface text-on-surface min-h-screen relative">
      <TopNav
        brandName={styleGuideLayout.brandName}
        avatarUrl={styleGuideLayout.userAvatarUrl}
      />
      <div className="flex max-w-container-max mx-auto px-margin-desktop py-gutter">
        <SideNav
          title={styleGuideLayout.sideNavTitle}
          subtitle={styleGuideLayout.sideNavSubtitle}
          ctaLabel={styleGuideLayout.sideNavCtaLabel}
        />
        <main className="flex-1 w-full pb-32">{children}</main>
      </div>
      <Footer brandText={styleGuideLayout.footerText} />
    </div>
  );
};

"use client";

import { DangerSection } from "../components/DangerSection";
import { LanguageSection } from "../components/LanguageSection";
import { ThemeSection } from "../components/ThemeSection";
import { useAuthStore } from "@/stores/auth/store";

export function SettingsPage(): React.JSX.Element {
  const role = useAuthStore((state) => state.user?.role ?? state.role);
  const canDeleteOwnAccount = role === "student" || role === "teacher";

  return (
    <div className="min-w-0 bg-background">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-normal text-on-surface">
          Cài đặt
        </h1>
        <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
          Tùy chỉnh giao diện, ngôn ngữ và quản lý tài khoản của bạn.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <ThemeSection />
        <LanguageSection />
        {canDeleteOwnAccount ? <DangerSection /> : null}
      </div>
    </div>
  );
}

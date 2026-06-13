"use client";

import { useState } from "react";
import type { SettingsNavItem, SettingsTab } from "../types";
import { AccountSection } from "../components/AccountSection";
import { ModeratorSection } from "../components/ModeratorSection";
import { SecuritySection } from "../components/SecuritySection";
import { SettingsShell } from "../components/SettingsShell";
import { ThemeSection } from "../components/ThemeSection";

// Extends USER_NAV with a moderator-only "Kiểm duyệt" tab.
const MODERATOR_NAV: SettingsNavItem[] = [
  { key: "account", label: "Tài khoản", icon: "person" },
  { key: "security", label: "Bảo mật", icon: "lock" },
  { key: "theme", label: "Giao diện", icon: "contrast" },
  { key: "moderator", label: "Kiểm duyệt", icon: "rule" },
];

export function ModeratorSettingsPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  return (
    <SettingsShell
      title="Cài đặt kiểm duyệt viên"
      subtitle="Quản lý hồ sơ, bảo mật, giao diện và tùy chọn kiểm duyệt."
      navItems={MODERATOR_NAV}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "account" && <AccountSection />}
      {activeTab === "security" && <SecuritySection />}
      {activeTab === "theme" && <ThemeSection />}
      {activeTab === "moderator" && <ModeratorSection />}
    </SettingsShell>
  );
}

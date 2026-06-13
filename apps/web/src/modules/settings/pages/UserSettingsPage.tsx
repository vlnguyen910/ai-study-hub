"use client";

import { useState } from "react";
import type { SettingsNavItem, SettingsTab } from "../types";
import { AccountSection } from "../components/AccountSection";
import { SecuritySection } from "../components/SecuritySection";
import { SettingsShell } from "../components/SettingsShell";
import { ThemeSection } from "../components/ThemeSection";

const USER_NAV: SettingsNavItem[] = [
  { key: "account", label: "Tài khoản", icon: "person" },
  { key: "security", label: "Bảo mật", icon: "lock" },
  { key: "theme", label: "Giao diện", icon: "contrast" },
];

export function UserSettingsPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  return (
    <SettingsShell
      title="Cài đặt"
      subtitle="Quản lý hồ sơ, bảo mật và giao diện của bạn."
      navItems={USER_NAV}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "account" && <AccountSection />}
      {activeTab === "security" && <SecuritySection />}
      {activeTab === "theme" && <ThemeSection />}
    </SettingsShell>
  );
}

"use client";

/**
 * ProfilePage (/profile)
 *
 * Data source: useAuthStore().user — the authenticated user is already held
 * in the store after login, so no separate API fetch is needed on mount.
 *
 * Layout: min-w-0 space-y-6 — consistent with /my-documents and /uploads.
 * The surrounding UserShell (via (app)/(user)/layout.tsx) provides the
 * SideNav, top padding, and background; this page adds no extra shell.
 *
 * Rendering is fully delegated to three child components:
 *  - ProfileHeader      → page title + security notice
 *  - PersonalInfoForm   → avatar + name/email/university fields + API save
 *  - SecurityForm       → password-change form
 */

import { useAuthStore } from "@/stores/auth/store";
import { CollectionsTab } from "@/modules/collections/components/CollectionsTab";
import { ProfileHeader } from "./components/ProfileHeader";
import { PersonalInfoForm } from "./components/PersonalInfoForm";
import { SecurityForm } from "./components/SecurityForm";
import { useState } from "react";

type ProfileTab = "account" | "collections";

export default function ProfilePage(): React.JSX.Element {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ProfileTab>("account");

  // Guard: this route is protected, but handle a missing user gracefully
  if (!user) {
    return (
      <div className="min-w-0 flex items-center justify-center py-24 text-center">
        <p className="text-sm text-on-surface-variant">
          Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <ProfileHeader />

      <div className="flex flex-wrap gap-2 rounded-2xl border border-outline-variant bg-surface-container-lowest p-1">
        {[
          { value: "account" as const, label: "Thông tin cá nhân" },
          { value: "collections" as const, label: "Bộ sưu tập" },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.value
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "account" ? (
        <>
          <PersonalInfoForm user={user} />
          <SecurityForm />
        </>
      ) : (
        <CollectionsTab userId={user.id} isOwnProfile />
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { AdminCard, MaterialIcon } from "../components/AdminPrimitives";
import { mockSettings } from "../mockData";
import type { AdminSettings } from "../types";
import { fetchSystemSettings, updateSystemSettings } from "./api";
import { EmailSection } from "./components/EmailSection";
import { GeneralSection } from "./components/GeneralSection";
import { NotificationSection } from "./components/NotificationSection";
import { SecuritySection } from "./components/SecuritySection";
import { ThemeSection } from "./components/ThemeSection";

type ActiveSection = keyof AdminSettings | "theme";

const NAV_ITEMS: { key: ActiveSection; label: string; icon: string }[] = [
  { key: "general", label: "Cấu hình chung", icon: "tune" },
  { key: "security", label: "Cài đặt bảo mật", icon: "security" },
  { key: "email", label: "Cài đặt email", icon: "mail" },
  { key: "notifications", label: "Thông báo", icon: "notifications" },
  { key: "theme", label: "Giao diện", icon: "contrast" },
];

export default function AdminSettingsPage(): React.JSX.Element {
  const [settings, setSettings] = useState<AdminSettings>(mockSettings);
  // Tracks the last-saved snapshot so Cancel can revert
  const [savedSettings, setSavedSettings] =
    useState<AdminSettings>(mockSettings);
  const [activeSection, setActiveSection] = useState<ActiveSection>("general");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load from API on mount; silently fall back to mock if endpoint is not live
  useEffect(() => {
    fetchSystemSettings()
      .then((data) => {
        setSettings(data);
        setSavedSettings(data);
      })
      .catch(() => {
        // API not yet implemented — mock data is used as initial state
      });
  }, []);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2600);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const updated = await updateSystemSettings(settings);
      setSavedSettings(updated);
      showToast("Đã lưu cấu hình hệ thống.");
    } catch {
      // API not live yet — treat local state as saved
      setSavedSettings(settings);
      showToast("Chưa có API — thay đổi được lưu cục bộ.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setSettings(savedSettings);
    showToast("Đã hoàn tác thay đổi.");
  }

  const patchGeneral = useCallback(
    <K extends keyof AdminSettings["general"]>(
      key: K,
      value: AdminSettings["general"][K],
    ) => {
      setSettings((s) => ({ ...s, general: { ...s.general, [key]: value } }));
    },
    [],
  );

  const patchSecurity = useCallback(
    <K extends keyof AdminSettings["security"]>(
      key: K,
      value: AdminSettings["security"][K],
    ) => {
      setSettings((s) => ({
        ...s,
        security: { ...s.security, [key]: value },
      }));
    },
    [],
  );

  const patchNotifications = useCallback(
    <K extends keyof AdminSettings["notifications"]>(
      key: K,
      value: AdminSettings["notifications"][K],
    ) => {
      setSettings((s) => ({
        ...s,
        notifications: { ...s.notifications, [key]: value },
      }));
    },
    [],
  );

  return (
    <>
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-on-surface">
            Cài đặt hệ thống
          </h1>
          <p className="mt-2 max-w-2xl font-body-md text-body-md text-on-surface-variant">
            Quản lý cấu hình nền tảng, bảo mật, email và thông báo.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            className="inline-flex items-center gap-2 rounded"
            onClick={handleCancel}
            variant="ghost"
            disabled={isSaving}
          >
            <MaterialIcon className="text-[18px]" name="restart_alt" />
            Hủy
          </Button>
          <Button
            className="inline-flex items-center gap-2 rounded"
            onClick={() => void handleSave()}
            disabled={isSaving}
          >
            <MaterialIcon className="text-[18px]" name="save" />
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      {/* Toast notification */}
      {toast ? (
        <div className="fixed right-4 top-20 z-90">
          <Toast
            icon={
              <MaterialIcon
                className="text-[18px]"
                name={toast.type === "success" ? "check" : "warning"}
              />
            }
            message={toast.message}
          />
        </div>
      ) : null}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        {/* Sticky sidebar nav */}
        <AdminCard className="h-max p-4 lg:sticky lg:top-24 lg:col-span-3">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col">
            {NAV_ITEMS.map(({ key, label, icon }) => (
              <button
                key={key}
                className={`inline-flex min-w-max items-center gap-2 rounded px-4 py-3 text-left font-label-md text-label-md tracking-normal transition-colors ${
                  activeSection === key
                    ? "bg-primary text-on-primary"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
                onClick={() => setActiveSection(key)}
                type="button"
              >
                <MaterialIcon className="text-[20px]" name={icon} />
                {label}
              </button>
            ))}
          </nav>
        </AdminCard>

        {/* Section content */}
        <div className="space-y-gutter lg:col-span-9">
          {activeSection === "general" && (
            <GeneralSection data={settings.general} onChange={patchGeneral} />
          )}
          {activeSection === "security" && (
            <SecuritySection
              data={settings.security}
              onChange={patchSecurity}
            />
          )}
          {activeSection === "email" && <EmailSection data={settings.email} />}
          {activeSection === "notifications" && (
            <NotificationSection
              data={settings.notifications}
              onChange={patchNotifications}
            />
          )}
          {activeSection === "theme" && <ThemeSection />}
        </div>
      </div>
    </>
  );
}

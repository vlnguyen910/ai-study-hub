"use client";

import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { Switch } from "@/components/ui/Switch";
import { Toast } from "@/components/ui/Toast";
import { useState, type ReactNode } from "react";
import { AdminShell } from "../components/AdminShell";
import {
  AdminCard,
  AdminSelect,
  MaterialIcon,
} from "../components/AdminPrimitives";
import { mockSettings } from "../mockData";
import type { AdminSettings } from "../types";

type SettingsSection = keyof AdminSettings;

const sectionLabels: Record<SettingsSection, { label: string; icon: string }> =
  {
    general: { label: "Cấu hình chung", icon: "tune" },
    security: { label: "Cài đặt bảo mật", icon: "security" },
    email: { label: "Cài đặt email", icon: "mail" },
    notifications: { label: "Thông báo", icon: "notifications" },
  };

const timezoneOptions = [
  { label: "Việt Nam (Asia/Ho_Chi_Minh)", value: "Asia/Ho_Chi_Minh" },
  { label: "Bangkok (Asia/Bangkok)", value: "Asia/Bangkok" },
  { label: "UTC", value: "UTC" },
] as const;

const alertFrequencyOptions = [
  { label: "Ngay lập tức", value: "Ngay lập tức" },
  { label: "Mỗi giờ", value: "Mỗi giờ" },
  { label: "Hằng ngày", value: "Hằng ngày" },
] as const;

export default function AdminSystemSettingsPage(): React.JSX.Element {
  const [settings, setSettings] = useState<AdminSettings>(mockSettings);
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("general");
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = () => {
    setMessage("Đã lưu thay đổi cài đặt.");
    window.setTimeout(() => setMessage(null), 2600);
  };

  const handleCancel = () => {
    setSettings(mockSettings);
    setMessage("Đã hoàn tác về cấu hình ban đầu.");
    window.setTimeout(() => setMessage(null), 2600);
  };

  return (
    <AdminShell
      activeSection="settings"
      searchPlaceholder="Tìm kiếm cấu hình hệ thống..."
    >
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
          >
            <MaterialIcon className="text-[18px]" name="restart_alt" />
            Hủy
          </Button>
          <Button
            className="inline-flex items-center gap-2 rounded"
            onClick={handleSave}
          >
            <MaterialIcon className="text-[18px]" name="save" />
            Lưu thay đổi
          </Button>
        </div>
      </div>

      {message ? (
        <div className="fixed right-4 top-20 z-[90]">
          <Toast
            icon={<MaterialIcon className="text-[18px]" name="check" />}
            message={message}
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <AdminCard className="h-max p-4 lg:sticky lg:top-24 lg:col-span-3">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col">
            {(Object.keys(sectionLabels) as SettingsSection[]).map(
              (section) => (
                <button
                  className={`inline-flex min-w-max items-center gap-2 rounded px-4 py-3 text-left font-label-md text-label-md tracking-normal transition-colors ${
                    activeSection === section
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                  key={section}
                  onClick={() => setActiveSection(section)}
                  type="button"
                >
                  <MaterialIcon
                    className="text-[20px]"
                    name={sectionLabels[section].icon}
                  />
                  {sectionLabels[section].label}
                </button>
              ),
            )}
          </nav>
        </AdminCard>

        <div className="space-y-gutter lg:col-span-9">
          {activeSection === "general" ? (
            <SettingsPanel
              icon={sectionLabels.general.icon}
              title={sectionLabels.general.label}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputField
                  label="Tên hệ thống"
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      general: {
                        ...current.general,
                        systemName: event.target.value,
                      },
                    }))
                  }
                  value={settings.general.systemName}
                />
                <InputField
                  label="Ký hiệu logo"
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      general: {
                        ...current.general,
                        systemLogo: event.target.value,
                      },
                    }))
                  }
                  value={settings.general.systemLogo}
                />
                <label className="block sm:col-span-2">
                  <span className="mb-1 block font-label-sm text-label-sm text-on-surface-variant tracking-normal">
                    Mô tả hệ thống
                  </span>
                  <textarea
                    className="min-h-28 w-full resize-y rounded border border-outline bg-surface px-3 py-2 font-body-md text-body-md outline-none focus:border-2 focus:border-primary focus:px-[11px] focus:py-[7px]"
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        general: {
                          ...current.general,
                          systemDescription: event.target.value,
                        },
                      }))
                    }
                    value={settings.general.systemDescription}
                  />
                </label>
                <AdminSelect
                  label="Múi giờ"
                  onChange={(value) =>
                    setSettings((current) => ({
                      ...current,
                      general: {
                        ...current.general,
                        timezone: value,
                      },
                    }))
                  }
                  options={timezoneOptions}
                  value={settings.general.timezone}
                />
                <div className="flex items-center gap-4 rounded border border-outline-variant bg-surface p-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded bg-primary-fixed text-xl font-bold text-on-primary-fixed-variant">
                    {settings.general.systemLogo}
                  </div>
                  <div>
                    <p className="font-label-md text-label-md tracking-normal">
                      Biểu trưng
                    </p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant tracking-normal">
                      {settings.general.systemName}
                    </p>
                  </div>
                </div>
              </div>
            </SettingsPanel>
          ) : null}

          {activeSection === "security" ? (
            <SettingsPanel
              icon={sectionLabels.security.icon}
              title={sectionLabels.security.label}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputField
                  label="Độ dài mật khẩu tối thiểu"
                  min={6}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      security: {
                        ...current.security,
                        passwordMinLength: Number(event.target.value),
                      },
                    }))
                  }
                  type="number"
                  value={settings.security.passwordMinLength}
                />
                <InputField
                  label="Chu kỳ đổi mật khẩu (ngày)"
                  min={0}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      security: {
                        ...current.security,
                        passwordExpiry: Number(event.target.value),
                      },
                    }))
                  }
                  type="number"
                  value={settings.security.passwordExpiry}
                />
                <InputField
                  label="Thời gian hết phiên (phút)"
                  min={5}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      security: {
                        ...current.security,
                        sessionTimeout: Number(event.target.value),
                      },
                    }))
                  }
                  type="number"
                  value={settings.security.sessionTimeout}
                />
                <ToggleRow
                  checked={settings.security.twoFAEnabled}
                  label="Yêu cầu 2FA cho admin"
                  onChange={(checked) =>
                    setSettings((current) => ({
                      ...current,
                      security: {
                        ...current.security,
                        twoFAEnabled: checked,
                      },
                    }))
                  }
                />
              </div>
            </SettingsPanel>
          ) : null}

          {activeSection === "email" ? (
            <SettingsPanel
              icon={sectionLabels.email.icon}
              title={sectionLabels.email.label}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputField
                  disabled
                  label="Máy chủ SMTP"
                  value={settings.email.smtpServer}
                />
                <InputField
                  disabled
                  label="Cổng SMTP"
                  type="number"
                  value={settings.email.smtpPort}
                />
                <InputField
                  disabled
                  label="Email gửi đi"
                  value={settings.email.senderEmail}
                />
                <InputField
                  disabled
                  label="Tên người gửi"
                  value={settings.email.senderName}
                />
              </div>
            </SettingsPanel>
          ) : null}

          {activeSection === "notifications" ? (
            <SettingsPanel
              icon={sectionLabels.notifications.icon}
              title={sectionLabels.notifications.label}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ToggleRow
                  checked={settings.notifications.emailAlerts}
                  label="Cảnh báo qua email"
                  onChange={(checked) =>
                    setSettings((current) => ({
                      ...current,
                      notifications: {
                        ...current.notifications,
                        emailAlerts: checked,
                      },
                    }))
                  }
                />
                <ToggleRow
                  checked={settings.notifications.systemAlerts}
                  label="Cảnh báo hệ thống"
                  onChange={(checked) =>
                    setSettings((current) => ({
                      ...current,
                      notifications: {
                        ...current.notifications,
                        systemAlerts: checked,
                      },
                    }))
                  }
                />
                <div className="sm:col-span-2">
                  <AdminSelect
                    label="Tần suất cảnh báo"
                    onChange={(value) =>
                      setSettings((current) => ({
                        ...current,
                        notifications: {
                          ...current.notifications,
                          alertFrequency: value,
                        },
                      }))
                    }
                    options={alertFrequencyOptions}
                    value={settings.notifications.alertFrequency}
                  />
                </div>
              </div>
            </SettingsPanel>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}

function SettingsPanel({
  children,
  icon,
  title,
}: {
  readonly children: ReactNode;
  readonly icon: string;
  readonly title: string;
}): React.JSX.Element {
  return (
    <AdminCard className="overflow-hidden">
      <div className="flex w-full items-center justify-between gap-4 border-b border-outline-variant p-5 text-left">
        <span className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded bg-primary-fixed text-primary">
            <MaterialIcon name={icon} />
          </span>
          <span className="text-xl font-semibold tracking-normal text-on-surface">
            {title}
          </span>
        </span>
      </div>
      <div className="p-5">{children}</div>
    </AdminCard>
  );
}

function ToggleRow({
  checked,
  label,
  onChange,
}: {
  readonly checked: boolean;
  readonly label: string;
  readonly onChange: (checked: boolean) => void;
}): React.JSX.Element {
  return (
    <div className="flex min-h-[74px] items-center justify-between gap-4 rounded border border-outline-variant bg-surface p-4">
      <div>
        <p className="font-label-md text-label-md tracking-normal">{label}</p>
        <p className="font-label-sm text-label-sm text-on-surface-variant tracking-normal">
          {checked ? "Đang bật" : "Đang tắt"}
        </p>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/Button";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AdminCard,
  AdminToneIcon,
  MaterialIcon,
} from "../components/AdminPrimitives";
import {
  fetchAdminDashboardStats,
  fetchAuditLogs,
  type AdminDashboardStats,
  type AuditLog,
} from "../api";
import type { AdminStat } from "../types";

const formatCount = (value: number): string =>
  new Intl.NumberFormat("vi-VN").format(value);

const buildStats = (stats: AdminDashboardStats): AdminStat[] => [
  {
    label: "Tổng tài khoản",
    value: formatCount(stats.accounts.total),
    caption: `${formatCount(stats.accounts.active)} đang hoạt động · ${formatCount(
      stats.accounts.unverified,
    )} chưa xác thực`,
    icon: "group",
    tone: "primary",
    trend: "API",
  },
  {
    label: "Tài khoản bị khóa",
    value: formatCount(stats.accounts.banned),
    caption: "Không bao gồm tài khoản admin và tài khoản đã xóa",
    icon: "block",
    tone: "error",
    trend: "API",
  },
  {
    label: "Môn học",
    value: formatCount(stats.subjects.total),
    caption: "Tổng môn học hiện có trong hệ thống",
    icon: "menu_book",
    tone: "secondary",
    trend: "API",
  },
  {
    label: "Tài liệu",
    value: formatCount(stats.documents.total),
    caption: `${formatCount(stats.documents.pending)} chờ duyệt · ${formatCount(
      stats.documents.rejected,
    )} bị từ chối`,
    icon: "description",
    tone: "neutral",
    trend: `${formatCount(stats.documents.active)} active`,
  },
];

const deferredSections = [
  {
    title: "Hoạt động hệ thống trong 7 ngày",
    icon: "monitoring",
    message: "Chưa có API audit log để hiển thị hoạt động theo ngày.",
  },
  {
    title: "Trạng thái dịch vụ",
    icon: "dns",
    message: "Chưa có API telemetry để hiển thị uptime và độ trễ dịch vụ.",
  },
] as const;

const actionLabelsMap: Record<string, string> = {
  BAN_USER: "Ban người dùng",
  UNBAN_USER: "Mở khóa người dùng",
  APPROVE_DOCUMENT: "Duyệt tài liệu",
  REJECT_DOCUMENT: "Từ chối tài liệu",
  DELETE_DOCUMENT: "Xóa tài liệu",
  UPDATE_SYSTEM_SETTINGS: "Cập nhật cài đặt hệ thống",
  UPDATE_DOCUMENT_VISIBILITY: "Cập nhật hiển thị tài liệu",
  CREATE_SUBJECT: "Tạo môn học",
  UPDATE_SUBJECT: "Cập nhật môn học",
  DELETE_SUBJECT: "Xóa môn học",
};

const formatDate = (value?: string): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

export default function AdminDashboardPage(): React.JSX.Element {
  const [dashboardStats, setDashboardStats] =
    useState<AdminDashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<readonly AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDashboardStats = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [stats, logsResponse] = await Promise.all([
        fetchAdminDashboardStats(),
        fetchAuditLogs({ limit: 5 }),
      ]);
      setDashboardStats(stats);
      setRecentLogs(logsResponse.logs);
    } catch {
      setErrorMessage("Không thể tải số liệu dashboard.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboardStats();
  }, [loadDashboardStats]);

  const adminStats = useMemo(
    () => (dashboardStats ? buildStats(dashboardStats) : []),
    [dashboardStats],
  );

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-on-surface">
            Bảng điều khiển hệ thống
          </h1>
          <p className="mt-2 max-w-2xl font-body-md text-body-md text-on-surface-variant">
            Theo dõi người dùng, phiên hoạt động, sức khỏe hệ thống và các tác
            vụ quản trị quan trọng.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            className="inline-flex items-center gap-2 rounded"
            disabled={isLoading}
            onClick={() => void loadDashboardStats()}
            size="sm"
          >
            <MaterialIcon className="text-[18px]" name="refresh" />
            Đồng bộ
          </Button>
          <Button
            className="inline-flex items-center gap-2 rounded"
            disabled
            size="sm"
            variant="outline"
          >
            <MaterialIcon className="text-[18px]" name="download" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        {isLoading ? (
          <AdminCard className="p-6 lg:col-span-12">
            <p className="font-label-md text-label-md text-on-surface-variant">
              Đang tải số liệu dashboard...
            </p>
          </AdminCard>
        ) : null}

        {errorMessage ? (
          <div className="rounded border border-error/30 bg-error-container px-4 py-3 font-label-sm text-label-sm text-error lg:col-span-12">
            {errorMessage}
          </div>
        ) : null}

        {!isLoading && !errorMessage
          ? adminStats.map((stat) => (
              <AdminCard className="p-6 lg:col-span-3" key={stat.label}>
                <div className="flex items-start justify-between gap-4">
                  <AdminToneIcon icon={stat.icon} tone={stat.tone} />
                  <span className="font-label-sm text-label-sm text-primary">
                    {stat.trend}
                  </span>
                </div>
                <p className="mt-6 font-label-md text-label-md text-on-surface-variant tracking-normal">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-bold tracking-normal text-on-surface">
                  {stat.value}
                </p>
                <p className="mt-2 font-label-sm text-label-sm text-on-surface-variant tracking-normal">
                  {stat.caption}
                </p>
              </AdminCard>
            ))
          : null}

        {deferredSections.map((section) => (
          <AdminCard className="p-6 lg:col-span-4" key={section.title}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold tracking-normal text-on-surface">
                {section.title}
              </h2>
              <MaterialIcon
                className="text-on-surface-variant"
                name={section.icon}
              />
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant tracking-normal">
              {section.message}
            </p>
          </AdminCard>
        ))}

        <AdminCard className="p-6 lg:col-span-4">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-normal text-on-surface">
              Hoạt động gần đây
            </h2>
            <MaterialIcon className="text-on-surface-variant" name="history" />
          </div>
          {isLoading ? (
            <p className="font-label-sm text-label-sm text-on-surface-variant tracking-normal">
              Đang tải hoạt động...
            </p>
          ) : recentLogs.length > 0 ? (
            <div className="flex flex-col gap-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col border-b border-outline-variant pb-2 last:border-0 last:pb-0"
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-semibold text-xs text-on-surface truncate max-w-[120px]">
                      {log.actor?.name || "Hệ thống"}
                    </span>
                    <span className="text-[10px] text-on-surface-variant shrink-0">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 truncate">
                    {actionLabelsMap[log.action] || log.action}:{" "}
                    <span className="font-semibold text-on-surface">
                      {log.targetName || log.targetId || "—"}
                    </span>
                  </p>
                </div>
              ))}
              <Link
                href="/admin/audit-logs"
                className="mt-2 text-center text-xs font-semibold text-primary hover:underline block"
              >
                Xem tất cả nhật ký
              </Link>
            </div>
          ) : (
            <p className="font-label-sm text-label-sm text-on-surface-variant tracking-normal">
              Chưa có hoạt động nào gần đây.
            </p>
          )}
        </AdminCard>

        <AdminCard className="p-6 lg:col-span-5">
          <div className="mb-6">
            <h2 className="text-xl font-semibold tracking-normal text-on-surface">
              Tác vụ nhanh
            </h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant tracking-normal">
              Lối tắt cho các thao tác quản trị thường dùng.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              className="flex min-h-28 flex-col justify-between rounded border border-outline-variant bg-surface p-4 transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
              href="/admin/users"
            >
              <MaterialIcon className="text-primary" name="person_add" />
              <span className="font-label-md text-label-md tracking-normal">
                Thêm người dùng
              </span>
            </Link>
            <Link
              className="flex min-h-28 flex-col justify-between rounded border border-outline-variant bg-surface p-4 transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
              href="/admin/settings"
            >
              <MaterialIcon className="text-primary" name="security" />
              <span className="font-label-md text-label-md tracking-normal">
                Cấu hình bảo mật
              </span>
            </Link>
          </div>
        </AdminCard>
      </div>
    </>
  );
}

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  activityTimeline,
  adminStats,
  recentAdminActivities,
  systemServices,
} from "../mockData";
import {
  AdminCard,
  AdminToneIcon,
  MaterialIcon,
} from "../components/AdminPrimitives";
import type { SystemServiceStatus } from "../types";

const activityToneClasses = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  tertiary: "bg-tertiary",
  error: "bg-error",
} as const;

const serviceTone: Record<
  SystemServiceStatus["status"],
  "success" | "warning" | "neutral"
> = {
  operational: "success",
  degraded: "warning",
  maintenance: "neutral",
};

const serviceLabel: Record<SystemServiceStatus["status"], string> = {
  operational: "Ổn định",
  degraded: "Giảm hiệu năng",
  maintenance: "Bảo trì",
};

export default function AdminDashboardPage(): React.JSX.Element {
  const maxTransactions = Math.max(
    ...activityTimeline.map((item) => item.transactions),
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
          <Button className="inline-flex items-center gap-2 rounded" size="sm">
            <MaterialIcon className="text-[18px]" name="refresh" />
            Đồng bộ
          </Button>
          <Button
            className="inline-flex items-center gap-2 rounded"
            size="sm"
            variant="outline"
          >
            <MaterialIcon className="text-[18px]" name="download" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        {adminStats.map((stat) => (
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
        ))}

        <AdminCard className="p-6 lg:col-span-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-normal text-on-surface">
                Hoạt động hệ thống trong 7 ngày
              </h2>
              <p className="font-label-sm text-label-sm text-on-surface-variant tracking-normal">
                So sánh giao dịch và phiên hoạt động theo ngày.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-2 font-label-sm text-label-sm tracking-normal">
                <span className="h-3 w-3 rounded-sm bg-primary" />
                Giao dịch
              </span>
              <span className="flex items-center gap-2 font-label-sm text-label-sm tracking-normal">
                <span className="h-3 w-3 rounded-sm bg-secondary" />
                Phiên hoạt động
              </span>
            </div>
          </div>
          <div className="flex h-72 items-end gap-3 border-b border-outline-variant px-2 pb-8">
            {activityTimeline.map((day) => (
              <div
                className="relative flex h-full flex-1 items-end"
                key={day.label}
              >
                <div
                  aria-label={`${day.label}: ${day.transactions} giao dịch`}
                  className="relative flex h-full w-full items-end justify-center rounded-t bg-surface-container"
                  role="img"
                >
                  <div
                    className="w-full max-w-10 rounded-t bg-primary transition-opacity hover:opacity-85"
                    style={{
                      height: `${Math.max(16, (day.transactions / maxTransactions) * 100)}%`,
                    }}
                  />
                  <div
                    className="absolute bottom-0 w-full max-w-10 rounded-t bg-secondary/70"
                    style={{
                      height: `${Math.max(12, (day.sessions / maxTransactions) * 100)}%`,
                    }}
                  />
                </div>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-label-sm text-label-sm text-on-surface-variant">
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard className="p-6 lg:col-span-4">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-normal text-on-surface">
                Trạng thái dịch vụ
              </h2>
              <p className="font-label-sm text-label-sm text-on-surface-variant tracking-normal">
                Theo dõi uptime và độ trễ.
              </p>
            </div>
            <MaterialIcon className="text-on-surface-variant" name="dns" />
          </div>
          <div className="space-y-4">
            {systemServices.map((service) => (
              <div
                className="rounded border border-outline-variant bg-surface p-4"
                key={service.name}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-label-md text-label-md text-on-surface tracking-normal">
                      {service.name}
                    </p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant tracking-normal">
                      Uptime {service.uptime} · {service.latency}
                    </p>
                  </div>
                  <Badge tone={serviceTone[service.status]}>
                    {serviceLabel[service.status]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard className="p-6 lg:col-span-7">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-normal text-on-surface">
              Hoạt động gần đây
            </h2>
            <MaterialIcon className="text-on-surface-variant" name="history" />
          </div>
          <div className="space-y-5">
            {recentAdminActivities.map((activity) => (
              <div className="flex gap-4" key={activity.id}>
                <div
                  className={`h-auto w-1 shrink-0 rounded-full ${
                    activityToneClasses[activity.tone]
                  }`}
                />
                <div className="min-w-0">
                  <p className="font-label-md text-label-md text-on-surface tracking-normal">
                    {activity.action}
                  </p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant tracking-normal">
                    {activity.performer} · {activity.timestamp}
                  </p>
                  <p className="mt-1 font-body-md text-sm text-on-surface-variant">
                    {activity.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
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
              className="flex min-h-28 flex-col justify-between rounded border border-outline-variant bg-surface p-4 transition-colors hover:border-primary hover:bg-primary-fixed"
              href="/admin/users"
            >
              <MaterialIcon className="text-primary" name="person_add" />
              <span className="font-label-md text-label-md tracking-normal">
                Thêm người dùng
              </span>
            </Link>
            <Link
              className="flex min-h-28 flex-col justify-between rounded border border-outline-variant bg-surface p-4 transition-colors hover:border-primary hover:bg-primary-fixed"
              href="/admin/settings"
            >
              <MaterialIcon className="text-primary" name="security" />
              <span className="font-label-md text-label-md tracking-normal">
                Cấu hình bảo mật
              </span>
            </Link>
            <button
              className="flex min-h-28 flex-col justify-between rounded border border-outline-variant bg-surface p-4 text-left transition-colors hover:border-primary hover:bg-primary-fixed"
              type="button"
            >
              <MaterialIcon className="text-primary" name="mark_email_read" />
              <span className="font-label-md text-label-md tracking-normal">
                Gửi thông báo
              </span>
            </button>
            <button
              className="flex min-h-28 flex-col justify-between rounded border border-outline-variant bg-surface p-4 text-left transition-colors hover:border-primary hover:bg-primary-fixed"
              type="button"
            >
              <MaterialIcon className="text-primary" name="backup" />
              <span className="font-label-md text-label-md tracking-normal">
                Sao lưu dữ liệu
              </span>
            </button>
          </div>
        </AdminCard>
      </div>
    </>
  );
}

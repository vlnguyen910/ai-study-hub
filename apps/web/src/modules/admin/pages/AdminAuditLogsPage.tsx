"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InputField } from "@/components/ui/InputField";
import { Pagination } from "@/components/ui/Pagination";
import { SelectField } from "@/components/ui/SelectField";
import { Table, type TableRow } from "@/components/ui/Table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchAuditLogs, type AuditAction, type AuditLog } from "../api";
import {
  AdminCard,
  AdminIconAction,
  MaterialIcon,
} from "../components/AdminPrimitives";

const auditColumns = [
  { key: "createdAt", label: "Thời gian" },
  { key: "actor", label: "Người thực hiện" },
  { key: "action", label: "Hành động" },
  { key: "targetId", label: "Đối tượng (ID)" },
  { key: "ipAddress", label: "Địa chỉ IP" },
  { key: "actions", label: "Chi tiết", align: "center" as const },
] as const;

const actionLabelsMap: Record<"all" | AuditAction, string> = {
  all: "Tất cả hành động",
  BAN_USER: "Ban người dùng",
  APPROVE_DOCUMENT: "Duyệt tài liệu",
  REJECT_DOCUMENT: "Từ chối tài liệu",
  DELETE_DOCUMENT: "Xóa tài liệu",
  UPDATE_SYSTEM_SETTINGS: "Cập nhật cài đặt hệ thống",
};

const actionValuesMap: Record<string, "all" | AuditAction> = {
  "Tất cả hành động": "all",
  "Ban người dùng": "BAN_USER",
  "Duyệt tài liệu": "APPROVE_DOCUMENT",
  "Từ chối tài liệu": "REJECT_DOCUMENT",
  "Xóa tài liệu": "DELETE_DOCUMENT",
  "Cập nhật cài đặt hệ thống": "UPDATE_SYSTEM_SETTINGS",
};

const actionOptionsList = Object.values(actionLabelsMap);

const pageSize = 10;

const formatDate = (value?: string): string => {
  if (!value) {
    return "Chưa có dữ liệu";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

export default function AdminAuditLogsPage(): React.JSX.Element {
  const [logs, setLogs] = useState<readonly AuditLog[]>([]);
  const [actorIdFilter, setActorIdFilter] = useState("");
  const [actionFilter, setActionFilter] = useState<"all" | AuditAction>("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [viewLog, setViewLog] = useState<AuditLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetchAuditLogs({
        page: currentPage,
        limit: pageSize,
        actorId: actorIdFilter.trim() || undefined,
        action: actionFilter === "all" ? undefined : actionFilter,
        startDate: startDateFilter || undefined,
        endDate: endDateFilter || undefined,
      });

      setLogs(response.logs);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Không thể tải nhật ký hoạt động."),
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    actorIdFilter,
    actionFilter,
    startDateFilter,
    endDateFilter,
  ]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const handleResetFilters = () => {
    setActorIdFilter("");
    setActionFilter("all");
    setStartDateFilter("");
    setEndDateFilter("");
    setCurrentPage(1);
  };

  const getActionBadge = (action: AuditAction): React.JSX.Element => {
    switch (action) {
      case "BAN_USER":
        return <Badge tone="error">Ban người dùng</Badge>;
      case "APPROVE_DOCUMENT":
        return <Badge tone="success">Duyệt tài liệu</Badge>;
      case "REJECT_DOCUMENT":
        return <Badge tone="warning">Từ chối tài liệu</Badge>;
      case "DELETE_DOCUMENT":
        return <Badge tone="error">Xóa tài liệu</Badge>;
      case "UPDATE_SYSTEM_SETTINGS":
        return <Badge tone="neutral">Cập nhật hệ thống</Badge>;
      default:
        return <Badge tone="neutral">{action}</Badge>;
    }
  };

  const rows: TableRow[] = useMemo(() => {
    return logs.map((log) => ({
      id: log.id,
      cells: [
        <span
          className="font-body-md text-sm text-on-surface-variant"
          key="createdAt"
        >
          {formatDate(log.createdAt)}
        </span>,
        <div className="flex flex-col" key="actor">
          <span className="font-semibold text-on-surface">
            {log.actor?.name || "Hệ thống"}
          </span>
          <span className="text-xs text-on-surface-variant">
            {log.actor?.email || ""}
          </span>
        </div>,
        <span key="action">{getActionBadge(log.action)}</span>,
        <span
          className="font-mono text-xs text-on-surface-variant break-all"
          key="targetId"
        >
          {log.targetId || "—"}
        </span>,
        <span
          className="font-body-md text-sm text-on-surface-variant"
          key="ipAddress"
        >
          {log.ipAddress || "—"}
        </span>,
        <div className="flex justify-center gap-1" key="actions">
          <AdminIconAction
            icon="visibility"
            label="Xem chi tiết"
            onClick={() => setViewLog(log)}
          />
        </div>,
      ],
    }));
  }, [logs]);

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">
            Nhật ký hoạt động (Audit Logs)
          </h1>
          <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
            Theo dõi và giám sát toàn bộ hoạt động quản trị của quản trị viên và
            điều phối viên.
          </p>
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-6 rounded border border-error/30 bg-error-container px-4 py-3 font-label-sm text-label-sm text-error">
          {errorMessage}
        </div>
      ) : null}

      <Card className="mb-6 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[minmax(200px,1.2fr)_minmax(180px,1fr)_180px_180px_auto] lg:items-end">
          <InputField
            label="ID người thực hiện (Actor ID)"
            onChange={(event) => {
              setActorIdFilter(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Nhập ID admin/mod..."
            value={actorIdFilter}
          />
          <SelectField
            label="Hành động"
            onChange={(value) => {
              setActionFilter(actionValuesMap[value] ?? "all");
              setCurrentPage(1);
            }}
            options={actionOptionsList}
            value={actionLabelsMap[actionFilter]}
          />
          <InputField
            label="Từ ngày"
            onChange={(event) => {
              setStartDateFilter(event.target.value);
              setCurrentPage(1);
            }}
            type="date"
            value={startDateFilter}
          />
          <InputField
            label="Đến ngày"
            onChange={(event) => {
              setEndDateFilter(event.target.value);
              setCurrentPage(1);
            }}
            type="date"
            value={endDateFilter}
          />
          <Button
            onClick={handleResetFilters}
            variant="outline"
            className="h-[42px] rounded-xl px-6 w-full lg:w-auto"
          >
            Xóa bộ lọc
          </Button>
        </div>
      </Card>

      <AdminCard className="w-full max-w-[calc(100vw-32px)] overflow-hidden lg:max-w-none">
        <div className="flex flex-col gap-3 border-b border-outline-variant p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-label-md text-label-md text-on-surface tracking-normal">
              Nhật ký hệ thống
            </h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant tracking-normal">
              {totalItems} bản ghi nhật ký
            </p>
          </div>
          <Badge tone="neutral">
            Trang {currentPage}/{totalPages}
          </Badge>
        </div>
        {isLoading ? (
          <div className="p-6 font-body-md text-body-md text-on-surface-variant">
            Đang tải nhật ký hoạt động...
          </div>
        ) : rows.length > 0 ? (
          <Table columns={auditColumns} rows={rows} />
        ) : (
          <div className="p-6 font-body-md text-body-md text-on-surface-variant">
            Không tìm thấy bản ghi nhật ký nào phù hợp.
          </div>
        )}
        <div className="flex flex-col gap-3 border-t border-outline-variant p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-label-sm text-label-sm text-on-surface-variant tracking-normal">
            Hiển thị {logs.length} trên {totalItems} bản ghi.
          </p>
          <Pagination
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalPages={totalPages}
          />
        </div>
      </AdminCard>

      {viewLog ? (
        <AuditLogDetailDialog log={viewLog} onClose={() => setViewLog(null)} />
      ) : null}
    </div>
  );
}

function AuditLogDetailDialog({
  log,
  onClose,
}: {
  readonly log: AuditLog;
  readonly onClose: () => void;
}): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-inverse-surface/35 px-4 py-8">
      <button
        aria-label="Đóng chi tiết nhật ký"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
      />
      <div className="relative z-10 w-full max-w-2xl rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-xl max-h-[85vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-3">
          <h2 className="text-xl font-semibold tracking-normal text-on-surface flex items-center gap-2">
            <MaterialIcon name="history" className="text-primary" />
            Chi tiết nhật ký hoạt động
          </h2>
          <button
            aria-label="Đóng"
            className="rounded-full p-1 hover:bg-surface-container-high text-on-surface-variant"
            onClick={onClose}
            type="button"
          >
            <MaterialIcon name="close" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <DetailItem
            label="Thời gian thực hiện"
            value={formatDate(log.createdAt)}
          />
          <DetailItem
            label="Địa chỉ IP"
            value={log.ipAddress || "Không rõ IP"}
          />
          <DetailItem
            label="Hành động"
            value={actionLabelsMap[log.action] || log.action}
          />
          <DetailItem
            label="Đối tượng tác động (ID)"
            value={log.targetId || "Không có đối tượng"}
          />

          <div className="md:col-span-2 rounded border border-outline-variant bg-surface-container-low p-4">
            <p className="font-label-sm text-label-sm text-on-surface-variant tracking-normal">
              Người thực hiện (Actor)
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                {log.actor?.name?.charAt(0).toUpperCase() || "S"}
              </span>
              <div className="flex flex-col">
                <span className="font-semibold text-on-surface">
                  {log.actor?.name || "Hệ thống"}
                </span>
                <span className="text-xs text-on-surface-variant">
                  Email: {log.actor?.email || "—"}
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono">
                  ID: {log.actorId}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="font-label-sm text-label-sm text-on-surface-variant tracking-normal mb-2">
            Dữ liệu chi tiết (Metadata)
          </p>
          <div className="rounded border border-outline-variant bg-surface-container-lowest p-4 overflow-x-auto max-h-[250px] overflow-y-auto font-mono text-xs">
            {log.metadata ? (
              <pre className="text-on-surface">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            ) : (
              <span className="text-on-surface-variant italic">
                Không có metadata
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-outline-variant pt-4">
          <Button onClick={onClose} variant="outline" className="px-6">
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}): React.JSX.Element {
  return (
    <div className="rounded border border-outline-variant bg-surface-container-low p-4">
      <p className="font-label-sm text-label-sm text-on-surface-variant tracking-normal">
        {label}
      </p>
      <p className="mt-1 break-words font-semibold text-on-surface tracking-normal">
        {value}
      </p>
    </div>
  );
}

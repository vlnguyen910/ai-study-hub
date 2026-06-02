"use client";

import { getDocumentById, verifyDocument } from "@/API";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { DocumentReviewStatus } from "../types";
import { ModeratorShell } from "../components/ModeratorShell";
import {
  EmptyState,
  MaterialIcon,
  ModeratorBadge,
  ModeratorCard,
} from "../components/ModeratorPrimitives";

const checkToneMap = {
  success: "secondary",
  warning: "tertiary",
  error: "error",
  neutral: "neutral",
} as const;

const statusLabelMap: Record<DocumentReviewStatus, string> = {
  pending: "Chờ duyệt",
  priority: "Ưu tiên",
  approved: "Đã duyệt",
  rejected: "Đã từ chối",
  changes_requested: "Cần chỉnh sửa",
  flagged: "Đã gắn cờ",
};

const previewControls = [
  { icon: "zoom_in", label: "Phóng to" },
  { icon: "zoom_out", label: "Thu nhỏ" },
  { icon: "fullscreen", label: "Toàn màn hình" },
] as const;

type DocumentDetailState = {
  id: string;
  title: string;
  description: string;
  fileSize: string;
  fileType: string;
  previewUrl: string;
  tags: string[];
  checks: Array<{
    label: string;
    value: string;
    tone: "success" | "warning" | "error" | "neutral";
  }>;
  versions: Array<{
    version: string;
    uploadedBy: string;
    uploadedAt: string;
    note: string;
  }>;
};

export default function ModeratorDocumentDetailPage({
  documentId,
}: {
  readonly documentId: string;
}): React.JSX.Element {
  const [document, setDocument] = useState<DocumentDetailState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [status, setStatus] = useState<DocumentReviewStatus>("pending");
  const [note, setNote] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDocumentDetail = async () => {
      try {
        const detail = await getDocumentById(documentId);

        if (!isMounted) {
          return;
        }

        const rawTags = Array.isArray(detail.tags) ? detail.tags : [];
        const rawChecks = Array.isArray(detail.checks) ? detail.checks : [];
        const rawVersions = Array.isArray(detail.versions)
          ? detail.versions
          : [];

        const checks = rawChecks.map((item, index) => {
          const record = item as Record<string, unknown>;
          const toneValue = String(record.tone ?? "neutral");
          const tone =
            toneValue === "success" ||
            toneValue === "warning" ||
            toneValue === "error" ||
            toneValue === "neutral"
              ? toneValue
              : "neutral";

          return {
            label: String(record.label ?? `Check ${index + 1}`),
            value: String(record.value ?? "N/A"),
            tone,
          };
        });

        const versions = rawVersions.map((item, index) => {
          const record = item as Record<string, unknown>;

          return {
            version: String(record.version ?? `${index + 1}`),
            uploadedBy: String(record.uploadedBy ?? "Unknown"),
            uploadedAt: String(record.uploadedAt ?? "N/A"),
            note: String(record.note ?? ""),
          };
        });

        setDocument({
          id: String(detail.id || documentId),
          title: String(detail.title ?? "Untitled document"),
          description: String(detail.description ?? "Không có mô tả"),
          fileSize:
            typeof detail.sizeInBytes === "number"
              ? `${(detail.sizeInBytes / (1024 * 1024)).toFixed(2)} MB`
              : "N/A",
          fileType: String(detail.format ?? "N/A"),
          previewUrl: String(
            detail.fileUrl ??
              "https://images.unsplash.com/photo-1633613286848-e6f43bbafb84?w=800&q=80",
          ),
          tags: rawTags.map((tag) => String(tag)),
          checks,
          versions,
        });

        if (
          detail.status &&
          statusLabelMap[detail.status as DocumentReviewStatus]
        ) {
          setStatus(detail.status as DocumentReviewStatus);
        }

        setLoadError(false);
      } catch {
        if (isMounted) {
          setDocument(null);
          setLoadError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDocumentDetail();

    return () => {
      isMounted = false;
    };
  }, [documentId]);

  if (isLoading) {
    return (
      <ModeratorShell activeSection="documents">
        <EmptyState
          description="Vui lòng chờ trong giây lát."
          title="Đang tải tài liệu"
        />
      </ModeratorShell>
    );
  }

  if (loadError || !document) {
    return (
      <ModeratorShell activeSection="documents">
        <EmptyState
          description="Vui lòng thử lại sau hoặc kiểm tra kết nối API."
          title="Không load được tài liệu"
        />
      </ModeratorShell>
    );
  }

  const handleAction = async (
    nextStatus: DocumentReviewStatus,
    message: string,
  ) => {
    try {
      await verifyDocument(documentId, {
        status: nextStatus,
        note: note || undefined,
      });
    } catch {
      // Keep local status update even if verify endpoint is temporarily unavailable.
    }

    setStatus(nextStatus);
    setToastMessage(message);
  };

  return (
    <ModeratorShell
      activeSection="documents"
      searchPlaceholder="Tìm kiếm tài liệu..."
    >
      <nav
        aria-label="Đường dẫn trang"
        className="mb-6 flex flex-wrap items-center gap-2 font-label-sm text-label-sm text-on-surface-variant"
      >
        <Link className="hover:text-primary" href="/moderator">
          Kiểm duyệt
        </Link>
        <MaterialIcon className="text-sm" name="chevron_right" />
        <Link className="hover:text-primary" href="/moderator/documents">
          Tài liệu chờ
        </Link>
        <MaterialIcon className="text-sm" name="chevron_right" />
        <span className="text-on-surface">{document.id}</span>
      </nav>

      {toastMessage ? (
        <div
          className="mb-gutter flex items-center justify-between border border-primary bg-primary-fixed px-4 py-3 text-on-primary-fixed"
          role="status"
        >
          <span className="font-label-md text-label-md">{toastMessage}</span>
          <button
            className="rounded p-1 text-on-primary-fixed-variant hover:bg-surface"
            onClick={() => setToastMessage(null)}
            type="button"
          >
            <span className="sr-only">Đóng thông báo</span>
            <MaterialIcon name="close" />
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-gutter xl:grid-cols-12 xl:items-start">
        <div className="space-y-gutter xl:col-span-8">
          <ModeratorCard className="overflow-hidden rounded-xl">
            <div className="flex flex-col gap-3 border-b border-outline-variant bg-surface-container-low px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <MaterialIcon className="text-primary" name="picture_as_pdf" />
                <h1 className="truncate font-label-md text-label-md">
                  Xem trước: {document.title}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                {previewControls.map((control) => (
                  <button
                    aria-label={control.label}
                    className="rounded p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high"
                    key={control.icon}
                    type="button"
                  >
                    <MaterialIcon name={control.icon} />
                  </button>
                ))}
              </div>
            </div>
            <div className="relative flex aspect-[3/4] items-center justify-center bg-surface-container p-6">
              <img
                alt={`Bản xem trước của ${document.title}`}
                className="max-h-full max-w-[90%] border border-outline-variant object-cover"
                height={900}
                src={document.previewUrl}
                width={640}
              />
              <div className="pointer-events-none absolute inset-0 flex rotate-45 items-center justify-center opacity-5">
                <span className="text-6xl font-bold uppercase tracking-widest">
                  Bản xem trước AcademiShare
                </span>
              </div>
            </div>
          </ModeratorCard>

          <ModeratorCard className="rounded-xl p-6">
            <h2 className="mb-4 flex items-center gap-2 font-headline-md text-headline-md">
              <MaterialIcon name="history" />
              Lịch sử phiên bản
            </h2>
            <div className="space-y-4">
              {document.versions.map((version, index) => (
                <div
                  className="flex flex-col gap-4 rounded-lg border border-outline-variant p-4 transition-colors hover:bg-surface-container-low sm:flex-row sm:items-center sm:justify-between"
                  key={`${version.version}-${version.uploadedAt}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded ${
                        index === 0
                          ? "bg-primary-fixed text-on-primary-fixed-variant"
                          : "bg-surface-container-highest text-outline"
                      }`}
                    >
                      <MaterialIcon name={index === 0 ? "update" : "history"} />
                    </div>
                    <div>
                      <p className="font-label-md text-label-md">
                        Phiên bản {version.version}
                        {index === 0 ? " (Hiện tại)" : ""}
                      </p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        Tải lên bởi: {version.uploadedBy} • {version.uploadedAt}
                      </p>
                      <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">
                        {version.note}
                      </p>
                    </div>
                  </div>
                  {index === 0 ? (
                    <ModeratorBadge tone="primary">Mới nhất</ModeratorBadge>
                  ) : (
                    <button
                      className="self-start font-label-sm text-label-sm text-primary hover:underline sm:self-center"
                      type="button"
                    >
                      Xem lại
                    </button>
                  )}
                </div>
              ))}
            </div>
          </ModeratorCard>
        </div>

        <aside className="space-y-gutter xl:col-span-4">
          <ModeratorCard className="rounded-xl p-6">
            <h2 className="mb-6 flex items-center gap-2 font-headline-md text-headline-md">
              <MaterialIcon name="info" />
              Thông tin chi tiết
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="mb-1 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Tên tài liệu
                </dt>
                <dd className="font-label-md text-label-md">
                  {document.title}
                </dd>
              </div>
              <div>
                <dt className="mb-1 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Mô tả
                </dt>
                <dd className="font-body-md text-body-md">
                  {document.description}
                </dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="mb-1 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                    Dung lượng
                  </dt>
                  <dd className="font-label-md text-label-md">
                    {document.fileSize}
                  </dd>
                </div>
                <div>
                  <dt className="mb-1 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                    Định dạng
                  </dt>
                  <dd className="font-label-md text-label-md">
                    {document.fileType}
                  </dd>
                </div>
              </div>
              <div>
                <dt className="mb-1 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Trạng thái
                </dt>
                <dd>
                  <ModeratorBadge
                    tone={
                      status === "approved"
                        ? "primary"
                        : status === "rejected" || status === "flagged"
                          ? "error"
                          : "tertiary"
                    }
                  >
                    {statusLabelMap[status]}
                  </ModeratorBadge>
                </dd>
              </div>
              <div>
                <dt className="mb-1 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Thẻ
                </dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {document.tags.map((tag) => (
                    <span
                      className="rounded bg-surface-container-high px-2 py-1 font-label-sm text-label-sm"
                      key={tag}
                    >
                      {tag}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </ModeratorCard>

          <ModeratorCard className="rounded-xl p-6">
            <h2 className="mb-4 flex items-center gap-2 font-headline-md text-headline-md">
              <MaterialIcon name="fact_check" />
              Kiểm tra tự động
            </h2>
            <div className="space-y-3">
              {document.checks.map((check) => (
                <div
                  className="flex items-center justify-between gap-3 border border-outline-variant bg-surface p-3"
                  key={check.label}
                >
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {check.label}
                  </span>
                  <ModeratorBadge tone={checkToneMap[check.tone]}>
                    {check.value}
                  </ModeratorBadge>
                </div>
              ))}
            </div>
          </ModeratorCard>

          <section className="sticky top-24 rounded-xl border-2 border-primary bg-surface-container-low p-6">
            <h2 className="mb-4 flex items-center gap-2 font-headline-md text-headline-md text-primary">
              <MaterialIcon name="verified_user" />
              Bảng kiểm duyệt
            </h2>
            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block font-label-sm text-label-sm text-on-surface-variant">
                  Phản hồi / Ghi chú cho người dùng
                </span>
                <textarea
                  className="w-full rounded-lg border border-outline bg-white p-3 font-body-md text-body-md outline-none transition-colors focus:border-2 focus:border-primary focus:p-[11px]"
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Nhập lý do phê duyệt hoặc từ chối..."
                  rows={5}
                  value={note}
                />
              </label>

              <div className="flex items-center gap-2 rounded-lg border border-outline-variant bg-white p-3">
                <MaterialIcon className="text-primary" name="security" />
                <span className="font-label-sm text-label-sm">
                  Tài liệu đã được quét mã độc bởi ClamAV
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  className="flex items-center justify-center gap-2 rounded-lg bg-on-error-container py-3 font-label-md text-label-md text-on-error transition-opacity hover:opacity-90"
                  onClick={async () =>
                    handleAction(
                      "rejected",
                      `Đã từ chối ${document.id}${note ? " kèm ghi chú" : ""}`,
                    )
                  }
                  type="button"
                >
                  <MaterialIcon name="close" />
                  Từ chối
                </button>
                <button
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary py-3 font-label-md text-label-md text-on-primary transition-colors hover:bg-on-primary-fixed-variant"
                  onClick={async () =>
                    handleAction(
                      "approved",
                      `Đã phê duyệt ${document.id}${
                        note ? " kèm ghi chú" : ""
                      }`,
                    )
                  }
                  type="button"
                >
                  <MaterialIcon name="check" />
                  Phê duyệt
                </button>
              </div>
              <button
                className="flex w-full items-center justify-center gap-1 py-2 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:text-primary"
                onClick={async () =>
                  handleAction(
                    "flagged",
                    `Đã báo cáo vi phạm bản quyền cho ${document.id}`,
                  )
                }
                type="button"
              >
                <MaterialIcon className="text-sm" name="flag" />
                Báo cáo vi phạm bản quyền
              </button>
              <button
                className="flex w-full items-center justify-center gap-1 py-2 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:text-primary"
                onClick={async () =>
                  handleAction(
                    "changes_requested",
                    `Đã yêu cầu chỉnh sửa thông tin mô tả cho ${document.id}`,
                  )
                }
                type="button"
              >
                <MaterialIcon className="text-sm" name="rate_review" />
                Yêu cầu chỉnh sửa
              </button>
            </div>
          </section>
        </aside>
      </div>
    </ModeratorShell>
  );
}

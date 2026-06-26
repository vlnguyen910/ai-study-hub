"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import {
  approveDocument,
  fetchDocumentDetail,
  rejectDocument,
  runModeratorAnalysis,
  type ModeratorAnalysisData,
  type WarningFlag,
} from "@/apis/document.api";
import type { DocumentDetail, DocumentStatus } from "@/types/document.type";
import { formatDate } from "@/utils";
import { DocumentPreview } from "@/modules/user/documents/detail/components/DocumentPreview";
import type { DocumentPreviewData } from "@/modules/user/documents/detail/type";
import { loadDocumentPreview } from "@/modules/user/documents/detail/utils/document-preview";

import {
  EmptyState,
  MaterialIcon,
  ModeratorBadge,
  ModeratorCard,
} from "../components/ModeratorPrimitives";
import { RejectDocumentModal } from "../components/RejectDocumentModal";

const flagLabelMap: Record<WarningFlag, string> = {
  SPAM: "Nội dung Spam / Quảng cáo",
  TOXIC: "Nội dung Nhạy cảm / Độc hại",
  ACADEMIC_INTEGRITY_RISK: "Vi phạm liêm chính học thuật",
};

const statusLabelMap: Record<DocumentStatus, string> = {
  PENDING: "Chờ duyệt",
  ACTIVE: "Đã duyệt",
  REJECTED: "Đã từ chối",
  DELETED: "Đã xóa",
};

const statusToneMap: Record<
  DocumentStatus,
  "primary" | "secondary" | "tertiary" | "error" | "neutral"
> = {
  PENDING: "tertiary",
  ACTIVE: "primary",
  REJECTED: "error",
  DELETED: "neutral",
};

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export default function ModeratorDocumentDetailPage({
  documentId,
}: {
  readonly documentId: string;
}): React.JSX.Element {
  const router = useRouter();
  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [preview, setPreview] = useState<DocumentPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<ModeratorAnalysisData | null>(
    null,
  );
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [initialRejectionReason, setInitialRejectionReason] = useState("");
  const [hasVerified, setHasVerified] = useState(false);

  const handleRunAiAnalysis = async () => {
    if (!document) return;
    setIsAiAnalyzing(true);
    try {
      const result = await runModeratorAnalysis(document.id);
      setAiAnalysis(result);
      if (result.moderationSuggestion === "REJECT" && result.moderationReason) {
        setInitialRejectionReason(result.moderationReason);
      }
      toast.success("Đã hoàn thành phân tích AI!");
    } catch {
      toast.error("Không thể chạy phân tích AI cho tài liệu này.");
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const loadDocument = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchDocumentDetail(documentId);
      setDocument(response);

      try {
        setPreview(await loadDocumentPreview(response));
      } catch (previewError) {
        console.error(
          "Could not load moderator document preview",
          previewError,
        );
        setPreview(null);
      }
    } catch {
      setDocument(null);
      setError("Không thể tải chi tiết tài liệu.");
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  const handleApprove = async () => {
    if (!document) return;

    setIsSubmitting(true);
    try {
      await approveDocument(document.id);
      toast.success(`Đã phê duyệt ${document.title}`);
      router.push("/moderator/documents");
      router.refresh();
    } catch {
      toast.error(`Không thể phê duyệt ${document.title}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectConfirm = async (rejectionReason: string) => {
    if (!document) return;

    setIsSubmitting(true);
    try {
      await rejectDocument(document.id, { rejectionReason });
      toast.success(`Đã từ chối ${document.title}`);
      setIsRejecting(false);
      router.push("/moderator/documents");
      router.refresh();
    } catch {
      toast.error(`Không thể từ chối ${document.title}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="px-6 py-12 text-center font-label-md text-label-md text-on-surface-variant">
        Đang tải chi tiết tài liệu...
      </div>
    );
  }

  if (error || !document) {
    return (
      <EmptyState
        description={
          error ?? "Mã tài liệu không tồn tại hoặc bạn không có quyền xem."
        }
        title="Không tìm thấy tài liệu"
      />
    );
  }

  const status = document.status ?? "PENDING";
  const canReview = status === "PENDING";

  return (
    <>
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

      <div className="grid grid-cols-1 gap-gutter xl:grid-cols-12 xl:items-start">
        <div className="space-y-gutter xl:col-span-8">
          <ModeratorCard className="overflow-hidden rounded-xl">
            <div className="flex flex-col gap-3 border-b border-outline-variant bg-surface-container-low px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <MaterialIcon className="text-primary" name="article" />
                <h1 className="truncate font-label-md text-label-md">
                  Xem trước: {document.title}
                </h1>
              </div>
              <a
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-label-sm text-label-sm text-on-primary"
                href={document.fileUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <MaterialIcon name="open_in_new" />
                Mở tệp
              </a>
            </div>
            <div className="bg-surface-container p-4">
              <DocumentPreview preview={preview ?? { type: "unsupported" }} />
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
                  {document.description || "Tài liệu chưa có mô tả."}
                </dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="mb-1 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                    Dung lượng
                  </dt>
                  <dd className="font-label-md text-label-md">
                    {formatBytes(document.sizeInBytes)}
                  </dd>
                </div>
                <div>
                  <dt className="mb-1 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                    Định dạng
                  </dt>
                  <dd className="font-label-md text-label-md">
                    {document.format.toUpperCase()}
                  </dd>
                </div>
              </div>
              <div>
                <dt className="mb-1 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Tác giả
                </dt>
                <dd className="font-label-md text-label-md">
                  {document.author.name}
                </dd>
              </div>
              <div>
                <dt className="mb-1 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Ngày tải
                </dt>
                <dd className="font-label-md text-label-md">
                  {formatDate(document.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="mb-1 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Môn học
                </dt>
                <dd>
                  <ModeratorBadge tone="secondary">
                    {document.subject?.name ?? "Chưa phân loại"}
                  </ModeratorBadge>
                </dd>
              </div>
              <div>
                <dt className="mb-1 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Trạng thái
                </dt>
                <dd>
                  <ModeratorBadge tone={statusToneMap[status]}>
                    {statusLabelMap[status]}
                  </ModeratorBadge>
                </dd>
              </div>
            </dl>
          </ModeratorCard>

          {/* Trợ lý Kiểm duyệt AI Card */}
          <section className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-md transition-all duration-300">
            {/* AI gradient accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-pink-500 to-blue-500" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MaterialIcon
                  className="text-violet-500 animate-pulse"
                  name="auto_awesome"
                />
                <h2 className="font-headline-md text-headline-md font-bold bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent dark:from-violet-400 dark:to-pink-400">
                  Trợ lý Kiểm duyệt AI
                </h2>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {!aiAnalysis && !isAiAnalyzing ? (
                <div className="space-y-3">
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    Sử dụng trí tuệ nhân tạo để tự động đọc tài liệu, tóm tắt
                    nội dung chính và phát hiện các dấu hiệu vi phạm trước khi
                    duyệt.
                  </p>
                  <button
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 py-3 font-label-md text-label-md text-white shadow-lg shadow-violet-500/20 transition-all hover:opacity-95 hover:shadow-violet-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isAiAnalyzing}
                    onClick={handleRunAiAnalysis}
                    type="button"
                  >
                    <MaterialIcon name="analytics" />
                    Chạy phân tích AI
                  </button>
                </div>
              ) : null}

              {isAiAnalyzing ? (
                <div className="space-y-3 py-4 text-center">
                  <div className="relative mx-auto h-10 w-10">
                    <div className="absolute inset-0 rounded-full border-4 border-violet-200/30" />
                    <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
                  </div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant animate-pulse">
                    AI đang trích xuất văn bản và phân tích nội dung...
                  </p>
                </div>
              ) : null}

              {aiAnalysis && !isAiAnalyzing ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Summary Section */}
                  <div className="space-y-1.5">
                    <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface-variant/80">
                      Tóm tắt tài liệu (AI Summary)
                    </span>
                    <div className="rounded-xl border border-violet-500/15 bg-violet-500/5 p-4 font-body-md text-body-md text-on-surface leading-relaxed">
                      {aiAnalysis.summary}
                    </div>
                  </div>

                  {/* Content Flags Section */}
                  <div className="space-y-1.5">
                    <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface-variant/80">
                      Cảnh báo nội dung (AI Flags)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {aiAnalysis.flags.length > 0 ? (
                        aiAnalysis.flags.map((flag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1 font-label-sm text-label-sm font-semibold text-red-500 dark:border-red-500/30"
                          >
                            <MaterialIcon className="text-sm" name="warning" />
                            {flagLabelMap[flag] || flag}
                          </span>
                        ))
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-1 font-label-sm text-label-sm font-semibold text-green-500 dark:border-green-500/30">
                          <MaterialIcon
                            className="text-sm"
                            name="check_circle"
                          />
                          Không phát hiện nội dung nghi vấn
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Suggestion Section */}
                  <div className="space-y-1.5">
                    <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface-variant/80">
                      Đề xuất kiểm duyệt
                    </span>
                    <div
                      className={`rounded-xl border p-4 space-y-2 ${
                        aiAnalysis.moderationSuggestion === "APPROVE"
                          ? "border-green-500/20 bg-green-500/5"
                          : "border-red-500/20 bg-red-500/5"
                      }`}
                    >
                      <div
                        className={`flex items-center gap-2 font-label-md text-label-md font-bold ${
                          aiAnalysis.moderationSuggestion === "APPROVE"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        <MaterialIcon
                          name={
                            aiAnalysis.moderationSuggestion === "APPROVE"
                              ? "thumb_up"
                              : "thumb_down"
                          }
                        />
                        {aiAnalysis.moderationSuggestion === "APPROVE"
                          ? "PHÊ DUYỆT (APPROVE)"
                          : "TỪ CHỐI (REJECT)"}
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant/90 leading-relaxed">
                        {aiAnalysis.moderationReason}
                      </p>

                      {aiAnalysis.moderationSuggestion === "REJECT" &&
                      aiAnalysis.moderationReason ? (
                        <button
                          className="flex items-center gap-1.5 rounded-lg border border-outline bg-surface-container px-3 py-1.5 font-label-sm text-label-sm font-semibold text-on-surface transition-colors hover:border-violet-500 hover:text-violet-500 active:scale-[0.98]"
                          onClick={() => {
                            setInitialRejectionReason(
                              aiAnalysis.moderationReason,
                            );
                            setIsRejecting(true);
                          }}
                          type="button"
                        >
                          <MaterialIcon
                            className="text-sm"
                            name="assignment_turned_in"
                          />
                          Dùng lý do kiểm duyệt này
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* Re-run button */}
                  <button
                    className="flex items-center gap-1 font-label-sm text-label-sm font-bold text-violet-500 hover:text-violet-600 transition-colors"
                    onClick={handleRunAiAnalysis}
                    type="button"
                  >
                    <MaterialIcon className="text-sm" name="refresh" />
                    Chạy lại phân tích
                  </button>
                </div>
              ) : null}
            </div>
          </section>

          <section className="sticky top-24 rounded-xl border-2 border-primary bg-surface-container-low p-6">
            <h2 className="mb-4 flex items-center gap-2 font-headline-md text-headline-md text-primary">
              <MaterialIcon name="verified_user" />
              Bảng kiểm duyệt
            </h2>

            {canReview ? (
              <label className="mb-4 flex items-start gap-2.5 rounded-lg border border-outline-variant bg-surface px-4 py-3 shadow-sm cursor-pointer select-none transition-colors hover:bg-surface-container-low">
                <input
                  checked={hasVerified}
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-primary"
                  onChange={(e) => setHasVerified(e.target.checked)}
                  type="checkbox"
                />
                <span className="font-label-sm text-label-sm text-on-surface leading-tight">
                  Tôi xác nhận đã trực tiếp đọc tài liệu, tự kiểm tra nội dung
                  và chịu trách nhiệm cho quyết định này.
                </span>
              </label>
            ) : null}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                className="flex items-center justify-center gap-2 rounded-lg bg-on-error-container py-3 font-label-md text-label-md text-on-error transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!canReview || isSubmitting || !hasVerified}
                onClick={() => setIsRejecting(true)}
                type="button"
              >
                <MaterialIcon name="close" />
                Từ chối
              </button>
              <button
                className="flex items-center justify-center gap-2 rounded-lg bg-primary py-3 font-label-md text-label-md text-on-primary transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!canReview || isSubmitting || !hasVerified}
                onClick={() => void handleApprove()}
                type="button"
              >
                <MaterialIcon name="check" />
                Phê duyệt
              </button>
            </div>
            {!canReview ? (
              <p className="mt-4 font-label-sm text-label-sm text-on-surface-variant">
                Tài liệu này không còn ở trạng thái chờ duyệt.
              </p>
            ) : null}
          </section>
        </aside>
      </div>

      <RejectDocumentModal
        initialReason={initialRejectionReason}
        open={isRejecting}
        isSubmitting={isSubmitting}
        onCancel={() => {
          if (isSubmitting) return;
          setIsRejecting(false);
        }}
        onConfirm={handleRejectConfirm}
      />
    </>
  );
}

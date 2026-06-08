"use client";

/**
 * DocumentTable
 *
 * Renders the searchable, paginated list of the user's documents.
 * Uses only components/ui primitives: Card, Badge, Button, Table, Pagination,
 * InputField.
 *
 * All data and handler props flow in from the page — this component is purely
 * presentational with local search-term state (client-side filter on the
 * current page).
 */

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InputField } from "@/components/ui/InputField";
import { Pagination } from "@/components/ui/Pagination";
import { Table, type TableRow } from "@/components/ui/Table";

import { formatDate } from "@/utils";
import type { LibraryDocument, PaginationMeta } from "@/types/document.type";

// ── Config ────────────────────────────────────────────────────────────────────

const COLUMNS = [
  { key: "name", label: "Tên tài liệu" },
  { key: "date", label: "Ngày tải lên" },
  { key: "status", label: "Trạng thái" },
  { key: "actions", label: "Thao tác", align: "right" as const },
] as const;

/** Maps API status enum to Vietnamese label + Badge tone. */
const STATUS_MAP: Record<
  string,
  { label: string; tone: "success" | "warning" | "error" | "neutral" }
> = {
  ACTIVE: { label: "Công khai", tone: "success" },
  PENDING: { label: "Đang chờ duyệt", tone: "warning" },
  REJECTED: { label: "Bị từ chối", tone: "error" },
};

/** Infers a Material Symbol icon from the document publicId extension. */
function formatToIcon(publicId: string): string {
  const lower = publicId.toLowerCase();
  if (lower.includes("pdf")) return "picture_as_pdf";
  if (lower.includes("docx") || lower.includes("doc")) return "description";
  if (lower.includes("pptx") || lower.includes("ppt")) return "slideshow";
  return "draft";
}

// ── Skeleton row ──────────────────────────────────────────────────────────────

function SkeletonRows({ count }: { count: number }): React.JSX.Element {
  return (
    <div className="divide-y divide-outline-variant">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3 animate-pulse"
        >
          <div className="h-10 w-10 rounded-lg bg-surface-variant" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-1/2 rounded bg-surface-variant" />
            <div className="h-3 w-1/4 rounded bg-surface-variant" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  readonly documents: LibraryDocument[];
  readonly pagination: PaginationMeta | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly skeletonCount: number;
  readonly onPageChange: (page: number) => void;
  /** Called with the document ID when the delete button is clicked. */
  readonly onDelete: (id: string) => Promise<void>;
  /** ID of the document currently being deleted (disables its row buttons). */
  readonly deletingId: string | null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DocumentTable({
  documents,
  pagination,
  isLoading,
  error,
  skeletonCount,
  onPageChange,
  onDelete,
  deletingId,
}: Props): React.JSX.Element {
  // Client-side search filter applied on top of the current server page
  const [searchTerm, setSearchTerm] = useState("");
  const normalizedSearchTerm = searchTerm.trim();
  const isSearching = normalizedSearchTerm.length > 0;

  const visibleDocuments = useMemo(() => {
    const term = normalizedSearchTerm.toLowerCase();
    if (!term) return documents;
    return documents.filter(
      (d) =>
        d.title.toLowerCase().includes(term) ||
        (d.subject?.name.toLowerCase().includes(term) ?? false),
    );
  }, [documents, normalizedSearchTerm]);

  // Build Table rows from visible documents
  const tableRows: TableRow[] = visibleDocuments.map((doc) => {
    const status = STATUS_MAP[doc.status] ?? {
      label: doc.status,
      tone: "neutral" as const,
    };
    const icon = formatToIcon(doc.publicId);

    return {
      id: doc.id,
      cells: [
        /* ── Name ── */
        <div key="name" className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-outline-variant bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[18px]">
              {icon}
            </span>
          </div>
          <div>
            <p className="font-semibold text-on-surface line-clamp-1">
              {doc.title}
            </p>
            <p className="text-xs text-on-surface-variant">
              {doc.subject?.name ?? "Chưa phân loại"}
            </p>
          </div>
        </div>,

        /* ── Date ── */
        <span
          key="date"
          className="whitespace-nowrap text-sm text-on-surface-variant"
        >
          {formatDate(doc.createdAt)}
        </span>,

        /* ── Status ── */
        <Badge key="status" tone={status.tone}>
          {status.label}
        </Badge>,

        /* ── Actions ── */
        <div key="actions" className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" className="px-3">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">
                edit
              </span>
              Sửa
            </span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="px-3 text-error hover:bg-error-container hover:text-error"
            onClick={() => onDelete(doc.id)}
            disabled={deletingId === doc.id}
          >
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">
                delete
              </span>
              {deletingId === doc.id ? "Đang xóa…" : "Xóa"}
            </span>
          </Button>
        </div>,
      ],
    };
  });

  return (
    <Card className="p-5 shadow-sm shadow-black/5 lg:p-6">
      {/* Header: title + search + filter/sort */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-on-surface">
            Danh sách tài liệu
          </h2>
          {isSearching ? (
            <p className="text-xs text-on-surface-variant">
              {visibleDocuments.length} tài liệu trên trang này
            </p>
          ) : pagination ? (
            <p className="text-xs text-on-surface-variant">
              {visibleDocuments.length} / {pagination.total} tài liệu
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full lg:w-64">
            <InputField
              placeholder="Tìm kiếm tài liệu…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={
                <span className="material-symbols-outlined text-[18px]">
                  search
                </span>
              }
            />
          </div>
          <Button variant="outline" type="button" size="sm">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">
                filter_list
              </span>
              Bộ lọc
            </span>
          </Button>
          <Button variant="outline" type="button" size="sm">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">
                sort
              </span>
              Sắp xếp
            </span>
          </Button>
        </div>
      </div>

      {/* Table body — three mutually exclusive states */}
      <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest">
        {isLoading ? (
          <SkeletonRows count={skeletonCount} />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <span className="material-symbols-outlined mb-2 text-4xl text-error">
              error_outline
            </span>
            <p className="text-sm text-error">{error}</p>
          </div>
        ) : tableRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <span className="material-symbols-outlined mb-2 text-4xl text-on-surface-variant/40">
              folder_open
            </span>
            <p className="text-sm text-on-surface-variant">
              {searchTerm
                ? "Không tìm thấy kết quả phù hợp."
                : "Bạn chưa có tài liệu nào."}
            </p>
          </div>
        ) : (
          <Table columns={COLUMNS} rows={tableRows} />
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && !isLoading && !isSearching ? (
        <div className="mt-5 flex flex-col gap-3 border-t border-outline-variant pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-on-surface-variant">
            Hiển thị {visibleDocuments.length} trong tổng số {pagination.total}{" "}
            tài liệu
          </p>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      ) : null}
    </Card>
  );
}

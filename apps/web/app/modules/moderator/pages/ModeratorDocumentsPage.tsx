"use client";

import { Pagination } from "@/components/ui/Pagination";
import { Table, type TableRow } from "@/components/ui/Table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { documentReviewItems } from "../mockData";
import type { DocumentReviewItem, DocumentReviewStatus } from "../types";
import { ModeratorShell } from "../components/ModeratorShell";
import {
  EmptyState,
  IconButton,
  MaterialIcon,
  ModeratorBadge,
  ModeratorCard,
} from "../components/ModeratorPrimitives";

const statusMeta: Record<
  DocumentReviewStatus,
  {
    label: string;
    tone: "primary" | "secondary" | "tertiary" | "error" | "neutral";
  }
> = {
  pending: { label: "Pending", tone: "tertiary" },
  priority: { label: "Priority", tone: "primary" },
  approved: { label: "Approved", tone: "secondary" },
  rejected: { label: "Rejected", tone: "error" },
  changes_requested: { label: "Needs changes", tone: "neutral" },
  flagged: { label: "Flagged", tone: "error" },
};

const categoryToneMap: Record<string, "secondary" | "tertiary" | "neutral"> = {
  "Khoa học Máy tính": "secondary",
  "Kinh tế học": "tertiary",
  "Tâm lý học": "neutral",
};

const pageSize = 3;

const documentColumns = [
  { key: "title", label: "TIÊU ĐỀ TÀI LIỆU" },
  { key: "author", label: "TÁC GIẢ" },
  { key: "category", label: "DANH MỤC" },
  { key: "uploadDate", label: "NGÀY TẢI" },
  { key: "status", label: "TRẠNG THÁI" },
  { key: "actions", label: "THAO TÁC", align: "right" as const },
] as const;

function updateDocumentStatus(
  items: DocumentReviewItem[],
  id: string,
  status: DocumentReviewStatus,
) {
  return items.map((item) => (item.id === id ? { ...item, status } : item));
}

export default function ModeratorDocumentsPage(): React.JSX.Element {
  const [documents, setDocuments] = useState(documentReviewItems);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(documents.map((item) => item.category))),
    [documents],
  );

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesCategory =
        category === "all" || document.category === category;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [
          document.title,
          document.author,
          document.category,
          document.subject,
          document.university,
          document.id,
        ].some((value) =>
          (value ?? "").toLowerCase().includes(normalizedQuery),
        );

      return matchesCategory && matchesQuery;
    });
  }, [category, documents, query]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDocuments.length / pageSize),
  );
  const visibleDocuments = useMemo(
    () =>
      filteredDocuments.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
      ),
    [currentPage, filteredDocuments],
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pendingCount = documents.filter((doc) =>
    ["pending", "priority", "changes_requested"].includes(doc.status),
  ).length;

  const handleStatusChange = useCallback(
    (id: string, status: DocumentReviewStatus, message: string) => {
      setDocuments((current) => updateDocumentStatus(current, id, status));
      setToastMessage(message);
    },
    [],
  );

  const documentRows: TableRow[] = useMemo(
    () =>
      visibleDocuments.map((document) => {
        const status = statusMeta[document.status];
        const categoryTone = categoryToneMap[document.category] ?? "neutral";

        return {
          id: document.id,
          cells: [
            <div className="flex items-center gap-3" key="title">
              <div className="flex h-12 w-10 items-center justify-center rounded-sm bg-primary-fixed">
                <MaterialIcon
                  className="text-primary"
                  name={document.fileType === "DOCX" ? "menu_book" : "article"}
                />
              </div>
              <div>
                <p className="max-w-[280px] truncate font-label-md text-label-md text-on-surface">
                  {document.title}
                </p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  {document.fileType} • {document.fileSize} • {document.id}
                </p>
              </div>
            </div>,
            <div className="flex items-center gap-2" key="author">
              <img
                alt={`${document.author} avatar`}
                className="h-6 w-6 rounded-full object-cover"
                height={24}
                src={document.avatarUrl}
                width={24}
              />
              <span className="font-body-md text-body-md text-on-surface">
                {document.author}
              </span>
            </div>,
            <ModeratorBadge key="category" tone={categoryTone}>
              {document.category}
            </ModeratorBadge>,
            <span
              className="font-body-md text-body-md text-on-surface"
              key="uploadDate"
            >
              {document.uploadDate}
            </span>,
            <ModeratorBadge key="status" tone={status.tone}>
              {status.label}
            </ModeratorBadge>,
            <div className="flex justify-end gap-2" key="actions">
              <IconButton
                href={`/moderator/documents/${document.id}`}
                icon="visibility"
                label={`Xem chi tiết ${document.title}`}
              />
              {document.status !== "changes_requested" ? (
                <IconButton
                  icon="rate_review"
                  label={`Yêu cầu chỉnh sửa ${document.title}`}
                  onClick={() =>
                    handleStatusChange(
                      document.id,
                      "changes_requested",
                      `Đã yêu cầu chỉnh sửa ${document.id}`,
                    )
                  }
                />
              ) : null}
              {document.status !== "flagged" ? (
                <IconButton
                  icon="flag"
                  label={`Gắn cờ ${document.title}`}
                  onClick={() =>
                    handleStatusChange(
                      document.id,
                      "flagged",
                      `Đã gắn cờ ${document.id}`,
                    )
                  }
                  tone="tertiary"
                />
              ) : null}
              {document.status !== "rejected" ? (
                <IconButton
                  icon="close"
                  label={`Từ chối ${document.title}`}
                  onClick={() =>
                    handleStatusChange(
                      document.id,
                      "rejected",
                      `Đã từ chối ${document.id}`,
                    )
                  }
                  tone="error"
                />
              ) : null}
              {document.status !== "approved" ? (
                <IconButton
                  icon="check"
                  label={`Phê duyệt ${document.title}`}
                  onClick={() =>
                    handleStatusChange(
                      document.id,
                      "approved",
                      `Đã phê duyệt ${document.id}`,
                    )
                  }
                  tone="primary"
                />
              ) : null}
            </div>,
          ],
        };
      }),
    [handleStatusChange, visibleDocuments],
  );

  return (
    <ModeratorShell
      activeSection="documents"
      searchPlaceholder="Tìm kiếm tài liệu..."
    >
      <div className="space-y-gutter">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="mb-1 font-headline-lg text-headline-lg text-on-surface">
              Kiểm Duyệt Tài Liệu
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Quản lý và phê duyệt các bản thảo học thuật được tải lên hệ thống.
            </p>
          </div>
          <div className="flex w-full max-w-sm items-center gap-4 bg-surface-container-high px-4 py-2 lg:w-auto">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                Chờ Duyệt
              </p>
              <p className="font-headline-md text-headline-md text-primary">
                {pendingCount}
              </p>
            </div>
            <div className="h-8 w-px bg-outline-variant" />
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                Hôm nay
              </p>
              <p className="font-headline-md text-headline-md text-secondary">
                12
              </p>
            </div>
          </div>
        </div>

        {toastMessage ? (
          <div
            className="flex items-center justify-between border border-primary bg-primary-fixed px-4 py-3 text-on-primary-fixed"
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <label className="border border-outline-variant bg-white p-4 transition-colors hover:border-primary">
            <span className="mb-2 flex items-center gap-3 font-label-md text-label-md text-on-surface">
              <MaterialIcon className="text-primary" name="filter_list" />
              Thể loại
            </span>
            <select
              className="w-full border-none bg-transparent p-0 font-label-sm text-label-sm text-on-surface-variant outline-none"
              onChange={(event) => {
                setCategory(event.target.value);
                setCurrentPage(1);
              }}
              value={category}
            >
              <option value="all">Tất cả thể loại</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="border border-outline-variant bg-white p-4 transition-colors hover:border-primary md:col-span-2">
            <span className="mb-2 flex items-center gap-3 font-label-md text-label-md text-on-surface">
              <MaterialIcon className="text-primary" name="search" />
              Tìm kiếm
            </span>
            <input
              className="w-full border-none bg-transparent p-0 font-label-sm text-label-sm text-on-surface-variant outline-none"
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tên tài liệu, tác giả, mã ID..."
              type="search"
              value={query}
            />
          </label>
          <button
            className="flex items-center justify-center gap-2 bg-surface-container-highest p-4 font-label-md text-label-md text-on-surface transition-colors hover:bg-outline-variant"
            onClick={() => {
              setQuery("");
              setCategory("all");
              setCurrentPage(1);
            }}
            type="button"
          >
            <MaterialIcon name="refresh" />
            Làm mới danh sách
          </button>
        </div>

        <ModeratorCard className="overflow-hidden">
          <Table columns={documentColumns} rows={documentRows} />
          {filteredDocuments.length === 0 ? (
            <EmptyState
              description="Thử đổi bộ lọc hoặc xóa nội dung tìm kiếm để xem lại hàng đợi."
              title="Không có tài liệu phù hợp"
            />
          ) : null}
          <div className="flex flex-col gap-3 border-t border-outline-variant bg-surface-container-lowest px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Hiển thị {visibleDocuments.length} của {filteredDocuments.length}{" "}
              tài liệu
            </p>
            <Pagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalPages={totalPages}
            />
          </div>
        </ModeratorCard>

        <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          <section className="relative flex min-h-[160px] flex-col justify-between overflow-hidden bg-primary-container p-6 text-on-primary-container">
            <MaterialIcon
              className="absolute -bottom-4 -right-4 text-8xl opacity-10"
              name="speed"
            />
            <div>
              <p className="font-label-sm text-label-sm font-bold uppercase opacity-80">
                Tốc độ Phản hồi
              </p>
              <h2 className="mt-2 font-display text-display">1.2h</h2>
            </div>
            <p className="font-label-md text-label-md">
              Giảm 15% so với tuần trước
            </p>
          </section>
          <ModeratorCard className="flex min-h-[160px] flex-col justify-between p-6">
            <div>
              <p className="font-label-sm text-label-sm font-bold uppercase text-on-surface-variant">
                Tỷ lệ Phê duyệt
              </p>
              <h2 className="mt-2 font-display text-display text-primary">
                82%
              </h2>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container-high">
              <div className="h-full w-[82%] bg-primary" />
            </div>
          </ModeratorCard>
          <section className="relative flex min-h-[160px] flex-col justify-between overflow-hidden bg-secondary-container p-6 text-on-secondary-container">
            <MaterialIcon
              className="absolute -bottom-4 -right-4 text-8xl opacity-10"
              name="verified"
            />
            <div>
              <p className="font-label-sm text-label-sm font-bold uppercase opacity-80">
                Tổng số đã duyệt
              </p>
              <h2 className="mt-2 font-display text-display">1,402</h2>
            </div>
            <p className="font-label-md text-label-md">
              +48 tài liệu mới tháng này
            </p>
          </section>
        </div>
      </div>
    </ModeratorShell>
  );
}

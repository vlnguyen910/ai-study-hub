"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { Pagination } from "@/components/ui/Pagination";
import { Table, type TableRow } from "@/components/ui/Table";
import { useMemo, useState, type ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { documentReviewItems } from "../mockData";
import type { DocumentReviewItem, DocumentReviewStatus } from "../types";
import { ModeratorShell } from "../components/ModeratorShell";
import { EmptyState, MaterialIcon } from "../components/ModeratorPrimitives";
import { ModeratorFilterToolbar } from "../components/ModeratorFilterToolbar";

const statusMeta: Record<
  DocumentReviewStatus,
  {
    label: string;
    tone: "primary" | "secondary" | "tertiary" | "error" | "neutral";
  }
> = {
  pending: { label: "Chờ duyệt", tone: "tertiary" },
  priority: { label: "Ưu tiên", tone: "primary" },
  approved: { label: "Đã duyệt", tone: "secondary" },
  rejected: { label: "Đã từ chối", tone: "error" },
  changes_requested: { label: "Cần chỉnh sửa", tone: "neutral" },
  flagged: { label: "Đã gắn cờ", tone: "error" },
};

const categoryTones = ["secondary", "tertiary", "neutral"] as const;
const allCategoryLabel = "Tất cả thể loại";
const pageSize = 4;

const statusToneMap: Record<
  DocumentReviewStatus,
  NonNullable<ComponentProps<typeof Badge>["tone"]>
> = {
  pending: "warning",
  priority: "warning",
  approved: "success",
  rejected: "error",
  changes_requested: "neutral",
  flagged: "error",
};

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
  const router = useRouter();
  const [documents, setDocuments] = useState(documentReviewItems);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(allCategoryLabel);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(documentReviewItems.map((item) => item.category))),
    [],
  );
  const categoryOptions = useMemo(
    () => [allCategoryLabel, ...categories],
    [categories],
  );

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesCategory =
        category === allCategoryLabel || document.category === category;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [
          document.title,
          document.author,
          document.category,
          document.subject,
          document.university,
          document.id,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));

      return matchesCategory && matchesQuery;
    });
  }, [category, documents, query]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDocuments.length / pageSize),
  );
  const visibleDocuments = filteredDocuments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const pendingCount = documents.filter((doc) =>
    ["pending", "priority", "changes_requested"].includes(doc.status),
  ).length;

  const handleStatusChange = (
    id: string,
    status: DocumentReviewStatus,
    message: string,
  ) => {
    setDocuments((current) => updateDocumentStatus(current, id, status));
    setToastMessage(message);
  };

  const handleResetFilters = () => {
    setQuery("");
    setCategory(allCategoryLabel);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setQuery("");
    setCurrentPage(1);
  };

  const documentRows: TableRow[] = visibleDocuments.map((document, index) => {
    const status = statusMeta[document.status];
    const categoryTone =
      categoryTones[index % categoryTones.length] ?? "neutral";

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
        <Badge
          className={
            categoryTone === "secondary"
              ? "bg-secondary-fixed text-on-secondary-fixed-variant"
              : categoryTone === "tertiary"
                ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                : ""
          }
          key="category"
          tone="neutral"
        >
          {document.category}
        </Badge>,
        <span
          className="font-body-md text-body-md text-on-surface"
          key="uploadDate"
        >
          {document.uploadDate}
        </span>,
        <Badge key="status" tone={statusToneMap[document.status]}>
          {status.label}
        </Badge>,
        <div className="flex justify-end gap-2" key="actions">
          <IconButton
            ariaLabel={`Xem chi tiết ${document.title}`}
            icon={<MaterialIcon name="visibility" />}
            onClick={() => router.push(`/moderator/documents/${document.id}`)}
          />
          <IconButton
            ariaLabel={`Yêu cầu chỉnh sửa ${document.title}`}
            icon={<MaterialIcon name="rate_review" />}
            onClick={() =>
              handleStatusChange(
                document.id,
                "changes_requested",
                `Đã yêu cầu chỉnh sửa ${document.id}`,
              )
            }
          />
          <IconButton
            ariaLabel={`Gắn cờ ${document.title}`}
            className="text-tertiary hover:text-tertiary"
            icon={<MaterialIcon name="flag" />}
            onClick={() =>
              handleStatusChange(
                document.id,
                "flagged",
                `Đã gắn cờ ${document.id}`,
              )
            }
          />
          <IconButton
            ariaLabel={`Từ chối ${document.title}`}
            className="text-error hover:text-error"
            icon={<MaterialIcon name="close" />}
            onClick={() =>
              handleStatusChange(
                document.id,
                "rejected",
                `Đã từ chối ${document.id}`,
              )
            }
          />
          <IconButton
            ariaLabel={`Phê duyệt ${document.title}`}
            className="text-primary hover:text-primary"
            icon={<MaterialIcon name="check" />}
            onClick={() =>
              handleStatusChange(
                document.id,
                "approved",
                `Đã phê duyệt ${document.id}`,
              )
            }
          />
        </div>,
      ],
    };
  });

  return (
    <ModeratorShell
      activeSection="documents"
      searchPlaceholder="Tìm kiếm tài liệu..."
    >
      <div className="space-y-gutter">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="mb-1 font-headline-lg text-headline-lg text-on-surface">
              Kiểm duyệt tài liệu
            </h1>
            <p className="max-w-3xl whitespace-normal break-words font-body-md text-body-md text-on-surface-variant">
              Quản lý và phê duyệt các bản thảo học thuật được tải lên hệ thống.
            </p>
          </div>
          <Card className="grid w-full max-w-sm grid-cols-2 gap-0 overflow-hidden rounded-lg p-0 lg:w-auto">
            <div className="border-r border-outline-variant px-5 py-3 text-center">
              <p className="font-label-sm text-label-sm uppercase text-on-surface-variant">
                Chờ duyệt
              </p>
              <p className="font-headline-md text-headline-md text-primary">
                {pendingCount}
              </p>
            </div>
            <div className="px-5 py-3 text-center">
              <p className="font-label-sm text-label-sm uppercase text-on-surface-variant">
                Hôm nay
              </p>
              <p className="font-headline-md text-headline-md text-secondary">
                12
              </p>
            </div>
          </Card>
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

        <ModeratorFilterToolbar
          filterLabel="Thể loại"
          filterOptions={categoryOptions}
          filterValue={category}
          onFilterChange={(value) => {
            setCategory(value);
            setCurrentPage(1);
          }}
          onQueryChange={(value) => {
            setQuery(value);
            setCurrentPage(1);
          }}
          onQueryClear={handleClearSearch}
          onReset={handleResetFilters}
          query={query}
          searchPlaceholder="Tên tài liệu, tác giả, mã ID..."
        />

        <Card className="overflow-hidden rounded-lg p-0">
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
        </Card>
      </div>
    </ModeratorShell>
  );
}

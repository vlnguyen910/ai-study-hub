import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, type TableRow } from "@/components/ui/Table";
import type { LibraryDocument } from "@/types/document.type";
import { formatDate } from "@/utils";

import { DocumentCollectionEmpty } from "./DocumentCollectionState";
import {
  getDocumentFileIcon,
  getDocumentStatusDisplay,
} from "./documentCollection.utils";

const COLUMNS = [
  { key: "name", label: "Tên tài liệu" },
  { key: "date", label: "Ngày tải lên", align: "center" as const },
  { key: "status", label: "Trạng thái", align: "center" as const },
  { key: "reason", label: "Lý do", align: "center" as const },
  { key: "actions", label: "Thao tác", align: "center" as const },
] as const;

function TableSkeleton({ count }: { count: number }): React.JSX.Element {
  return (
    <div className="divide-y divide-outline-variant">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-3 px-4 py-3"
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

interface Props {
  readonly documents: LibraryDocument[];
  readonly isLoading: boolean;
  readonly isSearching: boolean;
  readonly skeletonCount: number;
  readonly deletingId: string | null;
  readonly savingId: string | null;
  readonly onEdit: (document: LibraryDocument) => void;
  readonly onRequestDelete: (document: LibraryDocument) => void;
  readonly onViewReason: (document: LibraryDocument) => void;
}

export function DocumentTableView({
  documents,
  isLoading,
  isSearching,
  skeletonCount,
  deletingId,
  savingId,
  onEdit,
  onRequestDelete,
  onViewReason,
}: Props): React.JSX.Element {
  const rows: TableRow[] = documents.map((document) => {
    const status = getDocumentStatusDisplay(document.status, document.isPublic);
    const isBusy = deletingId === document.id || savingId === document.id;

    return {
      id: document.id,
      cells: [
        <div key="name" className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-outline-variant bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[18px]">
              {getDocumentFileIcon(document.publicId)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="line-clamp-1 font-semibold text-on-surface">
              {document.title}
            </p>
            <p className="text-xs text-on-surface-variant">
              {document.subject?.name ?? "Chưa phân loại"}
            </p>
          </div>
        </div>,
        <span
          key="date"
          className="block whitespace-nowrap text-center text-sm text-on-surface-variant"
        >
          {formatDate(document.createdAt)}
        </span>,
        <div key="status" className="flex justify-center">
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>,
        <div key="reason" className="flex justify-center">
          {document.status === "REJECTED" ? (
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="gap-1 border-error/20 bg-error/5 text-error"
              onClick={() => onViewReason(document)}
            >
              <span className="material-symbols-outlined text-[14px]">
                visibility
              </span>
              Xem lý do
            </Button>
          ) : (
            <span className="text-xs text-on-surface-variant">—</span>
          )}
        </div>,
        <div key="actions" className="flex justify-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isBusy}
            onClick={() => onEdit(document)}
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            {savingId === document.id ? "Đang lưu..." : "Sửa"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-error hover:bg-error-container hover:text-error"
            disabled={isBusy}
            onClick={() => onRequestDelete(document)}
          >
            <span className="material-symbols-outlined text-[16px]">
              delete
            </span>
            {deletingId === document.id ? "Đang xóa..." : "Xóa"}
          </Button>
        </div>,
      ],
    };
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest">
      {isLoading ? (
        <TableSkeleton count={skeletonCount} />
      ) : rows.length > 0 ? (
        <Table columns={COLUMNS} rows={rows} />
      ) : (
        <DocumentCollectionEmpty isSearching={isSearching} />
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";

import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import type { LibraryDocument, PaginationMeta } from "@/types/document.type";

import { DocumentCardView } from "./DocumentCardView";
import { DocumentContributionBanner } from "./DocumentContributionBanner";
import { DocumentCollectionError } from "./DocumentCollectionState";
import {
  DocumentCollectionToolbar,
  type DocumentViewMode,
} from "./DocumentCollectionToolbar";
import { DocumentReasonModal } from "./DocumentReasonModal";
import { DocumentTableView } from "./DocumentTableView";

interface Props {
  readonly documents: LibraryDocument[];
  readonly pagination: PaginationMeta | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly skeletonCount: number;
  readonly onPageChange: (page: number) => void;
  readonly onRequestDelete: (document: LibraryDocument) => void;
  readonly onEdit: (document: LibraryDocument) => void;
  readonly deletingId: string | null;
  readonly savingId: string | null;
}

export function DocumentCollection({
  documents,
  pagination,
  isLoading,
  error,
  skeletonCount,
  onPageChange,
  onRequestDelete,
  onEdit,
  deletingId,
  savingId,
}: Props): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<DocumentViewMode>("card");
  const [reasonDocument, setReasonDocument] = useState<LibraryDocument | null>(
    null,
  );
  const normalizedSearchTerm = searchTerm.trim();
  const isSearching = normalizedSearchTerm.length > 0;

  const visibleDocuments = useMemo(() => {
    const term = normalizedSearchTerm.toLowerCase();
    if (!term) return documents;
    return documents.filter(
      (document) =>
        document.title.toLowerCase().includes(term) ||
        (document.subject?.name.toLowerCase().includes(term) ?? false),
    );
  }, [documents, normalizedSearchTerm]);

  return (
    <Card className="p-5 shadow-sm shadow-black/5 lg:p-6">
      <DocumentCollectionToolbar
        documentCount={visibleDocuments.length}
        totalCount={pagination?.total ?? 0}
        isSearching={isSearching}
        searchTerm={searchTerm}
        viewMode={viewMode}
        onSearchChange={setSearchTerm}
        onViewModeChange={setViewMode}
      />

      {error ? (
        <DocumentCollectionError message={error} />
      ) : viewMode === "table" ? (
        <DocumentTableView
          documents={visibleDocuments}
          isLoading={isLoading}
          isSearching={isSearching}
          skeletonCount={skeletonCount}
          deletingId={deletingId}
          savingId={savingId}
          onEdit={onEdit}
          onRequestDelete={onRequestDelete}
          onViewReason={setReasonDocument}
        />
      ) : (
        <DocumentCardView
          documents={visibleDocuments}
          isLoading={isLoading}
          isSearching={isSearching}
          skeletonCount={skeletonCount}
          deletingId={deletingId}
          savingId={savingId}
          onEdit={onEdit}
          onRequestDelete={onRequestDelete}
          onViewReason={setReasonDocument}
        />
      )}

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

      <DocumentContributionBanner
        isVisible={!isLoading && !error && visibleDocuments.length > 0}
      />

      <DocumentReasonModal
        document={reasonDocument}
        isOpen={reasonDocument !== null}
        onClose={() => setReasonDocument(null)}
      />
    </Card>
  );
}

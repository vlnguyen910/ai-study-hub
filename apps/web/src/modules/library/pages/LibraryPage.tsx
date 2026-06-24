"use client";

import { useEffect, useMemo } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { useLibraryStore } from "../store/useLibraryStore";
import { FilterBar } from "../components/FilterBar";
import { LibraryHeader } from "../components/LibraryHeader";
import { DocumentGrid } from "../components/DocumentGrid";
import { TopSearchBar } from "../components/TopSearchBar";

/**
 * LibraryPage — main entry point for /library.
 *
 * Responsibilities:
 *  - Bootstrap the store (fetch documents + subjects on mount)
 *  - Compute the client-side filtered document list (search by title)
 *  - Compose FilterBar + LibraryHeader + DocumentGrid + Pagination
 */
interface Props {
  readonly initialSubjectId?: string;
}

export default function LibraryPage({
  initialSubjectId = "",
}: Props): React.JSX.Element {
  const {
    documents,
    subjects,
    pagination,
    isLoading,
    error,
    filters,
    fetchDocuments: loadDocuments,
    fetchSubjects: loadSubjects,
    setSubjectId,
    setPage,
  } = useLibraryStore();

  /** Bootstrap data on first render */
  useEffect(() => {
    if (initialSubjectId) {
      setSubjectId(initialSubjectId);
    } else {
      loadDocuments();
    }
    loadSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Client-side search filter — applied on top of the server page.
   * If AI Semantic Search is active, the documents are already filtered and ordered on the server.
   */
  const visibleDocuments = useMemo(() => {
    if (filters.isSemantic) return documents;
    const term = filters.search.trim().toLowerCase();
    if (!term) return documents;
    return documents.filter((doc) => doc.title.toLowerCase().includes(term));
  }, [documents, filters.search, filters.isSemantic]);

  /** Resolve the active subject label for the header */
  const activeSubjectName = useMemo(() => {
    if (!filters.subjectId) return null;
    return subjects.find((s) => s.id === filters.subjectId)?.name ?? null;
  }, [filters.subjectId, subjects]);

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col gap-6 overflow-hidden">
      {/* Header — takes its natural height, never shrinks away */}
      <LibraryHeader
        pagination={pagination}
        activeSearch={filters.search}
        activeSubjectName={activeSubjectName}
        isLoading={isLoading}
      />

      {/* Top Search Bar */}
      <TopSearchBar />

      {/* Two-column row — fills all remaining height */}
      <div className="flex flex-1 min-h-0 gap-6 overflow-hidden">
        {/* Left: FilterBar scrolls independently when subjects overflow */}
        <FilterBar />

        {/* Right: fixed column — grid is clipped, pagination stays anchored */}
        <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-hidden">
            <DocumentGrid
              documents={visibleDocuments}
              isLoading={isLoading}
              error={error}
            />
          </div>

          {pagination && pagination.totalPages > 1 ? (
            <div className="shrink-0 mt-4 flex items-center justify-between border-t border-outline-variant/40 pt-4">
              <p className="text-sm text-on-surface-variant">
                Trang {pagination.page} / {pagination.totalPages} —{" "}
                {pagination.total.toLocaleString("vi-VN")} tài liệu
              </p>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

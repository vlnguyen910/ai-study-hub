"use client";

import { useEffect, useMemo } from "react";

import { Pagination } from "@/components/ui/Pagination";
import { FilterBar } from "../components/FilterBar";
import { DocumentGrid } from "../components/DocumentGrid";
import { LibraryHeader } from "../components/LibraryHeader";
import { TopSearchBar } from "../components/TopSearchBar";
import { useLibraryStore } from "../store/useLibraryStore";

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

  useEffect(() => {
    if (initialSubjectId) {
      setSubjectId(initialSubjectId);
    } else {
      loadDocuments();
    }
    loadSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleDocuments = useMemo(() => {
    if (filters.isSemantic) return documents;
    const term = filters.search.trim().toLowerCase();
    if (!term) return documents;
    return documents.filter((doc) => doc.title.toLowerCase().includes(term));
  }, [documents, filters.search, filters.isSemantic]);

  const activeSubjectName = useMemo(() => {
    if (!filters.subjectId) return null;
    return subjects.find((s) => s.id === filters.subjectId)?.name ?? null;
  }, [filters.subjectId, subjects]);

  return (
    <div className="min-w-0 space-y-5">
      <LibraryHeader
        pagination={pagination}
        activeSearch={filters.search}
        activeSubjectName={activeSubjectName}
        isLoading={isLoading}
      />

      <div className="space-y-4">
        <TopSearchBar />
        <FilterBar />
      </div>

      <DocumentGrid
        documents={visibleDocuments}
        isLoading={isLoading}
        error={error}
      />

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Trang {pagination.page} / {pagination.totalPages} -{" "}
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
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { fetchDocuments, fetchSubjects } from "@/apis/document.api";
import { BackButton } from "@/components/ui/BackButton";
import { Pagination } from "@/components/ui/Pagination";
import { DocumentGrid } from "@/modules/library/components/DocumentGrid";
import { useAuthStore } from "@/stores/auth/store";
import type {
  DocumentAuthor,
  LibraryDocument,
  PaginationMeta,
  Subject,
} from "@/types/document.type";

import { AuthorDocumentFilters } from "../components/AuthorDocumentFilters";

interface Props {
  readonly authorId: string;
}

export default function DocumentRelatedByAuthor({
  authorId,
}: Props): React.JSX.Element {
  const router = useRouter();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [author, setAuthor] = useState<DocumentAuthor | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [isSemantic, setIsSemantic] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchSubjects(100)
      .then((response) => {
        if (isMounted) setSubjects(response.subjects);
      })
      .catch(() => {
        if (isMounted) setSubjects([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingSubjects(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    if (currentUserId === authorId) {
      router.replace("/my-documents");
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetchDocuments({
      authorId,
      subjectId: subjectId || undefined,
      search: search || undefined,
      isSemantic: search ? isSemantic : undefined,
      status: "ACTIVE",
      page,
      limit: 12,
    })
      .then((response) => {
        if (!isMounted) return;
        const publicDocuments = response.documents.filter(
          (document) => document.status === "ACTIVE" && document.isPublic,
        );
        setDocuments(publicDocuments);
        if (publicDocuments[0]?.author) setAuthor(publicDocuments[0].author);
        setPagination(response.pagination);
      })
      .catch(() => {
        if (!isMounted) return;
        setDocuments([]);
        setPagination(null);
        setError("Không thể tải tài liệu của tác giả. Vui lòng thử lại.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    authorId,
    currentUserId,
    hasHydrated,
    isSemantic,
    page,
    router,
    search,
    subjectId,
  ]);

  const updateSubject = (nextSubjectId: string) => {
    setPage(1);
    setSubjectId(nextSubjectId);
  };

  const updateSearch = (nextSearch: string) => {
    setPage(1);
    setSearch(nextSearch);
  };

  const updateSemantic = (nextIsSemantic: boolean) => {
    setPage(1);
    setIsSemantic(nextIsSemantic);
  };

  const resetFilters = () => {
    setPage(1);
    setSearch("");
    setSubjectId("");
    setIsSemantic(false);
  };

  return (
    <main className="flex h-[calc(100vh-3rem)] flex-col gap-6 overflow-hidden">
      <BackButton fallbackHref="/home" className="self-start shrink-0" />

      <section className="flex shrink-0 flex-col gap-3 rounded-2xl border border-outline-variant bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-base font-bold text-white">
            {author?.avatarUrl ? (
              <Image
                src={author.avatarUrl}
                alt={author.name}
                className="h-full w-full object-cover"
                height={48}
                width={48}
              />
            ) : (
              (author?.name.charAt(0).toUpperCase() ?? "?")
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              Tác giả
            </p>
            <h1 className="truncate text-xl font-bold text-on-surface">
              {author?.name ?? "Tài liệu của tác giả"}
            </h1>
            <p className="text-xs text-on-surface-variant">
              Tài liệu công khai đã được duyệt
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2 sm:ml-auto">
          <span className="material-symbols-outlined text-[20px] text-primary">
            description
          </span>
          <p className="text-sm text-on-surface-variant">
            <span className="font-bold text-on-surface">
              {pagination?.total ?? documents.length}
            </span>{" "}
            tài liệu công khai
          </p>
        </div>
      </section>

      <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto lg:grid-cols-[260px_minmax(0,1fr)] lg:overflow-hidden">
        <AuthorDocumentFilters
          subjects={subjects}
          isLoadingSubjects={isLoadingSubjects}
          search={search}
          subjectId={subjectId}
          isSemantic={isSemantic}
          onSearchChange={updateSearch}
          onSubjectChange={updateSubject}
          onSemanticChange={updateSemantic}
          onReset={resetFilters}
        />

        <div className="min-h-0 min-w-0 space-y-5 lg:overflow-y-auto lg:pr-1">
          <DocumentGrid
            documents={documents}
            isLoading={isLoading || !hasHydrated}
            error={error}
          />

          {pagination && pagination.totalPages > 1 && !isLoading ? (
            <div className="flex flex-col gap-3 border-t border-outline-variant pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-on-surface-variant">
                Trang {pagination.page} / {pagination.totalPages}
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
    </main>
  );
}

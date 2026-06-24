"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import type { Subject } from "@/types/document.type";

interface Props {
  readonly subjects: Subject[];
  readonly isLoadingSubjects: boolean;
  readonly search: string;
  readonly subjectId: string;
  readonly isSemantic: boolean;
  readonly onSearchChange: (search: string) => void;
  readonly onSubjectChange: (subjectId: string) => void;
  readonly onSemanticChange: (isSemantic: boolean) => void;
  readonly onReset: () => void;
}

export function AuthorDocumentFilters({
  subjects,
  isLoadingSubjects,
  search,
  subjectId,
  isSemantic,
  onSearchChange,
  onSubjectChange,
  onSemanticChange,
  onReset,
}: Props): React.JSX.Element {
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const submitSearch = () => onSearchChange(localSearch.trim());

  return (
    <aside className="h-fit space-y-5 rounded-2xl border border-outline-variant/60 bg-surface/80 p-5 shadow-sm shadow-black/5 backdrop-blur-md lg:h-full lg:overflow-y-auto">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">
          Bộ lọc
        </h2>
        <p className="mt-1 text-xs text-on-surface-variant">
          Chỉ áp dụng cho tài liệu công khai của tác giả này.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="author-document-search"
          className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
        >
          Tìm kiếm
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-outline-variant bg-surface px-3 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
            {isSemantic ? "psychology" : "search"}
          </span>
          <input
            id="author-document-search"
            type="search"
            value={localSearch}
            placeholder="Tên tài liệu..."
            className="h-10 min-w-0 flex-1 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60"
            onChange={(event) => setLocalSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submitSearch();
            }}
          />
          <button
            type="button"
            aria-label="Tìm kiếm tài liệu"
            className="rounded-lg p-1 text-primary transition-colors hover:bg-primary/10"
            onClick={submitSearch}
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </button>
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3 py-2">
          <span className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-primary">
              temp_preferences_custom
            </span>
            Tìm kiếm ngữ nghĩa
          </span>
          <input
            type="checkbox"
            checked={isSemantic}
            className="accent-primary"
            onChange={(event) => onSemanticChange(event.target.checked)}
          />
        </label>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
          Môn học
        </p>
        {isLoadingSubjects ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-8 animate-pulse rounded-lg bg-surface-variant"
              />
            ))}
          </div>
        ) : (
          <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-surface-container-low">
              <input
                type="radio"
                name="author-document-subject"
                value=""
                checked={subjectId === ""}
                className="accent-primary"
                onChange={() => onSubjectChange("")}
              />
              <span className="text-sm text-on-surface">Tất cả</span>
            </label>
            {subjects.map((subject) => (
              <label
                key={subject.id}
                className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-surface-container-low"
              >
                <input
                  type="radio"
                  name="author-document-subject"
                  value={subject.id}
                  checked={subjectId === subject.id}
                  className="accent-primary"
                  onChange={() => onSubjectChange(subject.id)}
                />
                <span className="line-clamp-1 text-sm text-on-surface">
                  {subject.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <Button
        variant="outline"
        className="w-full"
        type="button"
        onClick={() => {
          setLocalSearch("");
          onReset();
        }}
      >
        Làm mới bộ lọc
      </Button>
    </aside>
  );
}

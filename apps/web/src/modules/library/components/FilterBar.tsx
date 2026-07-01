"use client";

import type { FC } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useLibraryStore } from "../store/useLibraryStore";

/**
 * FilterBar — horizontal subject filter row beneath the search bar.
 * Provides:
 *  - Subject chips
 *  - One-tap reset chip at the end
 */
export const FilterBar: FC = () => {
  const { filters, subjects, isLoadingSubjects, setSubjectId, setSearch } =
    useLibraryStore();

  const handleReset = () => {
    setSearch("");
    setSubjectId("");
  };

  return (
    <section className="space-y-3">
      <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Môn học
      </p>

      <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Button
          type="button"
          variant={filters.subjectId === "" ? "default" : "outline"}
          size="sm"
          onClick={() => setSubjectId("")}
          className="h-9 shrink-0 rounded-full px-4"
          aria-pressed={filters.subjectId === ""}
        >
          Tất cả
        </Button>

        {isLoadingSubjects
          ? Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-9 w-28 shrink-0 animate-pulse rounded-full border border-border bg-muted"
              />
            ))
          : subjects.map((subject) => (
              <Button
                key={subject.id}
                type="button"
                variant={
                  filters.subjectId === subject.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSubjectId(subject.id)}
                className="h-9 shrink-0 rounded-full px-4"
                aria-pressed={filters.subjectId === subject.id}
              >
                <span className="max-w-[12rem] truncate">{subject.name}</span>
              </Button>
            ))}

        {!isLoadingSubjects && subjects.length === 0 ? (
          <p className="shrink-0 text-sm text-muted-foreground">
            Chưa có môn học nào.
          </p>
        ) : null}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-9 shrink-0 rounded-full px-3 text-xs"
        >
          <RotateCcw className="mr-2 size-3.5" />
          Làm mới bộ lọc
        </Button>
      </div>
    </section>
  );
};

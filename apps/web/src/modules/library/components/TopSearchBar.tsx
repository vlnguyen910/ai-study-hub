"use client";

import type { FC } from "react";
import { useState, useEffect } from "react";
import { useLibraryStore } from "../store/useLibraryStore";

export const TopSearchBar: FC = () => {
  const { filters, setSearch, setIsSemantic } = useLibraryStore();
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Sync local search when store search changes (e.g. reset filters)
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearch(localSearch);
    }
  };

  const handleToggle = (checked: boolean) => {
    setIsSemantic(checked);
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-outline-variant/60 bg-surface/80 p-4 shadow-sm backdrop-blur-md transition-all focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-on-surface-variant/70">
          {filters.isSemantic ? "psychology" : "search"}
        </span>
        <input
          type="text"
          className="flex-1 bg-transparent text-sm text-on-surface outline-hidden placeholder:text-outline-variant"
          placeholder={
            filters.isSemantic
              ? "Tìm kiếm tài liệu bằng ý nghĩa AI (ví dụ: 'tài liệu học về neuron')..."
              : "Tìm kiếm tài liệu..."
          }
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {localSearch && (
          <button
            type="button"
            className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface-variant"
            onClick={() => {
              setLocalSearch("");
              setSearch("");
            }}
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
        <button
          type="button"
          className="flex h-9 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-white shadow-xs hover:bg-primary/95 active:scale-98 transition-all"
          onClick={() => setSearch(localSearch)}
        >
          <span className="material-symbols-outlined text-[16px]">search</span>
          <span>Tìm kiếm</span>
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-outline-variant/30 pt-3">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            className="sr-only"
            checked={filters.isSemantic}
            onChange={(e) => handleToggle(e.target.checked)}
          />
          <div
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
              filters.isSemantic
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-outline-variant/60 bg-surface/50 text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              temp_preferences_custom
            </span>
            <span>Tìm kiếm ngữ nghĩa (AI)</span>
          </div>

          {/* Toggle Switch */}
          <div className="relative h-5 w-9 rounded-full border border-outline-variant bg-surface-container-low transition-colors duration-200">
            <div
              className={`absolute top-[2px] left-[2px] h-[14px] w-[14px] rounded-full bg-outline-variant transition-transform duration-200 ${
                filters.isSemantic
                  ? "translate-x-[16px] bg-primary shadow-[0_0_6px_rgba(59,130,246,0.6)]"
                  : ""
              }`}
            />
          </div>
        </label>

        <div className="flex items-center gap-1 text-[11px] text-on-surface-variant/80">
          <span className="material-symbols-outlined text-[14px] text-primary">
            info
          </span>
          <span>
            {filters.isSemantic
              ? "Tìm kiếm ngữ nghĩa (AI) bằng ý nghĩa và ngữ cảnh."
              : "Tìm kiếm từ khóa chuẩn xác theo tiêu đề."}
          </span>
        </div>
      </div>
    </div>
  );
};

"use client";

import type { FC } from "react";

export interface PaginationProps {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly onPageChange: (page: number) => void;
}

export const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pages = [1, 2, 3, totalPages].filter(
    (value, index, self) =>
      value <= totalPages && self.indexOf(value) === index,
  );

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        className="material-symbols-outlined rounded-md border border-outline-variant px-2 py-1 text-sm hover:bg-surface-variant disabled:opacity-50"
        disabled={currentPage === 1}
      >
        chevron_left
      </button>
      {pages.map((page, index) => (
        <div key={page} className="flex items-center gap-1">
          {index === pages.length - 1 && page > 3 ? (
            <span className="px-2">...</span>
          ) : null}
          <button
            type="button"
            onClick={() => onPageChange(page)}
            className={`rounded-md border px-3 py-1 font-medium ${
              page === currentPage
                ? "border-primary bg-primary text-on-primary"
                : "border-outline-variant hover:bg-surface-variant"
            }`}
          >
            {page}
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        className="material-symbols-outlined rounded-md border border-outline-variant px-2 py-1 text-sm hover:bg-surface-variant"
        disabled={currentPage === totalPages}
      >
        chevron_right
      </button>
    </div>
  );
};

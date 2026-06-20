"use client";

import { InputField } from "@/components/ui/InputField";

export type DocumentViewMode = "table" | "card";

interface Props {
  readonly documentCount: number;
  readonly totalCount: number;
  readonly isSearching: boolean;
  readonly searchTerm: string;
  readonly viewMode: DocumentViewMode;
  readonly onSearchChange: (value: string) => void;
  readonly onViewModeChange: (mode: DocumentViewMode) => void;
}

interface ViewModeButtonProps {
  readonly mode: DocumentViewMode;
  readonly currentMode: DocumentViewMode;
  readonly icon: string;
  readonly label: string;
  readonly onChange: (mode: DocumentViewMode) => void;
}

function ViewModeButton({
  mode,
  currentMode,
  icon,
  label,
  onChange,
}: ViewModeButtonProps): React.JSX.Element {
  const isActive = mode === currentMode;

  return (
    <button
      type="button"
      aria-label={`Hiển thị dạng ${label.toLowerCase()}`}
      aria-pressed={isActive}
      className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors ${
        isActive
          ? "bg-surface text-primary shadow-sm"
          : "text-on-surface-variant hover:text-on-surface"
      }`}
      onClick={() => onChange(mode)}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      {label}
    </button>
  );
}

export function DocumentCollectionToolbar({
  documentCount,
  totalCount,
  isSearching,
  searchTerm,
  viewMode,
  onSearchChange,
  onViewModeChange,
}: Props): React.JSX.Element {
  return (
    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h2 className="text-lg font-bold text-on-surface">
          Danh sách tài liệu
        </h2>
        <p className="mt-1 text-xs text-on-surface-variant">
          {isSearching
            ? `${documentCount} tài liệu trên trang này`
            : `${totalCount} tài liệu`}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-64">
          <InputField
            placeholder="Tìm kiếm tài liệu..."
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            leftIcon={
              <span className="material-symbols-outlined text-[18px]">
                search
              </span>
            }
          />
        </div>
        <div
          className="inline-flex self-start rounded-xl border border-outline-variant bg-surface-container-low p-1"
          aria-label="Chế độ hiển thị"
        >
          <ViewModeButton
            mode="table"
            currentMode={viewMode}
            icon="table_rows"
            label="Bảng"
            onChange={onViewModeChange}
          />
          <ViewModeButton
            mode="card"
            currentMode={viewMode}
            icon="grid_view"
            label="Thẻ"
            onChange={onViewModeChange}
          />
        </div>
      </div>
    </div>
  );
}

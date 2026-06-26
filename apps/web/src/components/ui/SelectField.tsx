"use client";

/**
 * SelectField
 *
 * Custom dropdown, designed to match the reference UI:
 *  - Trigger: same visual as InputField (rounded-xl, border-outline, py-2 px-3, text-sm)
 *  - Open: border-2 border-primary (same focus ring as InputField)
 *  - Chevron rotates 180° when open
 *  - Dropdown panel: white surface, rounded-xl, shadow, 1px border
 *  - Each option: plain text row, subtle hover, no icons
 *  - Selected option gets a slightly bolder style
 *  - Closes on outside click via useEffect
 */

import { useState, useRef, useEffect, useId } from "react";
import type { FC } from "react";

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export interface SelectFieldProps {
  readonly label?: string;
  readonly placeholder?: string;
  readonly options: readonly (string | SelectOption)[];
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly className?: string;
}

export const SelectField: FC<SelectFieldProps> = ({
  label,
  placeholder = "Chọn...",
  options,
  value,
  onChange,
  disabled = false,
  loading = false,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const labelId = useId();

  const normalizedOptions: readonly SelectOption[] = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );

  const selectedLabel =
    normalizedOptions.find((o) => o.value === value)?.label ?? null;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  const toggle = () => {
    if (!disabled && !loading) setOpen((prev) => !prev);
  };

  const select = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Label */}
      {label && (
        <span
          id={labelId}
          className="mb-1 block text-xs font-medium text-on-surface-variant"
        >
          {label}
        </span>
      )}

      {/* Trigger button */}
      <button
        type="button"
        aria-labelledby={label ? labelId : undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled || loading}
        onClick={toggle}
        className={[
          // Base layout
          "flex w-full items-center justify-between gap-2",
          "rounded-xl bg-surface text-sm",
          "transition-all duration-150 focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Border: thicker + primary when open, same as InputField focus ring
          open
            ? "border-2 border-primary px-[11px] py-[7px]"
            : "border border-outline px-3 py-2",
        ].join(" ")}
      >
        <span
          className={
            selectedLabel ? "text-on-surface" : "text-on-surface-variant/50"
          }
        >
          {loading ? "Đang tải..." : (selectedLabel ?? placeholder)}
        </span>

        {/* Animated chevron */}
        <span
          className={[
            "material-symbols-outlined shrink-0 select-none",
            "text-[18px] text-on-surface-variant/60",
            "transition-transform duration-200",
            open ? "-rotate-180" : "rotate-0",
          ].join(" ")}
          aria-hidden="true"
        >
          expand_more
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <ul
          role="listbox"
          aria-labelledby={label ? labelId : undefined}
          className={[
            "absolute left-0 top-full z-50 mt-1.5 w-full",
            "max-h-56 overflow-y-auto pr-1",
            "rounded-xl border border-outline-variant bg-surface py-1.5 shadow-lg",
            // Custom scrollbar
            "[&::-webkit-scrollbar]:w-1.5",
            "[&::-webkit-scrollbar-track]:bg-transparent",
            "[&::-webkit-scrollbar-thumb]:rounded-full",
            "[&::-webkit-scrollbar-thumb]:bg-outline-variant",
            "hover:[&::-webkit-scrollbar-thumb]:bg-outline-color/50",
          ].join(" ")}
        >
          {normalizedOptions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-on-surface-variant/60">
              Không có dữ liệu
            </p>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => select(opt.value)}
                  className={[
                    "w-[calc(100%-8px)] mx-1 px-3 py-2 text-left text-sm rounded-lg",
                    "transition-colors duration-100",
                    isSelected
                      ? "font-semibold text-primary bg-primary/10"
                      : "text-on-surface hover:bg-surface-container-low",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};

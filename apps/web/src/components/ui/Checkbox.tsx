"use client";

import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "checked" | "onChange" | "style"
> {
  readonly checked: boolean;
  readonly onCheckedChange: (checked: boolean) => void;
}

export function Checkbox({
  checked,
  onCheckedChange,
  className = "",
  ...props
}: CheckboxProps): React.JSX.Element {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onCheckedChange(event.target.checked)}
      className={cn(
        "h-4 w-4 shrink-0 rounded border border-input bg-background text-primary shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

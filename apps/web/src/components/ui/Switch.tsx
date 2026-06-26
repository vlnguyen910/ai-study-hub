"use client";

import type { FC } from "react";

export interface SwitchProps {
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly ariaLabel?: string;
  readonly disabled?: boolean;
}

export const Switch: FC<SwitchProps> = ({
  checked,
  onChange,
  ariaLabel,
  disabled = false,
}) => {
  return (
    <button
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      role="switch"
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-primary" : "bg-surface-variant border border-outline"
      }`}
    >
      <span
        className={`w-4 h-4 rounded-full absolute top-[3px] transition-all ${
          checked ? "bg-surface right-1" : "bg-outline left-1"
        }`}
      />
    </button>
  );
};

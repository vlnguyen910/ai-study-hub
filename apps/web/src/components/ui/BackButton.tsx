"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode, ButtonHTMLAttributes } from "react";

export interface BackButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick" | "className"
> {
  readonly label?: string;
  readonly fallbackHref?: string;
  readonly icon?: ReactNode;
  readonly className?: string;
  readonly mode?: "back" | "home";
  readonly onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export function BackButton({
  label = "Quay lại",
  fallbackHref = "/",
  icon = <span aria-hidden="true">←</span>,
  className = "",
  mode = "back",
  onClick,
  ...props
}: BackButtonProps): React.JSX.Element {
  const router = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (mode === "home") {
      router.push(fallbackHref);
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface ${className}`}
      onClick={handleClick}
      {...(props as any)}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

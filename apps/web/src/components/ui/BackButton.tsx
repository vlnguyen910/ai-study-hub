"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode, ButtonHTMLAttributes } from "react";

export interface BackButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick" | "className" | "style"
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
      className={`inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground ${className}`}
      onClick={handleClick}
      {...(props as any)}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

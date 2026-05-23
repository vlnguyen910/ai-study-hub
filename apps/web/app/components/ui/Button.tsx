"use client";

import type { ReactNode } from "react";

export interface ButtonProps extends Readonly<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> {
  readonly variant?: "primary" | "secondary" | "outline" | "ghost";
  readonly size?: "sm" | "md";
  readonly children: ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-primary text-on-primary transition-opacity hover:opacity-90",
  secondary:
    "border border-outline-variant bg-surface-variant text-on-surface transition-colors hover:bg-surface-dim",
  outline:
    "border border-primary bg-transparent text-primary transition-colors hover:bg-surface-container",
  ghost:
    "bg-transparent text-on-surface-variant transition-colors hover:bg-surface-variant",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-6 py-2 text-body-md",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps): React.JSX.Element {
  return (
    <button
      className={`rounded-xl font-label-md leading-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      type={props.type ?? "button"}
      {...props}
    >
      {children}
    </button>
  );
}

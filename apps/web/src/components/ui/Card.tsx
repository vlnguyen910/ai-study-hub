"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Card({
  className = "",
  children,
}: {
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className = "",
  children,
}: {
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
}: {
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <h2
      className={cn(
        "text-2xl font-bold tracking-tight text-foreground",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function CardDescription({
  className = "",
  children,
}: {
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
  );
}

export function CardContent({
  className = "",
  children,
}: {
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>;
}

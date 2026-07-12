"use client";

import type { ReactElement, ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface CardProps {
  readonly className?: string;
  readonly title?: ReactNode;
  readonly children: ReactNode;
}

export function Card({
  className = "",
  title,
  children,
}: CardProps): ReactElement {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
    >
      {title ? (
        <div className="border-b border-border/70 px-6 py-4">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
        </div>
      ) : null}
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
}): ReactElement {
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
}): ReactElement {
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
}): ReactElement {
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
}): ReactElement {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>;
}

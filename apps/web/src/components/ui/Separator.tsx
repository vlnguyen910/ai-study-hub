"use client";

import type { ReactElement } from "react";

import { cn } from "@/lib/utils";

export interface SeparatorProps {
  readonly className?: string;
}

export function Separator({ className = "" }: SeparatorProps): ReactElement {
  return (
    <div role="separator" className={cn("h-px w-full bg-border", className)} />
  );
}

"use client";

import { cn } from "@/lib/utils";

export interface SeparatorProps {
  readonly className?: string;
}

export function Separator({ className = "" }: SeparatorProps) {
  return (
    <div role="separator" className={cn("h-px w-full bg-border", className)} />
  );
}

import { ModeratorShell } from "@/modules/moderator/components/ModeratorShell";
import type { ReactNode } from "react";

export default function ModeratorLayout({
  children,
}: {
  readonly children: ReactNode;
}): React.JSX.Element {
  return <ModeratorShell>{children}</ModeratorShell>;
}

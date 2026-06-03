import type { ReactNode } from "react";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

export default function ModeratorLayout({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  return <ProtectedRoute requiredRole="moderator">{children}</ProtectedRoute>;
}

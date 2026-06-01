import type { ReactNode } from "react";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
}

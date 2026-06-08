import type { ReactNode } from "react";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

export default function MyDocumentsLayout({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

import { AdminShell } from "@/modules/admin/components/AdminShell";
import type { ReactNode } from "react";

export default function AdminLayout({
  children,
}: {
  readonly children: ReactNode;
}): React.JSX.Element {
  return <AdminShell>{children}</AdminShell>;
}

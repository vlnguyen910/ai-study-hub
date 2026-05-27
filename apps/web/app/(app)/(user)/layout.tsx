import { UserShell } from "@/modules/user/components/UserShell";
import type { ReactNode } from "react";

export default function UserLayout({
  children,
}: {
  readonly children: ReactNode;
}): React.JSX.Element {
  return (
    <UserShell
      title="User Dashboard"
      subtitle="Manage your documents and settings"
    >
      {children}
    </UserShell>
  );
}

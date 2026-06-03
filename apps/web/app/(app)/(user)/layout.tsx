import { UserShell } from "@/modules/user/components/UserShell";
import type { ReactNode } from "react";

export default function UserLayout({
  children,
}: {
  readonly children: ReactNode;
}): React.JSX.Element {
  return (
    <UserShell
      title="Không gian học tập"
      subtitle="Quản lý tài liệu và đóng góp của bạn"
    >
      {children}
    </UserShell>
  );
}

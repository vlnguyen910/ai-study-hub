"use client";

import { usePathname } from "next/navigation";
import { UserShell } from "@/modules/user/components/UserShell";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import type { ReactNode } from "react";

const USER_AREA_ROLES = ["student", "teacher"] as const;

export default function UserLayout({
  children,
}: {
  readonly children: ReactNode;
}): React.JSX.Element {
  const pathname = usePathname();
  const isPublicPath =
    pathname === "/home" || pathname.startsWith("/documents/");

  if (isPublicPath) {
    return (
      <UserShell
        title="Không gian học tập"
        subtitle="Quản lý tài liệu và đóng góp của bạn"
      >
        {children}
      </UserShell>
    );
  }

  return (
    <ProtectedRoute requiredRoles={USER_AREA_ROLES}>
      <UserShell
        title="Không gian học tập"
        subtitle="Quản lý tài liệu và đóng góp của bạn"
      >
        {children}
      </UserShell>
    </ProtectedRoute>
  );
}

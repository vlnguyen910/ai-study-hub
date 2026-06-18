/**
 * ProtectedRoute Component
 * Wrapper component for protecting routes based on authentication and roles
 */

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FC, type ReactNode } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { completeGoogleLoginFromLocation } from "@/modules/google-auth";
import { getAuthSession } from "./guards/auth.guard";
import {
  hasRoleAccess,
  getRoleRedirect,
  type UserRole,
} from "./guards/role.guard";

export interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

type GuardStatus = "checking" | "authorized" | "redirecting";

const GuardFallback = (): React.JSX.Element => (
  <div className="flex min-h-screen items-center justify-center bg-background text-on-surface">
    <div className="flex flex-col items-center gap-3">
      <Spinner />
      <p className="font-label-sm text-label-sm text-on-surface-variant">
        Đang tải...
      </p>
    </div>
  </div>
);

/**
 * Client-side route protection component
 * Usage:
 * <ProtectedRoute requiredRole="admin">
 *   <AdminDashboard />
 * </ProtectedRoute>
 */
export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const router = useRouter();
  const [status, setStatus] = useState<GuardStatus>("checking");

  useEffect(() => {
    setStatus("checking");
    completeGoogleLoginFromLocation();
    const { isAuthenticated: isAuth, user } = getAuthSession();
    const role = (user?.role || "guest") as UserRole;

    // Check authentication
    if (!isAuth) {
      setStatus("redirecting");
      router.replace(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }

    // Check role-based access
    if (
      requiredRole &&
      !hasRoleAccess({
        pathname: window.location.pathname,
        userRole: role,
        requiredRoles: [requiredRole],
      })
    ) {
      setStatus("redirecting");
      router.replace(getRoleRedirect(role));
      return;
    }

    setStatus("authorized");
  }, [requiredRole, router]);

  if (status !== "authorized") {
    return <GuardFallback />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

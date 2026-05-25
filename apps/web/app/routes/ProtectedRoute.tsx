/**
 * ProtectedRoute Component
 * Wrapper component for protecting routes based on authentication and roles
 */

"use client";

import { useRouter } from "next/navigation";
import { useEffect, type FC, type ReactNode } from "react";
import { getAuthToken, getAuthUser } from "./guards/auth.guard";
import {
  hasRoleAccess,
  getRoleRedirect,
  type UserRole,
} from "./guards/role.guard";

export interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

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
  const token = getAuthToken();
  const user = getAuthUser();
  const isAuthenticated = !!token && !!user;
  const userRole = (user?.role || "guest") as UserRole;

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }

    // Check role-based access
    if (
      requiredRole &&
      !hasRoleAccess({
        pathname: window.location.pathname,
        userRole,
        requiredRoles: [requiredRole],
      })
    ) {
      router.push(getRoleRedirect(userRole));
      return;
    }
  }, [isAuthenticated, userRole, requiredRole, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (
    requiredRole &&
    !hasRoleAccess({
      pathname: window.location.pathname,
      userRole,
      requiredRoles: [requiredRole],
    })
  ) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

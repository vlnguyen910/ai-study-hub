/**
 * ProtectedRoute Component
 * Wrapper component for protecting routes based on authentication and roles
 */

"use client";

import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import {
  canAccessRoute,
  getAuthRedirect,
  getAuthToken,
  getAuthUser,
} from "./auth.guard";
import {
  hasRoleAccess,
  getRequiredRoleForRoute,
  getRoleRedirect,
  type UserRole,
} from "./role.guard";

interface ProtectedRouteProps {
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
export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const router = useRouter();
  const token = getAuthToken();
  const user = getAuthUser();
  const isAuthenticated = !!token && !!user;
  const userRole = (user?.role || "guest") as UserRole;

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      router.push(
        `/user/login?redirect=${encodeURIComponent(window.location.pathname)}`,
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
}

export default ProtectedRoute;

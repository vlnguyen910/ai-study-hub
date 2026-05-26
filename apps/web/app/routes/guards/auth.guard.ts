/**
 * Authentication Guard
 * Middleware to protect routes that require authentication
 * Can be used in middleware.ts or as a wrapper component
 */

import { USER_PROTECTED_ROUTES } from "../user/user.routes";
import { AUTH_ROUTES, isAuthRoute } from "../user/user.auth.routes";

export interface GuardContext {
  pathname: string;
  isAuthenticated: boolean;
  userRole?: "guest" | "student" | "teacher" | "moderator" | "admin";
  token?: string;
}

const matchesRouteSegment = (pathname: string, route: string): boolean => {
  return pathname === route || pathname.startsWith(`${route}/`);
};

/**
 * Check if user can access this route
 */
export const canAccessRoute = (context: GuardContext): boolean => {
  const { pathname, isAuthenticated } = context;

  // Protected routes require authentication
  if (
    USER_PROTECTED_ROUTES.some((route) => matchesRouteSegment(pathname, route))
  ) {
    return isAuthenticated;
  }

  // Auth routes should only be accessed by unauthenticated users
  if (isAuthRoute(pathname)) {
    return !isAuthenticated;
  }

  // All other routes are public
  return true;
};

/**
 * Redirect logic for unauthenticated users
 */
export const getAuthRedirect = (
  pathname: string,
  isAuthenticated: boolean,
): string | null => {
  // If trying to access protected route without auth, redirect to login
  if (
    !isAuthenticated &&
    USER_PROTECTED_ROUTES.some((route) => matchesRouteSegment(pathname, route))
  ) {
    return `/login?redirect=${encodeURIComponent(pathname)}`;
  }

  // If authenticated and trying to access auth routes, redirect to home
  if (isAuthenticated && isAuthRoute(pathname)) {
    return "/";
  }

  return null;
};

/**
 * Extract token from localStorage (for client-side)
 */
export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};

/**
 * Extract user from localStorage (for client-side)
 */
export const getAuthUser = () => {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user_info");
  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    // Invalid localStorage payload should not break route guard flow
    localStorage.removeItem("user_info");
    return null;
  }
};

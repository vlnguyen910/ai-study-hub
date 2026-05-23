/**
 * Route configuration for AI Study Hub
 * All routes organized by section for easy management
 */

export const ROUTE_PATHS = {
  // ========== PUBLIC ROUTES (Any user can access) ==========
  HOME: "/",
  LIBRARY: "/library",
  LIBRARY_DETAIL: "/library/:id",
  ABOUT: "/about",
  TERMS: "/terms",
  PRIVACY: "/privacy",

  // ========== AUTH ROUTES (For unauthenticated users) ==========
  AUTH: "/user",
  AUTH_ROUTES: {
    LOGIN: "/user/login",
    REGISTER: "/user/register",
    FORGOT_PASSWORD: "/user/forgot-password",
    RESET_PASSWORD: "/user/reset-password/:token",
    VERIFY_EMAIL: "/user/verify-email/:token",
  },

  // ========== PROTECTED ROUTES (Require authentication) ==========
  PROTECTED: "/dashboard",
  PROTECTED_ROUTES: {
    DASHBOARD: "/dashboard",
    PROFILE: "/profile",
    SETTINGS: "/settings",
    FAVORITES: "/favorites",
    MY_DOCUMENTS: "/my-documents",
    MY_UPLOADS: "/my-uploads",
    CHANGE_PASSWORD: "/settings/change-password",
  },

  // ========== ADMIN ROUTES (Require admin role) ==========
  ADMIN: "/admin",
  ADMIN_ROUTES: {
    DASHBOARD: "/admin",
    USERS: "/admin/users",
    DOCUMENTS: "/admin/documents",
    CATEGORIES: "/admin/categories",
    REPORTS: "/admin/reports",
    SETTINGS: "/admin/settings",
  },
} as const;

/**
 * Get route with optional parameters
 * @example getRoutePath(ROUTE_PATHS.AUTH_ROUTES.VERIFY_EMAIL, { token: 'abc123' })
 * @example getRoutePath(ROUTE_PATHS.LIBRARY_DETAIL, { id: '456' })
 */
export const getRoutePath = (
  path: string,
  params?: Record<string, string | number>,
): string => {
  let result = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      result = result.replace(`:${key}`, String(value));
    });
  }
  return result;
};

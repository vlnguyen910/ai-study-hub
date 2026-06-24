/**
 * API Endpoints Constants
 * Tập trung tất cả các URL endpoint dùng trong toàn bộ ứng dụng
 */

export const API_ENDPOINTS = {
  SETTINGS: "/api/v1/settings",
  AUTH: {
    LOGIN: "/api/v1/auth/signin",
    GOOGLE: "/api/v1/auth/google",
    REGISTER: "/api/v1/auth/signup",
    RESEND_VERIFICATION_EMAIL: "/api/v1/auth/resend-verification-email",
    VERIFY_EMAIL: "/api/v1/auth/verify-email",
    LOGOUT: "/api/v1/auth/logout",
    REFRESH: "/api/v1/auth/refresh",
    ME: "/api/v1/auth/me",
    CHANGE_PASSWORD: "/api/v1/auth/change-password",
  },
  ACCOUNTS: {
    BASE: "/api/v1/accounts",
    DETAIL: (id: string) => `/api/v1/accounts/${id}`,
    BAN: (id: string) => `/api/v1/accounts/${id}/ban`,
  },
  ADMIN: {
    DASHBOARD: "/api/v1/admin/dashboard",
    SETTINGS: {
      BASE: "/api/v1/admin/settings",
      GENERAL: "/api/v1/admin/settings/general",
      UPLOAD: "/api/v1/admin/settings/upload",
      DOCUMENT_VISIBILITY: "/api/v1/admin/settings/document-visibility",
      AI: "/api/v1/admin/settings/ai",
      MODERATION: "/api/v1/admin/settings/moderation",
      ACCOUNT: "/api/v1/admin/settings/account",
      MOBILE: "/api/v1/admin/settings/mobile",
    },
  },
  DOCUMENTS: {
    BASE: "/api/v1/documents",
    DETAIL: (id: string) => `/api/v1/documents/${id}`,
    APPROVE: (id: string) => `/api/v1/documents/${id}/approve`,
    REJECT: (id: string) => `/api/v1/documents/${id}/reject`,
  },
  COLLECTIONS: {
    BASE: "/api/v1/collections",
    DETAIL: (id: string) => `/api/v1/collections/${id}`,
    DOCUMENTS: (id: string) => `/api/v1/collections/${id}/documents`,
    DOCUMENT: (id: string, documentId: string) =>
      `/api/v1/collections/${id}/documents/${documentId}`,
  },
  SUBJECTS: {
    BASE: "/api/v1/subjects",
    DETAIL: (id: string) => `/api/v1/subjects/${id}`,
  },
} as const;

export const DEFAULT_AVATAR_URL =
  "https://res.cloudinary.com/ddxstobvd/image/upload/v1/default-avatar";

export const isDefaultAvatar = (url?: string | null): boolean => {
  return !url || url === DEFAULT_AVATAR_URL;
};

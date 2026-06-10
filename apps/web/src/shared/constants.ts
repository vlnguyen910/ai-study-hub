/**
 * API Endpoints Constants
 * Tập trung tất cả các URL endpoint dùng trong toàn bộ ứng dụng
 */

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/v1/auth/signin",
    REGISTER: "/api/v1/auth/signup",
    RESEND_VERIFICATION_EMAIL: "/api/v1/auth/resend-verification-email",
    VERIFY_EMAIL: "/api/v1/auth/verify-email",
    LOGOUT: "/api/v1/auth/logout",
    REFRESH: "/api/v1/auth/refresh",
    ME: "/api/v1/auth/me",
  },
  ACCOUNTS: {
    BASE: "/api/v1/accounts",
    DETAIL: (id: string) => `/api/v1/accounts/${id}`,
    BAN: (id: string) => `/api/v1/accounts/${id}/ban`,
  },
  DOCUMENTS: {
    BASE: "/api/v1/documents",
    DETAIL: (id: string) => `/api/v1/documents/${id}`,
    APPROVE: (id: string) => `/api/v1/documents/${id}/approve`,
    REJECT: (id: string) => `/api/v1/documents/${id}/reject`,
  },
  SUBJECTS: {
    BASE: "/api/v1/subjects",
    DETAIL: (id: string) => `/api/v1/subjects/${id}`,
  },
} as const;

/**
 * API Endpoints Constants
 * Tập trung tất cả các URL endpoint dùng trong toàn bộ ứng dụng
 */

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
  },
  ACCOUNTS: {
    BASE: "/accounts",
    DETAIL: (id: string) => `/accounts/${id}`,
  },
  DOCUMENTS: {
    BASE: "/documents",
    DETAIL: (id: string) => `/documents/${id}`,
    APPROVE: (id: string) => `/documents/${id}/approve`,
    REJECT: (id: string) => `/documents/${id}/reject`,
  },
} as const;

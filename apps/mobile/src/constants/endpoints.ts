export const API_ENDPOINTS = {
  AUTH: {
    MOBILE_SIGN_IN: "/api/v1/auth/mobile-signin",
    GOOGLE_MOBILE_SIGN_IN: "/api/v1/auth/google/mobile",
    SIGN_UP: "/api/v1/auth/signup",
    VERIFY_EMAIL: "/api/v1/auth/verify-email",
    RESEND_VERIFICATION_EMAIL: "/api/v1/auth/resend-verification-email",
    FORGOT_PASSWORD: "/api/v1/auth/forgot-password",
    RESET_PASSWORD: "/api/v1/auth/reset-password",
    REFRESH: "/api/v1/auth/refresh",
    LOGOUT: "/api/v1/auth/logout",
  },
  DOCUMENTS: {
    BASE: "/api/v1/documents",
    MINE: "/api/v1/documents/me",
    DETAIL: (id: string) => `/api/v1/documents/${id}`,
    APPROVE: (id: string) => `/api/v1/documents/${id}/approve`,
    REJECT: (id: string) => `/api/v1/documents/${id}/reject`,
    GENERATE_DESCRIPTION_FROM_URL:
      "/api/v1/documents/generate-description-from-url",
    GENERATE_SUMMARY: (id: string) =>
      `/api/v1/documents/${id}/generate-summary`,
    MODERATOR_ANALYSIS: (id: string) =>
      `/api/v1/documents/${id}/moderator-analysis`,
  },
  COLLECTIONS: {
    BASE: "/api/v1/collections",
    DETAIL: (id: string) => `/api/v1/collections/${id}`,
    DOCUMENTS: (id: string) => `/api/v1/collections/${id}/documents`,
    DOCUMENT: (id: string, documentId: string) =>
      `/api/v1/collections/${id}/documents/${documentId}`,
    DOCUMENT_STATUS: (documentId: string) =>
      `/api/v1/collections/documents/${documentId}/status`,
  },
  SUBJECTS: {
    BASE: "/api/v1/subjects",
    DETAIL: (id: string) => `/api/v1/subjects/${id}`,
  },
  ACCOUNTS: {
    ME: "/api/v1/accounts/me",
    DETAIL: (id: string) => `/api/v1/accounts/${id}`,
  },
};

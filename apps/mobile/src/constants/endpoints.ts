export const API_ENDPOINTS = {
  AUTH: {
    MOBILE_SIGN_IN: "/api/v1/auth/mobile-signin",
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
  },
};

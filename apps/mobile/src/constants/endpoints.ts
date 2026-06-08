export const API_ENDPOINTS = {
  AUTH: {
    MOBILE_SIGN_IN: "/api/v1/auth/mobile-signin",
    SIGN_UP: "/api/v1/auth/signup",
    FORGOT_PASSWORD: "/api/v1/auth/forgot-password",
  },
  DOCUMENTS: {
    BASE: "/api/v1/documents",
    MINE: "/api/v1/documents/me",
    DETAIL: (id: string) => `/api/v1/documents/${id}`,
  },
};

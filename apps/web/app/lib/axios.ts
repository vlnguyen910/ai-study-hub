import axios from "axios";
import { APP_CONFIG } from "@/config";
import { API_ENDPOINTS } from "@/shared/constants";
import { useAuthStore } from "@/stores/auth/store";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipToast?: boolean;
    _retry?: boolean;
  }
}

export const apiClient = axios.create({
  baseURL: APP_CONFIG.api.baseUrl,
  timeout: APP_CONFIG.api.timeout,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ✅ Thay thế window.location.href = "/login"
const handleLogoutAndShowLogin = () => {
  const store = useAuthStore.getState();
  store.logout();
  store.setLoginPromptOpen(true);
};

let refreshTokenPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const { refreshToken } = useAuthStore.getState();

  if (!refreshToken) return null;

  if (!refreshTokenPromise) {
    refreshTokenPromise = apiClient
      .post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken }, { skipToast: true })
      .then((response) => {
        // ✅ FIX: interceptor đã unwrap response.data rồi
        // response ở đây là plain object, không còn là AxiosResponse
        const data = response as unknown as { accessToken?: unknown };

        if (!data || typeof data.accessToken !== "string") return null;

        return data.accessToken;
      })
      .finally(() => {
        refreshTokenPromise = null;
      });
  }

  return refreshTokenPromise;
};

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  const isAuthRequest = config.url?.includes("/auth/");

  if (token && !isAuthRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    return response.data?.data !== undefined
      ? response.data.data
      : response.data;
  },
  async (error) => {
    const originalRequest = error.config ?? {};
    const is401 = error.response?.status === 401;
    const isAuthRequest = originalRequest.url?.includes("/auth/");

    if (axios.isCancel(error)) return Promise.reject(error);
    if (originalRequest.skipToast) return Promise.reject(error);

    // 401 từ auth endpoint (login sai, v.v.) → logout + mở modal
    if (is401 && isAuthRequest) {
      handleLogoutAndShowLogin();
      return Promise.reject(error);
    }

    // 401 từ request thường → thử refresh token trước
    if (is401 && !isAuthRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const accessToken = await refreshAccessToken();

        if (!accessToken) throw new Error("Failed to refresh access token.");

        useAuthStore.getState().setAccessToken(accessToken);
        return apiClient(originalRequest);
      } catch {
        handleLogoutAndShowLogin();
        return Promise.reject(error);
      }
    }

    if (is401 && !isAuthRequest) {
      handleLogoutAndShowLogin();
    }

    return Promise.reject(error);
  },
);

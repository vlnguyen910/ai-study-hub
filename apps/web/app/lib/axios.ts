import axios from "axios";

import { APP_CONFIG } from "@/config";
import { useAuthStore } from "@/stores/auth/store";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipToast?: boolean;
  }
}

export const apiClient = axios.create({
  baseURL: APP_CONFIG.api.baseUrl,
  timeout: APP_CONFIG.api.timeout,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

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
  (error) => {
    const originalRequest = error.config ?? {};
    const is401 = error.response?.status === 401;
    const isAuthRequest = originalRequest.url?.includes("/auth/");

    if (is401 && !isAuthRequest) {
      useAuthStore.getState().logout();

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (originalRequest.skipToast) {
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

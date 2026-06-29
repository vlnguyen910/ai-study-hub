import axios, { type AxiosInstance } from "axios";
import { API_ENDPOINTS } from "../constants/endpoints";
import {
  getAccessToken,
  getRefreshToken,
  removeTokens,
  saveAccessToken,
} from "../utils/storage";

export const getApiBaseUrl = (): string => {
  return process.env.EXPO_PUBLIC_API_URL ?? "";
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const installAuthInterceptors = (client: AxiosInstance): void => {
  client.interceptors.request.use(
    async (config) => {
      const token = await getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      console.log(
        `[API Client] Connecting to: ${config.method?.toUpperCase()} ${config.baseURL || ""}${config.url}`,
      );
      return config;
    },
    (error) => {
      console.error(`[API Client] Request Error:`, error);
      return Promise.reject(error);
    },
  );

  client.interceptors.response.use(
    (response) => {
      console.log(
        `[API Client] Connection Success: ${response.config.method?.toUpperCase()} ${response.config.baseURL || ""}${response.config.url} - Status: ${response.status}`,
      );
      return response;
    },
    async (error) => {
      console.error(
        `[API Client] Connection Failure: ${error.config?.method?.toUpperCase()} ${error.config?.baseURL || ""}${error.config?.url} - Error: ${error.message}`,
      );
      if (!axios.isAxiosError(error)) {
        return Promise.reject(error);
      }

      const originalRequest = error.config;
      const is401 = error.response?.status === 401;
      const isRefreshRequest = originalRequest?.url?.includes(
        API_ENDPOINTS.AUTH.REFRESH,
      );

      if (!originalRequest || !is401 || isRefreshRequest) {
        return Promise.reject(error);
      }

      const requestWithRetry = originalRequest as typeof originalRequest & {
        _retry?: boolean;
      };

      if (requestWithRetry._retry) {
        return Promise.reject(error);
      }

      requestWithRetry._retry = true;

      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        await removeTokens();
        return Promise.reject(error);
      }

      try {
        const response = await client.post(API_ENDPOINTS.AUTH.REFRESH, {
          refreshToken,
        });
        const accessToken = response.data?.data?.accessToken;

        if (typeof accessToken !== "string" || accessToken.length === 0) {
          throw new Error("Refresh response did not include an access token.");
        }

        await saveAccessToken(accessToken);

        if (requestWithRetry.headers) {
          requestWithRetry.headers.Authorization = `Bearer ${accessToken}`;
        }

        return client(requestWithRetry);
      } catch (refreshError) {
        await removeTokens();
        return Promise.reject(refreshError);
      }
    },
  );
};

installAuthInterceptors(apiClient);

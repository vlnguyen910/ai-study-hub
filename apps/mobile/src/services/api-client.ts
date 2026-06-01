import axios, { type AxiosInstance } from "axios";
import { getAccessToken } from "../utils/storage";

const DEFAULT_API_BASE_URL = "http://localhost:8081";

export const getApiBaseUrl = (): string => {
  return process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL;
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor to inject Access Token into every request
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

import axios, { type AxiosInstance } from "axios";

const DEFAULT_API_BASE_URL = "http://localhost:8080";

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

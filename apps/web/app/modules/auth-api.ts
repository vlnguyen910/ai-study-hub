import axios from "axios";
import { APP_CONFIG } from "@/config";

type ApiEnvelope<T> = {
  success?: boolean;
  statusCode?: number;
  status_code?: number;
  message?: string;
  data?: T;
};

const client = axios.create({
  baseURL: APP_CONFIG.api.baseUrl,
  timeout: APP_CONFIG.api.timeout,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const unwrap = <T>(response: { data: ApiEnvelope<T> | T }): ApiEnvelope<T> => {
  const data = response.data as ApiEnvelope<T>;

  return data && typeof data === "object" && "data" in data
    ? data
    : { data: response.data as T };
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
};

export const signup = async (payload: {
  name: string;
  email: string;
  password: string;
}) => {
  try {
    return unwrap<null>(await client.post("/api/v1/auth/signup", payload));
  } catch (error) {
    throw new Error(getErrorMessage(error, "Registration failed"));
  }
};

export const signin = async (payload: {
  email: string;
  password: string;
  deviceId: string;
}) => {
  try {
    return unwrap<{ refreshToken?: string }>(
      await client.post("/api/v1/auth/signin", payload),
    );
  } catch (error) {
    throw new Error(getErrorMessage(error, "Login failed"));
  }
};

export const verifyEmail = async (payload: { token: string }) => {
  try {
    return unwrap<null>(
      await client.post("/api/v1/auth/verify-email", payload),
    );
  } catch (error) {
    throw new Error(getErrorMessage(error, "Email verification failed"));
  }
};

export const resendVerificationEmail = async () => {
  try {
    return unwrap<null>(
      await client.post("/api/v1/auth/resend-verification-email"),
    );
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not resend verification email"),
    );
  }
};

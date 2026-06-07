import axios, { type AxiosInstance } from "axios";
import { apiClient } from "@/services";
import type {
  AuthResponse,
  ForgotPasswordPayload,
  SignInPayload,
  SignUpPayload,
  VerifyEmailPayload,
} from "../types/auth.types";
import { API_ENDPOINTS } from "../../../constants/endpoints";

export class AuthServiceError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AuthServiceError";
    this.status = status;
  }
}

export type ApiClient = Pick<AxiosInstance, "post">;

export const signInService = async (
  payload: SignInPayload,
  client: ApiClient = apiClient,
): Promise<AuthResponse> => {
  try {
    const response = await client.post<AuthResponse>(
      API_ENDPOINTS.AUTH.MOBILE_SIGN_IN,
      payload,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "❌ [signInService] Lỗi từ API:",
        error.response?.data || error.message,
      );
      throw new AuthServiceError(
        error.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.",
        error.response?.status,
      );
    }

    if (error instanceof Error) {
      throw new AuthServiceError(error.message);
    }

    throw new AuthServiceError("Không thể kết nối đến máy chủ");
  }
};

export const signUpService = async (
  payload: SignUpPayload,
  client: ApiClient = apiClient,
): Promise<AuthResponse> => {
  try {
    const response = await client.post<AuthResponse>(
      API_ENDPOINTS.AUTH.SIGN_UP,
      payload,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new AuthServiceError(
        error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.",
        error.response?.status,
      );
    }

    if (error instanceof Error) {
      throw new AuthServiceError(error.message);
    }

    throw new AuthServiceError("Không thể kết nối đến máy chủ");
  }
};

export const verifyEmailService = async (
  payload: VerifyEmailPayload,
  client: ApiClient = apiClient,
): Promise<AuthResponse> => {
  try {
    const response = await client.post<AuthResponse>(
      "/api/v1/auth/verify-email",
      payload,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new AuthServiceError(
        error.response?.data?.message || "Xác thực email thất bại.",
        error.response?.status,
      );
    }

    if (error instanceof Error) {
      throw new AuthServiceError(error.message);
    }

    throw new AuthServiceError("Không thể kết nối đến máy chủ");
  }
};

export const resendVerificationEmailService = async (
  client: ApiClient = apiClient,
): Promise<AuthResponse> => {
  try {
    const response = await client.post<AuthResponse>(
      "/api/v1/auth/resend-verification-email",
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new AuthServiceError(
        error.response?.data?.message || "Không thể gửi lại mã xác thực.",
        error.response?.status,
      );
    }

    if (error instanceof Error) {
      throw new AuthServiceError(error.message);
    }

    throw new AuthServiceError("Không thể kết nối đến máy chủ");
  }
};

export const forgotPasswordService = async (
  payload: ForgotPasswordPayload,
  client: ApiClient = apiClient,
): Promise<AuthResponse> => {
  try {
    const response = await client.post<AuthResponse>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      payload,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new AuthServiceError(
        error.response?.data?.message ||
          "Không thể gửi liên kết đặt lại mật khẩu.",
        error.response?.status,
      );
    }

    if (error instanceof Error) {
      throw new AuthServiceError(error.message);
    }

    throw new AuthServiceError("Không thể kết nối đến máy chủ");
  }
};

export interface SignInPayload {
  email: string;
  password: string;
  deviceId: string;
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: AuthResponseData | null;
}

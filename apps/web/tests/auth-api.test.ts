import { beforeEach, describe, expect, it, vi } from "vitest";

const clientMock = vi.hoisted(() => ({
  post: vi.fn(),
}));

const apiClientMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => clientMock),
    isAxiosError: vi.fn(() => false),
  },
}));

vi.mock("../src/lib/axios", () => ({
  apiClient: apiClientMock,
}));

import {
  forgotPassword,
  logoutCurrentSession,
  resendVerificationEmail,
  resetPassword,
  verifyEmail,
} from "../src/modules/auth-api";

describe("web auth api helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clientMock.post.mockResolvedValue({
      data: { message: "ok", data: null },
    });
  });

  it("posts verification tokens as a token payload", async () => {
    await expect(verifyEmail({ token: "verify-token" })).resolves.toEqual({
      data: null,
      message: "ok",
    });

    expect(clientMock.post).toHaveBeenCalledWith("/api/v1/auth/verify-email", {
      token: "verify-token",
    });
  });

  it("resends verification email without an email payload", async () => {
    await resendVerificationEmail();

    expect(clientMock.post).toHaveBeenCalledWith(
      "/api/v1/auth/resend-verification-email",
    );
  });

  it("posts forgot and reset password payloads to auth endpoints", async () => {
    await forgotPassword({ email: "student@example.com" });
    await resetPassword({ token: "reset-token", password: "Password123!" });

    expect(clientMock.post).toHaveBeenCalledWith(
      "/api/v1/auth/forgot-password",
      { email: "student@example.com" },
    );
    expect(clientMock.post).toHaveBeenCalledWith(
      "/api/v1/auth/reset-password",
      { token: "reset-token", password: "Password123!" },
    );
  });

  it("revokes the current web session through the shared api client", async () => {
    apiClientMock.post.mockResolvedValue({ data: null });

    await logoutCurrentSession();

    expect(apiClientMock.post).toHaveBeenCalledWith(
      "/api/v1/auth/logout",
      null,
      { skipToast: true },
    );
  });

  it("does not throw when logout revocation fails", async () => {
    apiClientMock.post.mockRejectedValue(new Error("Session expired"));

    await expect(logoutCurrentSession()).resolves.toBeUndefined();
  });
});

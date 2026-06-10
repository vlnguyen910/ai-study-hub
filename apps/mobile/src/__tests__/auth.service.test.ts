import {
  forgotPasswordService,
  refreshTokenService,
  resendVerificationEmailService,
  resetPasswordService,
  signInService,
  signUpService,
  verifyEmailService,
  type ApiClient,
} from "@/features/auth/services/auth.service";

const createClientMock = (): jest.Mocked<ApiClient> => ({
  post: jest.fn(),
});

describe("auth.service", () => {
  it("signs in through the mobile endpoint", async () => {
    const client = createClientMock();
    const response = {
      message: "Signed in",
      data: { accessToken: "access", refreshToken: "refresh" },
    };
    client.post.mockResolvedValue({ data: response });

    await expect(
      signInService(
        {
          email: "student@example.com",
          password: "Password123!",
          deviceId: "device-1",
        },
        client,
      ),
    ).resolves.toBe(response);

    expect(client.post).toHaveBeenCalledWith("/api/v1/auth/mobile-signin", {
      email: "student@example.com",
      password: "Password123!",
      deviceId: "device-1",
    });
  });

  it("uses current auth endpoints for signup, verify, resend, forgot, reset and refresh", async () => {
    const client = createClientMock();
    const response = { message: "ok", data: null };
    client.post.mockResolvedValue({ data: response });

    await signUpService(
      {
        name: "Nguyen Student",
        email: "student@example.com",
        password: "Password123!",
      },
      client,
    );
    await verifyEmailService({ token: "verify-token" }, client);
    await resendVerificationEmailService(client);
    await forgotPasswordService({ email: "student@example.com" }, client);
    await resetPasswordService(
      { token: "reset-token", password: "Password123!" },
      client,
    );
    await refreshTokenService({ refreshToken: "refresh-token" }, client);

    expect(client.post).toHaveBeenCalledWith("/api/v1/auth/signup", {
      name: "Nguyen Student",
      email: "student@example.com",
      password: "Password123!",
    });
    expect(client.post).toHaveBeenCalledWith("/api/v1/auth/verify-email", {
      token: "verify-token",
    });
    expect(client.post).toHaveBeenCalledWith(
      "/api/v1/auth/resend-verification-email",
    );
    expect(client.post).toHaveBeenCalledWith("/api/v1/auth/forgot-password", {
      email: "student@example.com",
    });
    expect(client.post).toHaveBeenCalledWith("/api/v1/auth/reset-password", {
      token: "reset-token",
      password: "Password123!",
    });
    expect(client.post).toHaveBeenCalledWith("/api/v1/auth/refresh", {
      refreshToken: "refresh-token",
    });
  });
});

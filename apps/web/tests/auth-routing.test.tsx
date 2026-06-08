import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ForgotPasswordPage from "../app/modules/forgot-password/page";
import ResetPasswordPage from "../app/modules/reset-password/page";
import LoginPage from "../app/login/page";
import RegisterPage from "../app/register/page";
import { UserShell } from "../app/modules/user/components/UserShell";
import { useAuthStore } from "../app/stores/auth/store";
import VerifyEmailPendingPage from "../app/verify-email-pending/page";
import VerifyEmailPage from "../app/verify-email/[token]/page";
import { navigationMocks } from "./setup";

const apiClientMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock("@/lib/axios", () => ({
  apiClient: apiClientMock,
}));

const makeRefreshToken = () => {
  const payload = Buffer.from(
    JSON.stringify({
      sub: "user-1",
      role: "USER",
      status: "ACTIVE",
      type: "refreshToken",
      deviceId: "device-1",
    }),
  ).toString("base64url");

  return `header.${payload}.signature`;
};

describe("web auth routing", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().logout();
    vi.clearAllMocks();
    navigationMocks.pathname.mockReturnValue("/");
    navigationMocks.searchParams.mockReturnValue(new URLSearchParams());
    navigationMocks.params.mockReturnValue({});
    apiClientMock.get.mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      name: "Nguyen Student",
      avatarUrl: "",
      role: "USER",
      status: "ACTIVE",
      createdAt: "2026-06-08T00:00:00.000Z",
    });
  });

  it("redirects to /home after successful login by default", async () => {
    apiClientMock.post.mockResolvedValue({ refreshToken: makeRefreshToken() });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "student@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "Password123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() => {
      expect(navigationMocks.router.replace).toHaveBeenCalledWith("/home");
    });
  });

  it("redirects to a safe redirect query after successful login", async () => {
    navigationMocks.searchParams.mockReturnValue(
      new URLSearchParams("redirect=/uploads"),
    );
    apiClientMock.post.mockResolvedValue({ refreshToken: makeRefreshToken() });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "student@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "Password123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() => {
      expect(navigationMocks.router.replace).toHaveBeenCalledWith("/uploads");
    });
  });

  it("submits register without confirmPassword and redirects to verify pending", async () => {
    apiClientMock.post.mockResolvedValue({ data: null });

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("Họ tên"), {
      target: { value: "Nguyen Student" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "student@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByLabelText("Xác nhận mật khẩu"), {
      target: { value: "Password123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Đăng ký" }));

    await waitFor(() => {
      expect(apiClientMock.post).toHaveBeenCalledWith(
        "/api/v1/auth/signup",
        expect.objectContaining({
          name: "Nguyen Student",
          email: "student@example.com",
          password: "Password123!",
          deviceId: expect.any(String),
        }),
      );
      expect(navigationMocks.router.push).toHaveBeenCalledWith(
        "/verify-email-pending",
      );
    });

    expect(apiClientMock.post.mock.calls[0][1]).not.toHaveProperty(
      "confirmPassword",
    );
  });

  it("hydrates and displays the current user in the shared sidebar", async () => {
    useAuthStore.getState().setAuth(null, "student", undefined, "refresh");

    render(
      <UserShell title="Không gian học tập" subtitle="Quản lý tài liệu">
        <div>Content</div>
      </UserShell>,
    );

    expect(await screen.findByText("Nguyen Student")).toBeInTheDocument();
    expect(apiClientMock.get).toHaveBeenCalledWith("/api/v1/auth/me", {
      skipToast: true,
    });
  });

  it("logs out from the shared sidebar and redirects to /login", async () => {
    useAuthStore.getState().setAuth(
      null,
      "student",
      {
        id: "user-1",
        email: "student@example.com",
        name: "Nguyen Student",
        role: "student",
        createdAt: new Date("2026-06-08T00:00:00.000Z"),
      },
      "refresh",
    );
    apiClientMock.post.mockResolvedValue({ data: null });

    render(
      <UserShell title="Không gian học tập" subtitle="Quản lý tài liệu">
        <div>Content</div>
      </UserShell>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Đăng xuất/i }));

    await waitFor(() => {
      expect(apiClientMock.post).toHaveBeenCalledWith(
        "/api/v1/auth/logout",
        null,
        { skipToast: true },
      );
      expect(navigationMocks.router.replace).toHaveBeenCalledWith("/login");
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("renders back buttons on auth pages", async () => {
    apiClientMock.post.mockResolvedValue({ refreshToken: makeRefreshToken() });
    apiClientMock.get.mockResolvedValue({ data: null });

    const pages = [
      <LoginPage key="login" />,
      <RegisterPage key="register" />,
      <ForgotPasswordPage key="forgot" />,
      <ResetPasswordPage key="reset" />,
      <VerifyEmailPendingPage key="pending" />,
      <VerifyEmailPage
        key="verify"
        params={Promise.reject(new Error("Invalid token"))}
      />,
    ];

    for (const page of pages) {
      const { unmount } = render(page);
      expect(
        screen.getByRole("button", { name: /Quay lại/i }),
      ).toBeInTheDocument();
      unmount();
    }
  });
});

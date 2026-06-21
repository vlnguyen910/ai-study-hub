"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { buildUserFromAccessToken, extractAccessToken } from "@/lib/auth";
import { apiClient } from "@/lib/axios";
import {
  buildGoogleLoginUrl,
  markGoogleOauthPending,
} from "@/modules/google-auth";
import { ROUTE_PATHS } from "@/routes/router.const";
import { API_ENDPOINTS } from "@/shared/constants";
import { useAuthStore } from "@/stores/auth/store";
import { getOrCreateDeviceId } from "@/utils";
import { getErrorMessage } from "@/utils/error";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onOpenRegister,
}: LoginModalProps): ReactElement | null {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const resetForm = () => {
    setFormData({ email: "", password: "" });
    setErrors({ email: "", password: "", general: "" });
    setShowPassword(false);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [id]: "", general: "" }));
    }
  };

  const validate = () => {
    let isValid = true;
    const newErrors = { email: "", password: "", general: "" };

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isLoading) return;

    setIsLoading(true);
    try {
      const deviceId = getOrCreateDeviceId();

      const data = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: formData.email,
        password: formData.password,
        deviceId,
      });

      const accessToken = extractAccessToken(data);
      const user = buildUserFromAccessToken(accessToken ?? undefined, {
        email: formData.email,
      });

      if (!accessToken || !user) {
        // Logged for debugging — never shown to the user as-is.
        console.error(
          "Login response missing access token or invalid payload:",
          data,
        );
        setErrors((prev) => ({
          ...prev,
          general: "Đăng nhập thất bại. Vui lòng thử lại.",
        }));
        return;
      }

      setAuth(accessToken, user.role, user, null);
      resetForm();
      onClose();
      router.push(ROUTE_PATHS.PROTECTED_ROUTES.HOME);
    } catch (error: unknown) {
      // Logged for debugging — the user only ever sees a mapped message.
      console.error("Login failed:", error);
      setErrors((prev) => ({
        ...prev,
        general: getErrorMessage(error, {
          401: "Email hoặc mật khẩu không đúng.",
        }),
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      resetForm();
      onClose();
    }
  };

  const handleGoogleSignin = () => {
    const deviceId = getOrCreateDeviceId();
    const oauthState = markGoogleOauthPending();

    window.location.href = buildGoogleLoginUrl({
      deviceId,
      oauthState,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 px-4 py-8 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="flex min-h-full items-center justify-center">
        <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-8 text-card-foreground shadow-2xl shadow-black/20">
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            aria-label="Close login modal"
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="mb-6 flex items-center justify-center gap-2 text-2xl font-bold text-primary">
            AI Study Hub
          </div>

          <h1 className="mb-2 text-center text-2xl font-bold text-foreground">
            Welcome back
          </h1>
          <p className="mb-8 text-center text-sm text-muted-foreground">
            Please login to continue learning and sharing.
          </p>

          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit}
            noValidate
          >
            {errors.general && (
              <div className="rounded-lg border border-error/30 bg-error-container p-3 text-sm text-error">
                {errors.general}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-bold text-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className={`h-12 w-full rounded border px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:bg-background ${errors.email ? "border-error" : "border-border bg-background"}`}
                placeholder="example@academic.edu"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <span className="mt-1 text-xs text-error">{errors.email}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <label
                  htmlFor="password"
                  className="text-sm font-bold text-foreground"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`h-12 w-full rounded border px-4 pr-12 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:bg-background ${errors.password ? "border-error" : "border-border bg-background"}`}
                  placeholder="••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? "👁" : "🙈"}
                </button>
              </div>
              {errors.password && (
                <span className="mt-1 text-xs text-error">
                  {errors.password}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-full bg-primary text-base font-bold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold text-muted-foreground">
              or
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignin}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border bg-background text-sm font-bold text-foreground transition-colors hover:bg-muted"
          >
            <span className="font-bold text-[#EA4335]">G</span>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <button
              onClick={() => {
                resetForm();
                onClose();
                onOpenRegister();
              }}
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

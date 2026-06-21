"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/axios";
import { ROUTE_PATHS } from "@/routes/router.const";
import { API_ENDPOINTS } from "@/shared/constants";
import { getOrCreateDeviceId } from "@/utils";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export default function RegisterModal({
  isOpen,
  onClose,
  onOpenLogin,
}: RegisterModalProps): ReactElement | null {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    general: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    setErrors({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      general: "",
    });
    setIsLoading(false);
  };

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
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      general: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
      isValid = false;
    }
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
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      const name = formData.name.trim();
      const email = formData.email.trim();

      await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
        name,
        email,
        password: formData.password,
        deviceId,
      });

      resetForm();
      onClose();
      router.replace(ROUTE_PATHS.AUTH_ROUTES.LOGIN);
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      setErrors((prev) => ({
        ...prev,
        general:
          axiosError?.response?.data?.message ??
          (error instanceof Error
            ? error.message
            : "Đăng ký thất bại. Vui lòng thử lại."),
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
            aria-label="Close register modal"
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
            Create Account
          </h1>
          <p className="mb-8 text-center text-sm text-muted-foreground">
            Join our community to start learning and sharing.
          </p>

          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
            noValidate
          >
            {errors.general && (
              <div className="rounded-lg border border-error/30 bg-error-container p-3 text-sm text-error">
                {errors.general}
              </div>
            )}

            {(["name", "email", "password", "confirmPassword"] as const).map(
              (field) => (
                <div key={field} className="flex flex-col gap-2">
                  <label
                    htmlFor={field}
                    className="text-sm font-bold text-foreground"
                  >
                    {field === "name"
                      ? "Full Name"
                      : field === "confirmPassword"
                        ? "Confirm Password"
                        : field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    id={field}
                    type={
                      field.toLowerCase().includes("password")
                        ? "password"
                        : field === "email"
                          ? "email"
                          : "text"
                    }
                    className={`h-12 w-full rounded border px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:bg-background ${errors[field] ? "border-error" : "border-border bg-background"}`}
                    placeholder={
                      field === "email" ? "example@academic.edu" : "••••••••"
                    }
                    value={formData[field]}
                    onChange={handleChange}
                  />
                  {errors[field] && (
                    <span className="mt-1 text-xs text-error">
                      {errors[field]}
                    </span>
                  )}
                </div>
              ),
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 h-12 w-full rounded-full bg-primary text-base font-bold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={() => {
                resetForm();
                onClose();
                onOpenLogin();
              }}
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

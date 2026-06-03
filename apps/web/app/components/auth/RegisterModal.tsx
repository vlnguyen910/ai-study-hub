"use client";

import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Button } from "@repo/ui/button";
import { apiClient } from "@/lib/axios";
import { API_ENDPOINTS } from "@/shared/constants";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setErrors({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      general: "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
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
      await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      resetForm();
      onClose();
      onOpenLogin();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";
      setErrors((prev) => ({ ...prev, general: errorMessage }));
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
      className="fixed inset-0 z-50 bg-slate-950/60 px-4 py-8 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="flex min-h-full items-center justify-center">
        <div className="relative w-full max-w-md rounded-3xl border border-white/70 bg-white p-8 shadow-2xl shadow-slate-950/20 max-h-screen overflow-y-auto">
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            aria-label="Close register modal"
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 z-10"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-blue-600 mb-6">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 19.5V4.5C4 4.10218 4.15804 3.72064 4.43934 3.43934C4.72064 3.15804 5.10218 3 5.5 3H18.5C18.8978 3 19.2794 3.15804 19.5607 3.43934C19.842 3.72064 20 4.10218 20 4.5V19.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 19.5C4 19.9023 4.15964 20.2882 4.44411 20.5727C4.72859 20.8571 5.11453 21.0167 5.51675 21H18.4832C18.8855 21.0167 19.2714 20.8571 19.5559 20.5727C19.8404 20.2882 20 19.9023 20 19.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 7H16M8 11H16M8 15H12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            AI Study Hub
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-center text-gray-600 text-sm mb-8">
            Join our community to start learning and sharing.
          </p>

          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
            noValidate
          >
            {errors.general && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                {errors.general}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-bold text-gray-900">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className={`w-full h-12 px-4 bg-gray-100 border rounded text-gray-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all ${
                  errors.name ? "border-red-600" : "border-gray-300"
                }`}
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <span className="text-red-600 text-xs mt-1">{errors.name}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-bold text-gray-900"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className={`w-full h-12 px-4 bg-gray-100 border rounded text-gray-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all ${
                  errors.email ? "border-red-600" : "border-gray-300"
                }`}
                placeholder="example@academic.edu"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <span className="text-red-600 text-xs mt-1">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-sm font-bold text-gray-900"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`w-full h-12 px-4 pr-12 bg-gray-100 border rounded text-gray-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all ${
                    errors.password ? "border-red-600" : "border-gray-300"
                  }`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.11 1 12A15.42 15.42 0 0 1 4.54 6.54M9.9 4.24A9.12 9.12 0 0 1 12 4C17 4 21.27 7.89 23 12C22.25 13.88 21.1 15.54 19.64 16.89"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14.12 14.12A3 3 0 0 1 9.88 9.88M1 1L23 23"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 12C2.73 7.89 7 4 12 4C17 4 21.27 7.89 23 12C21.27 16.11 17 20 12 20C7 20 2.73 16.11 1 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-red-600 text-xs mt-1">
                  {errors.password}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-bold text-gray-900"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className={`w-full h-12 px-4 pr-12 bg-gray-100 border rounded text-gray-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all ${
                    errors.confirmPassword
                      ? "border-red-600"
                      : "border-gray-300"
                  }`}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.11 1 12A15.42 15.42 0 0 1 4.54 6.54M9.9 4.24A9.12 9.12 0 0 1 12 4C17 4 21.27 7.89 23 12C22.25 13.88 21.1 15.54 19.64 16.89"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14.12 14.12A3 3 0 0 1 9.88 9.88M1 1L23 23"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 12C2.73 7.89 7 4 12 4C17 4 21.27 7.89 23 12C21.27 16.11 17 20 12 20C7 20 2.73 16.11 1 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-red-600 text-xs mt-1">
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            <Button className="w-full h-12 text-base mt-2" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="flex gap-3 mt-6">
            <div className="flex-1 h-px bg-gray-300 my-auto"></div>
            <span className="text-sm text-gray-500">Or continue with</span>
            <div className="flex-1 h-px bg-gray-300 my-auto"></div>
          </div>

          <div className="flex gap-3 mt-6">
            <button className="flex-1 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </button>
            <button className="flex-1 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </button>
          </div>

          <p className="text-center text-gray-600 text-sm mt-6">
            Already have an account?{" "}
            <button
              onClick={() => {
                resetForm();
                onClose();
                onOpenLogin();
              }}
              className="text-blue-600 hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

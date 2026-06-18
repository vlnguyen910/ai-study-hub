"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
  type ReactElement,
} from "react";

import AuthLayout from "@/components/layout/AuthLayout";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/axios";
import { ROUTE_PATHS } from "@/routes/router.const";
import { API_ENDPOINTS } from "@/shared/constants";
import { getOrCreateDeviceId } from "@/utils";

const getSafeRedirect = (value: string | null): string | null => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
};

const getServerErrorMessage = (error: unknown): string => {
  const axiosError = error as {
    response?: { data?: { message?: string | string[] } };
  };
  const serverMessage = axiosError.response?.data?.message;

  if (Array.isArray(serverMessage)) {
    return serverMessage.join(" ");
  }

  if (serverMessage) {
    return serverMessage;
  }

  return error instanceof Error
    ? error.message
    : "Đăng ký thất bại. Vui lòng thử lại.";
};

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  readonly label: string;
  readonly errorText?: string;
}

function FloatingInput({
  label,
  errorText,
  required,
  className = "",
  ...props
}: FloatingInputProps): ReactElement {
  return (
    <label className="group block">
      <div className="relative pt-4">
        <input
          className={`peer h-12 w-full border-0 border-b border-outline/55 bg-transparent px-0 pb-2 pt-4 font-body-md text-body-md text-on-surface outline-none transition-colors placeholder:text-transparent focus:border-primary ${className}`}
          placeholder=" "
          required={required}
          aria-invalid={Boolean(errorText)}
          {...props}
        />
        <span className="pointer-events-none absolute left-0 top-7 font-label-md text-label-md text-on-surface-variant transition-all duration-200 peer-focus:top-0 peer-focus:text-label-sm peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-label-sm">
          {label}
          {required ? (
            <span aria-hidden="true" className="ml-0.5 text-error">
              *
            </span>
          ) : null}
        </span>
        <span className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-[#003ea8] to-[#3b82f6] transition-all duration-300 peer-focus:w-full" />
      </div>
      {errorText ? (
        <span className="mt-2 block font-label-sm text-label-sm leading-5 text-error">
          {errorText}
        </span>
      ) : null}
    </label>
  );
}

function FriendlyRobotIcon(): ReactElement {
  return (
    <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/8 shadow-lg shadow-primary/10">
      <svg
        aria-hidden="true"
        className="h-9 w-9"
        fill="none"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M24 8v5"
          stroke="#003EA8"
          strokeLinecap="round"
          strokeWidth="2.5"
        />
        <circle cx="24" cy="6.5" fill="#3B82F6" r="2.5" />
        <rect
          fill="#EFF6FF"
          height="25"
          rx="9"
          stroke="#2563EB"
          strokeWidth="2.5"
          width="30"
          x="9"
          y="14"
        />
        <circle cx="19" cy="25" fill="#003EA8" r="2.2" />
        <circle cx="29" cy="25" fill="#003EA8" r="2.2" />
        <path
          d="M18 31c3.2 3 8.8 3 12 0"
          stroke="#0EA5E9"
          strokeLinecap="round"
          strokeWidth="2.5"
        />
        <path
          d="M7 25h2M39 25h2"
          stroke="#2563EB"
          strokeLinecap="round"
          strokeWidth="2.5"
        />
      </svg>
    </div>
  );
}

export default function RegisterPageClient(): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const safeRedirect = getSafeRedirect(searchParams.get("redirect"));
  const loginHref = safeRedirect
    ? `${ROUTE_PATHS.AUTH_ROUTES.LOGIN}?redirect=${encodeURIComponent(
        safeRedirect,
      )}`
    : ROUTE_PATHS.AUTH_ROUTES.LOGIN;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: "",
    general: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBackClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const historyIndex =
      typeof window !== "undefined" &&
      typeof window.history.state?.idx === "number"
        ? window.history.state.idx
        : 0;

    if (historyIndex > 0) {
      router.back();
      return;
    }

    router.push(ROUTE_PATHS.HOME);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    if (errors[id as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [id]: "", general: "" }));
    }
  };

  const handleTermsChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      acceptedTerms: event.target.checked,
    }));
    setErrors((prev) => ({ ...prev, acceptedTerms: "", general: "" }));
  };

  const validate = () => {
    let isValid = true;
    const nextErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptedTerms: "",
      general: "",
    };

    if (!formData.name.trim()) {
      nextErrors.name = "Họ tên là bắt buộc";
      isValid = false;
    }

    const email = formData.email.trim();

    if (!email) {
      nextErrors.email = "Email là bắt buộc";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Vui lòng nhập email hợp lệ";
      isValid = false;
    }

    if (!formData.password) {
      nextErrors.password = "Mật khẩu là bắt buộc";
      isValid = false;
    } else if (formData.password.length < 8) {
      nextErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      isValid = false;
    }

    if (!formData.acceptedTerms) {
      nextErrors.acceptedTerms =
        "Bạn cần đồng ý với Điều khoản sử dụng trước khi đăng ký";
      isValid = false;
    }

    setErrors(nextErrors);
    return isValid;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

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

      router.replace(loginHref);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: getServerErrorMessage(error),
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      mode="register"
      title="Chào mừng đến với AI Study Hub"
      subtitle="Tạo tài khoản để lưu tài liệu, luyện tập thông minh và theo dõi tiến độ học tập của bạn trong một không gian duy nhất."
      switchHref={loginHref}
      switchText="Đã có tài khoản?"
      switchCta="Đăng nhập ngay"
    >
      <div className="mb-8 flex items-center justify-between gap-4">
        <BackButton fallbackHref={ROUTE_PATHS.HOME} onClick={handleBackClick} />
        <Link
          href={ROUTE_PATHS.HOME}
          className="hidden items-center gap-2 font-headline-sm text-headline-sm font-bold tracking-wide text-primary md:inline-flex"
        >
          <span className="material-symbols-outlined text-[24px]">school</span>
          AI Study Hub
        </Link>
      </div>

      <section className="rounded-3xl border border-outline-variant/70 bg-white/85 p-7 shadow-xl shadow-primary/5 backdrop-blur sm:p-9">
        <div className="mb-10">
          <FriendlyRobotIcon />
          <p className="font-label-sm text-label-sm uppercase tracking-[0.18em] text-on-surface-variant">
            Đăng ký
          </p>
          <h1 className="mt-3 font-headline-lg text-headline-lg font-bold tracking-wide text-primary">
            Tạo tài khoản mới
          </h1>
          <p className="mt-4 font-body-md text-body-md leading-7 text-on-surface-variant">
            Bắt đầu xây dựng không gian học tập cá nhân với AI Study Hub.
          </p>
        </div>

        <form className="space-y-7" onSubmit={handleSubmit} noValidate>
          {errors.general ? (
            <p className="rounded-2xl border border-error/30 bg-error-container px-4 py-3 font-label-sm text-label-sm leading-5 text-error">
              {errors.general}
            </p>
          ) : null}

          <FloatingInput
            aria-label="Họ tên"
            id="name"
            label="Họ tên/Username"
            value={formData.name}
            onChange={handleChange}
            type="text"
            required
            errorText={errors.name}
            autoComplete="name"
          />

          <FloatingInput
            aria-label="Email"
            id="email"
            label="Email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            required
            errorText={errors.email}
            autoComplete="email"
          />

          <FloatingInput
            aria-label="Mật khẩu"
            id="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            type="password"
            required
            errorText={errors.password}
            autoComplete="new-password"
          />

          <FloatingInput
            aria-label="Xác nhận mật khẩu"
            id="confirmPassword"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            type="password"
            required
            errorText={errors.confirmPassword}
            autoComplete="new-password"
          />

          <div>
            <label className="flex items-start gap-3 font-body-md text-body-md leading-7 text-on-surface">
              <input
                id="acceptedTerms"
                type="checkbox"
                checked={formData.acceptedTerms}
                onChange={handleTermsChange}
                className="mt-1.5 h-4 w-4 rounded border-outline text-primary focus:ring-primary"
              />
              <span>
                Tôi đồng ý với{" "}
                <Link
                  href={ROUTE_PATHS.TERMS}
                  className="font-medium text-primary hover:underline"
                >
                  Điều khoản sử dụng
                </Link>
              </span>
            </label>
            {errors.acceptedTerms ? (
              <span className="mt-2 block font-label-sm text-label-sm leading-5 text-error">
                {errors.acceptedTerms}
              </span>
            ) : null}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="h-12 w-full rounded-2xl bg-gradient-to-r from-[#003ea8] via-[#0053db] to-[#3b82f6] font-label-lg text-on-primary shadow-xl shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-primary/30 disabled:translate-y-0"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
          </Button>
        </form>

        <p className="mt-7 font-label-sm text-label-sm text-on-surface-variant md:hidden">
          Đã có tài khoản?{" "}
          <Link
            href={loginHref}
            className="font-medium text-primary hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </section>
    </AuthLayout>
  );
}

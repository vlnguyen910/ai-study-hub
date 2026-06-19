"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from "react";

import AuthLayout from "@/components/layout/AuthLayout";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { buildUserFromAccessToken, extractAccessToken } from "@/lib/auth";
import { apiClient } from "@/lib/axios";
import {
  buildGoogleLoginUrl,
  completeGoogleLoginFromLocation,
  markGoogleOauthPending,
} from "@/modules/google-auth";
import { ROUTE_PATHS } from "@/routes/router.const";
import { API_ENDPOINTS } from "@/shared/constants";
import { useAuthStore } from "@/stores/auth/store";
import type { UserRole } from "@/types";
import { getOrCreateDeviceId } from "@/utils";
import { getErrorMessage } from "@/utils/error";

const getDefaultRedirectForRole = (role: UserRole): string => {
  if (role === "admin") {
    return ROUTE_PATHS.ADMIN_ROUTES.DASHBOARD;
  }

  if (role === "moderator") {
    return ROUTE_PATHS.MODERATOR_ROUTES.DASHBOARD;
  }

  return ROUTE_PATHS.PROTECTED_ROUTES.HOME;
};

const getSafeRedirect = (value: string | null, role: UserRole): string => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return getDefaultRedirectForRole(role);
  }

  return value;
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

export default function LoginPageClient(): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  useEffect(() => {
    if (!completeGoogleLoginFromLocation()) {
      return;
    }

    const user = useAuthStore.getState().user;

    router.replace(
      getSafeRedirect(searchParams.get("redirect"), user?.role ?? "student"),
    );
  }, [router, searchParams]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    if (errors[id as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [id]: "", general: "" }));
    }
  };

  const handleRememberChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, rememberMe: event.target.checked }));
  };

  const validate = () => {
    let isValid = true;
    const nextErrors = {
      email: "",
      password: "",
      general: "",
    };
    const email = formData.email.trim();

    if (!email) {
      nextErrors.email = "Email là bắt buộc";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Vui lòng nhập email hợp lệ";
      isValid = false;
    }

    if (!formData.password) {
      nextErrors.password = "Password không được để trống";
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
      const email = formData.email.trim();
      const deviceId = getOrCreateDeviceId();
      const data = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password: formData.password,
        deviceId,
      });

      const accessToken = extractAccessToken(data);
      const user = buildUserFromAccessToken(accessToken ?? undefined, {
        email,
      });

      if (!accessToken) {
        throw new Error("Đăng nhập thành công nhưng thiếu access token.");
      }

      if (!user) {
        throw new Error("Đăng nhập thành công nhưng token không hợp lệ.");
      }

      setAuth(accessToken, user.role, user, null);
      router.replace(getSafeRedirect(searchParams.get("redirect"), user.role));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: getErrorMessage(error, {
          401: "Email hoặc password không đúng.",
        }),
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignin = () => {
    if (isGoogleSubmitting) {
      return;
    }

    setErrors((prev) => ({ ...prev, general: "" }));
    setIsGoogleSubmitting(true);

    try {
      const deviceId = getOrCreateDeviceId();
      const oauthState = markGoogleOauthPending();

      window.location.href = buildGoogleLoginUrl({
        deviceId,
        oauthState,
        redirectPath: getSafeRedirect(searchParams.get("redirect"), "student"),
      });
    } catch {
      setIsGoogleSubmitting(false);
      setErrors((prev) => ({
        ...prev,
        general:
          "Không thể bắt đầu đăng nhập Google. Vui lòng kiểm tra kết nối và thử lại.",
      }));
    }
  };

  return (
    <AuthLayout
      mode="login"
      title="Chào mừng trở lại với AI Study Hub"
      subtitle="Tiếp tục hành trình học tập thông minh, truy cập tài liệu đã lưu và theo dõi tiến độ của bạn."
      switchHref={ROUTE_PATHS.AUTH_ROUTES.REGISTER}
      switchText="Chưa có tài khoản?"
      switchCta="Đăng ký ngay"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <BackButton fallbackHref={ROUTE_PATHS.HOME} />
        <Link
          href={ROUTE_PATHS.HOME}
          className="hidden items-center gap-2 font-headline-sm text-headline-sm font-bold tracking-wide text-primary md:inline-flex"
        >
          <span className="material-symbols-outlined text-[24px]">school</span>
          AI Study Hub
        </Link>
      </div>

      <section className="rounded-3xl border border-outline-variant/70 bg-white/85 p-6 shadow-xl shadow-primary/5 backdrop-blur sm:p-7">
        <div className="mb-7">
          <p className="font-label-sm text-label-sm uppercase tracking-[0.18em] text-on-surface-variant">
            Đăng nhập
          </p>
          <h1 className="mt-2 font-headline-lg text-headline-lg font-bold tracking-wide text-primary">
            Chào mừng trở lại
          </h1>
          <p className="mt-2 font-body-md text-body-md leading-6 text-on-surface-variant">
            Đăng nhập để tiếp tục sử dụng không gian học tập của bạn.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          {errors.general ? (
            <p className="rounded-2xl border border-error/30 bg-error-container px-4 py-3 font-label-sm text-label-sm leading-5 text-error">
              {errors.general}
            </p>
          ) : null}

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
            autoComplete="current-password"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-3 font-body-md text-body-md text-on-surface">
              <input
                id="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleRememberChange}
                className="h-4 w-4 rounded border-outline text-primary focus:ring-primary"
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <Link
              href={ROUTE_PATHS.AUTH_ROUTES.FORGOT_PASSWORD}
              className="font-label-md text-label-md font-medium text-primary hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="h-12 w-full rounded-2xl bg-gradient-to-r from-[#003ea8] via-[#0053db] to-[#3b82f6] font-label-lg text-on-primary shadow-xl shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-primary/30 disabled:translate-y-0"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-outline-variant" />
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            hoặc
          </span>
          <div className="h-px flex-1 bg-outline-variant" />
        </div>

        <GoogleAuthButton
          label={
            isGoogleSubmitting
              ? "Đang chuyển tới Google..."
              : "Đăng nhập với Google"
          }
          onClick={handleGoogleSignin}
          disabled={isSubmitting || isGoogleSubmitting}
        />

        <p className="mt-5 font-label-sm text-label-sm text-on-surface-variant md:hidden">
          Chưa có tài khoản?{" "}
          <Link
            href={ROUTE_PATHS.AUTH_ROUTES.REGISTER}
            className="font-medium text-primary hover:underline"
          >
            Đăng ký
          </Link>
        </p>
      </section>
    </AuthLayout>
  );
}

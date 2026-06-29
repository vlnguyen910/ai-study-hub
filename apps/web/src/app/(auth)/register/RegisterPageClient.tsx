"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
  type ReactElement,
} from "react";

import AuthLayout from "@/components/layout/AuthLayout";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { signup } from "@/modules/auth-api";
import {
  buildGoogleLoginUrl,
  markGoogleOauthPending,
} from "@/modules/google-auth";
import { ROUTE_PATHS } from "@/routes/router.const";
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
  readonly rightIcon?: ReactNode;
}

function FloatingInput({
  label,
  errorText,
  rightIcon,
  required,
  className = "",
  ...props
}: FloatingInputProps): ReactElement {
  return (
    <label className="group block">
      <div className="relative pt-4">
        <input
          className={`peer h-12 w-full border-0 border-b border-border/70 bg-transparent pb-2 pt-4 font-body-md text-body-md text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary ${rightIcon ? "pr-10" : "px-0"} ${className}`}
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
        {rightIcon ? (
          <span className="absolute right-0 top-1/2 -translate-y-1/2">
            {rightIcon}
          </span>
        ) : null}
      </div>
      {errorText ? (
        <span className="mt-2 block font-label-sm text-label-sm leading-5 text-error">
          {errorText}
        </span>
      ) : null}
    </label>
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: "",
    general: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

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
      const name = formData.name.trim();
      const email = formData.email.trim();

      await signup({
        name,
        email,
        password: formData.password,
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

  const handleGoogleSignup = () => {
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
        redirectPath: safeRedirect ?? ROUTE_PATHS.PROTECTED_ROUTES.HOME,
      });
    } catch {
      setIsGoogleSubmitting(false);
      setErrors((prev) => ({
        ...prev,
        general:
          "Không thể bắt đầu đăng ký Google. Vui lòng kiểm tra kết nối và thử lại.",
      }));
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
      <div className="mb-5 flex items-center justify-between gap-4">
        <BackButton fallbackHref={ROUTE_PATHS.HOME} onClick={handleBackClick} />
        <Link
          href={ROUTE_PATHS.HOME}
          className="hidden items-center gap-2 font-headline-sm text-headline-sm font-bold tracking-wide text-primary md:inline-flex"
        >
          <span className="material-symbols-outlined text-[24px]">school</span>
          AI Study Hub
        </Link>
      </div>

      <section className="rounded-3xl border border-border/70 bg-card/90 p-6 shadow-xl shadow-black/5 backdrop-blur sm:p-7">
        <div className="mb-6">
          <p className="font-label-sm text-label-sm uppercase tracking-[0.18em] text-on-surface-variant">
            Đăng ký
          </p>
          <h1 className="mt-2 font-headline-lg text-headline-lg font-bold tracking-wide text-primary">
            Tạo tài khoản mới
          </h1>
          <p className="mt-2 font-body-md text-body-md leading-6 text-on-surface-variant">
            Bắt đầu xây dựng không gian học tập cá nhân với AI Study Hub.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
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
            type={showPassword ? "text" : "password"}
            required
            errorText={errors.password}
            autoComplete="new-password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="p-2 text-on-surface-variant transition-colors hover:text-foreground"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            }
          />

          <FloatingInput
            aria-label="Xác nhận mật khẩu"
            id="confirmPassword"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            type={showConfirmPassword ? "text" : "password"}
            required
            errorText={errors.confirmPassword}
            autoComplete="new-password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="p-2 text-on-surface-variant transition-colors hover:text-foreground"
                aria-label={
                  showConfirmPassword
                    ? "Ẩn xác nhận mật khẩu"
                    : "Hiện xác nhận mật khẩu"
                }
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showConfirmPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            }
          />

          <div>
            <label className="flex items-start gap-3 font-body-md text-body-md leading-6 text-foreground">
              <input
                id="acceptedTerms"
                type="checkbox"
                checked={formData.acceptedTerms}
                onChange={handleTermsChange}
                className="mt-1.5 h-4 w-4 rounded border-border bg-background text-primary accent-primary focus:ring-primary"
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
            className="h-12 w-full rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/80 font-label-lg text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-primary/25 disabled:translate-y-0"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
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
              : "Đăng ký với Google"
          }
          onClick={handleGoogleSignup}
          disabled={isSubmitting || isGoogleSubmitting}
        />

        <p className="mt-5 font-label-sm text-label-sm text-on-surface-variant md:hidden">
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

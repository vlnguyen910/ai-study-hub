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
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";

import AuthLayout from "@/components/layout/AuthLayout";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Separator } from "@/components/ui/Separator";
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

function AuthField({
  id,
  label,
  errorText,
  type,
  leftElement,
  rightElement,
  ...props
}: {
  readonly id: string;
  readonly label: string;
  readonly errorText?: string;
  readonly type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
  readonly leftElement?: ReactElement;
  readonly rightElement?: ReactElement;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "style">) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {props.required ? (
          <span className="ml-0.5 text-destructive">*</span>
        ) : null}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          aria-invalid={Boolean(errorText)}
          className={[leftElement ? "pl-10" : "", rightElement ? "pr-12" : ""]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {leftElement ? (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            {leftElement}
          </div>
        ) : null}
        {rightElement ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-1">
            {rightElement}
          </div>
        ) : null}
      </div>
      {errorText ? (
        <p className="text-sm text-destructive">{errorText}</p>
      ) : null}
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

  const handleTermsChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      acceptedTerms: checked,
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

      <Card className="border-border/70 bg-card/95 shadow-2xl shadow-black/5 backdrop-blur">
        <CardHeader className="space-y-3 p-6 pb-0">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Đăng ký
          </p>
          <CardTitle>Tạo tài khoản mới</CardTitle>
          <CardDescription>
            Bắt đầu xây dựng không gian học tập cá nhân với AI Study Hub.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {errors.general ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errors.general}
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <AuthField
              aria-label="Họ tên"
              id="name"
              label="Họ tên/Username"
              value={formData.name}
              onChange={handleChange}
              type="text"
              required
              errorText={errors.name}
              autoComplete="name"
              leftElement={<User className="size-4 text-muted-foreground" />}
            />

            <AuthField
              aria-label="Email"
              id="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              required
              errorText={errors.email}
              autoComplete="email"
              leftElement={<Mail className="size-4 text-muted-foreground" />}
            />

            <AuthField
              aria-label="Mật khẩu"
              id="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              type={showPassword ? "text" : "password"}
              required
              errorText={errors.password}
              autoComplete="new-password"
              leftElement={<Lock className="size-4 text-muted-foreground" />}
              rightElement={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="h-9 w-9 rounded-full"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              }
            />

            <AuthField
              aria-label="Xác nhận mật khẩu"
              id="confirmPassword"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              type={showConfirmPassword ? "text" : "password"}
              required
              errorText={errors.confirmPassword}
              autoComplete="new-password"
              leftElement={<Lock className="size-4 text-muted-foreground" />}
              rightElement={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="h-9 w-9 rounded-full"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  aria-label={
                    showConfirmPassword
                      ? "Ẩn xác nhận mật khẩu"
                      : "Hiện xác nhận mật khẩu"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              }
            />

            <div className="space-y-2">
              <label className="flex items-start gap-3 text-sm leading-6 text-foreground">
                <Checkbox
                  checked={formData.acceptedTerms}
                  onCheckedChange={handleTermsChange}
                  id="acceptedTerms"
                  className="mt-1.5"
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
                <p className="text-sm text-destructive">
                  {errors.acceptedTerms}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              variant="default"
              className="h-12 w-full rounded-2xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-sm text-muted-foreground">hoặc</span>
            <Separator className="flex-1" />
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

          <p className="text-sm text-muted-foreground md:hidden">
            Đã có tài khoản?{" "}
            <Link
              href={loginHref}
              className="font-medium text-primary hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

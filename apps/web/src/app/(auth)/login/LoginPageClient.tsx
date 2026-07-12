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
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

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

export default function LoginPageClient(): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
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

  const handleRememberChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }));
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

      <Card className="border-border/70 bg-card/95 shadow-2xl shadow-black/5 backdrop-blur">
        <CardHeader className="space-y-3 p-6 pb-0">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Đăng nhập
          </p>
          <CardTitle>Chào mừng trở lại</CardTitle>
          <CardDescription>
            Đăng nhập để tiếp tục sử dụng không gian học tập của bạn.
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
              autoComplete="current-password"
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

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-3 text-sm text-foreground">
                <Checkbox
                  checked={formData.rememberMe}
                  onCheckedChange={handleRememberChange}
                  id="rememberMe"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <Link
                href={ROUTE_PATHS.AUTH_ROUTES.FORGOT_PASSWORD}
                className="text-sm font-medium text-primary hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              variant="default"
              className="h-12 w-full rounded-2xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
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
                : "Đăng nhập với Google"
            }
            onClick={handleGoogleSignin}
            disabled={isSubmitting || isGoogleSubmitting}
          />

          <p className="text-sm text-muted-foreground md:hidden">
            Chưa có tài khoản?{" "}
            <Link
              href={ROUTE_PATHS.AUTH_ROUTES.REGISTER}
              className="font-medium text-primary hover:underline"
            >
              Đăng ký
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

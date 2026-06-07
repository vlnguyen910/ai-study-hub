"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InputField } from "@/components/ui/InputField";
import { userRouterConfig } from "../../../routes/user/user.routes";
import { changePassword } from "../../auth-api";

const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Họ tên không được để trống"),
  university: z.string().trim().min(1, "Trường đại học không được để trống"),
  faculty: z.string().trim().min(1, "Khoa không được để trống"),
  major: z.string().trim().min(1, "Chuyên ngành không được để trống"),
});

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .trim()
      .min(8, "Mật khẩu hiện tại phải có ít nhất 8 ký tự"),
    newPassword: z
      .string()
      .trim()
      .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
    confirmPassword: z.string().trim().min(8, "Vui lòng nhập lại mật khẩu mới"),
  })
  .refine(
    ({ newPassword, confirmPassword }) => newPassword === confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Mật khẩu xác nhận không khớp",
    },
  );

type ProfileFormInput = z.input<typeof profileSchema>;
type ProfileFormOutput = z.output<typeof profileSchema>;
type PasswordFormInput = z.input<typeof passwordSchema>;
type PasswordFormOutput = z.output<typeof passwordSchema>;

type ProfileState = {
  fullName: string;
  email: string;
  university: string;
  faculty: string;
  major: string;
};

const INITIAL_PROFILE = {
  fullName: "Nguyễn Văn A",
  email: "vana.student@university.edu.vn",
  university: "Đại học Khoa học Tự nhiên",
  faculty: "Công nghệ thông tin",
  major: "Khoa học máy tính",
  avatarUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD0YFN3ifIJ2LVG2ZbOx_5NZkBNNmPOveXmlUMn5l0tZCG5xA4SviBqCueZI6YbC3q2GqOITU201dRcinyo-J_7fggH1JezfUGZ-AWVovFXAehNHoro99qVn9yYmj8eKfBqiG4rjLCE7vYZt8kovz_lKXneHUGvB2BxBfvIzgrseFjrqaAUMeEiXFhEv9oWNvnaS_Zu0svxVRheeEBnwTN7U1YG8pWxnB8BPS6nB0_lH2d4FYd4sLSElpXyUtKFGKfPgPehZ7EYcMpC",
} as const;

const PROFILE_NAV_ITEMS = [
  userRouterConfig.PROFILE,
  userRouterConfig.SETTINGS,
  userRouterConfig.FAVORITES,
  userRouterConfig.MY_DOCUMENTS,
  userRouterConfig.MY_UPLOADS,
  userRouterConfig.CHANGE_PASSWORD,
] as const;

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function ProfileSidebar({ pathname }: { pathname: string }): ReactElement {
  return (
    <aside className="hidden lg:block w-72 shrink-0">
      <Card className="sticky top-6 p-5 shadow-sm shadow-black/5">
        <div className="mb-6">
          <p className="font-label-sm text-label-sm uppercase tracking-[0.18em] text-on-surface-variant">
            Tài khoản
          </p>
          <h2 className="mt-1 font-headline-md text-headline-md font-bold text-primary">
            AI Study Hub
          </h2>
        </div>

        <nav className="space-y-2">
          {PROFILE_NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.path || pathname.startsWith(`${item.path}/`);

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 font-label-md text-label-md transition-colors ${
                  isActive
                    ? "bg-secondary-container text-on-secondary-container"
                    : "text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                <span>{item.title}</span>
                {isActive ? (
                  <span className="material-symbols-outlined text-[18px]">
                    chevron_right
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 border-t border-outline-variant pt-5">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-2xl px-4 py-3 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            Về trang chủ
          </Link>
        </div>
      </Card>
    </aside>
  );
}

export default function ProfilePage(): ReactElement {
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [savedAvatarUrl, setSavedAvatarUrl] = useState<string>(
    INITIAL_PROFILE.avatarUrl,
  );
  const [draftAvatarUrl, setDraftAvatarUrl] = useState<string>(
    INITIAL_PROFILE.avatarUrl,
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [profile, setProfile] = useState<ProfileState>({
    fullName: INITIAL_PROFILE.fullName,
    email: INITIAL_PROFILE.email,
    university: INITIAL_PROFILE.university,
    faculty: INITIAL_PROFILE.faculty,
    major: INITIAL_PROFILE.major,
  });

  const profileForm = useForm<ProfileFormInput, undefined, ProfileFormOutput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.fullName,
      university: profile.university,
      faculty: profile.faculty,
      major: profile.major,
    },
  });

  const passwordForm = useForm<
    PasswordFormInput,
    undefined,
    PasswordFormOutput
  >({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    reset: resetProfileForm,
    formState: {
      errors: profileErrors,
      isSubmitting: isProfileSubmitting,
      isDirty: isProfileDirty,
    },
  } = profileForm;

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: {
      errors: passwordErrors,
      isSubmitting: isPasswordSubmitting,
      isDirty: isPasswordDirty,
    },
  } = passwordForm;

  const initials = useMemo(
    () => getInitials(profile.fullName),
    [profile.fullName],
  );
  const displayAvatarUrl = isProfileEditing ? draftAvatarUrl : savedAvatarUrl;

  const beginProfileEditing = () => {
    resetProfileForm({
      fullName: profile.fullName,
      university: profile.university,
      faculty: profile.faculty,
      major: profile.major,
    });
    setDraftAvatarUrl(savedAvatarUrl);
    setIsProfileEditing(true);
    setStatusMessage("");
  };

  const cancelProfileEditing = () => {
    resetProfileForm({
      fullName: profile.fullName,
      university: profile.university,
      faculty: profile.faculty,
      major: profile.major,
    });
    setDraftAvatarUrl(savedAvatarUrl);
    setIsProfileEditing(false);
    setStatusMessage("Đã hủy chỉnh sửa hồ sơ.");
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setDraftAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const onSaveProfile = handleProfileSubmit((values) => {
    setProfile((current) => ({
      ...current,
      fullName: values.fullName.trim(),
      university: values.university.trim(),
      faculty: values.faculty.trim(),
      major: values.major.trim(),
    }));
    setSavedAvatarUrl(draftAvatarUrl);
    setIsProfileEditing(false);
    setStatusMessage("Cập nhật hồ sơ thành công.");
    resetProfileForm({
      fullName: values.fullName.trim(),
      university: values.university.trim(),
      faculty: values.faculty.trim(),
      major: values.major.trim(),
    });
  });

  const onSavePassword = handlePasswordSubmit(async (values) => {
    setPasswordErrorMessage("");

    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setStatusMessage("Cập nhật mật khẩu thành công.");
      resetPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordErrorMessage(
        error instanceof Error ? error.message : "Không thể cập nhật mật khẩu.",
      );
    }
  });

  const inputClassName = isProfileEditing
    ? ""
    : "bg-surface-container-low text-on-surface-variant";

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <ProfileSidebar pathname={pathname} />

        <main className="flex-1 space-y-6">
          <Card className="p-6 shadow-sm shadow-black/5 lg:p-8">
            <div className="flex flex-col gap-2">
              <p className="font-label-sm text-label-sm uppercase tracking-[0.18em] text-on-surface-variant">
                Hồ sơ cá nhân
              </p>
              <h1 className="font-headline-lg text-headline-lg font-bold text-primary">
                Cập nhật hồ sơ
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Chỉnh sửa thông tin hiển thị và cập nhật mật khẩu theo từng hành
                động riêng biệt.
              </p>
            </div>
          </Card>

          <Card className="p-6 shadow-sm shadow-black/5 lg:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar
                  imageUrl={displayAvatarUrl}
                  initials={initials}
                  size="lg"
                  className="h-20 w-20 border-4 border-surface-container object-cover"
                />
                <div>
                  <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                    {profile.fullName}
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {profile.email}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-secondary-container px-3 py-1 font-label-sm text-label-sm font-semibold text-on-secondary-container">
                      Hồ sơ cá nhân
                    </span>
                    <span className="rounded-full bg-surface-container px-3 py-1 font-label-sm text-label-sm text-on-surface-variant">
                      Đã xác minh email
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:self-start">
                {!isProfileEditing ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={beginProfileEditing}
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">
                        edit
                      </span>
                      Chỉnh sửa hồ sơ
                    </span>
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={cancelProfileEditing}
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                      type="submit"
                      form="profile-form"
                      variant="primary"
                      disabled={isProfileSubmitting || !isProfileDirty}
                    >
                      {isProfileSubmitting ? "Đang lưu..." : "Lưu hồ sơ"}
                    </Button>
                  </>
                )}
              </div>
            </div>

            <form
              id="profile-form"
              className="space-y-6"
              onSubmit={onSaveProfile}
              noValidate
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Controller
                  name="fullName"
                  control={profileControl}
                  render={({ field }) => (
                    <InputField
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      label="Họ tên"
                      placeholder="Nhập họ tên của bạn"
                      disabled={!isProfileEditing}
                      errorText={profileErrors.fullName?.message}
                      className={inputClassName}
                    />
                  )}
                />

                <InputField
                  label="Email"
                  value={profile.email}
                  disabled
                  className="bg-surface-container-low text-on-surface-variant"
                  helperText="Email không thể chỉnh sửa từ trang này"
                />

                <Controller
                  name="university"
                  control={profileControl}
                  render={({ field }) => (
                    <InputField
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      label="Trường đại học"
                      placeholder="Tên trường đại học"
                      disabled={!isProfileEditing}
                      errorText={profileErrors.university?.message}
                      className={inputClassName}
                    />
                  )}
                />

                <Controller
                  name="faculty"
                  control={profileControl}
                  render={({ field }) => (
                    <InputField
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      label="Khoa"
                      placeholder="Khoa của bạn"
                      disabled={!isProfileEditing}
                      errorText={profileErrors.faculty?.message}
                      className={inputClassName}
                    />
                  )}
                />

                <Controller
                  name="major"
                  control={profileControl}
                  render={({ field }) => (
                    <InputField
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      label="Chuyên ngành"
                      placeholder="Chuyên ngành học"
                      disabled={!isProfileEditing}
                      errorText={profileErrors.major?.message}
                      className={inputClassName}
                    />
                  )}
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3">
                <div>
                  <p className="font-label-md text-label-md text-on-surface">
                    Ảnh đại diện
                  </p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Chọn ảnh mới chỉ khi đang ở chế độ chỉnh sửa hồ sơ.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!isProfileEditing}
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">
                        upload
                      </span>
                      Tải ảnh mới
                    </span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-error hover:bg-error-container hover:text-error"
                    onClick={() => setDraftAvatarUrl("")}
                    disabled={!isProfileEditing}
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                      Xóa ảnh
                    </span>
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={!isProfileEditing}
                  />
                </div>
              </div>
            </form>

            {statusMessage ? (
              <p className="mt-4 rounded-xl bg-surface-container-low px-4 py-3 font-label-sm text-label-sm text-on-surface-variant">
                {statusMessage}
              </p>
            ) : null}
          </Card>

          <Card className="p-6 shadow-sm shadow-black/5 lg:p-8">
            <div className="mb-6 flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary">
                lock
              </span>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  Cập nhật mật khẩu
                </h2>
                <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">
                  Phần này tách riêng để sau này gọi API khác với cập nhật hồ
                  sơ.
                </p>
              </div>
            </div>

            <form className="space-y-6" onSubmit={onSavePassword} noValidate>
              <div className="grid gap-5 md:grid-cols-2">
                <Controller
                  name="currentPassword"
                  control={passwordControl}
                  render={({ field }) => (
                    <InputField
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      label="Mật khẩu hiện tại"
                      placeholder="••••••••"
                      type="password"
                      errorText={passwordErrors.currentPassword?.message}
                    />
                  )}
                />

                <Controller
                  name="newPassword"
                  control={passwordControl}
                  render={({ field }) => (
                    <InputField
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      label="Mật khẩu mới"
                      placeholder="••••••••"
                      type="password"
                      errorText={passwordErrors.newPassword?.message}
                    />
                  )}
                />

                <Controller
                  name="confirmPassword"
                  control={passwordControl}
                  render={({ field }) => (
                    <InputField
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      label="Xác nhận mật khẩu"
                      placeholder="••••••••"
                      type="password"
                      errorText={passwordErrors.confirmPassword?.message}
                    />
                  )}
                />
              </div>

              {passwordErrorMessage ? (
                <p className="rounded-xl bg-error-container px-4 py-3 font-label-sm text-label-sm text-on-error-container">
                  {passwordErrorMessage}
                </p>
              ) : null}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isPasswordSubmitting || !isPasswordDirty}
                >
                  {isPasswordSubmitting
                    ? "Đang cập nhật..."
                    : "Cập nhật mật khẩu"}
                </Button>
              </div>
            </form>
          </Card>
        </main>
      </div>
    </div>
  );
}

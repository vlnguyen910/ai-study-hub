import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/nativewindui/Icon";
import { router } from "expo-router";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button, Card, PageShell } from "@/components";
import { ROUTES } from "@/constants/routes";
import { fetchMyProfile, updateProfile } from "../services/profile.service";
import type {
  AccountProfile,
  ProfileFieldKey,
  ProfileState,
} from "../types/profile.types";

const INITIAL_PROFILE: ProfileState = {
  id: "",
  fullName: "",
  email: "",
  avatarUrl: "",
};

const profileFields: {
  key: ProfileFieldKey;
  label: string;
  placeholder: string;
  icon: string;
}[] = [
  {
    key: "fullName",
    label: "Họ và tên",
    placeholder: "Nhập họ và tên",
    icon: "person",
  },
];

function getInitials(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "?";
}

function mapAccountToProfile(
  account: AccountProfile,
  current: ProfileState = INITIAL_PROFILE,
): ProfileState {
  return {
    ...current,
    id: account.id,
    fullName: account.name,
    email: account.email,
    avatarUrl: account.avatarUrl ?? "",
  };
}

function ProfileAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string;
}) {
  const initials = getInitials(name);

  if (avatarUrl.trim()) {
    return (
      <Image
        accessibilityLabel="Ảnh đại diện"
        source={{ uri: avatarUrl }}
        className="h-28 w-28 rounded-full border-4 border-surface-container object-cover"
      />
    );
  }

  return (
    <View className="h-28 w-28 items-center justify-center rounded-full border-4 border-surface-container bg-secondary-container">
      <Text className="text-3xl font-bold text-on-secondary-container">
        {initials}
      </Text>
    </View>
  );
}

function MetricChip({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "success" | "warning";
}) {
  const toneClasses = {
    neutral: "bg-surface-container-low text-on-surface",
    success: "bg-primary-container/20 text-primary",
    warning: "bg-secondary-container text-on-secondary-container",
  } as const;

  return (
    <View className={`rounded-2xl px-4 py-3 ${toneClasses[tone]}`}>
      <Text className="text-[11px] uppercase tracking-[0.18em] opacity-70">
        {label}
      </Text>
      <Text className="mt-1 text-sm font-semibold">{value}</Text>
    </View>
  );
}

export function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileState>(INITIAL_PROFILE);
  const [draft, setDraft] = useState<ProfileState>(INITIAL_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Đang tải hồ sơ cá nhân.");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<ProfileFieldKey, string>>
  >({});
  const [lastUpdatedAt, setLastUpdatedAt] = useState("Chưa cập nhật");

  const loadProfile = useCallback(async () => {
    setIsLoadingProfile(true);
    try {
      const account = await fetchMyProfile();
      const nextProfile = mapAccountToProfile(account);

      setProfile(nextProfile);
      setDraft(nextProfile);
      setLastUpdatedAt(
        account.updatedAt
          ? new Date(account.updatedAt).toLocaleString("vi-VN")
          : "Chưa cập nhật",
      );
      setStatusMessage(
        "Xem thông tin cá nhân hoặc chuyển sang chế độ sửa để cập nhật hồ sơ.",
      );
    } catch {
      setStatusMessage(
        "Không thể tải hồ sơ cá nhân. Vui lòng kiểm tra kết nối và thử lại.",
      );
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const startEditing = () => {
    setDraft(profile);
    setFieldErrors({});
    setIsEditing(true);
    setStatusMessage("Đang chỉnh sửa hồ sơ.");
  };

  const cancelEditing = () => {
    setDraft(profile);
    setFieldErrors({});
    setIsEditing(false);
    setStatusMessage("Đã hủy thay đổi.");
  };

  const updateDraftField = <T extends ProfileFieldKey>(
    field: T,
    value: string,
  ) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateDraft = () => {
    const nextErrors: Partial<Record<ProfileFieldKey, string>> = {};

    if (!draft.fullName.trim()) {
      nextErrors.fullName = "Họ và tên không được để trống";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveProfile = async () => {
    if (!validateDraft()) {
      setStatusMessage("Vui lòng kiểm tra lại các trường bắt buộc.");
      return;
    }

    if (!profile.id) {
      setStatusMessage("Hồ sơ chưa sẵn sàng để cập nhật. Vui lòng thử lại.");
      return;
    }

    setIsSaving(true);
    try {
      const normalizedDraft: ProfileState = {
        id: profile.id,
        fullName: draft.fullName.trim(),
        email: profile.email,
        avatarUrl: draft.avatarUrl.trim(),
      };

      const account = await updateProfile(profile.id, {
        name: normalizedDraft.fullName,
        avatarUrl: normalizedDraft.avatarUrl,
      });
      const normalizedProfile = mapAccountToProfile(account, normalizedDraft);

      setProfile(normalizedProfile);
      setDraft(normalizedProfile);
      setIsEditing(false);
      setLastUpdatedAt(new Date().toLocaleString("vi-VN"));
      setStatusMessage("Cập nhật hồ sơ thành công.");
    } catch {
      setStatusMessage("Không thể cập nhật hồ sơ. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageShell contentClassName="p-0">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 bg-surface"
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-5 flex-row items-center justify-between">
            <Pressable
              accessibilityRole="button"
              className="rounded-full bg-surface-container-high px-3 py-3"
              onPress={() => router.back()}
            >
              <Icon name="chevron.left" size={20} color="#191b23" />
            </Pressable>
            <Text className="flex-1 text-center text-lg font-bold text-on-surface">
              Hồ sơ cá nhân
            </Text>
            <View className="w-11" />
          </View>

          <Card className="mb-4 overflow-hidden">
            <View className="absolute left-0 right-0 top-0 h-24 bg-primary/10" />
            <View className="items-center gap-4 py-2">
              <ProfileAvatar
                name={draft.fullName}
                avatarUrl={draft.avatarUrl}
              />
              <View className="items-center gap-1">
                <Text className="text-xl font-bold text-on-surface">
                  {isEditing ? draft.fullName : profile.fullName}
                </Text>
                <Text className="text-sm text-on-surface-variant">
                  {profile.email}
                </Text>
              </View>

              <View className="flex-row flex-wrap justify-center gap-2">
                <MetricChip
                  label="Trạng thái"
                  value={isEditing ? "Đang sửa" : "Đã lưu"}
                  tone={isEditing ? "warning" : "success"}
                />
                <MetricChip label="Cập nhật" value={lastUpdatedAt} />
              </View>

              <View className="flex-row gap-3 pt-2">
                {!isEditing ? (
                  <Button
                    disabled={isLoadingProfile || !profile.id}
                    onPress={startEditing}
                    leftIcon={<Icon name="pencil" size={18} color="#ffffff" />}
                  >
                    Chỉnh sửa
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onPress={cancelEditing}>
                      Hủy
                    </Button>
                    <Button
                      loading={isSaving}
                      onPress={saveProfile}
                      leftIcon={
                        <Icon name="checkmark" size={18} color="#ffffff" />
                      }
                    >
                      Lưu thay đổi
                    </Button>
                  </>
                )}
              </View>
            </View>
          </Card>

          <Card
            className="mb-4"
            title="Không gian cá nhân"
            subtitle="Quản lý tài liệu đã tải lên và các bộ sưu tập của bạn."
          >
            <View className="gap-3">
              <Button
                fullWidth
                variant="outline"
                onPress={() => router.push(ROUTES.MY_DOCUMENTS as never)}
                leftIcon={<Icon name="doc" size={18} color="#191b23" />}
              >
                Tài liệu của tôi
              </Button>
              <Button
                fullWidth
                variant="outline"
                onPress={() => router.push(ROUTES.COLLECTIONS as never)}
                leftIcon={<Icon name="bookmark" size={18} color="#191b23" />}
              >
                Bộ sưu tập
              </Button>
            </View>
          </Card>

          <Card
            title="Thông tin cá nhân"
            subtitle="Xem và cập nhật hồ sơ của bạn."
          >
            <View className="gap-4">
              {profileFields.map((field) => (
                <View key={field.key}>
                  <Text className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                    {field.label}
                  </Text>
                  <View className="flex-row items-center rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3">
                    <Icon
                      name={field.icon as any}
                      size={18}
                      color={isEditing ? "#004ac6" : "#737686"}
                      style={{ marginRight: 10 }}
                    />
                    <TextInput
                      className="flex-1 p-0 text-base text-on-surface"
                      placeholder={field.placeholder}
                      placeholderTextColor="#737686"
                      editable={isEditing}
                      value={isEditing ? draft[field.key] : profile[field.key]}
                      onChangeText={(value) =>
                        updateDraftField(field.key, value)
                      }
                      autoCapitalize={
                        field.key === "fullName" ? "words" : "none"
                      }
                      autoCorrect={false}
                    />
                  </View>
                  {fieldErrors[field.key] ? (
                    <Text className="mt-1 text-xs font-medium text-red-600">
                      {fieldErrors[field.key]}
                    </Text>
                  ) : null}
                </View>
              ))}

              <View>
                <Text className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                  Avatar URL
                </Text>
                <View className="flex-row items-center rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3">
                  <Icon
                    name="photo"
                    size={18}
                    color={isEditing ? "#004ac6" : "#737686"}
                    style={{ marginRight: 10 }}
                  />
                  <TextInput
                    className="flex-1 p-0 text-base text-on-surface"
                    placeholder="Dán link ảnh đại diện"
                    placeholderTextColor="#737686"
                    editable={isEditing}
                    value={isEditing ? draft.avatarUrl : profile.avatarUrl}
                    onChangeText={(value) =>
                      updateDraftField("avatarUrl", value)
                    }
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                <Text className="mt-1 text-xs text-on-surface-variant">
                  Dùng đường dẫn ảnh công khai để hiển thị ảnh đại diện.
                </Text>
              </View>

              {isEditing ? (
                <Pressable
                  accessibilityRole="button"
                  className="self-start rounded-full bg-secondary-container px-4 py-2"
                  onPress={() => updateDraftField("avatarUrl", "")}
                >
                  <Text className="text-sm font-semibold text-on-secondary-container">
                    Xóa ảnh đại diện
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </Card>

          <Card className="mt-4" title="Thông báo">
            <Text className="text-sm leading-6 text-on-surface-variant">
              {statusMessage}
            </Text>
            {!isEditing ? (
              <View className="mt-4 self-start">
                <Button
                  variant="outline"
                  loading={isLoadingProfile}
                  onPress={() => void loadProfile()}
                >
                  Tải lại hồ sơ
                </Button>
              </View>
            ) : null}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </PageShell>
  );
}

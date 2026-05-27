import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
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
import type { ProfileFieldKey, ProfileState } from "../types/profile.types";

const INITIAL_PROFILE: ProfileState = {
  fullName: "Nguyễn Văn A",
  email: "vana.student@university.edu.vn",
  university: "Đại học Khoa học Tự nhiên",
  faculty: "Công nghệ thông tin",
  major: "Khoa học máy tính",
  avatarUrl:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=640&q=80",
};

const profileFields: {
  key: ProfileFieldKey;
  label: string;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    key: "fullName",
    label: "Họ và tên",
    placeholder: "Nhập họ và tên",
    icon: "person-outline",
  },
  {
    key: "university",
    label: "Trường đại học",
    placeholder: "Tên trường đại học",
    icon: "school-outline",
  },
  {
    key: "faculty",
    label: "Khoa",
    placeholder: "Tên khoa",
    icon: "library-outline",
  },
  {
    key: "major",
    label: "Chuyên ngành",
    placeholder: "Chuyên ngành học",
    icon: "bookmark-outline",
  },
];

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
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
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Xem thông tin cá nhân hoặc chuyển sang chế độ sửa để cập nhật hồ sơ.",
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<ProfileFieldKey, string>>
  >({});
  const [lastUpdatedAt, setLastUpdatedAt] = useState("Chưa cập nhật");

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

    profileFields.forEach(({ key, label }) => {
      if (!draft[key].trim()) {
        nextErrors[key] = `${label} không được để trống`;
      }
    });

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveProfile = async () => {
    if (!validateDraft()) {
      setStatusMessage("Vui lòng kiểm tra lại các trường bắt buộc.");
      return;
    }

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 700));

    const normalizedProfile: ProfileState = {
      fullName: draft.fullName.trim(),
      email: profile.email,
      university: draft.university.trim(),
      faculty: draft.faculty.trim(),
      major: draft.major.trim(),
      avatarUrl: draft.avatarUrl.trim(),
    };

    setProfile(normalizedProfile);
    setDraft(normalizedProfile);
    setIsEditing(false);
    setIsSaving(false);
    setLastUpdatedAt(new Date().toLocaleString("vi-VN"));
    setStatusMessage("Cập nhật hồ sơ thành công.");
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
              className="rounded-full bg-surface-container-low px-3 py-3"
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={20} color="#191b23" />
            </Pressable>
            <Text className="flex-1 text-center text-lg font-semibold text-on-surface">
              Profile
            </Text>
            <View className="w-11" />
          </View>

          <Card className="mb-4 shadow-sm">
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
                    onPress={startEditing}
                    leftIcon={
                      <Ionicons
                        name="create-outline"
                        size={18}
                        color="#ffffff"
                      />
                    }
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
                        <Ionicons
                          name="save-outline"
                          size={18}
                          color="#ffffff"
                        />
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
                    <Ionicons
                      name={field.icon}
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
                  <Ionicons
                    name="image-outline"
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
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </PageShell>
  );
}

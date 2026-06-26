"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { Switch } from "@/components/ui/Switch";
import {
  fetchAdminSettings,
  updateAdminSettings,
  type AdminSettings,
  type AdminSettingsGroup,
  type AdminSettingsGroupPayloadMap,
} from "../settings-api";
import { AdminCard, MaterialIcon } from "../components/AdminPrimitives";

const groupSuccessMessages: Record<AdminSettingsGroup, string> = {
  general: "Đã lưu cấu hình hệ thống.",
  upload: "Đã lưu cấu hình tải lên.",
  documentVisibility: "Đã lưu cấu hình hiển thị và kiểm duyệt.",
  ai: "Đã lưu cấu hình AI.",
  moderation: "Đã lưu cấu hình điều phối.",
  account: "Đã lưu cấu hình tài khoản.",
  mobile: "Đã lưu cấu hình ứng dụng di động.",
};

const cloneSettings = (settings: AdminSettings): AdminSettings => ({
  ...settings,
  general: { ...settings.general },
  upload: {
    ...settings.upload,
    allowedFileTypes: [...settings.upload.allowedFileTypes],
    fileTypes: settings.upload.fileTypes.map((fileType) => ({ ...fileType })),
  },
  documentVisibility: { ...settings.documentVisibility },
  ai: { ...settings.ai },
  moderation: { ...settings.moderation },
  account: { ...settings.account },
  mobile: { ...settings.mobile },
});

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback;

const formatUpdatedAt = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa xác định";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

export default function AdminConfigPage(): React.JSX.Element {
  const [savedSettings, setSavedSettings] = useState<AdminSettings | null>(
    null,
  );
  const [draft, setDraft] = useState<AdminSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [savingGroup, setSavingGroup] = useState<AdminSettingsGroup | null>(
    null,
  );
  const [groupErrors, setGroupErrors] = useState<
    Partial<Record<AdminSettingsGroup, string>>
  >({});
  const [newFileExtension, setNewFileExtension] = useState("");

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const settings = await fetchAdminSettings();
      setSavedSettings(cloneSettings(settings));
      setDraft(cloneSettings(settings));
      setGroupErrors({});
    } catch (error) {
      setLoadError(getErrorMessage(error, "Không thể tải cấu hình hệ thống."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const dirtyGroups = useMemo(() => {
    if (!draft || !savedSettings) return [];

    return (
      [
        "general",
        "upload",
        "documentVisibility",
        "ai",
        "moderation",
        "account",
        "mobile",
      ] as const
    ).filter(
      (group) =>
        JSON.stringify(draft[group]) !== JSON.stringify(savedSettings[group]),
    );
  }, [draft, savedSettings]);

  const updateGroup = <T extends AdminSettingsGroup>(
    group: T,
    updater: (
      current: AdminSettingsGroupPayloadMap[T],
    ) => AdminSettingsGroupPayloadMap[T],
  ) => {
    setDraft((current) => {
      if (!current) return current;

      return {
        ...current,
        [group]: updater(current[group] as AdminSettingsGroupPayloadMap[T]),
      } as AdminSettings;
    });
    setGroupErrors((current) => ({ ...current, [group]: "" }));
  };

  const validateGroup = (group: AdminSettingsGroup): string => {
    if (!draft) return "Dữ liệu cấu hình chưa sẵn sàng.";

    switch (group) {
      case "general":
        if (draft.general.systemName.trim().length < 2) {
          return "Tên hệ thống phải có ít nhất 2 ký tự.";
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.general.supportEmail)) {
          return "Email hỗ trợ không đúng định dạng.";
        }
        if (!/^[A-Z0-9_-]{2,20}$/.test(draft.general.defaultSchoolCode)) {
          return "Mã trường chỉ gồm 2–20 ký tự A–Z, số, gạch ngang hoặc gạch dưới.";
        }
        return "";
      case "upload":
        if (
          !Number.isInteger(draft.upload.maxFileSizeMb) ||
          draft.upload.maxFileSizeMb < 1 ||
          draft.upload.maxFileSizeMb > 1024
        ) {
          return "Dung lượng tối đa phải là số nguyên từ 1 đến 1024 MB.";
        }
        if (!draft.upload.fileTypes.some((fileType) => fileType.enabled)) {
          return "Cần chọn ít nhất một định dạng tài liệu.";
        }
        return "";
      case "ai":
        if (
          !Number.isInteger(draft.ai.maxAiRequestsPerUserPerDay) ||
          draft.ai.maxAiRequestsPerUserPerDay < 1 ||
          draft.ai.maxAiRequestsPerUserPerDay > 10000
        ) {
          return "Số yêu cầu AI mỗi ngày phải từ 1 đến 10.000.";
        }
        if (
          draft.ai.maxQuizQuestions < 1 ||
          draft.ai.maxQuizQuestions > 100 ||
          draft.ai.defaultQuizQuestions < 1 ||
          draft.ai.defaultQuizQuestions > draft.ai.maxQuizQuestions
        ) {
          return "Số câu hỏi mặc định phải từ 1 đến giới hạn câu hỏi tối đa.";
        }
        return "";
      case "moderation":
        if (
          !Number.isInteger(draft.moderation.duplicateSimilarityThreshold) ||
          draft.moderation.duplicateSimilarityThreshold < 0 ||
          draft.moderation.duplicateSimilarityThreshold > 100
        ) {
          return "Ngưỡng tương đồng phải là số nguyên từ 0 đến 100%.";
        }
        return "";
      default:
        return "";
    }
  };

  const handleSave = async <T extends AdminSettingsGroup>(group: T) => {
    if (!draft) return;

    const validationError = validateGroup(group);
    if (validationError) {
      setGroupErrors((current) => ({
        ...current,
        [group]: validationError,
      }));
      return;
    }

    setSavingGroup(group);
    setGroupErrors((current) => ({ ...current, [group]: "" }));

    try {
      const payload =
        group === "upload"
          ? {
              maxFileSizeMb: draft.upload.maxFileSizeMb,
              fileTypes: draft.upload.fileTypes,
              allowMobileUpload: draft.upload.allowMobileUpload,
            }
          : draft[group];
      const updated = await updateAdminSettings(
        group,
        payload as AdminSettingsGroupPayloadMap[T],
      );
      const serverSettings = cloneSettings(updated);

      setSavedSettings(serverSettings);
      setDraft((current) => {
        if (!current) return serverSettings;

        return {
          ...current,
          [group]: serverSettings[group],
          version: serverSettings.version,
          updatedAt: serverSettings.updatedAt,
        } as AdminSettings;
      });
      toast.success(groupSuccessMessages[group]);
    } catch (error) {
      setGroupErrors((current) => ({
        ...current,
        [group]: getErrorMessage(error, "Không thể lưu nhóm cấu hình này."),
      }));
    } finally {
      setSavingGroup(null);
    }
  };

  const handleReset = (group: AdminSettingsGroup) => {
    if (!savedSettings) return;

    const source = cloneSettings(savedSettings);
    setDraft((current) =>
      current
        ? ({ ...current, [group]: source[group] } as AdminSettings)
        : current,
    );
    setGroupErrors((current) => ({ ...current, [group]: "" }));
    if (group === "upload") setNewFileExtension("");
  };

  const handleAddFileType = () => {
    if (!draft) return;

    const extension = newFileExtension.trim().replace(/^\.+/, "").toUpperCase();

    if (!/^[A-Z0-9]{1,10}$/.test(extension)) {
      setGroupErrors((current) => ({
        ...current,
        upload:
          "Extension phải gồm 1–10 chữ cái hoặc số, không bao gồm dấu chấm.",
      }));
      return;
    }

    if (
      draft.upload.fileTypes.some(
        (fileType) => fileType.extension === extension,
      )
    ) {
      setGroupErrors((current) => ({
        ...current,
        upload: `Định dạng ${extension} đã có trong danh sách.`,
      }));
      return;
    }

    if (draft.upload.fileTypes.length >= 50) {
      setGroupErrors((current) => ({
        ...current,
        upload: "Chỉ được cấu hình tối đa 50 định dạng.",
      }));
      return;
    }

    updateGroup("upload", (current) => ({
      ...current,
      fileTypes: [...current.fileTypes, { extension, enabled: true }],
    }));
    setNewFileExtension("");
  };

  if (isLoading) {
    return (
      <div className="space-y-6" aria-live="polite">
        <PageHeading />
        <AdminCard className="p-8">
          <div className="flex items-center gap-3 text-on-surface-variant">
            <MaterialIcon className="animate-spin" name="progress_activity" />
            <span className="font-body-md text-body-md">
              Đang tải cấu hình hệ thống...
            </span>
          </div>
        </AdminCard>
      </div>
    );
  }

  if (!draft || !savedSettings) {
    return (
      <div className="space-y-6">
        <PageHeading />
        <AdminCard className="p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-headline-md text-headline-md text-error">
                Không thể tải cấu hình
              </h2>
              <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
                {loadError || "Vui lòng kiểm tra kết nối API và thử lại."}
              </p>
            </div>
            <Button onClick={() => void loadSettings()} variant="outline">
              <MaterialIcon className="mr-2 text-[18px]" name="refresh" />
              Thử lại
            </Button>
          </div>
        </AdminCard>
      </div>
    );
  }

  const isDirty = (group: AdminSettingsGroup) => dirtyGroups.includes(group);
  const isSaving = (group: AdminSettingsGroup) => savingGroup === group;

  return (
    <div className="space-y-6 pb-8">
      <PageHeading
        dirtyCount={dirtyGroups.length}
        updatedAt={draft.updatedAt}
        version={draft.version}
      />

      {draft.general.maintenanceMode ? (
        <div className="flex items-start gap-3 rounded-lg border border-tertiary/30 bg-tertiary-fixed px-4 py-3 text-on-tertiary-fixed-variant">
          <MaterialIcon name="construction" />
          <div>
            <p className="font-label-md text-label-md tracking-normal">
              Chế độ bảo trì đang bật
            </p>
            <p className="font-body-md text-body-md">
              Người dùng có thể bị giới hạn truy cập sau khi cấu hình này được
              lưu.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SettingsSection
          description="Thông tin nhận diện và trạng thái vận hành chung."
          dirty={isDirty("general")}
          error={groupErrors.general}
          icon="tune"
          id="general-settings"
          isSaving={isSaving("general")}
          onReset={() => handleReset("general")}
          onSave={() => void handleSave("general")}
          title="Cấu hình hệ thống"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              label="Tên hệ thống"
              maxLength={100}
              onChange={(event) =>
                updateGroup("general", (current) => ({
                  ...current,
                  systemName: event.target.value,
                }))
              }
              value={draft.general.systemName}
            />
            <InputField
              label="Email hỗ trợ"
              maxLength={254}
              onChange={(event) =>
                updateGroup("general", (current) => ({
                  ...current,
                  supportEmail: event.target.value,
                }))
              }
              type="email"
              value={draft.general.supportEmail}
            />
            <InputField
              helperText="Mã phải tồn tại trong danh sách trường học."
              label="Trường mặc định"
              maxLength={20}
              onChange={(event) =>
                updateGroup("general", (current) => ({
                  ...current,
                  defaultSchoolCode: event.target.value.toUpperCase(),
                }))
              }
              value={draft.general.defaultSchoolCode}
            />
            <SettingToggle
              checked={draft.general.maintenanceMode}
              description="Tạm thời hạn chế truy cập trong lúc bảo trì."
              label="Chế độ bảo trì"
              onChange={(checked) =>
                updateGroup("general", (current) => ({
                  ...current,
                  maintenanceMode: checked,
                }))
              }
            />
          </div>
        </SettingsSection>

        <SettingsSection
          description="Giới hạn dung lượng, định dạng và nguồn tải lên."
          dirty={isDirty("upload")}
          error={groupErrors.upload}
          icon="upload_file"
          id="upload-settings"
          isSaving={isSaving("upload")}
          onReset={() => handleReset("upload")}
          onSave={() => void handleSave("upload")}
          title="Tải lên tài liệu"
        >
          <div className="space-y-4">
            <InputField
              helperText="Cho phép từ 1 đến 1024 MB."
              label="Dung lượng tối đa (MB)"
              max={1024}
              min={1}
              onChange={(event) =>
                updateGroup("upload", (current) => ({
                  ...current,
                  maxFileSizeMb: Number(event.target.value),
                }))
              }
              type="number"
              value={draft.upload.maxFileSizeMb}
            />
            <div>
              <p className="mb-2 font-label-sm text-label-sm text-on-surface-variant">
                Định dạng tài liệu
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {draft.upload.fileTypes.map((fileType) => (
                  <div
                    className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant bg-surface px-3 py-2.5"
                    key={fileType.extension}
                  >
                    <div className="min-w-0">
                      <p className="font-label-md text-label-md text-on-surface tracking-normal">
                        .{fileType.extension.toLowerCase()}
                      </p>
                      <p
                        className={`font-label-sm text-label-sm tracking-normal ${
                          fileType.enabled
                            ? "text-primary"
                            : "text-on-surface-variant"
                        }`}
                      >
                        {fileType.enabled ? "Đang cho phép" : "Đã vô hiệu hóa"}
                      </p>
                    </div>
                    <Switch
                      ariaLabel={`Cho phép ${fileType.extension}`}
                      checked={fileType.enabled}
                      onChange={(enabled) =>
                        updateGroup("upload", (current) => ({
                          ...current,
                          fileTypes: current.fileTypes.map((item) =>
                            item.extension === fileType.extension
                              ? { ...item, enabled }
                              : item,
                          ),
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <InputField
                helperText="Ví dụ: TXT, XLSX, CSV, EPUB. Không nhập dấu chấm."
                label="Thêm định dạng mới"
                maxLength={10}
                onChange={(event) => setNewFileExtension(event.target.value)}
                placeholder="EPUB"
                value={newFileExtension}
              />
              <Button
                // Thêm sm:mb-[24px] hoặc sm:mb-6 vào đây để bù trừ chiều cao của helperText
                className="h-[38px] sm:mb-[24px]"
                disabled={!newFileExtension.trim()}
                onClick={handleAddFileType}
                variant="outline"
              >
                <MaterialIcon className="mr-1 text-[18px]" name="add" />
                Thêm định dạng
              </Button>
            </div>
            <SettingToggle
              checked={draft.upload.allowMobileUpload}
              description="Backend chấp nhận tài liệu gửi từ thiết bị di động."
              label="Cho phép tải lên từ mobile"
              onChange={(checked) =>
                updateGroup("upload", (current) => ({
                  ...current,
                  allowMobileUpload: checked,
                }))
              }
            />
          </div>
        </SettingsSection>

        <SettingsSection
          description="Quy định khả năng chia sẻ và luồng xét duyệt tài liệu."
          dirty={isDirty("documentVisibility")}
          error={groupErrors.documentVisibility}
          icon="visibility"
          id="document-visibility-settings"
          isSaving={isSaving("documentVisibility")}
          onReset={() => handleReset("documentVisibility")}
          onSave={() => void handleSave("documentVisibility")}
          title="Hiển thị & xét duyệt"
        >
          <div className="divide-y divide-outline-variant rounded-lg border border-outline-variant">
            <SettingToggle
              checked={
                draft.documentVisibility.requireModerationForPublicDocuments
              }
              description="Tài liệu công khai phải được duyệt trước khi hiển thị."
              label="Kiểm duyệt tài liệu công khai"
              onChange={(checked) =>
                updateGroup("documentVisibility", (current) => ({
                  ...current,
                  requireModerationForPublicDocuments: checked,
                }))
              }
              seamless
            />
            <SettingToggle
              checked={draft.documentVisibility.allowPrivateDocuments}
              description="Người dùng có thể lưu tài liệu chỉ mình họ xem được."
              label="Cho phép tài liệu riêng tư"
              onChange={(checked) =>
                updateGroup("documentVisibility", (current) => ({
                  ...current,
                  allowPrivateDocuments: checked,
                }))
              }
              seamless
            />
            <SettingToggle
              checked={draft.documentVisibility.allowSharedLink}
              description="Tài liệu có thể được truy cập qua liên kết chia sẻ."
              label="Cho phép liên kết chia sẻ"
              onChange={(checked) =>
                updateGroup("documentVisibility", (current) => ({
                  ...current,
                  allowSharedLink: checked,
                }))
              }
              seamless
            />
            <SettingToggle
              checked={draft.documentVisibility.privateToPublicRequiresReview}
              description="Chuyển riêng tư sang công khai sẽ tạo yêu cầu duyệt."
              label="Duyệt khi chuyển sang công khai"
              onChange={(checked) =>
                updateGroup("documentVisibility", (current) => ({
                  ...current,
                  privateToPublicRequiresReview: checked,
                }))
              }
              seamless
            />
            <SettingToggle
              checked={draft.documentVisibility.replaceFileRequiresReview}
              description="Thay file của tài liệu đã duyệt phải xét duyệt lại."
              label="Duyệt lại khi thay file"
              onChange={(checked) =>
                updateGroup("documentVisibility", (current) => ({
                  ...current,
                  replaceFileRequiresReview: checked,
                }))
              }
              seamless
            />
          </div>
        </SettingsSection>

        <SettingsSection
          description="Chính sách phát hiện trùng lặp và quyết định của moderator."
          dirty={isDirty("moderation")}
          error={groupErrors.moderation}
          icon="fact_check"
          id="moderation-settings"
          isSaving={isSaving("moderation")}
          onReset={() => handleReset("moderation")}
          onSave={() => void handleSave("moderation")}
          title="Điều phối kiểm duyệt"
        >
          <div className="space-y-4">
            <InputField
              helperText="Phần trăm tương đồng từ 0 đến 100."
              label="Ngưỡng tài liệu trùng lặp (%)"
              max={100}
              min={0}
              onChange={(event) =>
                updateGroup("moderation", (current) => ({
                  ...current,
                  duplicateSimilarityThreshold: Number(event.target.value),
                }))
              }
              type="number"
              value={draft.moderation.duplicateSimilarityThreshold}
            />
            <SettingToggle
              checked={draft.moderation.autoFlagDuplicateDocuments}
              description="Tự động đánh dấu tài liệu vượt ngưỡng tương đồng."
              label="Tự động gắn cờ trùng lặp"
              onChange={(checked) =>
                updateGroup("moderation", (current) => ({
                  ...current,
                  autoFlagDuplicateDocuments: checked,
                }))
              }
            />
            <SettingToggle
              checked={draft.moderation.requireRejectionReason}
              description="Moderator phải nhập lý do khi từ chối tài liệu."
              label="Bắt buộc lý do từ chối"
              onChange={(checked) =>
                updateGroup("moderation", (current) => ({
                  ...current,
                  requireRejectionReason: checked,
                }))
              }
            />
            <SettingToggle
              checked={
                draft.moderation.allowModeratorToApproveAiFlaggedDocument
              }
              description="AI chỉ hỗ trợ; moderator vẫn có quyền quyết định cuối."
              label="Cho phép duyệt tài liệu bị AI gắn cờ"
              onChange={(checked) =>
                updateGroup("moderation", (current) => ({
                  ...current,
                  allowModeratorToApproveAiFlaggedDocument: checked,
                }))
              }
            />
          </div>
        </SettingsSection>

        <SettingsSection
          className="xl:col-span-2"
          description="Bật/tắt từng khả năng AI và kiểm soát quota sử dụng."
          dirty={isDirty("ai")}
          error={groupErrors.ai}
          icon="auto_awesome"
          id="ai-settings"
          isSaving={isSaving("ai")}
          onReset={() => handleReset("ai")}
          onSave={() => void handleSave("ai")}
          title="Trí tuệ nhân tạo"
        >
          <SettingToggle
            checked={draft.ai.enableAiFeatures}
            description="Công tắc tổng cho toàn bộ chức năng AI trong hệ thống."
            label="Kích hoạt AI"
            onChange={(checked) =>
              updateGroup("ai", (current) => ({
                ...current,
                enableAiFeatures: checked,
              }))
            }
            prominent
          />
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(
              [
                ["enableAiSummary", "Tóm tắt tài liệu", "summarize"],
                ["enableAiQuiz", "Tạo câu hỏi", "quiz"],
                ["enableAiSearch", "Tìm kiếm ngữ nghĩa", "search"],
                ["enableAiChat", "Trò chuyện AI", "chat"],
                [
                  "enableAiModeratorAssistant",
                  "Trợ lý moderator",
                  "verified_user",
                ],
              ] as const
            ).map(([field, label, icon]) => (
              <SettingToggle
                checked={draft.ai[field]}
                description={`Cho phép sử dụng ${label.toLocaleLowerCase("vi-VN")}.`}
                icon={icon}
                key={field}
                label={label}
                onChange={(checked) =>
                  updateGroup("ai", (current) => ({
                    ...current,
                    [field]: checked,
                  }))
                }
              />
            ))}
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <InputField
              helperText="Giới hạn từ 1 đến 10.000."
              label="Yêu cầu AI/người dùng/ngày"
              max={10000}
              min={1}
              onChange={(event) =>
                updateGroup("ai", (current) => ({
                  ...current,
                  maxAiRequestsPerUserPerDay: Number(event.target.value),
                }))
              }
              type="number"
              value={draft.ai.maxAiRequestsPerUserPerDay}
            />
            <InputField
              label="Số câu hỏi tối đa"
              max={100}
              min={1}
              onChange={(event) =>
                updateGroup("ai", (current) => ({
                  ...current,
                  maxQuizQuestions: Number(event.target.value),
                }))
              }
              type="number"
              value={draft.ai.maxQuizQuestions}
            />
            <InputField
              helperText="Không được vượt quá số câu tối đa."
              label="Số câu hỏi mặc định"
              max={100}
              min={1}
              onChange={(event) =>
                updateGroup("ai", (current) => ({
                  ...current,
                  defaultQuizQuestions: Number(event.target.value),
                }))
              }
              type="number"
              value={draft.ai.defaultQuizQuestions}
            />
          </div>
        </SettingsSection>

        <SettingsSection
          description="Quy định đăng ký, xác minh và quyền mặc định."
          dirty={isDirty("account")}
          error={groupErrors.account}
          icon="manage_accounts"
          id="account-settings"
          isSaving={isSaving("account")}
          onReset={() => handleReset("account")}
          onSave={() => void handleSave("account")}
          title="Tài khoản"
        >
          <div className="space-y-4">
            <SettingToggle
              checked={draft.account.allowGmailRegistration}
              description="Cho phép người dùng tạo tài khoản bằng Gmail."
              label="Đăng ký bằng Gmail"
              onChange={(checked) =>
                updateGroup("account", (current) => ({
                  ...current,
                  allowGmailRegistration: checked,
                }))
              }
            />
            <SettingToggle
              checked={draft.account.requireEmailVerification}
              description="Tài khoản mới cần xác minh địa chỉ email."
              label="Bắt buộc xác minh email"
              onChange={(checked) =>
                updateGroup("account", (current) => ({
                  ...current,
                  requireEmailVerification: checked,
                }))
              }
            />
            <SettingToggle
              checked={draft.account.allowUnverifiedLoginWithLimitedAccess}
              description="Tài khoản chưa xác minh chỉ được dùng chức năng giới hạn."
              label="Cho phép đăng nhập giới hạn"
              onChange={(checked) =>
                updateGroup("account", (current) => ({
                  ...current,
                  allowUnverifiedLoginWithLimitedAccess: checked,
                }))
              }
            />
            <InputField
              disabled
              helperText="MVP cố định USER để tránh tự cấp quyền quản trị."
              label="Vai trò mặc định sau đăng ký"
              value={draft.account.defaultRoleAfterSignup}
            />
          </div>
        </SettingsSection>

        <SettingsSection
          description="Kiểm soát quyền truy cập và chức năng trên mobile."
          dirty={isDirty("mobile")}
          error={groupErrors.mobile}
          icon="smartphone"
          id="mobile-settings"
          isSaving={isSaving("mobile")}
          onReset={() => handleReset("mobile")}
          onSave={() => void handleSave("mobile")}
          title="Ứng dụng di động"
        >
          <div className="space-y-4">
            <SettingToggle
              checked={draft.mobile.enableMobileAppAccess}
              description="Cho phép client mobile truy cập hệ thống."
              label="Kích hoạt ứng dụng mobile"
              onChange={(checked) =>
                updateGroup("mobile", (current) => ({
                  ...current,
                  enableMobileAppAccess: checked,
                }))
              }
            />
            <SettingToggle
              checked={draft.mobile.enableMobileUpload}
              description="Hiển thị và kích hoạt luồng tải tài liệu trên mobile."
              label="Tải lên trên mobile"
              onChange={(checked) =>
                updateGroup("mobile", (current) => ({
                  ...current,
                  enableMobileUpload: checked,
                }))
              }
            />
            <SettingToggle
              checked={draft.mobile.enableMobileAiFeatures}
              description="Cho phép sử dụng các chức năng AI từ mobile."
              label="AI trên mobile"
              onChange={(checked) =>
                updateGroup("mobile", (current) => ({
                  ...current,
                  enableMobileAiFeatures: checked,
                }))
              }
            />
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}

function PageHeading({
  dirtyCount = 0,
  version,
  updatedAt,
}: {
  readonly dirtyCount?: number;
  readonly version?: number;
  readonly updatedAt?: string;
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-normal text-on-surface">
          Cấu hình hệ thống
        </h1>
        <p className="mt-2 max-w-2xl font-body-md text-body-md text-on-surface-variant">
          Quản lý chính sách vận hành, kiểm duyệt và các tính năng dùng chung
          cho Web và Mobile.
        </p>
      </div>
      {version !== undefined && updatedAt ? (
        <div className="flex flex-wrap items-center gap-2">
          {dirtyCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-tertiary-fixed px-3 py-1.5 font-label-sm text-label-sm text-on-tertiary-fixed-variant">
              <MaterialIcon className="text-[17px]" name="edit_note" />
              {dirtyCount} nhóm chưa lưu
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed px-3 py-1.5 font-label-sm text-label-sm text-on-secondary-fixed-variant">
              <MaterialIcon className="text-[17px]" name="cloud_done" />
              Đã đồng bộ
            </span>
          )}
          <span className="rounded-full border border-outline-variant bg-surface-container-low px-3 py-1.5 font-label-sm text-label-sm text-on-surface-variant">
            Phiên bản {version} · {formatUpdatedAt(updatedAt)}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function SettingsSection({
  children,
  className = "",
  description,
  dirty,
  error,
  icon,
  id,
  isSaving,
  onReset,
  onSave,
  title,
}: {
  readonly children: ReactNode;
  readonly className?: string;
  readonly description: string;
  readonly dirty: boolean;
  readonly error?: string;
  readonly icon: string;
  readonly id: string;
  readonly isSaving: boolean;
  readonly onReset: () => void;
  readonly onSave: () => void;
  readonly title: string;
}): React.JSX.Element {
  const headingId = `${id}-heading`;

  return (
    <div aria-labelledby={headingId} className={className} role="region">
      <AdminCard className="flex h-full flex-col overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-outline-variant bg-surface-container-low px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-fixed text-on-primary-fixed-variant">
              <MaterialIcon name={icon} />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  className="font-headline-md text-headline-md text-on-surface"
                  id={headingId}
                >
                  {title}
                </h2>
                {dirty ? (
                  <span className="rounded-full bg-tertiary-fixed px-2 py-0.5 font-label-sm text-label-sm text-on-tertiary-fixed-variant">
                    Chưa lưu
                  </span>
                ) : null}
              </div>
              <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
                {description}
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 p-5">{children}</div>
        {error ? (
          <p className="mx-5 mb-4 rounded border border-error/30 bg-error-container px-4 py-3 font-label-sm text-label-sm text-error">
            {error}
          </p>
        ) : null}
        <div className="flex justify-end gap-3 border-t border-outline-variant bg-surface-container-lowest px-5 py-4">
          <Button
            disabled={!dirty || isSaving}
            onClick={onReset}
            size="sm"
            variant="ghost"
          >
            Hoàn tác
          </Button>
          <Button disabled={!dirty || isSaving} onClick={onSave} size="sm">
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </AdminCard>
    </div>
  );
}

function SettingToggle({
  checked,
  description,
  icon,
  label,
  onChange,
  prominent = false,
  seamless = false,
}: {
  readonly checked: boolean;
  readonly description: string;
  readonly icon?: string;
  readonly label: string;
  readonly onChange: (checked: boolean) => void;
  readonly prominent?: boolean;
  readonly seamless?: boolean;
}): React.JSX.Element {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${
        seamless
          ? "px-4 py-3"
          : prominent
            ? "rounded-lg border border-primary/30 bg-primary-fixed/40 p-4"
            : "rounded-lg border border-outline-variant bg-surface p-4"
      }`}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon ? (
          <MaterialIcon
            className="mt-0.5 shrink-0 text-[20px] text-primary"
            name={icon}
          />
        ) : null}
        <div>
          <p className="font-label-md text-label-md text-on-surface tracking-normal">
            {label}
          </p>
          <p className="mt-0.5 font-label-sm text-label-sm text-on-surface-variant tracking-normal">
            {description}
          </p>
        </div>
      </div>
      <Switch ariaLabel={label} checked={checked} onChange={onChange} />
    </div>
  );
}

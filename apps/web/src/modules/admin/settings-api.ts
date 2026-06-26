import { apiClient } from "@/lib/axios";
import { API_ENDPOINTS } from "@/shared/constants";

export interface UploadFileTypeSetting {
  extension: string;
  enabled: boolean;
}

export interface GeneralSettings {
  systemName: string;
  maintenanceMode: boolean;
  defaultSchoolCode: string;
  supportEmail: string;
}

export interface UploadSettings {
  maxFileSizeMb: number;
  allowedFileTypes: string[];
  fileTypes: UploadFileTypeSetting[];
  allowMobileUpload: boolean;
}

export type UpdateUploadSettings = Omit<UploadSettings, "allowedFileTypes">;

export interface DocumentVisibilitySettings {
  requireModerationForPublicDocuments: boolean;
  allowPrivateDocuments: boolean;
  allowSharedLink: boolean;
  privateToPublicRequiresReview: boolean;
  replaceFileRequiresReview: boolean;
}

export interface AiSettings {
  enableAiFeatures: boolean;
  enableAiSummary: boolean;
  enableAiQuiz: boolean;
  enableAiSearch: boolean;
  enableAiChat: boolean;
  enableAiModeratorAssistant: boolean;
  maxAiRequestsPerUserPerDay: number;
  maxQuizQuestions: number;
  defaultQuizQuestions: number;
}

export interface ModerationSettings {
  autoFlagDuplicateDocuments: boolean;
  duplicateSimilarityThreshold: number;
  requireRejectionReason: boolean;
  allowModeratorToApproveAiFlaggedDocument: boolean;
}

export interface AccountSettings {
  allowGmailRegistration: boolean;
  requireEmailVerification: boolean;
  allowUnverifiedLoginWithLimitedAccess: boolean;
  defaultRoleAfterSignup: "USER";
}

export interface MobileSettings {
  enableMobileAppAccess: boolean;
  enableMobileUpload: boolean;
  enableMobileAiFeatures: boolean;
}

export interface AdminSettings {
  general: GeneralSettings;
  upload: UploadSettings;
  documentVisibility: DocumentVisibilitySettings;
  ai: AiSettings;
  moderation: ModerationSettings;
  account: AccountSettings;
  mobile: MobileSettings;
  version: number;
  updatedAt: string;
}

export type AdminSettingsGroup =
  | "general"
  | "upload"
  | "documentVisibility"
  | "ai"
  | "moderation"
  | "account"
  | "mobile";

export interface AdminSettingsGroupPayloadMap {
  general: GeneralSettings;
  upload: UpdateUploadSettings;
  documentVisibility: DocumentVisibilitySettings;
  ai: AiSettings;
  moderation: ModerationSettings;
  account: AccountSettings;
  mobile: MobileSettings;
}

const groupEndpoints: Record<AdminSettingsGroup, string> = {
  general: API_ENDPOINTS.ADMIN.SETTINGS.GENERAL,
  upload: API_ENDPOINTS.ADMIN.SETTINGS.UPLOAD,
  documentVisibility: API_ENDPOINTS.ADMIN.SETTINGS.DOCUMENT_VISIBILITY,
  ai: API_ENDPOINTS.ADMIN.SETTINGS.AI,
  moderation: API_ENDPOINTS.ADMIN.SETTINGS.MODERATION,
  account: API_ENDPOINTS.ADMIN.SETTINGS.ACCOUNT,
  mobile: API_ENDPOINTS.ADMIN.SETTINGS.MOBILE,
};

export const fetchAdminSettings = async (): Promise<AdminSettings> => {
  return apiClient.get<unknown, AdminSettings>(
    API_ENDPOINTS.ADMIN.SETTINGS.BASE,
  );
};

export const updateAdminSettings = async <T extends AdminSettingsGroup>(
  group: T,
  payload: AdminSettingsGroupPayloadMap[T],
): Promise<AdminSettings> => {
  return apiClient.patch<unknown, AdminSettings>(
    groupEndpoints[group],
    payload,
  );
};

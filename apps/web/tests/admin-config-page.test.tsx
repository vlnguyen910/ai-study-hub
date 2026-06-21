import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminConfigPage from "../src/modules/admin/pages/AdminConfigPage";
import type { AdminSettings } from "../src/modules/admin/settings-api";

const settingsApiMock = vi.hoisted(() => ({
  fetchAdminSettings: vi.fn(),
  updateAdminSettings: vi.fn(),
}));

vi.mock("../src/modules/admin/settings-api", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../src/modules/admin/settings-api")>();
  return { ...actual, ...settingsApiMock };
});

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const settings: AdminSettings = {
  general: {
    systemName: "AI Study Hub",
    maintenanceMode: false,
    defaultSchoolCode: "FPTU",
    supportEmail: "support@aistudyhub.local",
  },
  upload: {
    maxFileSizeMb: 100,
    allowedFileTypes: ["PDF", "DOCX", "PPTX"],
    allowMobileUpload: true,
  },
  documentVisibility: {
    requireModerationForPublicDocuments: true,
    allowPrivateDocuments: true,
    allowSharedLink: true,
    privateToPublicRequiresReview: true,
    replaceFileRequiresReview: true,
  },
  ai: {
    enableAiFeatures: true,
    enableAiSummary: true,
    enableAiQuiz: true,
    enableAiSearch: true,
    enableAiChat: true,
    enableAiModeratorAssistant: true,
    maxAiRequestsPerUserPerDay: 20,
    maxQuizQuestions: 20,
    defaultQuizQuestions: 10,
  },
  moderation: {
    autoFlagDuplicateDocuments: true,
    duplicateSimilarityThreshold: 85,
    requireRejectionReason: true,
    allowModeratorToApproveAiFlaggedDocument: true,
  },
  account: {
    allowGmailRegistration: true,
    requireEmailVerification: true,
    allowUnverifiedLoginWithLimitedAccess: true,
    defaultRoleAfterSignup: "USER",
  },
  mobile: {
    enableMobileAppAccess: true,
    enableMobileUpload: true,
    enableMobileAiFeatures: true,
  },
  version: 1,
  updatedAt: "2026-06-21T08:00:00.000Z",
};

describe("AdminConfigPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    settingsApiMock.fetchAdminSettings.mockResolvedValue(settings);
    settingsApiMock.updateAdminSettings.mockImplementation(
      (group: keyof AdminSettings, payload: object) =>
        Promise.resolve({
          ...settings,
          [group]: payload,
          version: 2,
          updatedAt: "2026-06-21T09:00:00.000Z",
        }),
    );
  });

  it("loads and renders all seven configuration groups", async () => {
    render(<AdminConfigPage />);

    expect(
      screen.getByText("Đang tải cấu hình hệ thống..."),
    ).toBeInTheDocument();
    expect(await screen.findByDisplayValue("AI Study Hub")).toBeInTheDocument();

    expect(
      screen.getByRole("region", { name: "Cấu hình hệ thống" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Tải lên tài liệu" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Hiển thị & xét duyệt" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Trí tuệ nhân tạo" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Điều phối kiểm duyệt" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Tài khoản" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Ứng dụng di động" }),
    ).toBeInTheDocument();
    expect(settingsApiMock.fetchAdminSettings).toHaveBeenCalledWith();
  });

  it("saves only the edited general settings block", async () => {
    render(<AdminConfigPage />);
    const input = await screen.findByLabelText("Tên hệ thống");
    const region = screen.getByRole("region", { name: "Cấu hình hệ thống" });

    fireEvent.change(input, { target: { value: "Study Hub Vietnam" } });
    expect(within(region).getByText("Chưa lưu")).toBeInTheDocument();
    fireEvent.click(
      within(region).getByRole("button", { name: "Lưu thay đổi" }),
    );

    await waitFor(() => {
      expect(settingsApiMock.updateAdminSettings).toHaveBeenCalledWith(
        "general",
        {
          ...settings.general,
          systemName: "Study Hub Vietnam",
        },
      );
    });
    expect(await screen.findByText(/Phiên bản 2/)).toBeInTheDocument();
  });

  it("restores a changed block without calling the API", async () => {
    render(<AdminConfigPage />);
    const input = await screen.findByLabelText("Tên hệ thống");
    const region = screen.getByRole("region", { name: "Cấu hình hệ thống" });

    fireEvent.change(input, { target: { value: "Temporary name" } });
    fireEvent.click(within(region).getByRole("button", { name: "Hoàn tác" }));

    expect(screen.getByLabelText("Tên hệ thống")).toHaveValue("AI Study Hub");
    expect(settingsApiMock.updateAdminSettings).not.toHaveBeenCalled();
  });

  it("blocks an invalid AI quiz limit before sending the request", async () => {
    render(<AdminConfigPage />);
    await screen.findByDisplayValue("AI Study Hub");
    const region = screen.getByRole("region", { name: "Trí tuệ nhân tạo" });

    fireEvent.change(screen.getByLabelText(/^Số câu hỏi mặc định/), {
      target: { value: "21" },
    });
    fireEvent.click(
      within(region).getByRole("button", { name: "Lưu thay đổi" }),
    );

    expect(
      await within(region).findByText(
        "Số câu hỏi mặc định phải từ 1 đến giới hạn câu hỏi tối đa.",
      ),
    ).toBeInTheDocument();
    expect(settingsApiMock.updateAdminSettings).not.toHaveBeenCalled();
  });

  it("shows a retry state when loading fails", async () => {
    settingsApiMock.fetchAdminSettings.mockRejectedValueOnce(
      new Error("API unavailable"),
    );

    render(<AdminConfigPage />);

    expect(
      await screen.findByText("Không thể tải cấu hình"),
    ).toBeInTheDocument();
    expect(screen.getByText("API unavailable")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));

    expect(await screen.findByDisplayValue("AI Study Hub")).toBeInTheDocument();
    expect(settingsApiMock.fetchAdminSettings).toHaveBeenCalledTimes(2);
  });
});

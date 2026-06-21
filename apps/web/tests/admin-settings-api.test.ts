import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchAdminSettings,
  updateAdminSettings,
  type AdminSettings,
  type AdminSettingsGroup,
} from "../src/modules/admin/settings-api";
import { apiClient } from "../src/lib/axios";

vi.mock("../src/lib/axios", () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

const clientMock = vi.mocked(apiClient);

const endpoints: Record<AdminSettingsGroup, string> = {
  general: "/api/v1/admin/settings/general",
  upload: "/api/v1/admin/settings/upload",
  documentVisibility: "/api/v1/admin/settings/document-visibility",
  ai: "/api/v1/admin/settings/ai",
  moderation: "/api/v1/admin/settings/moderation",
  account: "/api/v1/admin/settings/account",
  mobile: "/api/v1/admin/settings/mobile",
};

describe("admin settings api helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches all admin settings", async () => {
    const response = { version: 1 } as AdminSettings;
    clientMock.get.mockResolvedValue(response);

    await expect(fetchAdminSettings()).resolves.toBe(response);
    expect(clientMock.get).toHaveBeenCalledWith("/api/v1/admin/settings");
  });

  it.each(Object.entries(endpoints))(
    "updates the %s settings endpoint",
    async (group, endpoint) => {
      const response = { version: 2 } as AdminSettings;
      const payload = { enabled: true };
      clientMock.patch.mockResolvedValue(response);

      await updateAdminSettings(group as AdminSettingsGroup, payload as never);

      expect(clientMock.patch).toHaveBeenCalledWith(endpoint, payload);
    },
  );
});

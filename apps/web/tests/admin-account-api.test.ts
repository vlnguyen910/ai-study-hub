import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  banAdminAccount,
  createAdminAccount,
  fetchAdminAccountDetail,
  fetchAdminAccounts,
} from "../src/modules/admin/api";
import { apiClient } from "../src/lib/axios";

vi.mock("../src/lib/axios", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const clientMock = vi.mocked(apiClient);

describe("admin account api helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches admin accounts", async () => {
    const response = [{ id: "acc-1" }];
    clientMock.get.mockResolvedValue(response);

    await expect(fetchAdminAccounts()).resolves.toBe(response);

    expect(clientMock.get).toHaveBeenCalledWith("/api/v1/accounts", {
      params: {},
    });
  });

  it("fetches admin accounts with created date filters", async () => {
    const response = [{ id: "acc-1" }];
    clientMock.get.mockResolvedValue(response);

    await expect(
      fetchAdminAccounts({
        createdFrom: "2026-06-01",
        createdTo: "2026-06-10",
      }),
    ).resolves.toBe(response);

    expect(clientMock.get).toHaveBeenCalledWith("/api/v1/accounts", {
      params: {
        createdFrom: "2026-06-01",
        createdTo: "2026-06-10",
      },
    });
  });

  it("fetches admin account detail", async () => {
    const response = { id: "acc-1" };
    clientMock.get.mockResolvedValue(response);

    await expect(fetchAdminAccountDetail("acc-1")).resolves.toBe(response);

    expect(clientMock.get).toHaveBeenCalledWith("/api/v1/accounts/acc-1");
  });

  it("creates admin account with supported payload", async () => {
    const payload = {
      email: "moderator@example.com",
      name: "Moderator",
      password: "Password123!",
      role: "MODERATOR" as const,
      status: "ACTIVE" as const,
    };
    const response = { message: "Account created successfully" };
    clientMock.post.mockResolvedValue(response);

    await expect(createAdminAccount(payload)).resolves.toBe(response);

    expect(clientMock.post).toHaveBeenCalledWith("/api/v1/accounts", payload);
  });

  it("bans an admin account", async () => {
    const response = { message: "Account banned successfully" };
    clientMock.patch.mockResolvedValue(response);

    await expect(banAdminAccount("acc-1")).resolves.toBe(response);

    expect(clientMock.patch).toHaveBeenCalledWith("/api/v1/accounts/acc-1/ban");
  });
});

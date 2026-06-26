import axios from "axios";
import type { AxiosAdapter, AxiosInstance } from "axios";
import { installAuthInterceptors } from "@/services/api-client";
import * as storage from "../utils/storage";

jest.mock("../utils/storage", () => ({
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
  removeTokens: jest.fn(),
  saveAccessToken: jest.fn(),
}));

const storageMock = jest.mocked(storage);

describe("mobile api client auth interceptors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("attaches the stored access token to requests", async () => {
    storageMock.getAccessToken.mockResolvedValue("access-token");

    const adapter = jest.fn<ReturnType<AxiosAdapter>, Parameters<AxiosAdapter>>(
      async (config) => ({
        data: { ok: true },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      }),
    );
    const client = axios.create({ adapter });
    installAuthInterceptors(client);

    await client.get("/api/v1/documents");

    expect(adapter.mock.calls[0][0].headers?.Authorization).toBe(
      "Bearer access-token",
    );
  });

  it("refreshes access token, persists it, and retries once after a 401", async () => {
    storageMock.getAccessToken
      .mockResolvedValueOnce("expired-access")
      .mockResolvedValueOnce("expired-access")
      .mockResolvedValueOnce("new-access");
    storageMock.getRefreshToken.mockResolvedValue("refresh-token");

    const adapter = jest.fn<ReturnType<AxiosAdapter>, Parameters<AxiosAdapter>>(
      async (config) => {
        if (config.url === "/api/v1/auth/refresh") {
          return {
            data: { data: { accessToken: "new-access" } },
            status: 200,
            statusText: "OK",
            headers: {},
            config,
          };
        }

        if (adapter.mock.calls.length === 1) {
          throw {
            isAxiosError: true,
            config,
            response: { status: 401, data: { message: "Expired" } },
          };
        }

        return {
          data: { ok: true },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      },
    );
    const client = axios.create({ adapter });
    installAuthInterceptors(client);

    await expect(client.get("/api/v1/documents/me")).resolves.toMatchObject({
      data: { ok: true },
    });

    expect(storageMock.saveAccessToken).toHaveBeenCalledWith("new-access");
    expect(adapter).toHaveBeenCalledTimes(3);
  });
});

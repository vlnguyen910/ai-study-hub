import * as SecureStore from "expo-secure-store";
import {
  getAccessToken,
  getOrCreateDeviceId,
  getRefreshToken,
  removeTokens,
  saveAccessToken,
  saveTokens,
} from "@/utils/storage";

jest.mock("expo-secure-store", () => ({
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

const secureStoreMock = jest.mocked(SecureStore);

describe("mobile auth token storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("persists access and refresh tokens under the auth token keys", async () => {
    await saveTokens("access-token", "refresh-token");

    expect(secureStoreMock.setItemAsync).toHaveBeenCalledWith(
      "accessToken",
      "access-token",
    );
    expect(secureStoreMock.setItemAsync).toHaveBeenCalledWith(
      "refreshToken",
      "refresh-token",
    );
  });

  it("persists refreshed access tokens without changing the refresh token", async () => {
    await saveAccessToken("new-access-token");

    expect(secureStoreMock.setItemAsync).toHaveBeenCalledTimes(1);
    expect(secureStoreMock.setItemAsync).toHaveBeenCalledWith(
      "accessToken",
      "new-access-token",
    );
  });

  it("reads and clears stored auth tokens by their stable keys", async () => {
    secureStoreMock.getItemAsync
      .mockResolvedValueOnce("stored-access-token")
      .mockResolvedValueOnce("stored-refresh-token");

    await expect(getAccessToken()).resolves.toBe("stored-access-token");
    await expect(getRefreshToken()).resolves.toBe("stored-refresh-token");
    await removeTokens();

    expect(secureStoreMock.getItemAsync).toHaveBeenNthCalledWith(
      1,
      "accessToken",
    );
    expect(secureStoreMock.getItemAsync).toHaveBeenNthCalledWith(
      2,
      "refreshToken",
    );
    expect(secureStoreMock.deleteItemAsync).toHaveBeenCalledWith("accessToken");
    expect(secureStoreMock.deleteItemAsync).toHaveBeenCalledWith(
      "refreshToken",
    );
  });

  it("reuses an existing device id when present", async () => {
    secureStoreMock.getItemAsync.mockResolvedValue("device-1");

    await expect(getOrCreateDeviceId()).resolves.toBe("device-1");

    expect(secureStoreMock.getItemAsync).toHaveBeenCalledWith("deviceId");
    expect(secureStoreMock.setItemAsync).not.toHaveBeenCalled();
  });

  it("creates and stores a device id when one is missing", async () => {
    jest.spyOn(Date, "now").mockReturnValue(1_718_400_000_000);
    jest.spyOn(Math, "random").mockReturnValue(0.123456789);
    secureStoreMock.getItemAsync.mockResolvedValue(null);

    await expect(getOrCreateDeviceId()).resolves.toBe(
      "device-1718400000000-4fzzzxjy",
    );

    expect(secureStoreMock.setItemAsync).toHaveBeenCalledWith(
      "deviceId",
      "device-1718400000000-4fzzzxjy",
    );
  });
});

import { renderHook, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";

import {
  SessionProvider,
  useSession,
} from "@/features/auth/context/SessionContext";
import { fetchMyProfile } from "@/features/profile/services/profile.service";
import { getAccessToken, getRefreshToken, removeTokens } from "@/utils/storage";

jest.mock("@/features/profile/services/profile.service", () => ({
  fetchMyProfile: jest.fn(),
}));

jest.mock("@/services/api-client", () => ({
  apiClient: { post: jest.fn() },
}));

jest.mock("@/utils/storage", () => ({
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
  removeTokens: jest.fn(),
}));

const getAccessTokenMock = jest.mocked(getAccessToken);
const getRefreshTokenMock = jest.mocked(getRefreshToken);
const fetchMyProfileMock = jest.mocked(fetchMyProfile);
const removeTokensMock = jest.mocked(removeTokens);

const wrapper = ({ children }: { children: ReactNode }) => (
  <SessionProvider>{children}</SessionProvider>
);

describe("SessionProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("marks a device without credentials as unauthenticated", async () => {
    getAccessTokenMock.mockResolvedValue(null);
    getRefreshTokenMock.mockResolvedValue(null);

    const { result } = renderHook(() => useSession(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe("unauthenticated");
    });
    expect(fetchMyProfileMock).not.toHaveBeenCalled();
  });

  it("verifies stored credentials against the profile endpoint", async () => {
    getAccessTokenMock.mockResolvedValue("access-token");
    getRefreshTokenMock.mockResolvedValue("refresh-token");
    fetchMyProfileMock.mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      name: "Student",
      avatarUrl: null,
      role: "USER",
    });

    const { result } = renderHook(() => useSession(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });
    expect(result.current.user?.id).toBe("user-1");
  });

  it("clears credentials rejected by the API", async () => {
    getAccessTokenMock.mockResolvedValue("expired-access-token");
    getRefreshTokenMock.mockResolvedValue("expired-refresh-token");
    fetchMyProfileMock.mockRejectedValue({
      isAxiosError: true,
      response: { status: 401 },
    });

    const { result } = renderHook(() => useSession(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe("unauthenticated");
    });
    expect(removeTokensMock).toHaveBeenCalledTimes(1);
  });
});

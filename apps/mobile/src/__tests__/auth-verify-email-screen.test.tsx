import { Alert } from "react-native";
import { render, screen } from "@testing-library/react-native";
import { AuthVerifyEmailScreen } from "@/features/auth/screens/AuthVerifyEmailScreen";
import { verifyEmailService } from "@/features/auth/services/auth.service";
import { getDeviceId } from "@/utils/device";
import { saveTokens } from "@/utils/storage";

const mockRouterReplace = jest.fn();

jest.mock("expo-router", () => ({
  router: {
    replace: mockRouterReplace,
  },
  useLocalSearchParams: jest.fn(() => ({ token: "verify-token" })),
}));

jest.mock("@/features/auth/services/auth.service", () => ({
  AuthServiceError: class AuthServiceError extends Error {
    status?: number;

    constructor(message: string, status?: number) {
      super(message);
      this.name = "AuthServiceError";
      this.status = status;
    }
  },
  resendVerificationEmailService: jest.fn(),
  verifyEmailService: jest.fn(),
}));

jest.mock("@/utils/device", () => ({
  getDeviceId: jest.fn(),
}));

jest.mock("@/utils/storage", () => ({
  saveTokens: jest.fn(),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
  MaterialIcons: () => null,
  MaterialCommunityIcons: () => null,
}));

const verifyEmailServiceMock = jest.mocked(verifyEmailService);
const getDeviceIdMock = jest.mocked(getDeviceId);
const saveTokensMock = jest.mocked(saveTokens);

describe("AuthVerifyEmailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  });

  it("verifies email with current device id and persists returned tokens", async () => {
    getDeviceIdMock.mockResolvedValue("device-1");
    verifyEmailServiceMock.mockResolvedValue({
      success: true,
      status_code: 200,
      message: "Email verified successfully",
      data: {
        accessToken: "active-access-token",
        refreshToken: "active-refresh-token",
      },
    });

    render(<AuthVerifyEmailScreen />);

    expect(await screen.findByText(/Email.*xác thực/i)).toBeTruthy();
    expect(verifyEmailServiceMock).toHaveBeenCalledWith({
      token: "verify-token",
      deviceId: "device-1",
      deviceType: "MOBILE",
    });
    expect(saveTokensMock).toHaveBeenCalledWith(
      "active-access-token",
      "active-refresh-token",
    );
  }, 15000);
});

import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { AuthResetPasswordScreen } from "@/features/auth/screens/AuthResetPasswordScreen";
import { resetPasswordService } from "@/features/auth/services/auth.service";

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  router: {
    replace: (...args: unknown[]) => mockReplace(...args),
  },
  useLocalSearchParams: jest.fn(() => ({ token: "reset-token" })),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
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
  resetPasswordService: jest.fn(),
}));

const resetPasswordServiceMock = jest.mocked(resetPasswordService);

describe("AuthResetPasswordScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("submits reset token and new password to the backend", async () => {
    resetPasswordServiceMock.mockResolvedValue({
      success: true,
      status_code: 200,
      message: "Password reset successfully",
      data: null,
    });

    const { getAllByText, getByPlaceholderText, getByText } = render(
      <AuthResetPasswordScreen />,
    );

    fireEvent.changeText(getByPlaceholderText("Mật khẩu mới"), "Password123!");
    fireEvent.changeText(
      getByPlaceholderText("Xác nhận mật khẩu"),
      "Password123!",
    );
    fireEvent.press(getAllByText("Đặt lại mật khẩu")[1]);

    await waitFor(() => {
      expect(resetPasswordServiceMock).toHaveBeenCalledWith({
        token: "reset-token",
        password: "Password123!",
      });
    });

    expect(
      await waitFor(() => getByText("Mật khẩu đã được đặt lại.")),
    ).toBeTruthy();
  }, 15000);
});

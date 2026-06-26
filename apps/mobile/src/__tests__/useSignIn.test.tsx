import { act, renderHook } from "@testing-library/react-native";
import { Alert } from "react-native";
import {
  AuthServiceError,
  signInService,
} from "@/features/auth/services/auth.service";
import { useSignIn } from "@/features/auth/hooks/useSignIn";
import { getDeviceId } from "@/utils/device";
import { saveTokens } from "@/utils/storage";

jest.mock("@/features/auth/services/auth.service", () => ({
  AuthServiceError: class AuthServiceError extends Error {
    status?: number;

    constructor(message: string, status?: number) {
      super(message);
      this.name = "AuthServiceError";
      this.status = status;
    }
  },
  signInService: jest.fn(),
}));

jest.mock("@/utils/device", () => ({
  getDeviceId: jest.fn(),
}));

jest.mock("@/utils/storage", () => ({
  saveTokens: jest.fn(),
}));

const signInServiceMock = jest.mocked(signInService);
const getDeviceIdMock = jest.mocked(getDeviceId);
const saveTokensMock = jest.mocked(saveTokens);

describe("useSignIn", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  });

  it("persists access and refresh tokens returned by mobile signin", async () => {
    getDeviceIdMock.mockResolvedValue("device-1");
    signInServiceMock.mockResolvedValue({
      success: true,
      status_code: 200,
      message: "Signin successful",
      data: {
        accessToken: "access-token",
        refreshToken: "refresh-token",
      },
    });
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useSignIn());

    act(() => {
      result.current.form.setValue("email", "student@example.com", {
        shouldValidate: true,
      });
      result.current.form.setValue("password", "Password123!", {
        shouldValidate: true,
      });
    });

    await act(async () => {
      await result.current.submit(onSuccess);
    });

    expect(signInServiceMock).toHaveBeenCalledWith({
      email: "student@example.com",
      password: "Password123!",
      deviceId: "device-1",
    });
    expect(saveTokensMock).toHaveBeenCalledWith(
      "access-token",
      "refresh-token",
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("does not open the legacy verify-email route when signin reports verification", async () => {
    getDeviceIdMock.mockResolvedValue("device-1");
    signInServiceMock.mockRejectedValue(
      new AuthServiceError("Email verification required", 403),
    );
    const alertSpy = jest.spyOn(Alert, "alert");

    const { result } = renderHook(() => useSignIn());

    act(() => {
      result.current.form.setValue("email", "student@example.com", {
        shouldValidate: true,
      });
      result.current.form.setValue("password", "Password123!", {
        shouldValidate: true,
      });
    });

    await act(async () => {
      await result.current.submit(jest.fn());
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Đăng nhập thất bại",
      "Email verification required",
    );
  });
});

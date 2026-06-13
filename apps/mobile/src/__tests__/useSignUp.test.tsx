import { act, renderHook } from "@testing-library/react-native";
import { Alert } from "react-native";
import { signUpService } from "@/features/auth/services/auth.service";
import { useSignUp } from "@/features/auth/hooks/useSignUp";

jest.mock("@/features/auth/services/auth.service", () => ({
  AuthServiceError: class AuthServiceError extends Error {
    status?: number;

    constructor(message: string, status?: number) {
      super(message);
      this.name = "AuthServiceError";
      this.status = status;
    }
  },
  signUpService: jest.fn(),
}));

const signUpServiceMock = jest.mocked(signUpService);

describe("useSignUp", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  });

  it("creates an unverified account without signing in", async () => {
    signUpServiceMock.mockResolvedValue({
      success: true,
      status_code: 201,
      message: "Signup successful",
      data: null,
    });
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useSignUp());

    act(() => {
      result.current.form.setValue("name", "Nguyen Student", {
        shouldValidate: true,
      });
      result.current.form.setValue("email", "student@example.com", {
        shouldValidate: true,
      });
      result.current.form.setValue("password", "Password123!", {
        shouldValidate: true,
      });
      result.current.form.setValue("confirmPassword", "Password123!", {
        shouldValidate: true,
      });
    });

    await act(async () => {
      await result.current.submit(onSuccess);
    });

    expect(signUpServiceMock).toHaveBeenCalledWith({
      name: "Nguyen Student",
      email: "student@example.com",
      password: "Password123!",
    });
    expect(onSuccess).toHaveBeenCalledWith("student@example.com");
  });
});

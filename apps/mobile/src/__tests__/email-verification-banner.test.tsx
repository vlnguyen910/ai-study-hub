import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { EmailVerificationBanner } from "@/features/auth/components/EmailVerificationBanner";
import { resendVerificationEmailService } from "@/features/auth/services/auth.service";
import { getAccessToken } from "@/utils/storage";

jest.mock("@/features/auth/services/auth.service", () => ({
  resendVerificationEmailService: jest.fn(),
}));

jest.mock("@/utils/storage", () => ({
  getAccessToken: jest.fn(),
}));

const getAccessTokenMock = jest.mocked(getAccessToken);
const resendVerificationEmailServiceMock = jest.mocked(
  resendVerificationEmailService,
);

const encodeBase64Url = (value: string) => {
  const globalWithBuffer = globalThis as typeof globalThis & {
    Buffer: {
      from(input: string): { toString(encoding: "base64url"): string };
    };
  };

  return globalWithBuffer.Buffer.from(value).toString("base64url");
};

const makeAccessToken = (status: string) => {
  const payload = encodeBase64Url(
    JSON.stringify({
      sub: "user-1",
      role: "USER",
      status,
      type: "accessToken",
      deviceId: "device-1",
    }),
  );

  return `header.${payload}.signature`;
};

describe("EmailVerificationBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows resend action for unverified mobile sessions", async () => {
    getAccessTokenMock.mockResolvedValue(makeAccessToken("UNVERIFIED"));
    resendVerificationEmailServiceMock.mockResolvedValue({
      success: true,
      status_code: 200,
      message: "Verification email sent",
      data: null,
    });

    const { findByText, getByText } = render(<EmailVerificationBanner />);

    expect(
      await findByText(
        "Tài khoản của bạn chưa xác thực email. Vui lòng kiểm tra hộp thư để xác thực.",
      ),
    ).toBeTruthy();

    fireEvent.press(getByText("Gửi lại email xác thực"));

    await waitFor(() => {
      expect(resendVerificationEmailServiceMock).toHaveBeenCalledTimes(1);
    });
    expect(await findByText("Verification email sent")).toBeTruthy();
  }, 15000);

  it("does not render for active mobile sessions", async () => {
    getAccessTokenMock.mockResolvedValue(makeAccessToken("ACTIVE"));

    const { queryByText } = render(<EmailVerificationBanner />);

    await waitFor(() => {
      expect(
        queryByText(
          "Tài khoản của bạn chưa xác thực email. Vui lòng kiểm tra hộp thư để xác thực.",
        ),
      ).toBeNull();
    });
  }, 15000);
});

import { fireEvent, render } from "@testing-library/react-native";
import { router } from "expo-router";
import { DocumentUploadSuccessScreen } from "@/features/documents/screens/DocumentUploadSuccessScreen";
import { ROUTES } from "@/constants/routes";

const mockReplace = jest.fn();

describe("DocumentUploadSuccessScreen", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    (router as unknown as { replace: typeof mockReplace }).replace =
      mockReplace;
  });

  it("shows a success state and clear next actions", () => {
    const { getByText } = render(<DocumentUploadSuccessScreen />);

    expect(getByText("Tải lên tài liệu thành công")).toBeTruthy();
    expect(getByText(/Tài liệu của bạn đã được đăng lên/i)).toBeTruthy();
    expect(getByText("Xem tài liệu của tôi")).toBeTruthy();
  });

  it("returns to my documents instead of opening the uploaded detail", () => {
    const { getByText } = render(<DocumentUploadSuccessScreen />);

    fireEvent.press(getByText("Xem tài liệu của tôi"));

    expect(mockReplace).toHaveBeenCalledWith(ROUTES.MY_DOCUMENTS);
    expect(mockReplace).not.toHaveBeenCalledWith(
      expect.stringMatching(/^\/documents\/[a-f\d]{24}$/i),
    );
  });
});

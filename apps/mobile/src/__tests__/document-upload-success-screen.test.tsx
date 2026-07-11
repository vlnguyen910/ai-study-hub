import { render } from "@testing-library/react-native";
import { DocumentUploadSuccessScreen } from "@/features/documents/screens/DocumentUploadSuccessScreen";

describe("DocumentUploadSuccessScreen", () => {
  it("shows a success state and clear next actions", () => {
    const { getByText } = render(<DocumentUploadSuccessScreen />);

    expect(getByText("Tải lên tài liệu thành công")).toBeTruthy();
    expect(getByText(/Tài liệu của bạn đã được đăng lên/i)).toBeTruthy();
    expect(getByText("Xem tài liệu của tôi")).toBeTruthy();
  });
});

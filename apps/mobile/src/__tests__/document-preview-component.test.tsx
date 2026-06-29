import { render } from "@testing-library/react-native";

import { DocumentPreview } from "@/features/documents/components/DocumentPreview";

jest.mock("react-native-webview", () => {
  return {
    WebView: "WebView",
  };
});

describe("DocumentPreview", () => {
  it("renders PDF preview with an explicit native WebView height", () => {
    const { getByTestId } = render(
      <DocumentPreview
        document={{
          title: "test.pdf",
          format: "pdf",
          fileUrl: "https://res.cloudinary.com/demo/raw/upload/test.pdf",
          pdfPreviewUrl: null,
          extractedText: null,
        }}
      />,
    );

    expect(getByTestId("document-preview-webview")).toHaveStyle({
      height: 500,
    });
  });
});

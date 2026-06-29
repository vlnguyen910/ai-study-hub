import { fireEvent, render } from "@testing-library/react-native";

import { ReviewDocumentCard } from "@/features/document-review/components/ReviewDocumentCard";

const document = {
  id: "doc-1",
  title: "Algorithms",
  author: "by Student",
  uploadedAt: "29/06/2026",
  fileType: "PDF",
  fileSize: "1.2MB",
  description: "Pending document",
  category: "Computer Science",
  categoryKey: "cs",
  priority: "normal" as const,
};

describe("ReviewDocumentCard", () => {
  it("opens detail without rendering a quick reject action", () => {
    const onSeeDetail = jest.fn();

    const { getByText, queryByText } = render(
      <ReviewDocumentCard document={document} onSeeDetail={onSeeDetail} />,
    );

    expect(queryByText("Reject")).toBeNull();

    fireEvent.press(getByText("See Detail"));

    expect(onSeeDetail).toHaveBeenCalledTimes(1);
  });
});

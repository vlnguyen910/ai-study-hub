import { render, waitFor } from "@testing-library/react-native";
import { DocumentDetailScreen } from "@/features/documents/screens/DocumentDetailScreen";
import { useSession } from "@/features/auth/context/SessionContext";
import { fetchDocumentDetail } from "@/features/documents/services/documents.service";

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({ id: "doc-1" })),
}));

jest.mock("@/features/auth/context/SessionContext", () => ({
  useSession: jest.fn(),
}));

jest.mock("@/features/documents/services/documents.service", () => ({
  fetchDocumentDetail: jest.fn(),
  generateDocumentSummary: jest.fn(),
}));

jest.mock("@/components", () => ({
  Button: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Card: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PageShell: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/features/collections/components/SaveToCollectionModal", () => ({
  SaveToCollectionModal: () => null,
}));

jest.mock("@/features/chatbot", () => ({
  DocumentChatbotSheet: () => null,
}));

jest.mock("@/features/documents/components/DocumentBottomActionBar", () => ({
  DocumentBottomActionBar: () => null,
}));

jest.mock("@/features/documents/components/DocumentPreview", () => ({
  DocumentPreview: () => null,
}));

jest.mock("@/features/documents/components/DocumentSummaryCard", () => ({
  DocumentSummaryCard: () => null,
}));

const useSessionMock = jest.mocked(useSession);
const fetchDocumentDetailMock = jest.mocked(fetchDocumentDetail);

describe("DocumentDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("waits for auth state to settle before requesting the document detail", async () => {
    useSessionMock.mockReturnValue({
      status: "loading",
      isAuthenticated: false,
      user: null,
      refreshSession: jest.fn(),
      signOut: jest.fn(),
    });

    const { rerender } = render(<DocumentDetailScreen />);

    expect(fetchDocumentDetailMock).not.toHaveBeenCalled();

    useSessionMock.mockReturnValue({
      status: "authenticated",
      isAuthenticated: true,
      user: {
        id: "user-1",
        name: "Student",
        email: "student@example.com",
        avatarUrl: null,
        role: "USER",
      },
      refreshSession: jest.fn(),
      signOut: jest.fn(),
    });

    fetchDocumentDetailMock.mockResolvedValue({
      id: "doc-1",
      title: "Sample",
      description: null,
      fileUrl: "https://example.com/doc.pdf",
      publicId: "doc-1",
      status: "ACTIVE",
      isPublic: true,
      format: "pdf",
      sizeInBytes: 100,
      createdAt: "2024-01-01T00:00:00.000Z",
      author: {
        id: "user-1",
        name: "Student",
        avatarUrl: null,
        email: "student@example.com",
      },
      subject: null,
    });

    rerender(<DocumentDetailScreen />);

    await waitFor(() => {
      expect(fetchDocumentDetailMock).toHaveBeenCalledWith("doc-1");
    });
  });

  it("renders document content when the API returns a wrapped payload", async () => {
    useSessionMock.mockReturnValue({
      status: "authenticated",
      isAuthenticated: true,
      user: {
        id: "user-1",
        name: "Student",
        email: "student@example.com",
        avatarUrl: null,
        role: "USER",
      },
      refreshSession: jest.fn(),
      signOut: jest.fn(),
    });

    fetchDocumentDetailMock.mockResolvedValue({
      message: "Document fetched successfully",
      data: {
        id: "doc-1",
        title: "Wrapped Sample",
        description: null,
        fileUrl: "https://example.com/doc.pdf",
        publicId: "doc-1",
        status: "ACTIVE",
        isPublic: true,
        format: "pdf",
        sizeInBytes: 100,
        createdAt: "2024-01-01T00:00:00.000Z",
        author: {
          id: "user-1",
          name: "Student",
          avatarUrl: null,
          email: "student@example.com",
        },
        subject: null,
      },
    } as any);

    const { findByText } = render(<DocumentDetailScreen />);

    expect(await findByText("Wrapped Sample")).toBeTruthy();
  });
});

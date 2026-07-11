import { apiClient } from "@/services/api-client";
import { uploadToCloudinary } from "@/services/cloudinary.service";

jest.mock("@/services/api-client", () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

describe("uploadToCloudinary", () => {
  it("uploads the selected file to the backend upload endpoint", async () => {
    const postMock = apiClient.post as jest.MockedFunction<
      typeof apiClient.post
    >;

    postMock.mockResolvedValue({
      data: {
        data: {
          secureUrl: "https://cdn.example.com/file.pdf",
          publicId: "doc-123",
          bytes: 2400,
          format: "pdf",
          resourceType: "raw",
        },
      },
    } as never);

    const result = await uploadToCloudinary(
      "file:///tmp/document.pdf",
      "document.pdf",
      "pdf",
    );

    expect(postMock).toHaveBeenCalledWith(
      "/api/v1/documents/upload",
      expect.any(FormData),
      { headers: { "Content-Type": "multipart/form-data" } },
    );

    expect(result).toEqual({
      secureUrl: "https://cdn.example.com/file.pdf",
      publicId: "doc-123",
      bytes: 2400,
      format: "pdf",
      resourceType: "raw",
    });
  });
});

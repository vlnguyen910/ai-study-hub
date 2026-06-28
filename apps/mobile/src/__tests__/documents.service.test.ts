import {
  approveDocument,
  createDocument,
  deleteDocument,
  fetchDocumentDetail,
  fetchDocuments,
  fetchMyDocuments,
  fetchSubjects,
  generateDescriptionFromUrl,
  generateDocumentSummary,
  rejectDocument,
  runModeratorAnalysis,
  updateDocument,
  type DocumentsApiClient,
} from "@/features/documents/services/documents.service";

const createClientMock = (): jest.Mocked<DocumentsApiClient> => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
});

describe("documents.service", () => {
  it("fetches public documents with query params", async () => {
    const client = createClientMock();
    const response = { documents: [], pagination: { page: 1 } };
    client.get.mockResolvedValue({ data: { data: response } });

    await expect(
      fetchDocuments(
        {
          page: 2,
          limit: 20,
          subjectId: "subject-1",
          status: "PENDING",
          search: "algorithm",
          isSemantic: true,
        },
        client,
      ),
    ).resolves.toBe(response);

    expect(client.get).toHaveBeenCalledWith("/api/v1/documents", {
      params: {
        page: 2,
        limit: 20,
        subjectId: "subject-1",
        status: "PENDING",
        search: "algorithm",
        isSemantic: true,
      },
    });
  });

  it("fetches only active documents for the public home feed", async () => {
    const client = createClientMock();
    const response = { documents: [], pagination: { page: 1 } };
    client.get.mockResolvedValue({ data: { data: response } });

    await fetchDocuments({ page: 1, limit: 10, status: "ACTIVE" }, client);

    expect(client.get).toHaveBeenCalledWith("/api/v1/documents", {
      params: { page: 1, limit: 10, status: "ACTIVE" },
    });
  });

  it("fetches current user documents", async () => {
    const client = createClientMock();
    const response = { documents: [], pagination: { page: 1 } };
    client.get.mockResolvedValue({ data: { data: response } });

    await expect(fetchMyDocuments({ page: 1 }, client)).resolves.toBe(response);

    expect(client.get).toHaveBeenCalledWith("/api/v1/documents/me", {
      params: { page: 1, limit: 10 },
    });
  });

  it("fetches document detail", async () => {
    const client = createClientMock();
    const response = { id: "doc-1" };
    client.get.mockResolvedValue({ data: { data: response } });

    await expect(fetchDocumentDetail("doc-1", client)).resolves.toBe(response);

    expect(client.get).toHaveBeenCalledWith("/api/v1/documents/doc-1");
  });

  it("creates document metadata with visibility", async () => {
    const client = createClientMock();
    const payload = {
      title: "Doc",
      fileUrl: "https://example.com/doc.pdf",
      publicId: "doc",
      sizeInBytes: 100,
      format: "pdf",
      resourceType: "document",
      isPublic: true,
    };
    const response = { id: "doc-1" };
    client.post.mockResolvedValue({ data: { data: response } });

    await expect(createDocument(payload, client)).resolves.toBe(response);

    expect(client.post).toHaveBeenCalledWith("/api/v1/documents", payload);
  });

  it("updates document metadata", async () => {
    const client = createClientMock();
    const payload = { title: "Updated", isPublic: true };
    const response = { id: "doc-1", title: "Updated" };
    client.patch.mockResolvedValue({ data: { data: response } });

    await expect(updateDocument("doc-1", payload, client)).resolves.toBe(
      response,
    );

    expect(client.patch).toHaveBeenCalledWith(
      "/api/v1/documents/doc-1",
      payload,
    );
  });

  it("deletes document metadata", async () => {
    const client = createClientMock();
    client.delete.mockResolvedValue({ data: { message: "ok" } });

    await expect(deleteDocument("doc-1", client)).resolves.toBeUndefined();

    expect(client.delete).toHaveBeenCalledWith("/api/v1/documents/doc-1");
  });

  it("fetches subjects", async () => {
    const client = createClientMock();
    const response = { subjects: [], pagination: { page: 1 } };
    client.get.mockResolvedValue({ data: { data: response } });

    await expect(fetchSubjects(50, client)).resolves.toBe(response);

    expect(client.get).toHaveBeenCalledWith("/api/v1/subjects", {
      params: { page: 1, limit: 50 },
    });
  });

  it("generates description from uploaded URL", async () => {
    const client = createClientMock();
    client.post.mockResolvedValue({
      data: { data: { description: "AI description" } },
    });

    await expect(
      generateDescriptionFromUrl("https://cdn/doc.pdf", "pdf", client),
    ).resolves.toBe("AI description");

    expect(client.post).toHaveBeenCalledWith(
      "/api/v1/documents/generate-description-from-url",
      { fileUrl: "https://cdn/doc.pdf", format: "pdf" },
      { timeout: 60_000 },
    );
  });

  it("generates document summary", async () => {
    const client = createClientMock();
    client.post.mockResolvedValue({ data: { data: { summary: "Summary" } } });

    await expect(generateDocumentSummary("doc-1", client)).resolves.toBe(
      "Summary",
    );

    expect(client.post).toHaveBeenCalledWith(
      "/api/v1/documents/doc-1/generate-summary",
      {},
      { timeout: 60_000 },
    );
  });

  it("approves and rejects documents", async () => {
    const client = createClientMock();
    client.post.mockResolvedValueOnce({ data: { data: { id: "doc-1" } } });
    client.post.mockResolvedValueOnce({ data: { data: { id: "doc-1" } } });

    await expect(approveDocument("doc-1", client)).resolves.toEqual({
      id: "doc-1",
    });
    await expect(
      rejectDocument("doc-1", { rejectionReason: "Không phù hợp." }, client),
    ).resolves.toEqual({ id: "doc-1" });

    expect(client.post).toHaveBeenNthCalledWith(
      1,
      "/api/v1/documents/doc-1/approve",
    );
    expect(client.post).toHaveBeenNthCalledWith(
      2,
      "/api/v1/documents/doc-1/reject",
      { rejectionReason: "Không phù hợp." },
    );
  });

  it("runs moderator analysis", async () => {
    const client = createClientMock();
    const response = {
      summary: "Looks fine",
      flags: [],
      moderationSuggestion: "APPROVE",
      moderationReason: "No issue",
    };
    client.post.mockResolvedValue({ data: { data: response } });

    await expect(runModeratorAnalysis("doc-1", client)).resolves.toBe(response);

    expect(client.post).toHaveBeenCalledWith(
      "/api/v1/documents/doc-1/moderator-analysis",
      {},
      { timeout: 60_000 },
    );
  });
});

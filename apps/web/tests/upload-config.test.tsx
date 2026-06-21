import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUploadConfig } from "../src/modules/user/documents/uploads/hooks/useUploadConfig";
import { apiClient } from "../src/lib/axios";
import { validateFile } from "../src/utils/validate.file";

vi.mock("../src/lib/axios", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const clientMock = vi.mocked(apiClient);

describe("runtime upload config", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps dynamically enabled extensions from public settings", async () => {
    clientMock.get.mockResolvedValue({
      upload: {
        maxFileSizeMb: 25,
        allowedFileTypes: ["PDF", "XLSX", "EPUB"],
      },
    });

    const { result } = renderHook(() => useUploadConfig());

    await waitFor(() => {
      expect(result.current.maxFileSize).toBe(25 * 1024 * 1024);
    });

    expect(result.current.allowedExtensions).toEqual([
      ".pdf",
      ".xlsx",
      ".epub",
    ]);
    expect(result.current.allowedMimeTypes).toContain("application/pdf");
    expect(result.current.allowedMimeTypes).not.toContain(undefined);
  });

  it("accepts an enabled custom extension without relying on MIME", () => {
    const file = new File(["book"], "study.epub", { type: "" });

    expect(
      validateFile(file, {
        maxFileSize: 1024,
        maxFiles: 1,
        allowedExtensions: [".epub"],
        allowedMimeTypes: [],
      }),
    ).toEqual({ valid: true });
  });
});

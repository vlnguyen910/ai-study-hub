import { Directory, File, Paths } from "expo-file-system";

import { downloadDocumentToDevice } from "@/features/documents/utils/download-document";

jest.mock("expo-file-system", () => ({
  Paths: {
    cache: { uri: "file:///cache/" },
  },
  Directory: {
    pickDirectoryAsync: jest.fn(),
  },
  File: Object.assign(jest.fn(), {
    downloadFileAsync: jest.fn(),
  }),
}));

const pickDirectoryMock = jest.mocked(Directory.pickDirectoryAsync);
const fileConstructorMock = jest.mocked(File);
const downloadFileMock = jest.mocked(File.downloadFileAsync);

describe("downloadDocumentToDevice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("downloads to cache before copying into the selected Android directory", async () => {
    const readBytes = jest
      .fn()
      .mockReturnValueOnce(new Uint8Array([1, 2]))
      .mockReturnValueOnce(new Uint8Array([3]))
      .mockReturnValueOnce(new Uint8Array());
    const close = jest.fn();
    const temporaryFile = {
      uri: "file:///cache/document-download-notes.pdf",
      exists: true,
      open: jest.fn(() => ({ readBytes, close })),
      delete: jest.fn(),
    } as unknown as File;
    const destination = {
      uri: "content://downloads/notes.pdf",
      exists: true,
      write: jest.fn(),
      delete: jest.fn(),
    } as unknown as File;
    const directory = {
      uri: "content://downloads",
      createFile: jest.fn(() => destination),
    } as unknown as Directory;
    pickDirectoryMock.mockResolvedValue(directory);
    fileConstructorMock.mockReturnValue(temporaryFile);
    downloadFileMock.mockResolvedValue(temporaryFile);

    await expect(
      downloadDocumentToDevice({
        url: "https://res.cloudinary.com/demo/raw/upload/notes.pdf",
        fileName: "notes.pdf",
      }),
    ).resolves.toEqual({ uri: destination.uri });

    expect(fileConstructorMock).toHaveBeenCalledWith(
      Paths.cache,
      expect.stringMatching(/^document-download-\d+-notes\.pdf$/),
    );
    expect(downloadFileMock).toHaveBeenCalledWith(
      "https://res.cloudinary.com/demo/raw/upload/notes.pdf",
      temporaryFile,
      { idempotent: true },
    );
    expect(directory.createFile).toHaveBeenCalledWith(
      "notes.pdf",
      "application/pdf",
    );
    expect(destination.write).toHaveBeenNthCalledWith(
      1,
      new Uint8Array([1, 2]),
      { append: false },
    );
    expect(destination.write).toHaveBeenNthCalledWith(2, new Uint8Array([3]), {
      append: true,
    });
    expect(close).toHaveBeenCalledTimes(1);
    expect(temporaryFile.delete).toHaveBeenCalledTimes(1);
  });

  it("removes partial output and the temporary file when copying fails", async () => {
    const temporaryFile = {
      uri: "file:///cache/document-download-notes.pdf",
      exists: true,
      open: jest.fn(() => ({
        readBytes: jest.fn(() => new Uint8Array([1])),
        close: jest.fn(),
      })),
      delete: jest.fn(),
    } as unknown as File;
    const destination = {
      uri: "content://downloads/notes.pdf",
      exists: true,
      write: jest.fn(() => {
        throw new Error("copy failed");
      }),
      delete: jest.fn(),
    } as unknown as File;
    const directory = {
      uri: "content://downloads",
      createFile: jest.fn(() => destination),
    } as unknown as Directory;
    pickDirectoryMock.mockResolvedValue(directory);
    fileConstructorMock.mockReturnValue(temporaryFile);
    downloadFileMock.mockResolvedValue(temporaryFile);

    await expect(
      downloadDocumentToDevice({
        url: "https://res.cloudinary.com/demo/raw/upload/notes.pdf",
        fileName: "notes.pdf",
      }),
    ).rejects.toThrow("copy failed");

    expect(destination.delete).toHaveBeenCalledTimes(1);
    expect(temporaryFile.delete).toHaveBeenCalledTimes(1);
  });
});

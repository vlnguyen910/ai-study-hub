import { Directory, File, Paths } from "expo-file-system";

const COPY_CHUNK_SIZE = 1024 * 1024;

const MIME_TYPES: Readonly<Record<string, string>> = {
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  pdf: "application/pdf",
  png: "image/png",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  txt: "text/plain",
  webp: "image/webp",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export interface DownloadDocumentInput {
  readonly url: string;
  readonly fileName: string;
}

export interface DownloadDocumentResult {
  readonly uri: string;
}

function getMimeType(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  return MIME_TYPES[extension] ?? "application/octet-stream";
}

function copyFileInChunks(source: File, destination: File): void {
  const sourceHandle = source.open();
  let append = false;

  try {
    while (true) {
      const chunk = sourceHandle.readBytes(COPY_CHUNK_SIZE);

      if (chunk.length === 0) {
        break;
      }

      destination.write(chunk, { append });
      append = true;
    }
  } finally {
    sourceHandle.close();
  }
}

export async function downloadDocumentToDevice({
  url,
  fileName,
}: DownloadDocumentInput): Promise<DownloadDocumentResult> {
  const selectedDirectory = await Directory.pickDirectoryAsync();
  const temporaryFile = new File(
    Paths.cache,
    `document-download-${Date.now()}-${fileName}`,
  );
  let destination: File | null = null;

  try {
    await File.downloadFileAsync(url, temporaryFile, { idempotent: true });
    destination = selectedDirectory.createFile(fileName, getMimeType(fileName));
    copyFileInChunks(temporaryFile, destination);

    return { uri: destination.uri };
  } catch (error) {
    if (destination?.exists) {
      destination.delete();
    }

    throw error;
  } finally {
    if (temporaryFile.exists) {
      temporaryFile.delete();
    }
  }
}

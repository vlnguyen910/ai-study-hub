export interface DownloadDocumentInput {
  readonly url: string;
  readonly fileName: string;
}

export interface DownloadDocumentResult {
  readonly uri: string;
}

export async function downloadDocumentToDevice({
  url,
  fileName,
}: DownloadDocumentInput): Promise<DownloadDocumentResult> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Không thể tải tệp (${response.status}).`);
  }

  const objectUrl = URL.createObjectURL(await response.blob());
  const anchor = window.document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.style.display = "none";
  window.document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);

  return { uri: fileName };
}

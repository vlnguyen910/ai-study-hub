import { UploadConfig } from "../types/upload";

export interface ValidateFileResult {
  readonly valid: boolean;
  readonly error?: string;
}

export const validateFile = (
  file: File,
  config: UploadConfig,
): ValidateFileResult => {
  // The admin config is extension-based. MIME remains an input hint, but it
  // cannot be required because browsers return an empty/unknown MIME for many
  // custom academic file formats.
  const extension = file.name.includes(".")
    ? `.${file.name.split(".").pop()?.toLowerCase()}`
    : "";
  const normalizedAllowedExtensions = config.allowedExtensions.map((ext) =>
    ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`,
  );

  const validExtension = normalizedAllowedExtensions.includes(extension);

  if (!validExtension) {
    return {
      valid: false,
      error: "Unsupported file type",
    };
  }

  // validate size
  if (file.size > config.maxFileSize) {
    return {
      valid: false,
      error: `File exceeds ${config.maxFileSize / 1024 / 1024}MB`,
    };
  }

  return {
    valid: true,
  };
};

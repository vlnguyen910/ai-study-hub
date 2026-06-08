export const DEFAULT_UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024,

  maxFiles: 5,

  allowedMimeTypes: [
    "application/pdf",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "text/plain",

    "image/png",

    "image/jpeg",
  ],

  allowedExtensions: [".pdf", ".docx", ".txt", ".png", ".jpg", ".jpeg"],
};

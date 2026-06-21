"use client";

import { DEFAULT_UPLOAD_CONFIG } from "@/constants/upload.const";
import { apiClient } from "@/lib/axios";
import { API_ENDPOINTS } from "@/shared/constants";
import { UploadConfig } from "@/types/upload";
import { useEffect, useState } from "react";

const mimeTypesByExtension: Record<string, string> = {
  PDF: "application/pdf",
  DOC: "application/msword",
  DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  XLS: "application/vnd.ms-excel",
  XLSX: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  PPT: "application/vnd.ms-powerpoint",
  PPTX: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  TXT: "text/plain",
  CSV: "text/csv",
};

interface RuntimeSettings {
  upload: {
    maxFileSizeMb: number;
    allowedFileTypes: string[];
  };
}

const toUploadConfig = (settings: RuntimeSettings): UploadConfig => {
  const extensions = settings.upload.allowedFileTypes.map((extension) =>
    extension.trim().replace(/^\.+/, "").toUpperCase(),
  );

  return {
    maxFileSize: settings.upload.maxFileSizeMb * 1024 * 1024,
    maxFiles: 1,
    allowedExtensions: extensions.map(
      (extension) => `.${extension.toLowerCase()}`,
    ),
    allowedMimeTypes: extensions
      .map((extension) => mimeTypesByExtension[extension])
      .filter((mimeType): mimeType is string => Boolean(mimeType)),
  };
};

export const useUploadConfig = () => {
  const [config, setConfig] = useState<UploadConfig>(DEFAULT_UPLOAD_CONFIG);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const settings = await apiClient.get<unknown, RuntimeSettings>(
          API_ENDPOINTS.SETTINGS,
          { skipToast: true },
        );
        setConfig(toUploadConfig(settings));
      } catch {
        // fallback default config
      }
    };

    fetchConfig();
  }, []);

  return config;
};

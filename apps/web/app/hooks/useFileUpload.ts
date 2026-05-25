"use client";

import { useState } from "react";
import { useUploadConfig } from "./useUploadConfig";
import { validateFile } from "../utils/validate.file";

export const useFileUpload = () => {
  const config = useUploadConfig();

  const [files, setFiles] = useState<File[]>([]);

  const [error, setError] = useState("");

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    // validate max files
    if (selectedFiles.length > config.maxFiles) {
      setError(`Maximum ${config.maxFiles} files allowed`);

      return;
    }

    const validFiles: File[] = [];

    for (const file of selectedFiles) {
      const result = validateFile(file, config);

      if (!result.valid) {
        setError(result.error || "Invalid file");

        return;
      }

      validFiles.push(file);
    }

    setFiles(validFiles);

    setError("");
  };

  return {
    files,
    error,
    handleUpload,
    config,
  };
};

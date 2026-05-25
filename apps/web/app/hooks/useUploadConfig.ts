"use client";

import { useEffect, useState } from "react";
import { UploadConfig } from "../types/upload";
import { DEFAULT_UPLOAD_CONFIG } from "../constants/upload.const";

export const useUploadConfig = () => {
  const [config, setConfig] = useState<UploadConfig>(DEFAULT_UPLOAD_CONFIG);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/upload-config");

        const data = await response.json();

        setConfig(data);
      } catch {
        // fallback default config
      }
    };

    fetchConfig();
  }, []);

  return config;
};

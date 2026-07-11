import { API_ENDPOINTS } from "@/constants/endpoints";
import { apiClient } from "@/services/api-client";

export interface CloudinaryUploadResponse {
  secureUrl: string;
  publicId: string;
  bytes: number;
  format: string;
  resourceType: string;
}

const getMimeType = (format: string): string => {
  const ext = format.toLowerCase();
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "doc":
      return "application/msword";
    case "txt":
      return "text/plain";
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "ppt":
      return "application/vnd.ms-powerpoint";
    default:
      return "application/octet-stream";
  }
};

export const uploadToCloudinary = async (
  fileUri: string,
  fileName: string,
  format: string,
): Promise<CloudinaryUploadResponse> => {
  const formData = new FormData();
  formData.append("file", {
    uri: fileUri,
    name: fileName,
    type: getMimeType(format),
  } as any);

  const response = await apiClient.post(
    API_ENDPOINTS.DOCUMENTS.UPLOAD,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  const data = response.data;

  return {
    secureUrl: data?.data?.secureUrl || data?.secureUrl,
    publicId: data?.data?.publicId || data?.publicId,
    bytes: data?.data?.bytes || data?.bytes || 0,
    format: data?.data?.format || data?.format || format,
    resourceType: data?.data?.resourceType || data?.resourceType || "raw",
  };
};

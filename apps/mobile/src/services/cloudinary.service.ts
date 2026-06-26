import axios from "axios";

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
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary cloud name or upload preset is not configured in environment variables.",
    );
  }

  // Cloudinary expects raw files (PDFs, docx, etc.) to be uploaded to /raw/upload
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;

  const formData = new FormData();
  formData.append("file", {
    uri: fileUri,
    name: fileName,
    type: getMimeType(format),
  } as any);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const data = response.data;

    return {
      secureUrl: data.secure_url,
      publicId: data.public_id,
      bytes: data.bytes || 0,
      format: data.format || format,
      resourceType: data.resource_type || "raw",
    };
  } catch (error: any) {
    throw error;
  }
};

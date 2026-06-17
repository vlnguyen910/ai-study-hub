import { APP_CONFIG } from "@/config";
import { API_ENDPOINTS } from "@/shared/constants";

interface BuildGoogleLoginUrlOptions {
  apiBaseUrl?: string;
  deviceId: string;
  redirectPath?: string | null;
}

export const buildGoogleLoginUrl = ({
  apiBaseUrl = APP_CONFIG.api.baseUrl,
  deviceId,
  redirectPath,
}: BuildGoogleLoginUrlOptions): string => {
  const baseUrl = `${apiBaseUrl}${API_ENDPOINTS.AUTH.GOOGLE}`;
  const params = new URLSearchParams({ deviceId });

  if (redirectPath) {
    params.set("redirectPath", redirectPath);
  }

  return `${baseUrl}?${params.toString()}`;
};

export const consumeGoogleAccessTokenFromHash = (
  hash: string,
): string | null => {
  const normalizedHash = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(normalizedHash);
  const accessToken = params.get("googleAccessToken");

  return accessToken && accessToken.length > 0 ? accessToken : null;
};

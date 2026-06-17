import { APP_CONFIG } from "@/config";
import { buildUserFromAccessToken } from "@/lib/auth";
import { API_ENDPOINTS } from "@/shared/constants";
import { useAuthStore } from "@/stores/auth/store";

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

export const completeGoogleLoginFromLocation = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  const accessToken = consumeGoogleAccessTokenFromHash(window.location.hash);

  if (!accessToken) {
    return false;
  }

  const user = buildUserFromAccessToken(accessToken);

  if (!user) {
    return false;
  }

  useAuthStore.getState().setAuth(accessToken, user.role, user, null);
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${window.location.search}`,
  );

  return true;
};

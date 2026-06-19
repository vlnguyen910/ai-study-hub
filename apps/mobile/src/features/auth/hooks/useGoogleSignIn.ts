import { useState } from "react";
import { Alert } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import {
  googleSignInService,
  AuthServiceError,
} from "../services/auth.service";
import { getDeviceId } from "../../../utils/device";
import { saveTokens } from "../../../utils/storage";

WebBrowser.maybeCompleteAuthSession();

const PLACEHOLDER = "PLACE_HOLDER";

const googleClientIds = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || PLACEHOLDER,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || PLACEHOLDER,
  androidClientId:
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || PLACEHOLDER,
};

export const useGoogleSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    ...googleClientIds,
    selectAccount: true,
  });

  const signIn = async (onSuccess?: () => void | Promise<void>) => {
    setIsLoading(true);

    try {
      const result = await promptAsync();

      if (result.type !== "success") {
        return;
      }

      const idToken = result.params?.id_token;

      if (!idToken) {
        throw new AuthServiceError("Google did not return an id token");
      }

      const deviceId = await getDeviceId();
      const response = await googleSignInService({ idToken, deviceId });

      if (response.data?.accessToken && response.data.refreshToken) {
        await saveTokens(response.data.accessToken, response.data.refreshToken);
      }

      await onSuccess?.();
    } catch (error) {
      const message =
        error instanceof AuthServiceError
          ? error.message
          : "Đăng nhập Google thất bại. Vui lòng thử lại.";
      Alert.alert("Đăng nhập Google thất bại", message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isGoogleLoading: isLoading,
    isGoogleReady: Boolean(request),
    signInWithGoogle: signIn,
  };
};

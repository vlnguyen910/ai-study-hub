import * as Application from "expo-application";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const FALLBACK_DEVICE_ID_KEY = "fallback_device_id";

export const getDeviceId = async (): Promise<string> => {
  try {
    if (Platform.OS === "android") {
      const androidId = Application.getAndroidId();
      if (androidId) return androidId;
    }
    if (Platform.OS === "ios") {
      const iosId = await Application.getIosIdForVendorAsync();
      if (iosId) return iosId;
    }
  } catch (error) {
    console.warn("Failed to get native device ID:", error);
  }

  try {
    const existingId = await SecureStore.getItemAsync(FALLBACK_DEVICE_ID_KEY);
    if (existingId) return existingId;

    const newId = `fallback-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 15)}`;
    await SecureStore.setItemAsync(FALLBACK_DEVICE_ID_KEY, newId);
    return newId;
  } catch (error) {
    console.warn("Failed to access secure store for device ID:", error);
    return `fallback-temp-${Date.now().toString(36)}`;
  }
};

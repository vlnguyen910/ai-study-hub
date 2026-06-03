import * as Application from "expo-application";
import { Platform } from "react-native";

export const getDeviceId = async (): Promise<string> => {
  if (Platform.OS === "android") {
    return Application.getAndroidId() || "unknown-android";
  }
  if (Platform.OS === "ios") {
    const iosId = await Application.getIosIdForVendorAsync();
    return iosId || "unknown-ios";
  }
  return "unknown-device";
};

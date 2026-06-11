import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const DEVICE_ID_KEY = "deviceId";

const generateDeviceId = (): string => {
  return `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const saveTokens = async (accessToken: string, refreshToken: string) => {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error("Error saving tokens:", error);
  }
};

export const saveAccessToken = async (accessToken: string) => {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  } catch (error) {
    console.error("Error saving access token:", error);
  }
};

export const getAccessToken = async () => {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
};

export const getRefreshToken = async () => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Error getting refresh token:", error);
    return null;
  }
};

export const removeTokens = async () => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Error removing tokens:", error);
  }
};

export const getOrCreateDeviceId = async (): Promise<string> => {
  try {
    const existingDeviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (existingDeviceId) {
      return existingDeviceId;
    }

    const deviceId = generateDeviceId();
    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
    return deviceId;
  } catch (error) {
    console.error("Error getting device id:", error);
    return generateDeviceId();
  }
};

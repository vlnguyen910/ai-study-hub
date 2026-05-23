/**
 * Utility Functions
 */

// String utilities
export const truncate = (str: string, length: number) => {
  return str.length > length ? str.slice(0, length) + "..." : str;
};

export const capitalizeFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  return /\S+@\S+\.\S+/.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

// Storage utilities
export const setLocalStorage = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Failed to set localStorage:", error);
  }
};

export const getLocalStorage = <T = unknown>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error("Failed to get localStorage:", error);
    return null;
  }
};

export const removeLocalStorage = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to remove from localStorage:", error);
  }
};

// Format utilities
export const formatNumber = (num: number): string => {
  return num.toLocaleString("en-US");
};

export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString("vi-VN");
};

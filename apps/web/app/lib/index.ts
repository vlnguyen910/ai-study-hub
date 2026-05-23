/**
 * Library Functions & Helpers
 */

// API Client
export const fetchAPI = async <T = unknown>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API fetch error:", error);
    throw error;
  }
};

// Class Name Merger (cn alternative)
export const cn = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(" ");
};

type AuthTokenPayload = {
  status?: string;
};

const decodeBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded =
    padding === 0 ? normalized : normalized + "=".repeat(4 - padding);
  const globalWithBuffer = globalThis as typeof globalThis & {
    Buffer?: {
      from(input: string, encoding: "base64"): { toString(): string };
    };
  };

  if (globalWithBuffer.Buffer) {
    return globalWithBuffer.Buffer.from(padded, "base64").toString();
  }

  if (typeof atob === "function") {
    return atob(padded);
  }

  throw new Error("No base64 decoder available");
};

export const getAuthTokenStatus = (token: string | null): string | null => {
  const payloadPart = token?.split(".")[1];

  if (!payloadPart) {
    return null;
  }

  try {
    const payload = JSON.parse(
      decodeBase64Url(payloadPart),
    ) as AuthTokenPayload;
    return typeof payload.status === "string" ? payload.status : null;
  } catch {
    return null;
  }
};

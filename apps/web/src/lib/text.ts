const mojibakeIndicators =
  /[\u00C3\u00C2\u00C4\u00C5\u00C6\u00D0\u00DE\u00E1\u00BA\u00BB]/u;

const canDecodeUtf8Mojibake = (value: string): boolean => {
  if (!value || !mojibakeIndicators.test(value)) {
    return false;
  }

  try {
    const bytes = Uint8Array.from(value, (character) =>
      character.charCodeAt(0),
    );
    const decoded = new TextDecoder("utf-8").decode(bytes);

    return decoded !== value && !decoded.includes("\uFFFD");
  } catch {
    return false;
  }
};

export const normalizeUtf8Mojibake = (
  value?: string | null,
): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (!canDecodeUtf8Mojibake(value)) {
    return value;
  }

  const bytes = Uint8Array.from(value, (character) => character.charCodeAt(0));
  const decoded = new TextDecoder("utf-8").decode(bytes);

  return decoded || value;
};

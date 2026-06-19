import { useEffect, useState } from "react";

export function useDocumentText(fileUrl: string, enabled: boolean) {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetch(fileUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Preview request failed (${response.status})`);
        }
        return response.text();
      })
      .then((content) => setText(content.slice(0, 50_000)))
      .catch((loadError: unknown) => {
        if (loadError instanceof Error && loadError.name === "AbortError") {
          return;
        }
        setError("Không thể tải nội dung xem trước của tệp văn bản.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [enabled, fileUrl]);

  return { text, isLoading, error };
}

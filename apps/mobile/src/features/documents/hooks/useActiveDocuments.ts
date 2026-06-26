import { useCallback, useEffect, useState } from "react";

import { fetchDocuments } from "../services/documents.service";
import type { LibraryDocument } from "../types/document.types";

export function useActiveDocuments(limit = 20) {
  const [documents, setDocuments] = useState<readonly LibraryDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchDocuments({
        page: 1,
        limit,
        status: "ACTIVE",
      });
      setDocuments(
        response.documents.filter((document) => document.status === "ACTIVE"),
      );
    } catch {
      setDocuments([]);
      setError("Unable to load active documents. Pull to try again.");
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  return { documents, isLoading, error, reload: loadDocuments };
}

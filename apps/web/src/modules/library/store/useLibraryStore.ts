"use client";

/**
 * Library Zustand store.
 * Owns documents[], subjects[], pagination, loading flags, and active filters.
 *
 * Filter behaviour:
 *  - subjectId  → passed to the backend query (server-side)
 *  - search     → applied client-side on the fetched page (title match)
 *  - Changing either filter resets page to 1 and re-fetches from the API.
 */

import { create } from "zustand";
import { fetchDocuments, fetchSubjects } from "@/apis/document.api";
import type {
  LibraryDocument,
  PaginationMeta,
  Subject,
} from "@/types/document.type";

interface LibraryFilters {
  search: string;
  subjectId: string;
  page: number;
  isSemantic: boolean;
}

interface LibraryState {
  documents: LibraryDocument[];
  subjects: Subject[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  isLoadingSubjects: boolean;
  error: string | null;
  filters: LibraryFilters;

  /** Fetch a page of documents using current filters */
  fetchDocuments: () => Promise<void>;
  /** Fetch subjects once for the filter sidebar */
  fetchSubjects: () => Promise<void>;
  /** Update the free-text search term (client-side filter only, no re-fetch) */
  setSearch: (search: string) => void;
  /** Toggle semantic search */
  setIsSemantic: (isSemantic: boolean) => void;
  /** Switch active subject filter and re-fetch from page 1 */
  setSubjectId: (subjectId: string) => void;
  /** Jump to a specific page and re-fetch */
  setPage: (page: number) => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  documents: [],
  subjects: [],
  pagination: null,
  isLoading: false,
  isLoadingSubjects: false,
  error: null,
  filters: {
    search: "",
    subjectId: "",
    page: 1,
    isSemantic: false,
  },

  fetchDocuments: async () => {
    const { filters } = get();

    set({ isLoading: true, error: null });

    try {
      const response = await fetchDocuments({
        page: filters.page,
        limit: 9, // 3×3 grid fits in a fixed viewport without page scroll
        subjectId: filters.subjectId || undefined,
        search: filters.isSemantic ? filters.search || undefined : undefined,
        isSemantic: filters.isSemantic || undefined,
      });

      set({
        documents: response.documents,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch {
      set({
        error: "Không thể tải danh sách tài liệu. Vui lòng thử lại.",
        isLoading: false,
      });
    }
  },

  fetchSubjects: async () => {
    set({ isLoadingSubjects: true });

    try {
      const response = await fetchSubjects(100);
      set({ subjects: response.subjects, isLoadingSubjects: false });
    } catch {
      // Non-critical — filter sidebar degrades gracefully when subjects fail
      set({ isLoadingSubjects: false });
    }
  },

  setSearch: (search) => {
    const isSemantic = get().filters.isSemantic;
    set((state) => ({ filters: { ...state.filters, search, page: 1 } }));
    if (isSemantic) {
      get().fetchDocuments();
    }
  },

  setIsSemantic: (isSemantic) => {
    set((state) => ({ filters: { ...state.filters, isSemantic, page: 1 } }));
    get().fetchDocuments();
  },

  setSubjectId: (subjectId) => {
    set((state) => ({ filters: { ...state.filters, subjectId, page: 1 } }));
    get().fetchDocuments();
  },

  setPage: (page) => {
    set((state) => ({ filters: { ...state.filters, page } }));
    get().fetchDocuments();
  },
}));

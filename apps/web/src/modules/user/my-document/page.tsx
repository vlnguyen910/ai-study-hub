"use client";

/**
 * MyDocumentPage (/my-documents)
 *
 * Responsible for data fetching and coordinating state.
 * Rendering is fully delegated to child components:
 *   - DocumentStats  → stats row (total from API, others are UI placeholders)
 *   - DocumentTable  → search + table + pagination
 */

import { useCallback, useEffect, useState } from "react";

import {
  fetchMyDocuments,
  deleteDocument,
  fetchSubjects,
  updateDocument,
} from "@/apis/document.api";
import type {
  LibraryDocument,
  PaginationMeta,
  Subject,
  UpdateDocumentPayload,
} from "@/types/document.type";
import { DocumentEditModal } from "./components/DocumentEditModal";
import { DocumentTable } from "./components/DocumentTable";
import { DocumentStats } from "./components/DocumentStats";

const ITEMS_PER_PAGE = 4;

export default function MyDocumentPage(): React.JSX.Element {
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [editingDocument, setEditingDocument] =
    useState<LibraryDocument | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const load = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchMyDocuments({ page, limit: ITEMS_PER_PAGE });
      setDocuments(res.documents);
      setPagination(res.pagination);
    } catch {
      setError("Không thể tải danh sách tài liệu. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load(currentPage);
  }, [currentPage, load]);

  useEffect(() => {
    fetchSubjects(100)
      .then((res) => setSubjects(res.subjects))
      .catch(() => setSubjects([]));
  }, []);

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này không?")) return;
    setDeletingId(id);
    try {
      await deleteDocument(id);
      // Step back one page when the last item on a non-first page is deleted
      const targetPage =
        documents.length === 1 && currentPage > 1
          ? currentPage - 1
          : currentPage;
      setCurrentPage(targetPage);
      await load(targetPage);
    } catch {
      alert("Xóa tài liệu thất bại. Vui lòng thử lại.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (document: LibraryDocument) => {
    setEditError(null);
    setEditingDocument(document);
  };

  const handleSaveEdit = async (payload: UpdateDocumentPayload) => {
    if (!editingDocument) return;

    setSavingId(editingDocument.id);
    setEditError(null);
    try {
      await updateDocument(editingDocument.id, payload);
      setEditingDocument(null);
      await load(currentPage);
    } catch {
      setEditError("Cập nhật tài liệu thất bại. Vui lòng thử lại.");
    } finally {
      setSavingId(null);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Tải liệu của tôi</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Quản lý tài liệu bạn đã tải lên.
        </p>
      </div>

      <DocumentStats
        totalDocuments={pagination?.total ?? 0}
        isLoading={isLoading}
      />

      <DocumentTable
        documents={documents}
        pagination={pagination}
        isLoading={isLoading}
        error={error}
        skeletonCount={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        deletingId={deletingId}
        savingId={savingId}
      />

      <DocumentEditModal
        document={editingDocument}
        subjects={subjects}
        isOpen={editingDocument !== null}
        isSaving={savingId !== null}
        error={editError}
        onCancel={() => {
          if (savingId) return;
          setEditingDocument(null);
          setEditError(null);
        }}
        onSave={handleSaveEdit}
      />
    </div>
  );
}

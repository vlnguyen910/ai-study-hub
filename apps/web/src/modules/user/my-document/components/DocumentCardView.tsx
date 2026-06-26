"use client";

import { useState } from "react";

import { DocumentCardSkeleton } from "@/modules/library/components/DocumentCardSkeleton";
import type { LibraryDocument } from "@/types/document.type";

import { DocumentCollectionEmpty } from "./DocumentCollectionState";
import { MyDocumentCard } from "./MyDocumentCard";

interface Props {
  readonly documents: LibraryDocument[];
  readonly isLoading: boolean;
  readonly isSearching: boolean;
  readonly skeletonCount: number;
  readonly deletingId: string | null;
  readonly savingId: string | null;
  readonly onEdit: (document: LibraryDocument) => void;
  readonly onRequestDelete: (document: LibraryDocument) => void;
  readonly onViewReason: (document: LibraryDocument) => void;
}

export function DocumentCardView({
  documents,
  isLoading,
  isSearching,
  skeletonCount,
  deletingId,
  savingId,
  onEdit,
  onRequestDelete,
  onViewReason,
}: Props): React.JSX.Element {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <DocumentCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return <DocumentCollectionEmpty isSearching={isSearching} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {documents.map((document) => (
        <MyDocumentCard
          key={document.id}
          document={document}
          isMenuOpen={openMenuId === document.id}
          isBusy={deletingId === document.id || savingId === document.id}
          onMenuToggle={() =>
            setOpenMenuId((current) =>
              current === document.id ? null : document.id,
            )
          }
          onMenuClose={() => setOpenMenuId(null)}
          onEdit={() => onEdit(document)}
          onDelete={() => onRequestDelete(document)}
          onViewReason={() => onViewReason(document)}
        />
      ))}
    </div>
  );
}

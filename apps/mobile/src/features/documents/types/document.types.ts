export type DocumentCategoryValue = string;

export type DocumentStatus = "ACTIVE" | "PENDING" | "REJECTED" | "DELETED";

export interface DocumentAuthor {
  readonly id: string;
  readonly name: string;
  readonly avatarUrl: string | null;
}

export interface DocumentSubject {
  readonly id: string;
  readonly name: string;
  readonly code: string;
}

export interface LibraryDocument {
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly fileUrl?: string;
  readonly pdfPreviewUrl?: string | null;
  readonly publicId: string;
  readonly status: DocumentStatus;
  readonly isPublic: boolean;
  readonly format?: string;
  readonly sizeInBytes?: number;
  readonly reviewedById?: string | null;
  readonly reviewedAt?: string | null;
  readonly rejectionReason?: string | null;
  readonly rejectionDetail?: string | null;
  readonly aiScore?: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly author: DocumentAuthor;
  readonly subject: DocumentSubject | null;
}

export interface DocumentDetail {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly fileUrl: string;
  readonly pdfPreviewUrl?: string | null;
  readonly publicId: string;
  readonly status: DocumentStatus;
  readonly isPublic: boolean;
  readonly format: string;
  readonly sizeInBytes: number;
  readonly createdAt: string;
  readonly updatedAt?: string;
  readonly author: DocumentAuthor & {
    readonly email: string;
  };
  readonly subject: DocumentSubject | null;
  readonly aiSummary?: string | null;
  readonly reviewedById?: string | null;
  readonly reviewedAt?: string | null;
  readonly rejectionReason?: string | null;
  readonly rejectionDetail?: string | null;
}

export interface PaginationMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
}

export interface DocumentsListResponse {
  readonly documents: readonly LibraryDocument[];
  readonly pagination: PaginationMeta;
}

export interface ListDocumentsQuery {
  readonly page?: number;
  readonly limit?: number;
  readonly subjectId?: string;
  readonly authorId?: string;
  readonly status?: DocumentStatus;
  readonly search?: string;
  readonly isSemantic?: boolean;
}

export interface CreateDocumentPayload {
  readonly title: string;
  readonly description?: string;
  readonly fileUrl: string;
  readonly publicId: string;
  readonly sizeInBytes: number;
  readonly format: string;
  readonly resourceType: string;
  readonly subjectId?: string;
  readonly isPublic: boolean;
}

export interface UpdateDocumentPayload {
  readonly title?: string;
  readonly description?: string;
  readonly subjectId?: string;
  readonly isPublic?: boolean;
}

export interface RejectDocumentPayload {
  readonly rejectionReason: string;
}

export interface Subject {
  readonly id: string;
  readonly name: string;
  readonly code: string;
}

export interface SubjectsListResponse {
  readonly subjects: readonly Subject[];
  readonly pagination: PaginationMeta;
}

export interface DocumentCategoryOption {
  readonly label: string;
  readonly value: DocumentCategoryValue;
}

export interface RelatedDocumentItem {
  id: string;
  title: string;
  author: string;
  downloads: string;
  previewUrl: string;
}

export interface DocumentDetailInfo {
  id: string;
  title: string;
  author: string;
  publishedAt: string;
  views: string;
  downloads: string;
  fileType: string;
  fileSize: string;
  description: string[];
  tags: string[];
  previewUrl: string;
  relatedDocuments: RelatedDocumentItem[];
}

export interface DocumentUploadFormValues {
  fileName: string;
  title: string;
  subjectId: string;
  description: string;
}

export type WarningFlag = "SPAM" | "TOXIC" | "ACADEMIC_INTEGRITY_RISK";

export interface ModeratorAnalysisData {
  readonly summary: string;
  readonly flags: readonly WarningFlag[];
  readonly moderationSuggestion: "APPROVE" | "REJECT";
  readonly moderationReason: string;
}

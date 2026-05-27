export type DocumentCategoryValue = "cs" | "math" | "phys" | "eco";

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
  category: DocumentCategoryValue;
  description: string;
}

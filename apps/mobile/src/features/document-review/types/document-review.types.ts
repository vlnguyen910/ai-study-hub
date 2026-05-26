export interface ReviewQueueFilter {
  label: string;
  value: string;
}

export interface ReviewDocumentSummary {
  id: string;
  title: string;
  author: string;
  uploadedAt: string;
  fileType: string;
  fileSize: string;
  description: string;
  category: string;
  categoryKey: string;
  priority?: "normal" | "high";
}

export interface DocumentDetailStat {
  label: string;
  value: string;
}

export interface DocumentDetailData {
  id: string;
  category: string;
  year: string;
  title: string;
  author: string;
  submittedAt: string;
  fileType: string;
  fileSize: string;
  pageCount: string;
  confidence: string;
  description: string;
  previewUrl: string;
  stats: DocumentDetailStat[];
}

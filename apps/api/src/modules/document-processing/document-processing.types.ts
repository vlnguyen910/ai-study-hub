export const DOCUMENT_JOB_NAMES = {
  processUpload: 'process-upload',
  generateDescription: 'generate-description',
  generateSummary: 'generate-summary',
  generateEmbeddings: 'generate-embeddings',
} as const;

export type ProcessUploadJobData = {
  type: typeof DOCUMENT_JOB_NAMES.processUpload;
  documentId: string;
};

export type GenerateDescriptionJobData = {
  type: typeof DOCUMENT_JOB_NAMES.generateDescription;
  documentId: string;
};

export type GenerateSummaryJobData = {
  type: typeof DOCUMENT_JOB_NAMES.generateSummary;
  documentId: string;
};

export type GenerateEmbeddingsJobData = {
  type: typeof DOCUMENT_JOB_NAMES.generateEmbeddings;
  documentId: string;
};

export type DocumentJobData =
  | ProcessUploadJobData
  | GenerateDescriptionJobData
  | GenerateSummaryJobData
  | GenerateEmbeddingsJobData;

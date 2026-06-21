export const DOCUMENT_JOB_NAMES = {
  processUpload: 'process-upload',
  generateDescription: 'generate-description',
  generateSummary: 'generate-summary',
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

export type DocumentJobData =
  | ProcessUploadJobData
  | GenerateDescriptionJobData
  | GenerateSummaryJobData;

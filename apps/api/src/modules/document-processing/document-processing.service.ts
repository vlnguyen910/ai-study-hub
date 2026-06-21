import { Injectable, Logger } from '@nestjs/common';
import { QueueService } from '../../common/queue/queue.service';
import { QUEUE_NAMES } from '../../common/queue/queue.constants';
import { DOCUMENT_JOB_NAMES } from './document-processing.types';

@Injectable()
export class DocumentProcessingService {
  private readonly logger = new Logger(DocumentProcessingService.name);

  constructor(private readonly queueService: QueueService) {}

  async enqueueUploadProcessing(documentId: string) {
    await this.queueService.getQueue(QUEUE_NAMES.document).add(
      DOCUMENT_JOB_NAMES.processUpload,
      {
        type: DOCUMENT_JOB_NAMES.processUpload,
        documentId,
      },
      {
        jobId: `${DOCUMENT_JOB_NAMES.processUpload}-${documentId}`,
      },
    );
    this.logger.log(
      `Enqueued upload processing job for document ID: ${documentId}`,
    );
  }

  async enqueueDescriptionGeneration(documentId: string) {
    await this.queueService.getQueue(QUEUE_NAMES.document).add(
      DOCUMENT_JOB_NAMES.generateDescription,
      {
        type: DOCUMENT_JOB_NAMES.generateDescription,
        documentId,
      },
      {
        jobId: `${DOCUMENT_JOB_NAMES.generateDescription}-${documentId}`,
      },
    );
    this.logger.log(
      `Enqueued description generation job for document ID: ${documentId}`,
    );
  }

  async enqueueSummaryGeneration(documentId: string) {
    await this.queueService.getQueue(QUEUE_NAMES.document).add(
      DOCUMENT_JOB_NAMES.generateSummary,
      {
        type: DOCUMENT_JOB_NAMES.generateSummary,
        documentId,
      },
      {
        jobId: `${DOCUMENT_JOB_NAMES.generateSummary}-${documentId}`,
      },
    );
    this.logger.log(
      `Enqueued summary generation job for document ID: ${documentId}`,
    );
  }

  async enqueueEmbeddingsGeneration(documentId: string) {
    await this.queueService.getQueue(QUEUE_NAMES.document).add(
      DOCUMENT_JOB_NAMES.generateEmbeddings,
      {
        type: DOCUMENT_JOB_NAMES.generateEmbeddings,
        documentId,
      },
      {
        jobId: `${DOCUMENT_JOB_NAMES.generateEmbeddings}-${documentId}`,
      },
    );
    this.logger.log(
      `Enqueued embeddings generation job for document ID: ${documentId}`,
    );
  }
}

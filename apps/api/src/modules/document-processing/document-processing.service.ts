import { Injectable, Logger } from '@nestjs/common';
import { QueueService } from '../../common/queue/queue.service';
import { QUEUE_NAMES } from '../../common/queue/queue.constants';
import { DOCUMENT_JOB_NAMES } from './document-processing.types';
import { DocumentProcessingProcessor } from './document-processing.processor';

@Injectable()
export class DocumentProcessingService {
  private readonly logger = new Logger(DocumentProcessingService.name);
  private readonly chatPreparationTasks = new Map<string, Promise<void>>();

  constructor(
    private readonly queueService: QueueService,
    private readonly documentProcessingProcessor: DocumentProcessingProcessor,
  ) {}

  async ensureDocumentReadyForChat(documentId: string): Promise<void> {
    const existingTask = this.chatPreparationTasks.get(documentId);
    if (existingTask) return existingTask;

    const preparationTask = this.documentProcessingProcessor
      .prepareDocumentForChat(documentId)
      .finally(() => {
        this.chatPreparationTasks.delete(documentId);
      });

    this.chatPreparationTasks.set(documentId, preparationTask);
    return preparationTask;
  }

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
    this.logger.log('Enqueued upload processing job for document');
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
    this.logger.log('Enqueued description generation job for document');
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
    this.logger.log('Enqueued summary generation job for document');
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
    this.logger.log('Enqueued embeddings generation job for document');
  }
}

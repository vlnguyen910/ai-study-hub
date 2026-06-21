import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import { QueueService } from '../../common/queue/queue.service';
import { QUEUE_NAMES } from '../../common/queue/queue.constants';
import { RedisService } from '../../common/redis/redis.service';
import {
  DOCUMENT_JOB_NAMES,
  type DocumentJobData,
} from './document-processing.types';

@Injectable()
export class DocumentProcessingProcessor
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(DocumentProcessingProcessor.name);
  private worker: Worker<DocumentJobData> | null = null;

  constructor(
    private readonly redisService: RedisService,
    private readonly queueService: QueueService,
  ) {}

  onModuleInit() {
    const isWorkerEnabled = process.env.ENABLE_WORKERS === 'true';
    if (!isWorkerEnabled) {
      this.logger.log(
        'DocumentProcessingProcessor worker consumption disabled (ENABLE_WORKERS is not true)',
      );
      return;
    }

    this.worker = new Worker<DocumentJobData>(
      QUEUE_NAMES.document,
      (job) => this.process(job),
      {
        connection: this.redisService.getBullMqConnectionOptions(),
        prefix: this.redisService.getBullMqPrefix(),
      },
    );
    this.worker.on('completed', (job) => this.logCompleted(job));
    this.worker.on('failed', (job, error) => this.logFailed(job, error));

    // Ensure queue is registered/initialized
    this.queueService.getQueue(QUEUE_NAMES.document);
    this.logger.log(
      'DocumentProcessingProcessor worker consumption enabled and listening.',
    );
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }

  async process(job: Pick<Job<DocumentJobData>, 'id' | 'name' | 'data'>) {
    this.logger.log(
      `Processing job ${job.name} (ID: ${job.id}) for document ID: ${job.data.documentId}`,
    );

    switch (job.data.type) {
      case DOCUMENT_JOB_NAMES.processUpload:
        await this.processUpload(job.data.documentId);
        break;
      case DOCUMENT_JOB_NAMES.generateDescription:
        await this.processGenerateDescription(job.data.documentId);
        break;
      case DOCUMENT_JOB_NAMES.generateSummary:
        await this.processGenerateSummary(job.data.documentId);
        break;
      default:
        this.logger.warn(`Unknown job type received: ${job.name}`);
    }
  }

  logCompleted(job: Pick<Job<DocumentJobData>, 'id' | 'name'>) {
    this.logger.log(`Completed document job ${job.name} with ID ${job.id}`);
  }

  logFailed(
    job:
      | Pick<Job<DocumentJobData>, 'id' | 'name' | 'data' | 'attemptsMade'>
      | undefined,
    error: Error,
  ) {
    this.logger.error(
      `Failed document job ${job?.name ?? 'unknown'} with ID ${
        job?.id ?? 'unknown'
      } after ${job?.attemptsMade ?? 0} attempts: ${error.message}`,
      error.stack,
    );
  }

  private async processUpload(documentId: string) {
    this.logger.log(
      `[SIMULATED] Extracting text, chunking, and generating embedding for document: ${documentId}`,
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  private async processGenerateDescription(documentId: string) {
    this.logger.log(
      `[SIMULATED] Generating description with Gemini for document: ${documentId}`,
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  private async processGenerateSummary(documentId: string) {
    this.logger.log(
      `[SIMULATED] Generating summary with Gemini for document: ${documentId}`,
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

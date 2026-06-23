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
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentExtractorService } from './document-extractor.service';
import { AIService } from '../ai/ai.service';
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
    private readonly prismaService: PrismaService,
    private readonly documentExtractorService: DocumentExtractorService,
    private readonly aiService: AIService,
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
    this.logger.log(`Processing job ${job.name} for document`);

    switch (job.data.type) {
      case DOCUMENT_JOB_NAMES.processUpload:
        await this.processUpload(job.data.documentId);
        break;
      case DOCUMENT_JOB_NAMES.generateEmbeddings:
        await this.processGenerateEmbeddings(job.data.documentId);
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
    this.logger.log(`Completed document job ${job.name}`);
  }

  logFailed(
    job:
      | Pick<Job<DocumentJobData>, 'id' | 'name' | 'data' | 'attemptsMade'>
      | undefined,
    error: Error,
  ) {
    this.logger.error(
      `Failed document job ${job?.name ?? 'unknown'} after ${job?.attemptsMade ?? 0} attempts: ${error.message}`,
      error.stack,
    );
  }

  private async processUpload(documentId: string) {
    this.logger.log('Starting processUpload for document');

    const document = await this.prismaService.documents.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      this.logger.error('Document not found in processor DB');
      return;
    }

    if (document.deletedAt) {
      this.logger.error('Document is deleted');
      return;
    }

    this.logger.log('Extracting text from document');
    const rawText = await this.documentExtractorService.extractText(
      document.fileUrl,
      document.format,
    );

    if (!rawText || rawText.trim().length === 0) {
      this.logger.warn('No readable text extracted for document');
      return;
    }

    // Chunking strategy: sliding character window of 1000 characters, 200 characters overlap
    const chunkSize = 1000;
    const overlap = 200;
    const chunks: string[] = [];

    let i = 0;
    while (i < rawText.length) {
      chunks.push(rawText.slice(i, i + chunkSize));
      i += chunkSize - overlap;
    }

    this.logger.log(`Generated ${chunks.length} chunks for document`);

    const chunkEntities = chunks.map((chunkText, index) => ({
      documentId,
      chunkIndex: index,
      chunkText,
      tokenCount: Math.ceil(chunkText.length / 4),
      embedding: [],
    }));

    // Make processUpload idempotent by deleting existing chunks and saving new chunks atomically in a transaction
    await this.prismaService.$transaction([
      this.prismaService.document_chunks.deleteMany({
        where: { documentId },
      }),
      this.prismaService.document_chunks.createMany({
        data: chunkEntities,
      }),
    ]);

    this.logger.log('Successfully saved chunks to database for document');

    // Trigger embeddings generation downstream (Option B)
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
    this.logger.log('Enqueued generate-embeddings job for document');
  }

  private async processGenerateEmbeddings(documentId: string) {
    this.logger.log('Starting processGenerateEmbeddings for document');

    const chunks = await this.prismaService.document_chunks.findMany({
      where: { documentId },
      orderBy: { chunkIndex: 'asc' },
    });

    if (chunks.length === 0) {
      this.logger.warn('No chunks found for document to generate embeddings');
      return;
    }

    this.logger.log(
      `Generating embeddings for ${chunks.length} chunks sequentially...`,
    );

    for (const chunk of chunks) {
      try {
        const embedding = await this.aiService.getEmbedding(chunk.chunkText);
        await this.prismaService.document_chunks.update({
          where: { id: chunk.id },
          data: { embedding },
        });
      } catch (error) {
        this.logger.error(
          `Failed to generate/save embedding for chunk ${chunk.chunkIndex}: ${(error as Error).message}`,
        );
        throw error; // Let BullMQ retry
      }
    }

    this.logger.log('Successfully completed generateEmbeddings for document');
  }

  private async processGenerateDescription(documentId: string) {
    this.logger.log(
      '[SIMULATED] Generating description with Gemini for document',
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  private async processGenerateSummary(documentId: string) {
    this.logger.log('[SIMULATED] Generating summary with Gemini for document');
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

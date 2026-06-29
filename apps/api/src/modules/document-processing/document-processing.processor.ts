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

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const execPromise = promisify(exec);

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

    // Convert Word/Office document to PDF for preview
    try {
      const pdfPreviewUrl = await this.convertOfficeToPdfAndUpload(document);
      if (pdfPreviewUrl) {
        await this.prismaService.documents.update({
          where: { id: documentId },
          data: { pdfPreviewUrl },
        });
        this.logger.log(
          `Successfully generated and saved PDF preview URL: ${pdfPreviewUrl}`,
        );
      }
    } catch (previewErr) {
      this.logger.error(
        `Failed to handle PDF preview generation: ${(previewErr as Error).message}`,
      );
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

  private async checkLibreOfficeAvailable(): Promise<
    'local' | 'docker' | null
  > {
    try {
      const { stdout } = await execPromise(
        'which soffice || which libreoffice',
      );
      if (stdout.trim()) return 'local';
    } catch {}

    try {
      const { stdout } = await execPromise('docker --version');
      if (stdout.trim()) return 'docker';
    } catch {}

    return null;
  }

  private async uploadToCloudinary(
    fileBuffer: Buffer,
    title: string,
  ): Promise<string> {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary credentials are not configured');
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = 'document-previews';

    // Sort parameters alphabetically to sign
    const signatureParams = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash('sha1').update(signatureParams).digest('hex');

    const formData = new FormData();
    const base64File = `data:application/pdf;base64,${fileBuffer.toString('base64')}`;
    formData.append('file', base64File);
    formData.append('folder', folder);
    formData.append('timestamp', timestamp);
    formData.append('api_key', apiKey);
    formData.append('signature', signature);

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Cloudinary upload failed (HTTP ${response.status}): ${errorText}`,
      );
    }

    const data = (await response.json()) as { secure_url: string };
    return data.secure_url;
  }

  private async convertOfficeToPdfAndUpload(document: {
    id: string;
    fileUrl: string;
    format: string;
    title: string;
  }): Promise<string | null> {
    const normalizedFormat = document.format.toLowerCase().trim();
    if (normalizedFormat !== 'docx' && normalizedFormat !== 'doc') {
      return null;
    }

    this.logger.log(
      `Document format is ${document.format}, checking LibreOffice availability...`,
    );
    const mode = await this.checkLibreOfficeAvailable();
    if (!mode) {
      this.logger.warn(
        'Neither local LibreOffice nor Docker CLI is available. Skipping PDF preview generation.',
      );
      return null;
    }

    this.logger.log(`LibreOffice mode selected: ${mode}`);

    let tempDir = '';
    let inputFilePath = '';

    try {
      this.logger.log(
        `Downloading original file from Cloudinary for conversion: ${document.fileUrl}`,
      );
      const response = await fetch(document.fileUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to download original document (HTTP ${response.status})`,
        );
      }
      const buffer = Buffer.from(await response.arrayBuffer());

      const uuidValue = uuidv4();
      tempDir = path.join(os.tmpdir(), `libreoffice-conv-${uuidValue}`);
      await fs.mkdir(tempDir, { recursive: true });

      const ext = normalizedFormat === 'docx' ? '.docx' : '.doc';
      inputFilePath = path.join(tempDir, `input${ext}`);
      await fs.writeFile(inputFilePath, buffer);

      this.logger.log(`Executing LibreOffice conversion command (${mode})...`);

      let command = '';
      if (mode === 'local') {
        command = `soffice --headless --convert-to pdf --outdir "${tempDir}" "${inputFilePath}"`;
      } else {
        // Run LibreOffice via linstep/libreoffice Docker image
        // Pass host UID and GID to avoid root file ownership permissions issue on Linux
        const uid = process.getuid ? process.getuid() : 1000;
        const gid = process.getgid ? process.getgid() : 1000;
        command = `docker run --rm -u ${uid}:${gid} -v "${tempDir}":/data linstep/libreoffice --headless --convert-to pdf --outdir /data /data/input${ext}`;
      }

      const { stdout, stderr } = await execPromise(command, { timeout: 45000 });
      this.logger.log(`LibreOffice stdout: ${stdout}`);
      if (stderr) {
        this.logger.warn(`LibreOffice stderr: ${stderr}`);
      }

      // Check expected file or search directory
      const pdfPath = path.join(tempDir, `input.pdf`);
      try {
        await fs.access(pdfPath);
      } catch {
        const files = await fs.readdir(tempDir);
        const generatedPdf = files.find((f) =>
          f.toLowerCase().endsWith('.pdf'),
        );
        if (!generatedPdf) {
          throw new Error(
            'LibreOffice conversion completed but no PDF output file was found.',
          );
        }
      }

      const pdfBuffer = await fs.readFile(pdfPath);
      this.logger.log(
        `Office-to-PDF conversion successful. PDF size: ${pdfBuffer.length} bytes.`,
      );

      const pdfUrl = await this.uploadToCloudinary(pdfBuffer, document.title);
      return pdfUrl;
    } catch (err) {
      this.logger.error(
        `Office-to-PDF conversion failed for document ${document.id}: ${(err as Error).message}`,
        (err as Error).stack,
      );
      return null;
    } finally {
      if (tempDir) {
        try {
          await fs.rm(tempDir, { recursive: true, force: true });
          this.logger.log(`Cleaned up temp directory: ${tempDir}`);
        } catch (cleanupErr) {
          this.logger.warn(
            `Failed to clean up temp directory ${tempDir}: ${(cleanupErr as Error).message}`,
          );
        }
      }
    }
  }
}

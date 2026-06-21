import { Test, TestingModule } from '@nestjs/testing';
import { DocumentProcessingProcessor } from './document-processing.processor';
import { RedisService } from '../../common/redis/redis.service';
import { QueueService } from '../../common/queue/queue.service';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentExtractorService } from './document-extractor.service';
import { AIService } from '../ai/ai.service';
import { DOCUMENT_JOB_NAMES } from './document-processing.types';
import { QUEUE_NAMES } from '../../common/queue/queue.constants';

describe('DocumentProcessingProcessor', () => {
  let processor: DocumentProcessingProcessor;
  let prismaMock: any;
  let queueServiceMock: any;
  let documentExtractorMock: any;
  let aiServiceMock: any;
  let mockQueue: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    prismaMock = {
      documents: {
        findUnique: jest.fn(),
      },
      document_chunks: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    mockQueue = {
      add: jest.fn(),
    };

    queueServiceMock = {
      getQueue: jest.fn(() => mockQueue),
    };

    const redisServiceMock = {
      getBullMqConnectionOptions: jest.fn(),
      getBullMqPrefix: jest.fn(),
    };

    documentExtractorMock = {
      extractText: jest.fn(),
    };

    aiServiceMock = {
      getEmbedding: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentProcessingProcessor,
        { provide: RedisService, useValue: redisServiceMock },
        { provide: QueueService, useValue: queueServiceMock },
        { provide: PrismaService, useValue: prismaMock },
        { provide: DocumentExtractorService, useValue: documentExtractorMock },
        { provide: AIService, useValue: aiServiceMock },
      ],
    }).compile();

    processor = module.get<DocumentProcessingProcessor>(
      DocumentProcessingProcessor,
    );
  });

  describe('processUpload', () => {
    it('does nothing if document is not found', async () => {
      prismaMock.documents.findUnique.mockResolvedValue(null);

      await processor.process({
        id: '1',
        name: DOCUMENT_JOB_NAMES.processUpload,
        data: {
          type: DOCUMENT_JOB_NAMES.processUpload,
          documentId: 'doc-1',
        },
      } as any);

      expect(prismaMock.documents.findUnique).toHaveBeenCalledWith({
        where: { id: 'doc-1' },
      });
      expect(documentExtractorMock.extractText).not.toHaveBeenCalled();
    });

    it('extracts text, chunks it, deletes old chunks, saves new chunks, and enqueues embedding job', async () => {
      const mockDoc = {
        id: 'doc-1',
        fileUrl: 'https://cloudinary.com/doc.pdf',
        format: 'pdf',
      };
      prismaMock.documents.findUnique.mockResolvedValue(mockDoc);

      // 1250 chars will result in 2 chunks of 1000 with 200 overlap:
      // Chunk 0: slice(0, 1000)
      // Chunk 1: slice(800, 1250) (length 450)
      const testText = 'a'.repeat(1250);
      documentExtractorMock.extractText.mockResolvedValue(testText);

      await processor.process({
        id: '1',
        name: DOCUMENT_JOB_NAMES.processUpload,
        data: {
          type: DOCUMENT_JOB_NAMES.processUpload,
          documentId: 'doc-1',
        },
      } as any);

      expect(prismaMock.documents.findUnique).toHaveBeenCalled();
      expect(documentExtractorMock.extractText).toHaveBeenCalledWith(
        'https://cloudinary.com/doc.pdf',
        'pdf',
      );
      expect(prismaMock.document_chunks.deleteMany).toHaveBeenCalledWith({
        where: { documentId: 'doc-1' },
      });

      expect(prismaMock.document_chunks.createMany).toHaveBeenCalledWith({
        data: [
          {
            documentId: 'doc-1',
            chunkIndex: 0,
            chunkText: 'a'.repeat(1000),
            tokenCount: 250,
            embedding: [],
          },
          {
            documentId: 'doc-1',
            chunkIndex: 1,
            chunkText: 'a'.repeat(450),
            tokenCount: 113,
            embedding: [],
          },
        ],
      });

      expect(queueServiceMock.getQueue).toHaveBeenCalledWith(
        QUEUE_NAMES.document,
      );
      expect(mockQueue.add).toHaveBeenCalledWith(
        DOCUMENT_JOB_NAMES.generateEmbeddings,
        {
          type: DOCUMENT_JOB_NAMES.generateEmbeddings,
          documentId: 'doc-1',
        },
        {
          jobId: `${DOCUMENT_JOB_NAMES.generateEmbeddings}-doc-1`,
        },
      );
    });
  });

  describe('processGenerateEmbeddings', () => {
    it('retrieves chunks, calls getEmbedding for each, and updates database', async () => {
      const mockChunks = [
        { id: 'chunk-1', chunkIndex: 0, chunkText: 'text 1' },
        { id: 'chunk-2', chunkIndex: 1, chunkText: 'text 2' },
      ];
      prismaMock.document_chunks.findMany.mockResolvedValue(mockChunks);

      aiServiceMock.getEmbedding
        .mockResolvedValueOnce([0.1, 0.2, 0.3])
        .mockResolvedValueOnce([0.4, 0.5, 0.6]);

      await processor.process({
        id: '1',
        name: DOCUMENT_JOB_NAMES.generateEmbeddings,
        data: {
          type: DOCUMENT_JOB_NAMES.generateEmbeddings,
          documentId: 'doc-1',
        },
      } as any);

      expect(prismaMock.document_chunks.findMany).toHaveBeenCalledWith({
        where: { documentId: 'doc-1' },
        orderBy: { chunkIndex: 'asc' },
      });

      expect(aiServiceMock.getEmbedding).toHaveBeenNthCalledWith(1, 'text 1');
      expect(aiServiceMock.getEmbedding).toHaveBeenNthCalledWith(2, 'text 2');

      expect(prismaMock.document_chunks.update).toHaveBeenNthCalledWith(1, {
        where: { id: 'chunk-1' },
        data: { embedding: [0.1, 0.2, 0.3] },
      });
      expect(prismaMock.document_chunks.update).toHaveBeenNthCalledWith(2, {
        where: { id: 'chunk-2' },
        data: { embedding: [0.4, 0.5, 0.6] },
      });
    });
  });
});

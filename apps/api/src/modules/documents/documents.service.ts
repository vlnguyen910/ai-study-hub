import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
  HttpException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { DocumentStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  ListDocumentsQueryDto,
  RejectDocumentDto,
} from './dto';
import { SubjectsService } from '../subjects';
import { TokenPayload } from '../../common/interfaces/auth.interface';
import { SettingsService } from '../settings';
import { DocumentExtractorService } from '../document-processing/document-extractor.service';
import { AIService } from '../ai/ai.service';
import { DocumentProcessingService } from '../document-processing/document-processing.service';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly subjectsService: SubjectsService,
    private readonly settingsService: SettingsService,
    private readonly documentExtractorService: DocumentExtractorService,
    private readonly aiService: AIService,
    private readonly documentProcessingService: DocumentProcessingService,
  ) {}

  private readonly cloudinaryCloudName =
    process.env.CLOUDINARY_CLOUD_NAME ?? '';
  private readonly cloudinaryApiKey = process.env.CLOUDINARY_API_KEY ?? '';
  private readonly cloudinaryApiSecret =
    process.env.CLOUDINARY_API_SECRET ?? '';

  private readonly listDocumentSelect = {
    id: true,
    title: true,
    description: true,
    fileUrl: true,
    publicId: true,
    status: true,
    format: true,
    sizeInBytes: true,
    isPublic: true,
    createdAt: true,
    updatedAt: true,
    rejectionReason: true,
    author: {
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    },
    subject: {
      select: {
        id: true,
        name: true,
        code: true,
      },
    },
  } satisfies Prisma.documentsSelect;

  private buildVisibleDocumentFilters(user?: TokenPayload) {
    const visibilityFilters: Prisma.documentsWhereInput[] = [
      {
        status: DocumentStatus.ACTIVE,
        isPublic: true,
      },
    ];

    if (!user) {
      return visibilityFilters;
    }

    visibilityFilters.push(
      {
        status: DocumentStatus.ACTIVE,
        isPublic: false,
        authorId: user.sub,
      },
      {
        status: DocumentStatus.PENDING,
        authorId: user.sub,
      },
      {
        status: DocumentStatus.REJECTED,
        authorId: user.sub,
      },
    );

    if (user.role === UserRole.MODERATOR) {
      visibilityFilters.push(
        { status: DocumentStatus.PENDING },
        { status: DocumentStatus.REJECTED },
      );
    }

    return visibilityFilters;
  }

  private async findReviewableDocument(id: string) {
    const existingDocument = await this.prismaService.documents.findUnique({
      where: {
        id,
        status: {
          not: DocumentStatus.DELETED,
        },
      },
    });

    if (!existingDocument) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    if (existingDocument.status !== DocumentStatus.PENDING) {
      throw new BadRequestException('Only pending documents can be reviewed');
    }

    return existingDocument;
  }

  private async destroyCloudinaryAsset(document: {
    publicId: string;
    resourceType: string;
  }) {
    if (
      !this.cloudinaryCloudName ||
      !this.cloudinaryApiKey ||
      !this.cloudinaryApiSecret
    ) {
      this.logger.warn(
        'Skipping Cloudinary destroy: missing server credentials',
      );
      return;
    }

    const candidates = Array.from(
      new Set([document.resourceType, 'image', 'raw', 'video'].filter(Boolean)),
    );

    this.logger.log(
      `Starting Cloudinary destroy, resourceType=${document.resourceType}, candidates=${candidates.join(',')}`,
    );

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = createHash('sha1')
      .update(
        `public_id=${document.publicId}&timestamp=${timestamp}${this.cloudinaryApiSecret}`,
      )
      .digest('hex');

    const readResponseBody = async (response: Response) => {
      if (typeof response.text === 'function') {
        return response.text();
      }

      if (typeof response.json === 'function') {
        try {
          const data = await response.json();
          return JSON.stringify(data);
        } catch {
          return '';
        }
      }

      return '';
    };

    for (const resourceType of candidates) {
      const formData = new FormData();
      formData.append('public_id', document.publicId);
      formData.append('timestamp', timestamp);
      formData.append('api_key', this.cloudinaryApiKey);
      formData.append('signature', signature);

      const url = `https://api.cloudinary.com/v1_1/${this.cloudinaryCloudName}/${resourceType}/destroy`;
      this.logger.log(
        `Cloudinary destroy request: resourceType=${resourceType}`,
      );

      try {
        const response = await fetch(url, {
          method: 'POST',
          body: formData,
        });

        const bodyText = await readResponseBody(response as Response);
        this.logger.log(
          `Cloudinary destroy response: status=${response.status}, ok=${response.ok}, resourceType=${resourceType}, body=[Redacted]`,
        );

        if (!response.ok) {
          continue;
        }

        let parsed: { result?: string } = {};
        try {
          parsed = bodyText
            ? (JSON.parse(bodyText) as { result?: string })
            : {};
        } catch {
          this.logger.warn(
            `Cloudinary destroy response was not JSON for resourceType=${resourceType}`,
          );
        }

        if (parsed.result === 'ok' || parsed.result === 'not found') {
          this.logger.log(
            `Cloudinary destroy completed for resourceType=${resourceType}, result=${parsed.result}`,
          );
          return;
        }

        this.logger.warn(
          `Cloudinary destroy returned unexpected result for resourceType=${resourceType}, result=${parsed.result ?? 'unknown'}`,
        );
      } catch (error) {
        this.logger.error(
          `Cloudinary destroy threw for resourceType=${resourceType}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }

    this.logger.warn(
      'Cloudinary destroy exhausted all candidates. The DB record will still be deleted.',
    );
  }

  async create(createDocumentDto: CreateDocumentDto, authorId: string) {
    await this.settingsService.validateDocumentUpload(
      createDocumentDto.format,
      createDocumentDto.sizeInBytes,
    );

    if (createDocumentDto.subjectId) {
      const subject = await this.subjectsService.findOne(
        createDocumentDto.subjectId,
      );
      if (!subject) {
        throw new BadRequestException(
          `Subject with ID ${createDocumentDto.subjectId} does not exist`,
        );
      }
    }

    const document = await this.prismaService.documents.create({
      data: {
        ...createDocumentDto,
        authorId,
        status: createDocumentDto.isPublic
          ? DocumentStatus.PENDING
          : DocumentStatus.ACTIVE,
      },
      include: {
        author: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Auto-trigger background processing asynchronously (without blocking response or causing document creation failure)
    this.documentProcessingService
      .enqueueUploadProcessing(document.id)
      .catch((err) => {
        this.logger.error(
          `Failed to enqueue upload processing for document: ${err.message}`,
          err.stack,
        );
      });

    return {
      message: 'Document created successfully',
      data: document,
    };
  }

  async findAll(query: ListDocumentsQueryDto, user?: TokenPayload) {
    const {
      page = 1,
      limit = 10,
      authorId,
      subjectId,
      status,
      search,
      isSemantic,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.documentsWhereInput = {
      status: status
        ? { equals: status, not: DocumentStatus.DELETED }
        : { not: DocumentStatus.DELETED },
      OR: this.buildVisibleDocumentFilters(user),
    };

    if (authorId) {
      where.authorId = authorId;
    }

    if (subjectId) {
      where.subjectId = subjectId;
    }

    if (search && isSemantic) {
      // 1. Generate query embedding
      const queryEmbedding = await this.aiService.getEmbedding(search);

      // 2. Fetch all matching active chunks with embeddings
      const chunks = await this.prismaService.document_chunks.findMany({
        where: {
          embedding: {
            isEmpty: false,
          },
          document: {
            status: status
              ? { equals: status, not: DocumentStatus.DELETED }
              : { not: DocumentStatus.DELETED },
            authorId: authorId || undefined,
            subjectId: subjectId || undefined,
            OR: this.buildVisibleDocumentFilters(user),
          },
        },
        select: {
          documentId: true,
          embedding: true,
        },
      });

      // 3. Compute dot product similarity scores (Gemini vectors are pre-normalized)
      const dotProduct = (a: number[], b: number[]) => {
        if (a.length !== b.length) return 0;
        let sum = 0;
        for (let i = 0; i < a.length; i++) {
          sum += a[i] * b[i];
        }
        return sum;
      };

      const docScores: Record<string, number> = {};
      for (const chunk of chunks) {
        if (!chunk.embedding || chunk.embedding.length === 0) continue;
        const score = dotProduct(queryEmbedding, chunk.embedding);
        if (
          !docScores[chunk.documentId] ||
          score > docScores[chunk.documentId]
        ) {
          docScores[chunk.documentId] = score;
        }
      }

      // 4. Sort and paginate matching documents (threshold: >= 70% match)
      const matchedDocIds = Object.keys(docScores).filter(
        (id) => docScores[id] >= 0.7,
      );
      const total = matchedDocIds.length;
      const sortedDocIds = matchedDocIds.sort(
        (a, b) => docScores[b] - docScores[a],
      );
      const pageDocIds = sortedDocIds.slice(skip, skip + limit);

      // 5. Fetch details and maintain descending order
      const dbDocs = await this.prismaService.documents.findMany({
        where: {
          id: { in: pageDocIds },
        },
        select: this.listDocumentSelect,
      });

      const docMap = new Map(dbDocs.map((d) => [d.id, d]));
      const documents = pageDocIds
        .map((id) => {
          const doc = docMap.get(id);
          if (!doc) return null;
          return {
            ...doc,
            aiScore: Math.round(docScores[id] * 100),
          };
        })
        .filter(Boolean);

      return {
        message: 'Documents fetched successfully via AI Semantic Search',
        data: {
          documents,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    }

    // Keyword Search Fallback
    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [documents, total] = await Promise.all([
      this.prismaService.documents.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: this.listDocumentSelect,
      }),
      this.prismaService.documents.count({ where }),
    ]);

    return {
      message: 'Documents fetched successfully',
      data: {
        documents: documents.map((d) => ({ ...d, aiScore: undefined })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findMine(query: ListDocumentsQueryDto, userId: string) {
    const { page = 1, limit = 10, subjectId, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.documentsWhereInput = {
      authorId: userId,
      status: {
        not: DocumentStatus.DELETED,
      },
    };

    if (subjectId) {
      where.subjectId = subjectId;
    }

    if (status) {
      where.status = {
        equals: status,
        not: DocumentStatus.DELETED,
      };
    }

    const [documents, total] = await Promise.all([
      this.prismaService.documents.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: this.listDocumentSelect,
      }),
      this.prismaService.documents.count({ where }),
    ]);

    return {
      message: 'Documents fetched successfully',
      data: {
        documents,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOne(id: string, user?: TokenPayload) {
    const document = await this.prismaService.documents.findFirst({
      where: {
        id,
        status: {
          not: DocumentStatus.DELETED,
        },
        OR: this.buildVisibleDocumentFilters(user),
      },
      select: {
        id: true,
        title: true,
        description: true,
        fileUrl: true,
        publicId: true,
        format: true,
        sizeInBytes: true,
        status: true,
        isPublic: true,
        reviewedById: true,
        reviewedAt: true,
        rejectionReason: true,
        createdAt: true,
        aiSummary: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return {
      message: 'Document fetched successfully',
      data: document,
    };
  }

  async update(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
    userId: string,
  ) {
    if (updateDocumentDto.subjectId) {
      const subject = await this.subjectsService.findOne(
        updateDocumentDto.subjectId,
      );

      if (!subject) {
        throw new BadRequestException(
          `Subject with ID ${updateDocumentDto.subjectId} does not exist`,
        );
      }
    }
    const existingDocument = await this.prismaService.documents.findUnique({
      where: {
        id,
        status: {
          not: DocumentStatus.DELETED,
        },
      },
    });

    if (!existingDocument) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    if (existingDocument.authorId !== userId) {
      throw new ForbiddenException(
        'Only the document author can update this document',
      );
    }

    const shouldQueueForReview =
      existingDocument.isPublic === false &&
      updateDocumentDto.isPublic === true;
    const shouldCancelReview =
      existingDocument.status === DocumentStatus.PENDING &&
      existingDocument.isPublic === true &&
      updateDocumentDto.isPublic === false;

    const document = await this.prismaService.documents.update({
      where: { id },
      data: {
        ...updateDocumentDto,
        ...(shouldQueueForReview ? { status: DocumentStatus.PENDING } : {}),
        ...(shouldCancelReview ? { status: DocumentStatus.ACTIVE } : {}),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        subject: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    return {
      message: 'Document updated successfully',
      data: document,
    };
  }

  async approve(id: string, reviewerId: string) {
    await this.findReviewableDocument(id);

    const document = await this.prismaService.documents.update({
      where: { id },
      data: {
        status: DocumentStatus.ACTIVE,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        rejectionReason: null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return {
      message: 'Document approved successfully',
      data: document,
    };
  }

  async reject(
    id: string,
    rejectDocumentDto: RejectDocumentDto,
    reviewerId: string,
  ) {
    await this.findReviewableDocument(id);

    const document = await this.prismaService.documents.update({
      where: { id },
      data: {
        status: DocumentStatus.REJECTED,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        rejectionReason: rejectDocumentDto.rejectionReason,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return {
      message: 'Document rejected successfully',
      data: document,
    };
  }

  async delete(id: string, userId: string) {
    const existingDocument = await this.prismaService.documents.findUnique({
      where: {
        id,
        status: {
          not: DocumentStatus.DELETED,
        },
      },
      select: {
        id: true,
        authorId: true,
        publicId: true,
        resourceType: true,
      },
    });

    if (!existingDocument) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    if (existingDocument.authorId !== userId) {
      throw new ForbiddenException(
        'Only the document author can delete this document',
      );
    }

    await this.destroyCloudinaryAsset(existingDocument);

    await this.prismaService.documents.delete({
      where: { id },
    });

    return {
      message: 'Document deleted successfully',
    };
  }

  async generateDescription(id: string, userId: string) {
    const document = await this.prismaService.documents.findUnique({
      where: {
        id,
        status: {
          not: DocumentStatus.DELETED,
        },
      },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    if (document.authorId !== userId) {
      throw new ForbiddenException(
        'Only the document author can generate a description for this document',
      );
    }

    this.logger.log('Extracting text for document');
    const rawText = await this.documentExtractorService.extractText(
      document.fileUrl,
      document.format,
    );

    if (!rawText || rawText.trim().length === 0) {
      throw new BadRequestException(
        'The document contains no readable text for description generation',
      );
    }

    this.logger.log('Generating AI description for document');
    const generatedDescription =
      await this.aiService.generateDescription(rawText);

    return {
      message: 'Description generated successfully',
      data: {
        description: generatedDescription,
      },
    };
  }

  async generateDescriptionFromUrl(fileUrl: string, format: string) {
    try {
      this.logger.log('Extracting text for description from file');
      let rawText: string;
      try {
        rawText = await this.documentExtractorService.extractText(
          fileUrl,
          format,
        );
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        throw new BadRequestException(
          `Failed to extract text from the document: ${(error as Error).message}`,
        );
      }

      if (!rawText || rawText.trim().length === 0) {
        throw new BadRequestException(
          'The document contains no readable text for description generation',
        );
      }

      this.logger.log(`Generating AI description from text`);
      const generatedDescription =
        await this.aiService.generateDescription(rawText);

      return {
        message: 'Description generated successfully',
        data: {
          description: generatedDescription,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed in generateDescriptionFromUrl: ${(error as Error).message}`,
        (error as Error).stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(
        `AI description generation failed: ${(error as Error).message}`,
      );
    }
  }

  async generateSummary(id: string) {
    const document = await this.prismaService.documents.findFirst({
      where: {
        id,
        status: {
          not: DocumentStatus.DELETED,
        },
      },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    // 1. Query ai_reviews first
    const existingReview = await this.prismaService.ai_reviews.findUnique({
      where: { documentId: id },
    });

    if (existingReview?.summary) {
      return {
        message: 'Summary retrieved successfully',
        data: {
          summary: existingReview.summary,
        },
      };
    }

    // 2. Fallback to documents.aiSummary
    if (document.aiSummary) {
      await this.prismaService.ai_reviews.upsert({
        where: { documentId: id },
        update: { summary: document.aiSummary },
        create: {
          documentId: id,
          summary: document.aiSummary,
        },
      });
      return {
        message: 'Summary retrieved successfully',
        data: {
          summary: document.aiSummary,
        },
      };
    }

    // 3. Query document_chunks for raw text
    const chunks = await this.prismaService.document_chunks.findMany({
      where: { documentId: id },
      orderBy: { chunkIndex: 'asc' },
    });

    if (chunks.length === 0) {
      throw new BadRequestException(
        'The document text chunks have not been processed yet. Please wait for upload processing to complete.',
      );
    }

    const rawText = chunks.map((chunk) => chunk.chunkText).join('\n');

    this.logger.log('Generating AI summary for document');
    const generatedSummary = await this.aiService.generateSummary(rawText);

    // 4. Update documents table
    await this.prismaService.documents.update({
      where: { id },
      data: { aiSummary: generatedSummary },
    });

    // 5. Save/Update ai_reviews table
    await this.prismaService.ai_reviews.upsert({
      where: { documentId: id },
      update: { summary: generatedSummary },
      create: {
        documentId: id,
        summary: generatedSummary,
      },
    });

    return {
      message: 'Summary generated successfully',
      data: {
        summary: generatedSummary,
      },
    };
  }

  async runModeratorAnalysis(id: string) {
    const document = await this.prismaService.documents.findFirst({
      where: {
        id,
        status: {
          not: DocumentStatus.DELETED,
        },
      },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    if (document.status !== DocumentStatus.PENDING) {
      throw new BadRequestException(
        `Docuemnt is not in PENDING status to review`,
      );
    }

    // 1. Query ai_reviews first for cached result
    const existingReview = await this.prismaService.ai_reviews.findUnique({
      where: { documentId: id },
    });

    if (existingReview?.summary && existingReview?.moderationSuggestion) {
      return {
        message: 'Moderator analysis retrieved from cache',
        data: {
          summary: existingReview.summary,
          flags: existingReview.warningFlags,
          moderationSuggestion: existingReview.moderationSuggestion as
            | 'APPROVE'
            | 'REJECT',
          moderationReason: existingReview.moderationReason ?? '',
        },
      };
    }

    // 2. Retrieve document chunks
    const chunks = await this.prismaService.document_chunks.findMany({
      where: { documentId: id },
      orderBy: { chunkIndex: 'asc' },
    });

    if (chunks.length === 0) {
      throw new BadRequestException(
        'The document text chunks have not been processed yet. Please wait for upload processing to complete.',
      );
    }

    const rawText = chunks.map((chunk) => chunk.chunkText).join('\n');

    this.logger.log('Running AI moderator analysis for document');
    const analysis = await this.aiService.analyzeDocumentForModerator(rawText);

    // 3. Save/Update ai_reviews table
    await this.prismaService.ai_reviews.upsert({
      where: { documentId: id },
      update: {
        summary: analysis.summary,
        warningFlags: analysis.flags,
        moderationSuggestion: analysis.moderationSuggestion,
        moderationReason: analysis.reason,
      },
      create: {
        documentId: id,
        summary: analysis.summary,
        warningFlags: analysis.flags,
        moderationSuggestion: analysis.moderationSuggestion,
        moderationReason: analysis.reason,
      },
    });

    return {
      message: 'Moderator analysis completed successfully',
      data: {
        summary: analysis.summary,
        flags: analysis.flags,
        moderationSuggestion: analysis.moderationSuggestion,
        moderationReason: analysis.reason,
      },
    };
  }
}

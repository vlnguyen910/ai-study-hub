import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DocumentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  ListDocumentsQueryDto,
} from './dto';

@Injectable()
export class DocumentsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createDocumentDto: CreateDocumentDto, authorId: string) {
    const document = await this.prismaService.documents.create({
      data: {
        ...createDocumentDto,
        authorId,
        status: createDocumentDto.isPublic
          ? DocumentStatus.ACTIVE
          : DocumentStatus.PENDING,
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

    return {
      message: 'Document created successfully',
      data: document,
    };
  }

  async findAll(query: ListDocumentsQueryDto) {
    const {
      page = 1,
      limit = 10,
      status,
      authorId,
      subjectId,
      include,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (subjectId) {
      where.subjectId = subjectId;
    }

    const [documents, total] = await Promise.all([
      this.prismaService.documents.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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

  async findOne(id: string) {
    const document = await this.prismaService.documents.findUnique({
      where: { id },
      include: {
        author: {
          select: {
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
    const existingDocument = await this.prismaService.documents.findUnique({
      where: { id },
    });

    if (!existingDocument) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    if (existingDocument.authorId !== userId) {
      throw new ForbiddenException(
        'Only the document author can update this document',
      );
    }

    const document = await this.prismaService.documents.update({
      where: { id },
      data: updateDocumentDto,
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

  async delete(id: string, userId: string) {
    const existingDocument = await this.prismaService.documents.findUnique({
      where: { id },
    });

    if (!existingDocument) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    if (existingDocument.authorId !== userId) {
      throw new ForbiddenException(
        'Only the document author can delete this document',
      );
    }

    await this.prismaService.documents.update({
      where: { id },
      data: {
        status: DocumentStatus.DELETED,
        deletedAt: new Date(),
      },
    });

    return {
      message: 'Document deleted successfully',
    };
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DocumentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AddDocumentToCollectionDto,
  CreateCollectionDto,
  ListCollectionsQueryDto,
  UpdateCollectionDto,
} from './dto';

type CollectionSummaryRecord = {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  items: {
    documentId: string;
  }[];
};

@Injectable()
export class CollectionsService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly documentCardSelect = {
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

  private readonly collectionAuthorSelect = {
    id: true,
    name: true,
    avatarUrl: true,
  } satisfies Prisma.accountsSelect;

  private buildReadableDocumentWhere(
    userId: string,
  ): Prisma.documentsWhereInput {
    return {
      status: {
        not: DocumentStatus.DELETED,
      },
      OR: [
        {
          status: DocumentStatus.ACTIVE,
          isPublic: true,
        },
        {
          authorId: userId,
        },
      ],
    };
  }

  private buildPublicDocumentWhere(): Prisma.documentsWhereInput {
    return {
      status: DocumentStatus.ACTIVE,
      isPublic: true,
    };
  }

  private toCollectionSummary(
    collection: CollectionSummaryRecord,
    documentId?: string,
  ) {
    const documentCount = collection.items.length;
    const containsDocument = documentId
      ? collection.items.some((item) => item.documentId === documentId)
      : undefined;

    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      isPublic: collection.isPublic,
      authorId: collection.authorId,
      author: collection.author,
      documentCount,
      containsDocument,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    };
  }

  private async findOwnedCollection(id: string, userId: string) {
    const collection = await this.prismaService.collections.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    if (collection.authorId !== userId) {
      throw new ForbiddenException(
        'Only the collection author can perform this action',
      );
    }

    return collection;
  }

  private async findReadableCollection(id: string, userId: string) {
    const collection = await this.prismaService.collections.findFirst({
      where: {
        id,
        OR: [{ authorId: userId }, { isPublic: true }],
      },
      include: {
        author: {
          select: this.collectionAuthorSelect,
        },
      },
    });

    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    return collection;
  }

  private async findReadableDocument(documentId: string, userId: string) {
    const document = await this.prismaService.documents.findFirst({
      where: {
        id: documentId,
        ...this.buildReadableDocumentWhere(userId),
      },
      select: {
        id: true,
      },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    return document;
  }

  async create(createCollectionDto: CreateCollectionDto, authorId: string) {
    if (createCollectionDto.documentId) {
      await this.findReadableDocument(createCollectionDto.documentId, authorId);
    }

    const collection = await this.prismaService.$transaction(async (tx) => {
      const created = await tx.collections.create({
        data: {
          name: createCollectionDto.name.trim(),
          description: createCollectionDto.description?.trim() || null,
          isPublic: createCollectionDto.isPublic ?? false,
          authorId,
        },
      });

      if (createCollectionDto.documentId) {
        await tx.collection_documents.create({
          data: {
            collectionId: created.id,
            documentId: createCollectionDto.documentId,
          },
        });
      }

      return tx.collections.findUniqueOrThrow({
        where: { id: created.id },
        include: {
          author: {
            select: this.collectionAuthorSelect,
          },
          items: {
            select: {
              documentId: true,
            },
          },
        },
      });
    });

    return {
      message: 'Collection created successfully',
      data: this.toCollectionSummary(collection),
    };
  }

  async findAll(query: ListCollectionsQueryDto, userId: string) {
    const {
      page = 1,
      limit = 20,
      userId: requestedUserId,
      documentId,
      search,
    } = query;
    const targetUserId = requestedUserId ?? userId;
    const isOwnProfile = targetUserId === userId;
    const skip = (page - 1) * limit;

    const where: Prisma.collectionsWhereInput = {
      authorId: targetUserId,
      ...(isOwnProfile ? {} : { isPublic: true }),
    };

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const visibleDocumentWhere = isOwnProfile
      ? this.buildReadableDocumentWhere(userId)
      : this.buildPublicDocumentWhere();

    const [collections, total] = await Promise.all([
      this.prismaService.collections.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          author: {
            select: this.collectionAuthorSelect,
          },
          items: {
            where: {
              document: visibleDocumentWhere,
            },
            select: {
              documentId: true,
            },
          },
        },
      }),
      this.prismaService.collections.count({ where }),
    ]);

    return {
      message: 'Collections fetched successfully',
      data: {
        collections: collections.map((collection) =>
          this.toCollectionSummary(collection, documentId),
        ),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOne(id: string, userId: string) {
    const collection = await this.findReadableCollection(id, userId);
    const isOwner = collection.authorId === userId;

    const items = await this.prismaService.collection_documents.findMany({
      where: {
        collectionId: id,
        document: isOwner
          ? this.buildReadableDocumentWhere(userId)
          : this.buildPublicDocumentWhere(),
      },
      orderBy: {
        addedAt: 'desc',
      },
      include: {
        document: {
          select: this.documentCardSelect,
        },
      },
    });

    return {
      message: 'Collection fetched successfully',
      data: {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        isPublic: collection.isPublic,
        authorId: collection.authorId,
        author: collection.author,
        documentCount: items.length,
        documents: items.map((item) => item.document),
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
      },
    };
  }

  async update(
    id: string,
    updateCollectionDto: UpdateCollectionDto,
    userId: string,
  ) {
    await this.findOwnedCollection(id, userId);

    if (Object.keys(updateCollectionDto).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    const collection = await this.prismaService.collections.update({
      where: { id },
      data: {
        ...(updateCollectionDto.name !== undefined
          ? { name: updateCollectionDto.name.trim() }
          : {}),
        ...(updateCollectionDto.description !== undefined
          ? { description: updateCollectionDto.description?.trim() || null }
          : {}),
        ...(updateCollectionDto.isPublic !== undefined
          ? { isPublic: updateCollectionDto.isPublic }
          : {}),
      },
      include: {
        author: {
          select: this.collectionAuthorSelect,
        },
        items: {
          select: {
            documentId: true,
          },
        },
      },
    });

    return {
      message: 'Collection updated successfully',
      data: this.toCollectionSummary(collection),
    };
  }

  async delete(id: string, userId: string) {
    await this.findOwnedCollection(id, userId);

    await this.prismaService.$transaction([
      this.prismaService.collection_documents.deleteMany({
        where: { collectionId: id },
      }),
      this.prismaService.collections.delete({
        where: { id },
      }),
    ]);

    return {
      message: 'Collection deleted successfully',
    };
  }

  async getDocumentSaveStatus(documentId: string, userId: string) {
    await this.findReadableDocument(documentId, userId);

    const links = await this.prismaService.collection_documents.findMany({
      where: {
        documentId,
        collection: {
          authorId: userId,
        },
      },
      select: {
        collectionId: true,
      },
    });

    return {
      message: 'Document collection save status fetched successfully',
      data: {
        documentId,
        isSaved: links.length > 0,
        collectionIds: links.map((link) => link.collectionId),
      },
    };
  }

  async addDocument(
    id: string,
    addDocumentDto: AddDocumentToCollectionDto,
    userId: string,
  ) {
    await this.findOwnedCollection(id, userId);
    await this.findReadableDocument(addDocumentDto.documentId, userId);

    await this.prismaService.$transaction(async (tx) => {
      await tx.collection_documents.upsert({
        where: {
          collectionId_documentId: {
            collectionId: id,
            documentId: addDocumentDto.documentId,
          },
        },
        update: {},
        create: {
          collectionId: id,
          documentId: addDocumentDto.documentId,
        },
      });

      await tx.collections.update({
        where: { id },
        data: { updatedAt: new Date() },
      });
    });

    const collection = await this.findOne(id, userId);

    return {
      message: 'Document added to collection successfully',
      data: collection.data,
    };
  }

  async removeDocument(id: string, documentId: string, userId: string) {
    await this.findOwnedCollection(id, userId);

    const result = await this.prismaService.$transaction(async (tx) => {
      const deleteResult = await tx.collection_documents.deleteMany({
        where: {
          collectionId: id,
          documentId,
        },
      });

      if (deleteResult.count > 0) {
        await tx.collections.update({
          where: { id },
          data: { updatedAt: new Date() },
        });
      }

      return deleteResult;
    });

    if (result.count === 0) {
      throw new NotFoundException(
        `Document with ID ${documentId} is not in this collection`,
      );
    }

    return {
      message: 'Document removed from collection successfully',
    };
  }
}

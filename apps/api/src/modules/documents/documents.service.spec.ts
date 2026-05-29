import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SubjectsService } from '../subjects';
import { DocumentStatus } from '@prisma/client';

describe('DocumentsService', () => {
  let service: DocumentsService;

  const prismaMock: any = {
    documents: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const subjectsServiceMock = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: SubjectsService, useValue: subjectsServiceMock },
      ],
    }).compile();

    service = module.get(DocumentsService);
  });

  it('create returns expected response when subject exists', async () => {
    const dto = {
      title: 'T',
      subjectId: '507f1f77bcf86cd799439011',
      isPublic: false,
    } as any;
    const authorId = 'u1';
    subjectsServiceMock.findOne.mockResolvedValue({
      id: '507f1f77bcf86cd799439011',
    });
    const created = { id: '507f1f77bcf86cd799439011', title: 'T', authorId };
    prismaMock.documents.create.mockResolvedValue(created);

    const res = await service.create(dto, authorId);

    expect(prismaMock.documents.create).toHaveBeenCalled();
    expect(res).toEqual({
      message: 'Document created successfully',
      data: created,
    });
  });

  it('create throws BadRequest when subjectId provided but not found', async () => {
    const dto = {
      title: 'T',
      subjectId: '507f1f77bcf86cd799439011',
      isPublic: false,
    } as any;
    const authorId = 'u1';
    subjectsServiceMock.findOne.mockResolvedValue(null);

    await expect(service.create(dto, authorId)).rejects.toThrow();
  });

  it('create sets status to PENDING when isPublic true', async () => {
    const dto = { title: 'T', isPublic: true } as any;
    const authorId = 'u1';
    subjectsServiceMock.findOne.mockResolvedValue(null);
    const created = {
      id: '507f1f77bcf86cd799439011',
      title: 'T',
      authorId,
      status: 'PENDING',
    };
    prismaMock.documents.create.mockResolvedValue(created);

    const res = await service.create(dto, authorId);
    expect(res.data).toEqual(created);
  });

  it('findAllPublic accepts authorId and subjectId filters', async () => {
    const docs = [{ id: '507f1f77bcf86cd799439011' }];
    prismaMock.documents.findMany.mockResolvedValue(docs);
    prismaMock.documents.count.mockResolvedValue(1);

    const res = await service.findAllPublic({
      authorId: 'u1',
      subjectId: '507f1f77bcf86cd799439011',
      page: 2,
      limit: 5,
    } as any);

    expect(prismaMock.documents.findMany).toHaveBeenCalled();
    expect(res.data.pagination.page).toBe(2);
  });

  it('findAllPublic returns paginated documents response', async () => {
    const docs = [{ id: '507f1f77bcf86cd799439011' }];
    prismaMock.documents.findMany.mockResolvedValue(docs);
    prismaMock.documents.count.mockResolvedValue(1);

    const res = await service.findAllPublic({} as any);

    expect(prismaMock.documents.findMany).toHaveBeenCalled();
    expect(prismaMock.documents.count).toHaveBeenCalled();
    expect(res.message).toBe('Documents fetched successfully');
    expect(res.data.documents).toEqual(docs);
    expect(res.data.pagination.total).toBe(1);
  });

  it('findOnePublic returns document response', async () => {
    const doc = { id: '507f1f77bcf86cd799439011', title: 'T' };
    prismaMock.documents.findUnique.mockResolvedValue(doc);

    const res = await service.findOnePublic('507f1f77bcf86cd799439011');

    expect(prismaMock.documents.findUnique).toHaveBeenCalled();
    expect(res).toEqual({
      message: 'Document fetched successfully',
      data: doc,
    });
  });

  it('update returns updated document when author matches', async () => {
    const existing = {
      id: '507f1f77bcf86cd799439011',
      authorId: 'u1',
      status: DocumentStatus.ACTIVE,
    };
    const updated = { id: '507f1f77bcf86cd799439011', title: 'Updated' };
    prismaMock.documents.findUnique.mockResolvedValueOnce(existing);
    prismaMock.documents.update.mockResolvedValue(updated);

    const res = await service.update(
      '507f1f77bcf86cd799439011',
      { title: 'Updated' } as any,
      'u1',
    );

    expect(prismaMock.documents.findUnique).toHaveBeenCalled();
    expect(prismaMock.documents.update).toHaveBeenCalled();
    expect(res).toEqual({
      message: 'Document updated successfully',
      data: updated,
    });
  });

  it('delete returns success message when author matches', async () => {
    const existing = {
      id: '507f1f77bcf86cd799439011',
      authorId: 'u1',
      status: DocumentStatus.ACTIVE,
    };
    prismaMock.documents.findUnique.mockResolvedValue(existing);
    prismaMock.documents.update.mockResolvedValue({});

    const res = await service.delete('507f1f77bcf86cd799439011', 'u1');

    expect(prismaMock.documents.findUnique).toHaveBeenCalled();
    expect(prismaMock.documents.update).toHaveBeenCalled();
    expect(res).toEqual({ message: 'Document deleted successfully' });
  });

  it('findOnePublic throws BadRequestException for invalid id', async () => {
    await expect(service.findOnePublic('bad-id')).rejects.toThrow();
  });

  it('update throws NotFoundException when document missing', async () => {
    prismaMock.documents.findUnique.mockResolvedValue(null);

    await expect(
      service.update('507f1f77bcf86cd799439011', { title: 'X' } as any, 'u1'),
    ).rejects.toThrow();
  });

  it('update throws ForbiddenException when non-author', async () => {
    const existing = {
      id: '507f1f77bcf86cd799439011',
      authorId: 'other',
      status: DocumentStatus.ACTIVE,
    };
    prismaMock.documents.findUnique.mockResolvedValueOnce(existing);

    await expect(
      service.update('507f1f77bcf86cd799439011', { title: 'X' } as any, 'u1'),
    ).rejects.toThrow();
  });

  it('delete throws NotFoundException when document missing', async () => {
    prismaMock.documents.findUnique.mockResolvedValue(null);

    await expect(
      service.delete('507f1f77bcf86cd799439011', 'u1'),
    ).rejects.toThrow();
  });

  it('delete throws ForbiddenException when non-author', async () => {
    const existing = {
      id: '507f1f77bcf86cd799439011',
      authorId: 'other',
      status: DocumentStatus.ACTIVE,
    };
    prismaMock.documents.findUnique.mockResolvedValue(existing);

    await expect(
      service.delete('507f1f77bcf86cd799439011', 'u1'),
    ).rejects.toThrow();
  });

  it('update throws BadRequest when subjectId provided but subject missing', async () => {
    // subjectsService returns null -> should throw BadRequest before fetching document
    const dto = { subjectId: '507f1f77bcf86cd799439012' } as any;
    subjectsServiceMock.findOne.mockResolvedValue(null);

    await expect(
      service.update('507f1f77bcf86cd799439011', dto, 'u1'),
    ).rejects.toThrow();
  });

  it('findAllPublic handles zero total and calculates totalPages as 0', async () => {
    prismaMock.documents.findMany.mockResolvedValue([]);
    prismaMock.documents.count.mockResolvedValue(0);

    const res = await service.findAllPublic({} as any);

    expect(res.data.pagination.total).toBe(0);
    expect(res.data.pagination.totalPages).toBe(0);
  });
});

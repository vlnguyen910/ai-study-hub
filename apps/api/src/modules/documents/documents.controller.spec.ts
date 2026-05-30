import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OptionalJwtGuard } from '../../common/guards/optional-jwt.guard';

describe('DocumentsController', () => {
  let controller: DocumentsController;

  const documentsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findMine: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleBuilder = Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        {
          provide: DocumentsService,
          useValue: documentsServiceMock,
        },
      ],
    });

    // Override guards to avoid instantiating JwtService/Config in unit tests
    moduleBuilder
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true });
    moduleBuilder
      .overrideGuard(OptionalJwtGuard)
      .useValue({ canActivate: () => true });

    const module: TestingModule = await moduleBuilder.compile();

    controller = module.get<DocumentsController>(DocumentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create service with user id', async () => {
    documentsServiceMock.create.mockResolvedValue({ id: 'doc1' });

    const dto = { title: 'T', content: 'C', subjectId: 's1' };
    const user = { sub: 'user-123' } as any;

    await controller.create(dto as any, user);

    expect(documentsServiceMock.create).toHaveBeenCalledWith(dto, 'user-123');
  });

  it('should call findAll service with optional user', async () => {
    documentsServiceMock.findAll.mockResolvedValue([]);
    const query = { page: 1 };
    const user = { sub: 'user-123', email: 'u@example.com' } as any;

    await controller.findAll(query as any, user);

    expect(documentsServiceMock.findAll).toHaveBeenCalledWith(query, user);
  });

  it('should call findMine service with user id', async () => {
    documentsServiceMock.findMine.mockResolvedValue([]);
    const query = { page: 1 };
    const user = { sub: 'user-123' } as any;

    await controller.findMine(query as any, user);

    expect(documentsServiceMock.findMine).toHaveBeenCalledWith(
      query,
      'user-123',
    );
  });

  it('should call findOne service with optional user', async () => {
    documentsServiceMock.findOne.mockResolvedValue({ id: 'doc1' });
    const user = { sub: 'user-123', email: 'u@example.com' } as any;

    await controller.findOne('doc1', user);

    expect(documentsServiceMock.findOne).toHaveBeenCalledWith('doc1', user);
  });

  it('should call update service with user id', async () => {
    documentsServiceMock.update.mockResolvedValue({ id: 'doc1' });

    const dto = { title: 'Updated' };
    const user = { sub: 'user-123' } as any;

    await controller.update('doc1', dto as any, user);

    expect(documentsServiceMock.update).toHaveBeenCalledWith(
      'doc1',
      dto,
      'user-123',
    );
  });

  it('should call delete service with user id', async () => {
    documentsServiceMock.delete.mockResolvedValue({ success: true });

    const user = { sub: 'user-123' } as any;

    await controller.remove('doc1', user);

    expect(documentsServiceMock.delete).toHaveBeenCalledWith(
      'doc1',
      'user-123',
    );
  });

  it('should propagate service NotFound/Forbidden errors', async () => {
    documentsServiceMock.create.mockImplementationOnce(() =>
      Promise.reject(new (require('@nestjs/common').NotFoundException)('x')),
    );

    await expect(
      controller.create({} as any, { sub: 'u' } as any),
    ).rejects.toThrow();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';
import { UserRole } from '@prisma/client';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

describe('SubjectsController', () => {
  let controller: SubjectsController;

  const subjectsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleBuilder = Test.createTestingModule({
      controllers: [SubjectsController],
      providers: [
        {
          provide: SubjectsService,
          useValue: subjectsServiceMock,
        },
      ],
    });

    // Override guards to avoid requiring JwtService and reflector in unit tests
    moduleBuilder
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true });
    moduleBuilder
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true });

    const module: TestingModule = await moduleBuilder.compile();

    controller = module.get<SubjectsController>(SubjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create service', async () => {
    subjectsServiceMock.create.mockResolvedValue({ id: 's1' });

    const dto = { name: 'Math' };

    await controller.create(dto as any);

    expect(subjectsServiceMock.create).toHaveBeenCalledWith(dto);
  });

  it('should call findAll service', async () => {
    subjectsServiceMock.findAll.mockResolvedValue([]);

    await controller.findAll({} as any);

    expect(subjectsServiceMock.findAll).toHaveBeenCalled();
  });

  it('should call findOne service', async () => {
    subjectsServiceMock.findOne.mockResolvedValue({ id: 's1' });

    await controller.findOne('s1');

    expect(subjectsServiceMock.findOne).toHaveBeenCalledWith('s1');
  });

  it('should call update service', async () => {
    subjectsServiceMock.update.mockResolvedValue({ id: 's1' });

    const dto = { name: 'Physics' };

    await controller.update('s1', dto as any);

    expect(subjectsServiceMock.update).toHaveBeenCalledWith('s1', dto);
  });

  it('should call delete service', async () => {
    subjectsServiceMock.delete.mockResolvedValue({ success: true });

    await controller.remove('s1');

    expect(subjectsServiceMock.delete).toHaveBeenCalledWith('s1');
  });

  it('should propagate service Conflict/NotFound errors', async () => {
    subjectsServiceMock.create.mockImplementationOnce(() =>
      Promise.reject(new (require('@nestjs/common').ConflictException)('x')),
    );

    await expect(controller.create({} as any)).rejects.toThrow();
  });
});

import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { SubjectsService } from '../subjects/subjects.service';
import { AdminSubjectsController } from './admin-subjects.controller';

describe('AdminSubjectsController', () => {
  let controller: AdminSubjectsController;

  const subjectsServiceMock = {
    create: jest.fn().mockResolvedValue({ id: 's1' }),
    update: jest.fn().mockResolvedValue({ id: 's1' }),
    delete: jest.fn().mockResolvedValue({ message: 'Subject deleted' }),
    findOne: jest
      .fn()
      .mockResolvedValue({ id: 's1', name: 'Math', code: 'MTH101' }),
  };

  const auditLogServiceMock = {
    log: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AdminSubjectsController(
      subjectsServiceMock as unknown as SubjectsService,
      auditLogServiceMock as any,
    );
  });

  it('delegates subject mutations to SubjectsService', async () => {
    const createDto = { name: 'Math', code: 'MTH101' } as any;
    const updateDto = { name: 'Physics' } as any;
    const mockRequest = {
      user: { sub: 'admin-1', role: 'ADMIN' },
      ip: '127.0.0.1',
    };

    await controller.create(createDto, mockRequest);
    await controller.update('s1', updateDto, mockRequest);
    await controller.remove('s1', mockRequest);

    expect(subjectsServiceMock.create).toHaveBeenCalledWith(createDto);
    expect(subjectsServiceMock.update).toHaveBeenCalledWith('s1', updateDto);
    expect(subjectsServiceMock.delete).toHaveBeenCalledWith('s1');
  });

  it('restricts admin subject endpoints to ADMIN role', () => {
    expect(Reflect.getMetadata(ROLES_KEY, controller.create)).toEqual([
      UserRole.ADMIN,
    ]);
    expect(Reflect.getMetadata(ROLES_KEY, controller.update)).toEqual([
      UserRole.ADMIN,
    ]);
    expect(Reflect.getMetadata(ROLES_KEY, controller.remove)).toEqual([
      UserRole.ADMIN,
    ]);
  });
});

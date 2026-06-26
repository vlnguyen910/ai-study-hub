import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

describe('AuditLogsController', () => {
  let controller: AuditLogsController;

  const auditLogServiceMock = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleBuilder = Test.createTestingModule({
      controllers: [AuditLogsController],
      providers: [
        {
          provide: AuditLogService,
          useValue: auditLogServiceMock,
        },
      ],
    });

    moduleBuilder
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true });
    moduleBuilder
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true });

    const module: TestingModule = await moduleBuilder.compile();

    controller = module.get<AuditLogsController>(AuditLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call auditLogService.findAll with queries', async () => {
    const query = { page: 1, limit: 10 };
    auditLogServiceMock.findAll.mockResolvedValue({ logs: [], total: 0 });

    const result = await controller.findAll(query);

    expect(auditLogServiceMock.findAll).toHaveBeenCalledWith(query);
    expect(result).toEqual({ logs: [], total: 0 });
  });
});

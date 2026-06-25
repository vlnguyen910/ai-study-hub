import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditAction, AuditTargetType, UserRole } from '@prisma/client';

describe('AuditLogService', () => {
  let service: AuditLogService;

  const prismaMock = {
    audit_logs: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    accounts: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an audit log with provided role', async () => {
    const params = {
      actorId: 'user-1',
      actorRole: UserRole.ADMIN,
      action: AuditAction.BAN_USER,
      targetType: AuditTargetType.USER,
      targetId: 'user-2',
      metadata: { reason: 'spam' },
      ipAddress: '127.0.0.1',
    };

    prismaMock.audit_logs.create.mockResolvedValue({ id: 'log-1', ...params });

    const result = await service.create(params);

    expect(prismaMock.audit_logs.create).toHaveBeenCalledWith({
      data: {
        actorId: 'user-1',
        actorRole: UserRole.ADMIN,
        action: AuditAction.BAN_USER,
        targetType: AuditTargetType.USER,
        targetId: 'user-2',
        metadata: { reason: 'spam' },
        ipAddress: '127.0.0.1',
      },
    });
    expect(result).toEqual({ id: 'log-1', ...params });
  });

  it('should create an audit log and fetch role if not provided', async () => {
    const params = {
      actorId: 'user-1',
      action: AuditAction.BAN_USER,
      targetType: AuditTargetType.USER,
      targetId: 'user-2',
      metadata: { reason: 'spam' },
      ipAddress: '127.0.0.1',
    };

    prismaMock.accounts.findUnique.mockResolvedValue({
      role: UserRole.MODERATOR,
    });
    prismaMock.audit_logs.create.mockResolvedValue({
      id: 'log-1',
      ...params,
      actorRole: UserRole.MODERATOR,
    });

    const result = await service.create(params);

    expect(prismaMock.accounts.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { role: true },
    });
    expect(prismaMock.audit_logs.create).toHaveBeenCalledWith({
      data: {
        actorId: 'user-1',
        actorRole: UserRole.MODERATOR,
        action: AuditAction.BAN_USER,
        targetType: AuditTargetType.USER,
        targetId: 'user-2',
        metadata: { reason: 'spam' },
        ipAddress: '127.0.0.1',
      },
    });
    expect(result).toEqual({
      id: 'log-1',
      ...params,
      actorRole: UserRole.MODERATOR,
    });
  });

  it('should findAll audit logs with pagination and filters', async () => {
    const query = {
      page: 1,
      limit: 10,
      actorId: 'user-1',
      action: AuditAction.BAN_USER,
      targetType: AuditTargetType.USER,
      from: '2026-06-01T00:00:00.000Z',
      to: '2026-06-30T23:59:59.000Z',
    };

    prismaMock.audit_logs.findMany.mockResolvedValue([]);
    prismaMock.audit_logs.count.mockResolvedValue(0);

    const result = await service.findAll(query);

    expect(prismaMock.audit_logs.findMany).toHaveBeenCalledWith({
      where: {
        actorId: 'user-1',
        action: AuditAction.BAN_USER,
        targetType: AuditTargetType.USER,
        createdAt: {
          gte: new Date('2026-06-01T00:00:00.000Z'),
          lte: new Date('2026-06-30T23:59:59.000Z'),
        },
      },
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    expect(result).toEqual({
      message: 'Audit logs fetched successfully',
      data: {
        logs: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      },
    });
  });
});

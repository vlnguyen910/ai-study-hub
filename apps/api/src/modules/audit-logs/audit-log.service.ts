import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditAction, AuditTargetType, UserRole, Prisma } from '@prisma/client';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: {
    actorId?: string;
    actorRole?: UserRole;
    action: AuditAction;
    targetType?: AuditTargetType;
    targetId?: string;
    metadata?: any;
    ipAddress?: string;
  }) {
    let finalActorRole = params.actorRole;
    if (params.actorId && !finalActorRole) {
      const user = await this.prisma.accounts.findUnique({
        where: { id: params.actorId },
        select: { role: true },
      });
      if (user) {
        finalActorRole = user.role;
      }
    }

    return this.prisma.audit_logs.create({
      data: {
        actorId: params.actorId || null,
        actorRole: finalActorRole || null,
        action: params.action,
        targetType: params.targetType || null,
        targetId: params.targetId || null,
        metadata: params.metadata
          ? (params.metadata as Prisma.InputJsonValue)
          : null,
        ipAddress: params.ipAddress || null,
      },
    });
  }

  async log(params: {
    actorId?: string;
    actorRole?: UserRole;
    action: AuditAction;
    targetType?: AuditTargetType;
    targetId?: string;
    metadata?: any;
    ipAddress?: string;
  }) {
    return this.create(params);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    actorId?: string;
    action?: AuditAction;
    targetType?: AuditTargetType;
    from?: string;
    to?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.audit_logsWhereInput = {};

    if (query.actorId) {
      where.actorId = query.actorId;
    }

    if (query.action) {
      where.action = query.action;
    }

    if (query.targetType) {
      where.targetType = query.targetType;
    }

    const startVal = query.from || query.startDate;
    const endVal = query.to || query.endDate;

    if (startVal || endVal) {
      where.createdAt = {};
      if (startVal) {
        where.createdAt.gte = new Date(startVal);
      }
      if (endVal) {
        where.createdAt.lte = new Date(endVal);
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.audit_logs.findMany({
        where,
        skip,
        take: limit,
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
      }),
      this.prisma.audit_logs.count({ where }),
    ]);

    return {
      message: 'Audit logs fetched successfully',
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }
}

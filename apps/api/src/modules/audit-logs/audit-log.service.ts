import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditAction, Prisma } from '@prisma/client';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: {
    actorId: string;
    action: AuditAction;
    targetId?: string;
    metadata?: any;
    ipAddress?: string;
  }) {
    return this.prisma.audit_logs.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        targetId: params.targetId || null,
        metadata: params.metadata
          ? (params.metadata as Prisma.InputJsonValue)
          : null,
        ipAddress: params.ipAddress || null,
      },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    actorId?: string;
    action?: AuditAction;
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

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
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

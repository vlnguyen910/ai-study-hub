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
      },
    });
  }

  async log(params: {
    actorId?: string;
    actorRole?: UserRole;
    action: AuditAction;
    targetType?: AuditTargetType;
    targetId?: string;
  }) {
    return this.create(params);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    actorId?: string;
    actorName?: string;
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

    if (query.actorName) {
      where.actor = {
        name: {
          contains: query.actorName,
          mode: 'insensitive',
        },
      };
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

    const docIds = logs
      .filter((l) => l.targetType === AuditTargetType.DOCUMENT && l.targetId)
      .map((l) => l.targetId) as string[];
    const userIds = logs
      .filter((l) => l.targetType === AuditTargetType.USER && l.targetId)
      .map((l) => l.targetId) as string[];
    const subjectIds = logs
      .filter((l) => l.targetType === AuditTargetType.SUBJECT && l.targetId)
      .map((l) => l.targetId) as string[];

    const [docs, users, subjects] = await Promise.all([
      docIds.length > 0
        ? this.prisma.documents.findMany({
            where: { id: { in: docIds } },
            select: { id: true, title: true },
          })
        : Promise.resolve([]),
      userIds.length > 0
        ? this.prisma.accounts.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true },
          })
        : Promise.resolve([]),
      subjectIds.length > 0
        ? this.prisma.subjects.findMany({
            where: { id: { in: subjectIds } },
            select: { id: true, name: true },
          })
        : Promise.resolve([]),
    ]);

    const docMap = new Map<string, string>(
      docs.map((d) => [d.id, d.title] as [string, string]),
    );
    const userMap = new Map<string, string>(
      users.map((u) => [u.id, u.name] as [string, string]),
    );
    const subjectMap = new Map<string, string>(
      subjects.map((s) => [s.id, s.name] as [string, string]),
    );

    const enrichedLogs = logs.map((log) => {
      let targetName: string | null = null;
      if (log.targetId) {
        if (log.targetType === AuditTargetType.DOCUMENT) {
          targetName = docMap.get(log.targetId) || null;
        } else if (log.targetType === AuditTargetType.USER) {
          targetName = userMap.get(log.targetId) || null;
        } else if (log.targetType === AuditTargetType.SUBJECT) {
          targetName = subjectMap.get(log.targetId) || null;
        } else if (log.targetType === AuditTargetType.SYSTEM_SETTING) {
          targetName = 'Cấu hình hệ thống';
        }
      }
      return {
        ...log,
        targetName,
      };
    });

    return {
      message: 'Audit logs fetched successfully',
      data: {
        logs: enrichedLogs,
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

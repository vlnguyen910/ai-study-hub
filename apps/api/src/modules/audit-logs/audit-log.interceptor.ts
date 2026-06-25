import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from './audit-log.service';
import { AUDIT_ACTION_KEY } from './audit-log.decorator';
import { AuditAction, AuditTargetType } from '@prisma/client';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const action = this.reflector.get<AuditAction>(
      AUDIT_ACTION_KEY,
      context.getHandler(),
    );

    if (!action) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap({
        next: async (data) => {
          try {
            const actorId = request.user?.sub;
            if (!actorId) return;

            const actorRole = request.user?.role;

            const ipAddress =
              request.ip ||
              request.headers['x-forwarded-for'] ||
              request.socket.remoteAddress;

            // Determine targetId
            // Can be explicitly set on the request by the controller, e.g. request.auditTargetId = ...
            // Or default to request params
            const targetId =
              request.auditTargetId ||
              request.params.id ||
              request.params.userId ||
              request.params.accountId ||
              request.params.documentId ||
              (data && data.data && data.data.id) ||
              (data && data.id);

            // Determine targetType
            let targetType = request.auditTargetType;
            if (!targetType) {
              if (
                action === AuditAction.BAN_USER ||
                action === AuditAction.UNBAN_USER
              ) {
                targetType = AuditTargetType.USER;
              } else if (
                action === AuditAction.APPROVE_DOCUMENT ||
                action === AuditAction.REJECT_DOCUMENT ||
                action === AuditAction.DELETE_DOCUMENT ||
                action === AuditAction.UPDATE_DOCUMENT_VISIBILITY
              ) {
                targetType = AuditTargetType.DOCUMENT;
              } else if (action === AuditAction.UPDATE_SYSTEM_SETTINGS) {
                targetType = AuditTargetType.SYSTEM_SETTING;
              } else if (
                action === AuditAction.CREATE_SUBJECT ||
                action === AuditAction.UPDATE_SUBJECT ||
                action === AuditAction.DELETE_SUBJECT
              ) {
                targetType = AuditTargetType.SUBJECT;
              }
            }

            // Determine metadata
            // Can be explicitly set on the request by the controller, e.g. request.auditMetadata = ...
            let metadata = request.auditMetadata;
            if (!metadata) {
              if (
                action === AuditAction.REJECT_DOCUMENT &&
                request.body?.rejectionReason
              ) {
                metadata = { rejectionReason: request.body.rejectionReason };
              } else if (action === AuditAction.UPDATE_SYSTEM_SETTINGS) {
                metadata = { ...request.body };
              } else if (
                action === AuditAction.BAN_USER &&
                request.body?.reason
              ) {
                metadata = { reason: request.body.reason };
              }
            }

            await this.auditLogService.create({
              actorId,
              actorRole,
              action,
              targetType,
              targetId: targetId ? String(targetId) : undefined,
              metadata,
              ipAddress: ipAddress ? String(ipAddress) : undefined,
            });
          } catch (err) {
            // Silently catch logging errors to not disrupt primary business flow
            console.error('AuditLogInterceptor failed to create log:', err);
          }
        },
      }),
    );
  }
}

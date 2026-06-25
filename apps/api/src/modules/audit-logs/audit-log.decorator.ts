import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '@prisma/client';

export const AUDIT_ACTION_KEY = 'audit_action';
export const AuditLogAction = (action: AuditAction) =>
  SetMetadata(AUDIT_ACTION_KEY, action);

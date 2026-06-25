import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
  Version,
  Req,
} from '@nestjs/common';
import { UserRole, AuditAction, AuditTargetType } from '@prisma/client';
import { Roles } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateSubjectDto, UpdateSubjectDto } from '../subjects/dto';
import { SubjectsService } from '../subjects/subjects.service';
import { ParseMongoIdPipe } from '../../common/pipes/parse-mongoid.pipe';
import { AuditLogService } from '../audit-logs';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subjects')
export class AdminSubjectsController {
  constructor(
    private readonly subjectsService: SubjectsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Version('1')
  @Roles(UserRole.ADMIN)
  @Post()
  async create(
    @Body() createSubjectDto: CreateSubjectDto,
    @Req() request: any,
  ) {
    const result = await this.subjectsService.create(createSubjectDto);
    try {
      const actorId = request?.user?.sub;
      const actorRole = request?.user?.role;
      const ipAddress = request
        ? request.ip ||
          request.headers?.['x-forwarded-for'] ||
          request.socket?.remoteAddress
        : undefined;

      await this.auditLogService.log({
        actorId,
        actorRole,
        action: AuditAction.CREATE_SUBJECT,
        targetType: AuditTargetType.SUBJECT,
        targetId: result.id,
        metadata: {
          name: createSubjectDto.name,
          code: createSubjectDto.code,
          schoolId: createSubjectDto.schoolId,
        },
        ipAddress: ipAddress ? String(ipAddress) : undefined,
      });
    } catch (err) {
      console.error('Failed to log CREATE_SUBJECT:', err);
    }
    return result;
  }

  @Version('1')
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async update(
    @Param('id', new ParseMongoIdPipe()) id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
    @Req() request: any,
  ) {
    const oldSubject = await this.subjectsService.findOne(id);
    const result = await this.subjectsService.update(id, updateSubjectDto);
    try {
      const actorId = request?.user?.sub;
      const actorRole = request?.user?.role;
      const ipAddress = request
        ? request.ip ||
          request.headers?.['x-forwarded-for'] ||
          request.socket?.remoteAddress
        : undefined;

      await this.auditLogService.log({
        actorId,
        actorRole,
        action: AuditAction.UPDATE_SUBJECT,
        targetType: AuditTargetType.SUBJECT,
        targetId: id,
        metadata: {
          old: oldSubject
            ? { name: oldSubject.name, code: oldSubject.code }
            : null,
          new: { name: updateSubjectDto.name, code: updateSubjectDto.code },
        },
        ipAddress: ipAddress ? String(ipAddress) : undefined,
      });
    } catch (err) {
      console.error('Failed to log UPDATE_SUBJECT:', err);
    }
    return result;
  }

  @Version('1')
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(
    @Param('id', new ParseMongoIdPipe()) id: string,
    @Req() request: any,
  ) {
    const oldSubject = await this.subjectsService.findOne(id);
    const result = await this.subjectsService.delete(id);
    try {
      const actorId = request?.user?.sub;
      const actorRole = request?.user?.role;
      const ipAddress = request
        ? request.ip ||
          request.headers?.['x-forwarded-for'] ||
          request.socket?.remoteAddress
        : undefined;

      await this.auditLogService.log({
        actorId,
        actorRole,
        action: AuditAction.DELETE_SUBJECT,
        targetType: AuditTargetType.SUBJECT,
        targetId: id,
        metadata: oldSubject
          ? { name: oldSubject.name, code: oldSubject.code }
          : null,
        ipAddress: ipAddress ? String(ipAddress) : undefined,
      });
    } catch (err) {
      console.error('Failed to log DELETE_SUBJECT:', err);
    }
    return result;
  }
}

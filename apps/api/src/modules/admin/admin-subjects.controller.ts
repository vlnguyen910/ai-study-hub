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
    @Req() request?: any,
  ) {
    const result = await this.subjectsService.create(createSubjectDto);
    try {
      const actorId = request?.user?.sub;
      const actorRole = request?.user?.role;

      await this.auditLogService.log({
        actorId,
        actorRole,
        action: AuditAction.CREATE_SUBJECT,
        targetType: AuditTargetType.SUBJECT,
        targetId: result.data.id,
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
    @Req() request?: any,
  ) {
    const result = await this.subjectsService.update(id, updateSubjectDto);
    try {
      const actorId = request?.user?.sub;
      const actorRole = request?.user?.role;

      await this.auditLogService.log({
        actorId,
        actorRole,
        action: AuditAction.UPDATE_SUBJECT,
        targetType: AuditTargetType.SUBJECT,
        targetId: id,
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
    @Req() request?: any,
  ) {
    const result = await this.subjectsService.delete(id);
    try {
      const actorId = request?.user?.sub;
      const actorRole = request?.user?.role;

      await this.auditLogService.log({
        actorId,
        actorRole,
        action: AuditAction.DELETE_SUBJECT,
        targetType: AuditTargetType.SUBJECT,
        targetId: id,
      });
    } catch (err) {
      console.error('Failed to log DELETE_SUBJECT:', err);
    }
    return result;
  }
}

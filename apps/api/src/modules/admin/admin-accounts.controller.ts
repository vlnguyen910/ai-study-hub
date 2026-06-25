import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Version,
  Req,
} from '@nestjs/common';
import { UserRole, AuditAction, AuditTargetType } from '@prisma/client';
import { Roles } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ParseMongoIdPipe } from '../../common/pipes/parse-mongoid.pipe';
import { AccountsService } from '../accounts/accounts.service';
import { CreateAccountDto } from '../accounts/dto/create-account.dto';
import { ListAccountsQueryDto } from '../accounts/dto/list-accounts-query.dto';
import { AuditLogService } from '../audit-logs';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('accounts')
export class AdminAccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Roles(UserRole.ADMIN)
  @Version('1')
  @Post()
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.createModerator(createAccountDto);
  }

  @Roles(UserRole.ADMIN)
  @Version('1')
  @Get()
  findAll(@Query() query: ListAccountsQueryDto) {
    return this.accountsService.findAll(query);
  }

  @Roles(UserRole.ADMIN)
  @Version('1')
  @Get(':id')
  findOne(@Param('id', new ParseMongoIdPipe()) id: string) {
    return this.accountsService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Version('1')
  @Patch(':accountId/ban')
  async ban(
    @Param('accountId', new ParseMongoIdPipe()) accountId: string,
    @Req() request?: any,
  ) {
    const result = await this.accountsService.ban(accountId);
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
        action: AuditAction.BAN_USER,
        targetType: AuditTargetType.USER,
        targetId: accountId,
        metadata: {
          previousStatus: 'ACTIVE',
          newStatus: 'BANNED',
        },
        ipAddress: ipAddress ? String(ipAddress) : undefined,
      });
    } catch (err) {
      console.error('Failed to log BAN_USER action:', err);
    }
    return result;
  }
}

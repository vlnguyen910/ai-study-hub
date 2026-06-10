import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Version,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { ListAccountsQueryDto } from './dto/list-accounts-query.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ParseMongoIdPipe } from '../../common/pipes/parse-mongoid.pipe';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { TokenPayload } from '../../common/interfaces/auth.interface';
import { User } from '../../common/decorators';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

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
  @Patch(':accountId/ban')
  ban(@Param('accountId', new ParseMongoIdPipe()) accountId: string) {
    return this.accountsService.ban(accountId);
  }

  @Roles(UserRole.ADMIN)
  @Version('1')
  @Get(':id')
  findOne(@Param('id', new ParseMongoIdPipe()) id: string) {
    return this.accountsService.findOne(id);
  }

  @Roles(UserRole.USER)
  @Version('1')
  @Patch(':id')
  update(
    @Param('id', new ParseMongoIdPipe()) id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @User() user: TokenPayload,
  ) {
    return this.accountsService.update(id, updateAccountDto, user.sub);
  }

  @Roles(UserRole.USER)
  @Version('1')
  @Delete(':id')
  remove(
    @Param('id', new ParseMongoIdPipe()) id: string,
    @User() user: TokenPayload,
  ) {
    return this.accountsService.remove(id, user.sub);
  }
}

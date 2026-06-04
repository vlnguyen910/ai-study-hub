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
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ParseMongoIdPipe } from '../../common/pipes/parse-mongoid.pipe';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Roles(UserRole.ADMIN)
  @Version('1')
  @Post()
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(createAccountDto);
  }

  @Roles(UserRole.ADMIN)
  @Version('1')
  @Get()
  findAll() {
    return this.accountsService.findAll();
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
  ) {
    return this.accountsService.update(id, updateAccountDto);
  }

  @Roles(UserRole.USER)
  @Version('1')
  @Delete(':id')
  remove(@Param('id', new ParseMongoIdPipe()) id: string) {
    return this.accountsService.remove(id);
  }
}

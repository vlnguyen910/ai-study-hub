import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole, UserStatus } from '@prisma/client';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PrismaService } from '../../prisma/prisma.service';

const accountPublicSelect = {
  id: true,
  email: true,
  name: true,
  avatarUrl: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const;

@Injectable()
export class AccountsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createAccountDto: CreateAccountDto) {
    const existing = await this.prismaService.accounts.findUnique({
      where: { email: createAccountDto.email },
    });

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createAccountDto.password, 10);

    return this.prismaService.accounts.create({
      data: {
        email: createAccountDto.email,
        name: createAccountDto.name,
        password: hashedPassword,
        avatarUrl: createAccountDto.avatarUrl ?? '',
        role: createAccountDto.role ?? UserRole.USER,
      },
      select: accountPublicSelect,
    });
  }

  findAll() {
    return this.prismaService.accounts.findMany({
      where: { status: { not: UserStatus.DELETED } },
      select: accountPublicSelect,
    });
  }

  findOne(id: string) {
    const account = this.prismaService.accounts.findUnique({
      where: { id },
      select: accountPublicSelect,
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  ban(accountId: string) {
    return this.prismaService.accounts.update({
      where: { id: accountId },
      data: {
        status: UserStatus.BANNED,
      },
      select: accountPublicSelect,
    });
  }

  async update(id: string, updateAccountDto: UpdateAccountDto) {
    const account = await this.prismaService.accounts.findUnique({
      where: { id },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const updatedAccount = await this.prismaService.accounts.update({
      where: { id: account.id },
      data: {
        name: updateAccountDto.name,
        avatarUrl: updateAccountDto.avatarUrl,
      },
      select: accountPublicSelect,
    });

    return updatedAccount;
  }

  async remove(id: string) {
    const account = await this.prismaService.accounts.findUnique({
      where: { id },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    await this.prismaService.accounts.update({
      where: { id: account.id },
      data: {
        status: UserStatus.DELETED,
      },
      select: accountPublicSelect,
    });

    return { message: `Account deleted successfully` };
  }
}

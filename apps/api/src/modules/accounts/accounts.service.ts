import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { accounts, UserRole, UserStatus } from '@prisma/client';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PrismaService } from '../../prisma/prisma.service';

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

    await this.prismaService.accounts.create({
      data: {
        email: createAccountDto.email,
        name: createAccountDto.name,
        password: createAccountDto.hashedPassword,
        avatarUrl: createAccountDto.avatarUrl ?? '',
        role: createAccountDto.role ?? UserRole.USER,
      },
    });

    return { message: 'Account created successfully' };
  }

  async findAll() {
    return await this.prismaService.accounts.findMany({
      where: {
        status: { not: UserStatus.DELETED },
        role: { not: UserRole.ADMIN },
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    const account = await this.prismaService.accounts.findUnique({
      where: {
        id,
        status: { not: UserStatus.DELETED },
      },
      omit: {
        password: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async findAccountByEmail(email: string): Promise<accounts | null> {
    return await this.prismaService.accounts.findUnique({
      where: {
        email,
        status: { not: UserStatus.DELETED },
      },
    });
  }

  async ban(accountId: string) {
    const account = await this.prismaService.accounts.findUnique({
      where: {
        id: accountId,
        status: { not: UserStatus.DELETED },
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.status === UserStatus.BANNED) {
      return { message: 'Account is already banned' };
    }

    await this.prismaService.accounts.update({
      where: { id: accountId },
      data: {
        status: UserStatus.BANNED,
      },
    });

    return { message: `Account banned successfully` };
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
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
      },
    });

    return updatedAccount;
  }

  async remove(id: string) {
    const account = await this.prismaService.accounts.findUnique({
      where: {
        id,
        status: { not: UserStatus.DELETED },
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    await this.prismaService.accounts.update({
      where: { id: account.id },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return { message: `Account deleted successfully` };
  }
}

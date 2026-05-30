import { Injectable, ConflictException } from '@nestjs/common';
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
      select: accountPublicSelect,
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} account`;
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

  update(id: number, updateAccountDto: UpdateAccountDto) {
    return `This action updates a #${id} account`;
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UserStatus } from '@prisma/client';
import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountsService } from './accounts.service';

describe('AccountsService', () => {
  let service: AccountsService;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    jest.clearAllMocks();

    moduleRef = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: PrismaService,
          useValue: {
            accounts: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = moduleRef.get<AccountsService>(AccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create hashes password and returns a public account payload', async () => {
    const prisma: any = moduleRef.get(PrismaService as any);
    prisma.accounts.create.mockResolvedValue({ id: 'acc-1' });

    await service.create({
      email: 'admin@example.com',
      name: 'Admin User',
      password: 'Password123!',
      role: 'ADMIN' as any,
    });

    const createArgs = prisma.accounts.create.mock.calls[0][0];
    expect(createArgs.data.email).toBe('admin@example.com');
    expect(createArgs.data.name).toBe('Admin User');
    expect(createArgs.data.role).toBe('ADMIN');
    expect(await bcrypt.compare('Password123!', createArgs.data.password)).toBe(
      true,
    );
    expect(createArgs.select).toEqual({
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    });
  });

  it('throws ConflictException when email already exists', async () => {
    const prisma: any = moduleRef.get(PrismaService as any);
    prisma.accounts.findUnique.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create({
        email: 'existing@example.com',
        name: 'Existing',
        password: 'Password123!',
      } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('findAll calls prisma findMany with a public select', async () => {
    const prisma: any = moduleRef.get(PrismaService as any);
    prisma.accounts.findMany.mockResolvedValue([{ id: 1 }]);
    const res = await service.findAll();
    expect(res).toEqual([{ id: 1 }]);
    expect(prisma.accounts.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          role: true,
          status: true,
        }),
      }),
    );
  });

  it('ban updates account status to banned', async () => {
    const prisma: any = moduleRef.get(PrismaService as any);
    prisma.accounts.update.mockResolvedValue({ id: 'acc-1' });

    await service.ban('acc-1');

    expect(prisma.accounts.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'acc-1' },
        data: { status: UserStatus.BANNED },
      }),
    );
  });

  it('findOne returns placeholder', () => {
    expect(service.findOne(5)).toMatch(/#5 account/);
  });

  it('update returns placeholder', () => {
    expect(service.update(5, {} as any)).toMatch(/updates a #5 account/);
  });

  it('remove returns placeholder', () => {
    expect(service.remove(5)).toMatch(/removes a #5 account/);
  });
});

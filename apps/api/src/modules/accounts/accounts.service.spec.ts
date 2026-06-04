import { Test, TestingModule } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';
import { ConflictException, NotFoundException } from '@nestjs/common';
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

  it('create stores hashed password and returns success message', async () => {
    const prisma: any = moduleRef.get(PrismaService as any);
    prisma.accounts.findUnique.mockResolvedValue(null);
    prisma.accounts.create.mockResolvedValue({ id: 'acc-1' });
    const res = await service.create({
      email: 'admin@example.com',
      name: 'Admin User',
      password: 'Password123!',
      role: 'ADMIN' as any,
    });

    const createArgs = prisma.accounts.create.mock.calls[0][0];
    expect(createArgs.data.email).toBe('admin@example.com');
    expect(createArgs.data.name).toBe('Admin User');
    expect(createArgs.data.role).toBe('ADMIN');
    expect(createArgs.data.password).not.toBe('Password123!');
    expect(res).toEqual({ message: 'Account created successfully' });
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
    prisma.accounts.findUnique.mockResolvedValue({
      id: 'acc-1',
      status: UserStatus.ACTIVE,
    });
    prisma.accounts.update.mockResolvedValue({ id: 'acc-1' });

    await service.ban('acc-1');

    expect(prisma.accounts.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'acc-1' },
        data: { status: UserStatus.BANNED },
      }),
    );
  });

  it('ban returns already banned message when account is already banned', async () => {
    const prisma: any = moduleRef.get(PrismaService as any);
    prisma.accounts.findUnique.mockResolvedValue({
      id: 'acc-2',
      status: UserStatus.BANNED,
    });

    const res = await service.ban('acc-2');
    expect(res).toEqual({ message: 'Account is already banned' });
  });

  it('ban throws NotFoundException when account does not exist', async () => {
    const prisma: any = moduleRef.get(PrismaService as any);
    prisma.accounts.findUnique.mockResolvedValue(null);

    await expect(service.ban('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('findOne returns account when found', async () => {
    const prisma: any = moduleRef.get(PrismaService as any);
    const account = { id: 'acc-1', email: 'a@example.com' };
    prisma.accounts.findUnique.mockResolvedValue(account);

    const res = await service.findOne('acc-1');
    expect(res).toEqual(account);
    expect(prisma.accounts.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'acc-1' }),
      }),
    );
  });

  it('findOne throws NotFoundException when not found', async () => {
    const prisma: any = moduleRef.get(PrismaService as any);
    prisma.accounts.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update returns updated account when exists', async () => {
    const prisma: any = moduleRef.get(PrismaService as any);
    prisma.accounts.findUnique.mockResolvedValue({ id: 'acc-1' });
    const updated = {
      id: 'acc-1',
      email: 'a@example.com',
      name: 'New',
      avatarUrl: 'u',
    };
    prisma.accounts.update.mockResolvedValue(updated);

    const res = await service.update('acc-1', {
      name: 'New',
      avatarUrl: 'u',
    } as any);
    expect(res).toEqual(updated);
    expect(prisma.accounts.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'acc-1' },
        data: { name: 'New', avatarUrl: 'u' },
        select: expect.objectContaining({
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
        }),
      }),
    );
  });

  it('remove sets status to DELETED and returns message', async () => {
    const prisma: any = moduleRef.get(PrismaService as any);
    prisma.accounts.findUnique.mockResolvedValue({ id: 'acc-1' });
    prisma.accounts.update.mockResolvedValue({ id: 'acc-1' });

    const res = await service.remove('acc-1');
    expect(prisma.accounts.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'acc-1' },
        data: { status: UserStatus.DELETED },
      }),
    );
    expect(res).toEqual({ message: 'Account deleted successfully' });
  });
});

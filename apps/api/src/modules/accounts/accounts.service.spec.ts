import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountsService } from './accounts.service';

describe('AccountsService', () => {
  let service: AccountsService;
  let moduleRef: any;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = moduleRef.get<AccountsService>(AccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create returns placeholder string', () => {
    expect(service.create({} as any)).toMatch(/adds a new account/);
  });

  it('findAll calls prisma findMany', async () => {
    const prisma: any = moduleRef.get(PrismaService as any);
    prisma.accounts = { findMany: jest.fn().mockResolvedValue([{ id: 1 }]) };
    const res = await service.findAll();
    expect(res).toEqual([{ id: 1 }]);
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

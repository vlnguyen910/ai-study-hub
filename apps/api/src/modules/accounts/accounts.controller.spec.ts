import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

describe('AccountsController', () => {
  let controller: AccountsController;
  const accountsServiceMock = {
    create: jest.fn().mockReturnValue('created'),
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockReturnValue('one'),
    update: jest.fn().mockReturnValue('updated'),
    remove: jest.fn().mockReturnValue('removed'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        {
          provide: AccountsService,
          useValue: accountsServiceMock,
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AccountsController>(AccountsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create', () => {
    expect(controller.create({} as any)).toBe('created');
    expect(accountsServiceMock.create).toHaveBeenCalled();
  });

  it('should call findAll', async () => {
    await expect(controller.findAll()).resolves.toEqual([]);
    expect(accountsServiceMock.findAll).toHaveBeenCalled();
  });

  it('should call findOne/update/remove', () => {
    expect(controller.findOne('5')).toBe('one');
    expect(controller.update('5', {} as any)).toBe('updated');
    expect(controller.remove('5')).toBe('removed');
  });
});

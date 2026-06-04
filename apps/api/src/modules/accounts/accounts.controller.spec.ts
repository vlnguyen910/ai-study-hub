import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

describe('AccountsController', () => {
  let controller: AccountsController;
  const accountsServiceMock = {
    create: jest.fn().mockReturnValue('created'),
    findAll: jest.fn().mockResolvedValue([]),
    ban: jest.fn().mockReturnValue({ message: 'Account banned successfully' }),
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

  it('should call ban', () => {
    expect(controller.ban('acc-1')).toEqual({
      message: 'Account banned successfully',
    });
    expect(accountsServiceMock.ban).toHaveBeenCalledWith('acc-1');
  });

  it('should call findOne/update/remove', () => {
    expect(controller.findOne('5')).toBe('one');
    expect(controller.update('5', {} as any)).toBe('updated');
    expect(controller.remove('5')).toBe('removed');
  });

  it('should restrict admin endpoints to ADMIN role', () => {
    expect(Reflect.getMetadata(ROLES_KEY, controller.create)).toEqual([
      UserRole.ADMIN,
    ]);
    expect(Reflect.getMetadata(ROLES_KEY, controller.findAll)).toEqual([
      UserRole.ADMIN,
    ]);
    expect(Reflect.getMetadata(ROLES_KEY, controller.ban)).toEqual([
      UserRole.ADMIN,
    ]);
    expect(Reflect.getMetadata(ROLES_KEY, controller.findOne)).toEqual([
      UserRole.ADMIN,
    ]);
  });

  it('should restrict self-service endpoints to USER role', () => {
    expect(Reflect.getMetadata(ROLES_KEY, controller.update)).toEqual([
      UserRole.USER,
    ]);
    expect(Reflect.getMetadata(ROLES_KEY, controller.remove)).toEqual([
      UserRole.USER,
    ]);
  });
});

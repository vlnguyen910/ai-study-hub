import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    signup: jest.fn(),
    signin: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call signup service', async () => {
    authServiceMock.signup.mockResolvedValue({ accessToken: 'token' });

    await controller.signup({
      email: 'new-user@example.com',
      name: 'New User',
      password: 'Password123!',
      deviceInfo: 'WEB',
    });

    expect(authServiceMock.signup).toHaveBeenCalled();
  });

  it('should call signin service', async () => {
    authServiceMock.signin.mockResolvedValue({ accessToken: 'token' });

    await controller.signin({
      email: 'new-user@example.com',
      password: 'Password123!',
      deviceInfo: 'WEB',
    });

    expect(authServiceMock.signin).toHaveBeenCalled();
  });

  it('should call logout service', () => {
    authServiceMock.logout.mockReturnValue({ message: 'Logout successful' });

    controller.logout();

    expect(authServiceMock.logout).toHaveBeenCalled();
  });
});

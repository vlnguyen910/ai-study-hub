import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { jwtConfiguration } from '../../config';
import type { ConfigType } from '@nestjs/config';
import { TokenPayload } from '../../common/interfaces/auth.interface';
import { JwtTokenType } from '../../common/enums/jwt.enum';
import { accounts, DeviceType, UserRole } from '@prisma/client';
import argon2 from 'argon2';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject(jwtConfiguration.KEY)
    private readonly jwtConfig: ConfigType<typeof jwtConfiguration>,
    private accountService: AccountsService,
    private prismaService: PrismaService,
  ) {}

  async signup(signupDto: SignupDto) {
    const existingAccount = await this.accountService.findAccountByEmail(
      signupDto.email,
    );

    if (existingAccount) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await argon2.hash(signupDto.password);

    await this.accountService.create({
      email: signupDto.email,
      name: signupDto.name,
      hashedPassword: hashedPassword,
      avatarUrl: signupDto.avatarUrl,
      role: UserRole.USER,
    });

    return {
      message: 'Signup successful',
      data: null,
    };
  }

  async signin(signinDto: SigninDto, deviceType: DeviceType) {
    const account = await this.accountService.findAccountByEmail(
      signinDto.email,
    );

    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatchPassword = await argon2.verify(
      account.password,
      signinDto.password,
    );

    if (!isMatchPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const data = await this.manageUserToken(account, signinDto.deviceId);

    const hashedRefreshToken = await argon2.hash(data.refreshToken);
    // Avoiding multiple sessions with same deviceId for the same user, we use upsert to update existing session or create new one
    await this.prismaService.sessions.upsert({
      where: {
        userId_deviceId: {
          userId: account.id,
          deviceId: signinDto.deviceId,
        },
      },
      update: {
        refreshToken: hashedRefreshToken,
        expiresAt: this.getExpiryDate(this.jwtConfig.refreshTokenExpiresIn),
        isRevoked: false,
      },
      create: {
        userId: account.id,
        refreshToken: hashedRefreshToken,
        deviceId: signinDto.deviceId,
        deviceType: deviceType,
        expiresAt: this.getExpiryDate(this.jwtConfig.refreshTokenExpiresIn),
      },
    });

    return {
      message: 'Signin successful',
      data: data,
    };
  }

  async logout(userId: string, deviceId: string) {
    const account = this.accountService.findOne(userId);

    if (!account) {
      throw new UnauthorizedException('Invalid user');
    }

    await this.prismaService.sessions.updateMany({
      where: {
        userId,
        deviceId,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
      },
    });

    return {
      message: 'Logout successful',
      data: null,
    };
  }

  async refreshToken(userPayload: TokenPayload) {
    const accessToken = await this.generateToken(
      userPayload,
      JwtTokenType.AccessToken,
      this.jwtConfig.accessTokenExpiresIn,
    );

    return {
      message: 'Token refreshed successfully',
      data: {
        accessToken: accessToken,
      },
    };
  }

  private async manageUserToken(account: accounts, deviceId: string) {
    const tokenPayload: TokenPayload = {
      sub: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      status: account.status,
      type: JwtTokenType.AccessToken, // Default to AccessToken, will be overridden in generateToken
      deviceId: deviceId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.generateToken(
        tokenPayload,
        JwtTokenType.AccessToken,
        this.jwtConfig.accessTokenExpiresIn,
      ),
      this.generateToken(
        tokenPayload,
        JwtTokenType.RefreshToken,
        this.jwtConfig.refreshTokenExpiresIn,
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async generateToken(
    payload: TokenPayload,
    type: JwtTokenType,
    expiresIn: number | string,
  ) {
    const tokenPayload: TokenPayload = {
      ...payload,
      type,
    };

    const options: Partial<JwtSignOptions> = {
      expiresIn: expiresIn,
    } as unknown as JwtSignOptions;

    return this.jwtService.signAsync(tokenPayload, options);
  }

  private getExpiryDate(expiresIn: string) {
    const match = expiresIn.trim().match(/^(\d+)([smhd])$/i);

    if (!match) {
      throw new Error(`Unsupported token expiry format: ${expiresIn}`);
    }

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + amount * multipliers[unit]);
  }
}

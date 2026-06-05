import {
  BadRequestException,
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
import { accounts, DeviceType, UserRole, UserStatus } from '@prisma/client';
import argon2 from 'argon2';
import { AccountsService } from '../accounts/accounts.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationCodeDto } from './dto/resend-verification-code.dto';
import { EmailService } from './services/email.service';
import { VerificationCodeService } from './services/verification-code.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject(jwtConfiguration.KEY)
    private readonly jwtConfig: ConfigType<typeof jwtConfiguration>,
    private accountService: AccountsService,
    private prismaService: PrismaService,
    private verificationCodeService: VerificationCodeService,
    private emailService: EmailService,
  ) {}

  async signup(signupDto: SignupDto) {
    const existingAccount = await this.accountService.findAccountByEmail(
      signupDto.email,
    );

    if (existingAccount) {
      throw new ConflictException('Email already exists');
    }

    await this.accountService.create({
      email: signupDto.email,
      name: signupDto.name,
      password: signupDto.password,
      avatarUrl: signupDto.avatarUrl,
      role: UserRole.USER,
      status: UserStatus.UNVERIFIED,
    });

    const account = await this.accountService.findAccountByEmail(
      signupDto.email,
    );

    if (!account) {
      throw new BadRequestException('Unable to create account');
    }

    const code = await this.verificationCodeService.issueCode({
      accountId: account.id,
      email: account.email,
    });

    await this.emailService.sendVerificationCode({
      email: account.email,
      name: account.name,
      code,
    });

    return {
      message: 'Signup successful. Please verify your email.',
      data: null,
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const account = await this.accountService.findAccountByEmail(
      verifyEmailDto.email,
    );

    if (!account) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    if (account.status === UserStatus.ACTIVE) {
      throw new BadRequestException('Email is already verified');
    }

    if (account.status !== UserStatus.UNVERIFIED) {
      throw new BadRequestException('Account cannot be verified');
    }

    const accountId = await this.verificationCodeService.verifyCode(
      account.email,
      verifyEmailDto.code,
    );

    if (accountId !== account.id) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    await this.prismaService.accounts.update({
      where: { id: account.id },
      data: { status: UserStatus.ACTIVE },
    });

    return {
      message: 'Email verified successfully',
      data: null,
    };
  }

  async resendVerificationCode(
    resendVerificationCodeDto: ResendVerificationCodeDto,
  ) {
    const account = await this.accountService.findAccountByEmail(
      resendVerificationCodeDto.email,
    );

    if (!account) {
      throw new BadRequestException('Account cannot be verified');
    }

    if (account.status === UserStatus.ACTIVE) {
      throw new BadRequestException('Email is already verified');
    }

    if (account.status !== UserStatus.UNVERIFIED) {
      throw new BadRequestException('Account cannot be verified');
    }

    const code = await this.verificationCodeService.issueCode({
      accountId: account.id,
      email: account.email,
      enforceCooldown: true,
    });

    await this.emailService.sendVerificationCode({
      email: account.email,
      name: account.name,
      code,
    });

    return {
      message: 'Verification code sent',
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

    if (account.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Email verification is required');
    }

    const tokens = await this.manageUserToken(account, signinDto.deviceId);

    const hashedRefreshToken = await argon2.hash(tokens.refreshToken);
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
      data: tokens,
    };
  }

  async logout(userId: string, deviceId: string) {
    const account = await this.accountService.findOne(userId);

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

  async refreshToken(userPayload: TokenPayload, refreshToken: string) {
    const session = await this.prismaService.sessions.findFirst({
      where: {
        userId: userPayload.sub,
        deviceId: userPayload.deviceId,
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid session');
    }

    const isValidRefreshToken = await argon2.verify(
      session.refreshToken,
      refreshToken,
    );

    if (!isValidRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

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

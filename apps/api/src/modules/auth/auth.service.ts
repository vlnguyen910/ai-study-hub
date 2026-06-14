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
import {
  emailVerificationConfiguration,
  jwtConfiguration,
  passwordRecoveryConfiguration,
} from '../../config';
import type { ConfigType } from '@nestjs/config';
import { TokenPayload } from '../../common/interfaces/auth.interface';
import { JwtTokenType } from '../../common/enums/jwt.enum';
import { accounts, DeviceType, UserRole, UserStatus } from '@prisma/client';
import argon2 from 'argon2';
import { AccountsService } from '../accounts/accounts.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { MailService } from '../mail/mail.service';
import { AuthTokenService } from './services/auth-token.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

const VERIFY_EMAIL_TOKEN_PREFIX = 'verify_email';
const VERIFY_EMAIL_USER_PREFIX = 'verify_email_user';
const VERIFY_EMAIL_COOLDOWN_PREFIX = 'verify_email_cooldown';
const PASSWORD_RESET_TOKEN_PREFIX = 'password_reset';
const PASSWORD_RESET_USER_PREFIX = 'password_reset_user';
const PASSWORD_RESET_COOLDOWN_PREFIX = 'password_reset_cooldown';
const PASSWORD_RESET_SUCCESS_MESSAGE =
  'If an account exists for this email, a password reset link has been sent.';

type VerificationAccount = Pick<
  accounts,
  'id' | 'email' | 'name' | 'role' | 'status'
>;

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject(jwtConfiguration.KEY)
    private readonly jwtConfig: ConfigType<typeof jwtConfiguration>,
    @Inject(emailVerificationConfiguration.KEY)
    private readonly emailVerificationConfig: ConfigType<
      typeof emailVerificationConfiguration
    >,
    @Inject(passwordRecoveryConfiguration.KEY)
    private readonly passwordRecoveryConfig: ConfigType<
      typeof passwordRecoveryConfiguration
    >,
    private accountService: AccountsService,
    private prismaService: PrismaService,
    private mailService: MailService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async getCurrentUser(userPayload: TokenPayload) {
    const account = await this.accountService.findOne(userPayload.sub);

    if (!account) {
      throw new UnauthorizedException('Invalid user');
    }

    return {
      message: 'Current user retrieved successfully',
      data: {
        id: account.id,
        email: account.email,
        name: account.name,
        avatarUrl: account.avatarUrl,
        role: account.role,
        status: account.status,
        createdAt: account.createdAt,
      },
    };
  }

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

    await this.issueVerificationEmail(account);

    return {
      message: 'Signup successful. Please verify your email.',
      data: null,
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const accountId = await this.authTokenService.getSubjectId(
      VERIFY_EMAIL_TOKEN_PREFIX,
      verifyEmailDto.token,
    );

    if (!accountId) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    const account = await this.accountService.findOne(accountId);

    if (!account) {
      throw new BadRequestException('Account cannot be verified');
    }

    if (account.status === UserStatus.ACTIVE) {
      throw new BadRequestException('Email is already verified');
    }

    if (account.status !== UserStatus.UNVERIFIED) {
      throw new BadRequestException('Account cannot be verified');
    }

    const activatedAccount = await this.prismaService.accounts.update({
      where: { id: account.id },
      data: { status: UserStatus.ACTIVE },
    });

    await this.authTokenService.invalidateToken(
      {
        tokenPrefix: VERIFY_EMAIL_TOKEN_PREFIX,
        subjectPrefix: VERIFY_EMAIL_USER_PREFIX,
        cooldownPrefix: VERIFY_EMAIL_COOLDOWN_PREFIX,
      },
      account.id,
      verifyEmailDto.token,
    );

    const deviceId = verifyEmailDto.deviceId?.trim();
    const tokens = deviceId
      ? await this.rotateVerifiedSession(activatedAccount, deviceId)
      : null;

    return {
      message: 'Email verified successfully',
      data: tokens,
    };
  }

  async resendVerificationEmail(userId: string) {
    const account = await this.accountService.findOne(userId);

    if (!account) {
      throw new BadRequestException('Account cannot be verified');
    }

    if (account.status === UserStatus.ACTIVE) {
      return {
        message: 'Email is already verified',
        data: null,
      };
    }

    if (account.status !== UserStatus.UNVERIFIED) {
      throw new BadRequestException('Account cannot be verified');
    }

    await this.assertVerificationCooldown(account.id);
    await this.issueVerificationEmail(account);
    await this.authTokenService.setCooldown(
      VERIFY_EMAIL_COOLDOWN_PREFIX,
      account.id,
      this.emailVerificationConfig.resendCooldownSeconds,
    );

    return {
      message: 'Verification email sent',
      data: null,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const account = await this.accountService.findAccountByEmail(
      forgotPasswordDto.email,
    );

    if (!account || account.status !== UserStatus.ACTIVE) {
      return {
        message: PASSWORD_RESET_SUCCESS_MESSAGE,
        data: null,
      };
    }

    await this.authTokenService.assertCooldown(
      PASSWORD_RESET_COOLDOWN_PREFIX,
      account.id,
      this.passwordRecoveryConfig.resendCooldownSeconds,
      (waitSeconds) =>
        `Please wait ${waitSeconds} seconds before requesting another password reset email`,
    );

    const { token } = await this.authTokenService.rotateToken({
      tokenPrefix: PASSWORD_RESET_TOKEN_PREFIX,
      subjectPrefix: PASSWORD_RESET_USER_PREFIX,
      subjectId: account.id,
      ttlSeconds: this.passwordRecoveryConfig.ttlSeconds,
    });

    await this.mailService.sendPasswordResetLink(
      account,
      token,
      this.passwordRecoveryConfig.ttlSeconds,
    );
    await this.authTokenService.setCooldown(
      PASSWORD_RESET_COOLDOWN_PREFIX,
      account.id,
      this.passwordRecoveryConfig.resendCooldownSeconds,
    );

    return {
      message: PASSWORD_RESET_SUCCESS_MESSAGE,
      data: null,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const accountId = await this.authTokenService.getSubjectId(
      PASSWORD_RESET_TOKEN_PREFIX,
      resetPasswordDto.token,
    );

    if (!accountId) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const account = await this.prismaService.accounts.findUnique({
      where: {
        id: accountId,
        status: UserStatus.ACTIVE,
      },
    });

    if (!account) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await argon2.hash(resetPasswordDto.password);

    await this.prismaService.accounts.update({
      where: { id: account.id },
      data: { password: hashedPassword },
    });
    await this.authTokenService.invalidateToken(
      {
        tokenPrefix: PASSWORD_RESET_TOKEN_PREFIX,
        subjectPrefix: PASSWORD_RESET_USER_PREFIX,
        cooldownPrefix: PASSWORD_RESET_COOLDOWN_PREFIX,
      },
      account.id,
      resetPasswordDto.token,
    );
    await this.prismaService.sessions.updateMany({
      where: {
        userId: account.id,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
      },
    });

    return {
      message: 'Password reset successfully',
      data: null,
    };
  }

  async changePassword(
    userPayload: TokenPayload,
    changePasswordDto: ChangePasswordDto,
  ) {
    const account = await this.prismaService.accounts.findUnique({
      where: {
        id: userPayload.sub,
        status: UserStatus.ACTIVE,
      },
    });

    if (!account) {
      throw new UnauthorizedException('Invalid user');
    }

    const isCurrentPasswordValid = await argon2.verify(
      account.password,
      changePasswordDto.currentPassword,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    const isSamePassword = await argon2.verify(
      account.password,
      changePasswordDto.newPassword,
    );

    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const hashedPassword = await argon2.hash(changePasswordDto.newPassword);

    await this.prismaService.accounts.update({
      where: { id: account.id },
      data: { password: hashedPassword },
    });
    await this.prismaService.sessions.updateMany({
      where: {
        userId: account.id,
        deviceId: {
          not: userPayload.deviceId,
        },
        isRevoked: false,
      },
      data: {
        isRevoked: true,
      },
    });

    return {
      message: 'Password changed successfully',
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

    if (
      account.status !== UserStatus.ACTIVE &&
      account.status !== UserStatus.UNVERIFIED
    ) {
      throw new UnauthorizedException('Invalid credentials');
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

  private async rotateVerifiedSession(account: accounts, deviceId: string) {
    const tokens = await this.manageUserToken(account, deviceId);
    const hashedRefreshToken = await argon2.hash(tokens.refreshToken);

    await this.prismaService.sessions.upsert({
      where: {
        userId_deviceId: {
          userId: account.id,
          deviceId,
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
        deviceId,
        deviceType: DeviceType.WEB,
        expiresAt: this.getExpiryDate(this.jwtConfig.refreshTokenExpiresIn),
      },
    });

    return tokens;
  }

  private async issueVerificationEmail(account: VerificationAccount) {
    const { token } = await this.authTokenService.rotateToken({
      tokenPrefix: VERIFY_EMAIL_TOKEN_PREFIX,
      subjectPrefix: VERIFY_EMAIL_USER_PREFIX,
      subjectId: account.id,
      ttlSeconds: this.emailVerificationConfig.ttlSeconds,
    });
    await this.mailService.sendVerificationCode(account, token);
  }

  private async assertVerificationCooldown(userId: string) {
    await this.authTokenService.assertCooldown(
      VERIFY_EMAIL_COOLDOWN_PREFIX,
      userId,
      this.emailVerificationConfig.resendCooldownSeconds,
      (waitSeconds) =>
        `Please wait ${waitSeconds} seconds before requesting another verification email`,
    );
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

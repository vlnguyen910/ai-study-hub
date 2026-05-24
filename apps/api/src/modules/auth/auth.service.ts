import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const existingAccount = await this.prismaService.accounts.findUnique({
      where: {
        email: signupDto.email,
      },
    });

    if (existingAccount) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);

    const account = await this.prismaService.accounts.create({
      data: {
        email: signupDto.email,
        name: signupDto.name,
        password: hashedPassword,
        avatarUrl: signupDto.avatarUrl ?? '',
        role: 'USER',
      },
    });

    const tokens = await this.generateTokens(account.id, account.email);

    await this.prismaService.sessions.create({
      data: {
        userId: account.id,
        refreshToken: tokens.refreshToken,
        deviceInfo: signupDto.deviceInfo ?? 'WEB',
        expiresAt: this.getRefreshExpiresAt(),
      },
    });

    return {
      user: {
        id: account.id,
        email: account.email,
        name: account.name,
      },
      ...tokens,
    };
  }

  async signin(signinDto: SigninDto) {
    const account = await this.prismaService.accounts.findUnique({
      where: {
        email: signinDto.email,
      },
    });

    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatched = await bcrypt.compare(
      signinDto.password,
      account.password,
    );

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(account.id, account.email);

    await this.prismaService.sessions.create({
      data: {
        userId: account.id,
        refreshToken: tokens.refreshToken,
        deviceInfo: signinDto.deviceInfo ?? 'WEB',
        expiresAt: this.getRefreshExpiresAt(),
      },
    });

    return {
      user: {
        id: account.id,
        email: account.email,
        name: account.name,
      },
      ...tokens,
    };
  }

  logout() {
    return {
      message: 'Logout successful',
    };
  }

  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<AuthTokens> {
    const payload = {
      sub: userId,
      email,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: this.parseExpiresIn(
        process.env.JWT_ACCESS_EXPIRES_IN,
        15 * 60,
      ),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: this.parseExpiresIn(
        process.env.JWT_REFRESH_EXPIRES_IN,
        30 * 24 * 60 * 60,
      ),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private getRefreshExpiresAt() {
    const now = Date.now();
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

    return new Date(now + thirtyDaysInMs);
  }

  private parseExpiresIn(
    rawValue: string | undefined,
    fallback: number,
  ): number {
    if (!rawValue) {
      return fallback;
    }

    const normalized = rawValue.trim().toLowerCase();

    if (/^\d+$/.test(normalized)) {
      return Number.parseInt(normalized, 10);
    }

    const matched = normalized.match(/^(\d+)(s|m|h|d)$/);

    if (!matched) {
      return fallback;
    }

    const value = Number.parseInt(matched[1], 10);
    const unit = matched[2];

    if (unit === 's') {
      return value;
    }

    if (unit === 'm') {
      return value * 60;
    }

    if (unit === 'h') {
      return value * 60 * 60;
    }

    return value * 24 * 60 * 60;
  }
}

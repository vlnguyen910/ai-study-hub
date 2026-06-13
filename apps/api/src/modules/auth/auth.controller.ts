import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
  Version,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from '../../common/decorators/public.decorator';
import { cookieConfiguration } from '../../config';
import { DeviceType } from '@prisma/client';
import { User } from '../../common/decorators';
import { TokenPayload } from '../../common/interfaces/auth.interface';
import { RefreshTokenGuard } from '../../common/guards/refresh-token.guard';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';

type RefreshTokenRequest = Request & {
  body?: {
    refreshToken?: unknown;
  };
};

const getBearerToken = (authorization?: unknown) => {
  if (typeof authorization !== 'string') {
    return undefined;
  }

  const [scheme, token] = authorization.split(' ');
  return scheme === 'Bearer' ? token : undefined;
};

const getRefreshToken = (request: RefreshTokenRequest) => {
  const token =
    request.body?.refreshToken ??
    getBearerToken(request.headers?.authorization) ??
    request.cookies?.['refreshToken'] ??
    request.cookies?.['refresh_token'];

  return typeof token === 'string' ? token : undefined;
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(cookieConfiguration.KEY)
    private readonly cookieConfig: ConfigType<typeof cookieConfiguration>,
  ) {}

  @Version('1')
  @Public()
  @Post('signup')
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Version('1')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('verify-email')
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Version('1')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('resend-verification-email')
  resendVerificationEmail(@User() user: TokenPayload) {
    return this.authService.resendVerificationEmail(user.sub);
  }

  @Version('1')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Version('1')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Version('1')
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@User() user: TokenPayload) {
    return this.authService.getCurrentUser(user);
  }

  @Version('1')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  changePassword(
    @User() user: TokenPayload,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user, changePasswordDto);
  }

  @Version('1')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(@Body() signinDto: SigninDto, @Res() res: Response) {
    const result = await this.authService.signin(signinDto, DeviceType.WEB);

    // Store refresh token in an HTTP-only cookie for the web session.
    res.cookie('refreshToken', result.data.refreshToken, {
      httpOnly: this.cookieConfig.httpOnly,
      secure: this.cookieConfig.secure,
      sameSite: this.cookieConfig.sameSite,
      maxAge: this.cookieConfig.refreshTokenMaxAge,
    });

    // Return access token in the body for client-side Authorization retries.
    return res.json({
      success: true,
      statusCode: HttpStatus.OK,
      message: result.message,
      data: {
        accessToken: result.data.accessToken,
      },
    });
  }

  @Version('1')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('mobile-signin')
  async mobileSignin(@Body() signinDto: SigninDto) {
    const result = await this.authService.signin(signinDto, DeviceType.MOBILE);

    return {
      message: result.message,
      data: result.data,
    };
  }

  @Version('1')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(
    @User() user: TokenPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return this.authService.logout(user.sub, user.deviceId);
  }

  @Version('1')
  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refreshToken(
    @User() userPayload: TokenPayload,
    @Body() body: { refreshToken?: string },
    @Req() req: RefreshTokenRequest,
  ) {
    const refreshToken = body.refreshToken ?? getRefreshToken(req);

    if (!refreshToken) {
      throw new BadRequestException('refreshToken is required');
    }

    return this.authService.refreshToken(userPayload, refreshToken);
  }
}

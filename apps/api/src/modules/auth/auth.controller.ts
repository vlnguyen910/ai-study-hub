import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
  Version,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { Public } from '../../common/decorators/public.decorator';
import { cookieConfiguration } from '../../config';
import { DeviceInfo } from '@prisma/client';

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
    return this.authService.signup({
      ...signupDto,
      deviceInfo: DeviceInfo.WEB,
    });
  }

  @Version('1')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(@Body() signinDto: SigninDto, @Res() res: Response) {
    const result = await this.authService.signin(signinDto);

    // Set access token as HTTP-only cookie
    res.cookie('accessToken', result.data.accessToken, {
      httpOnly: this.cookieConfig.httpOnly,
      secure: this.cookieConfig.secure,
      sameSite: this.cookieConfig.sameSite,
      maxAge: this.cookieConfig.accessTokenMaxAge,
    });

    // Return response with refresh token in body
    return res.json({
      success: true,
      statusCode: HttpStatus.OK,
      message: result.message,
      data: {
        refreshToken: result.data.refreshToken,
      },
    });
  }

  @Version('1')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('mobile-signin')
  async mobileSignin(@Body() signinDto: SigninDto) {
    const result = await this.authService.signin({
      ...signinDto,
      deviceInfo: DeviceInfo.MOBILE,
    });

    return {
      message: result.message,
      data: result.data,
    };
  }

  @Version('1')
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Res() res: Response) {
    const result = this.authService.logout();

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.json({
      success: true,
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result.data,
    });
  }
}

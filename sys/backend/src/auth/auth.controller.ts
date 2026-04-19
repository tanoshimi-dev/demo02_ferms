import {
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthRedirectQueryDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('handover')
  async handover(
    @Req() request: Request,
    @Res() response: Response,
    @Query() query: AuthRedirectQueryDto,
  ) {
    const returnTo = this.authService.sanitizeReturnTo(query.returnTo);

    try {
      const session = await this.authService.handover(request);
      response.cookie(
        this.authService.getSessionCookieName(),
        session.id,
        this.authService.buildSessionCookie(session),
      );
      response.redirect(HttpStatus.FOUND, returnTo);
      return;
    } catch (error) {
      if (this.authService.shouldRedirectToPortalLogin(error)) {
        response.redirect(
          HttpStatus.FOUND,
          this.authService.buildPortalLoginUrl(returnTo),
        );
        return;
      }

      response.status(HttpStatus.UNAUTHORIZED).json({
        error: {
          code: 'unauthenticated',
          message: '認証引き継ぎに失敗しました。',
        },
      });
    }
  }

  @Get('me')
  async getMe(@Req() request: Request) {
    const user = await this.authService.currentUser(request);
    if (!user) {
      throw new UnauthorizedException({
        error: {
          code: 'unauthenticated',
          message: '認証済みユーザーが存在しません。',
        },
      });
    }

    return {
      data: {
        authenticated: true,
        user,
      },
    };
  }

  @Get('logout')
  logout(
    @Req() request: Request,
    @Res() response: Response,
    @Query() query: AuthRedirectQueryDto,
  ) {
    const returnTo = this.authService.sanitizeReturnTo(query.returnTo);

    this.authService.clearSession(request);
    response.clearCookie(
      this.authService.getSessionCookieName(),
      this.authService.buildExpiredCookie(),
    );
    response.redirect(
      HttpStatus.FOUND,
      this.authService.buildPortalLogoutUrl(returnTo),
    );
  }

  @Post('logout')
  logoutForApi(@Req() request: Request, @Res() response: Response) {
    this.authService.clearSession(request);
    response.clearCookie(
      this.authService.getSessionCookieName(),
      this.authService.buildExpiredCookie(),
    );
    response.status(HttpStatus.OK).json({
      data: {
        loggedOut: true,
      },
    });
  }
}

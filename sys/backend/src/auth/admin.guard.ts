import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedRequest } from './auth.types';
import { AuthService } from './auth.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    try {
      const currentUser = this.authService.requireSessionUser(request);
      if (currentUser.role !== 'admin') {
        throw new ForbiddenException({
          error: {
            code: 'forbidden',
            message: '管理者権限が必要です。',
          },
        });
      }

      request.currentUser = currentUser;
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw new UnauthorizedException({
        error: {
          code: 'unauthenticated',
          message: '認証済みユーザーが存在しません。',
        },
      });
    }
  }
}

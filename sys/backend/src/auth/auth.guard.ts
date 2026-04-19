import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedRequest } from './auth.types';
import { AuthService } from './auth.service';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    try {
      request.currentUser = this.authService.requireSessionUser(request);
      return true;
    } catch {
      throw new UnauthorizedException({
        error: {
          code: 'unauthenticated',
          message: '認証済みユーザーが存在しません。',
        },
      });
    }
  }
}

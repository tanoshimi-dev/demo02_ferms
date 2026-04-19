import { Module } from '@nestjs/common';
import { AdminAuthGuard } from './admin.guard';
import { loadRuntimeConfig } from '../config/runtime.config';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AUTH_PROVIDER } from './auth.constants';
import { SessionAuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { MockAuthProvider } from './mock-auth.provider';
import { PortalAuthProvider } from './portal-auth.provider';
import { SessionStore } from './session.store';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    {
      provide: 'RUNTIME_CONFIG',
      useFactory: () => loadRuntimeConfig(),
    },
    {
      provide: AUTH_PROVIDER,
      inject: ['RUNTIME_CONFIG'],
      useFactory: (runtimeConfig: ReturnType<typeof loadRuntimeConfig>) => {
        if (runtimeConfig.auth.mode === 'portal') {
          return new PortalAuthProvider(runtimeConfig);
        }

        return MockAuthProvider.fromConfig(runtimeConfig);
      },
    },
    SessionStore,
    AuthService,
    SessionAuthGuard,
    AdminAuthGuard,
  ],
  exports: [AuthService, SessionAuthGuard, AdminAuthGuard],
})
export class AuthModule {}

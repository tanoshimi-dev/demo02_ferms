import type { ExecutionContext } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import type { InsertResult, Repository } from 'typeorm';
import { AdminAuthGuard } from './admin.guard';
import { AuthService } from './auth.service';
import { SessionStore } from './session.store';
import type { AuthProvider } from './auth.types';
import type { RuntimeConfig } from '../config/runtime.config';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/user.entity';

class GuardProvider implements AuthProvider {
  constructor(private readonly role: string) {}

  authenticate() {
    return Promise.resolve({
      id: 'demo02-user-001',
      email: 'demo02.user@local.test',
      name: 'Demo02 Local User',
      role: this.role,
    });
  }
}

function createRuntimeConfig(): RuntimeConfig {
  return {
    port: 8080,
    frontendOrigin: 'http://localhost:3000',
    frontendPublicUrl: 'http://localhost:3000',
    backendPublicUrl: 'http://localhost:8080',
    database: {
      host: 'localhost',
      port: 5432,
      name: 'demo02_ferms',
      username: 'postgres',
      password: 'postgres',
      synchronize: true,
    },
    auth: {
      mode: 'mock',
      mockUser: {
        id: 'demo02-user-001',
        email: 'demo02.user@local.test',
        name: 'Demo02 Local User',
        role: 'admin',
      },
      portalCookieNames: ['portal_token'],
      portalAllowedIssuers: ['https://tanoshimi.dev'],
      portalJwksUrl: '',
      portalLoginUrl: '',
      portalSessionUrls: [],
      portalUserInfoUrls: [],
      sessionCookieName: 'demo02_ferms_session',
      sessionCookieDomain: '',
      sessionCookieSecure: false,
      sessionTtlMs: 43_200_000,
    },
  };
}

function createUsersService(): UsersService {
  let persistedUser: UserEntity | null = null;

  const repository = {
    upsert: jest.fn(
      async (entity: Partial<UserEntity> | Partial<UserEntity>[]) => {
        const user = Array.isArray(entity) ? entity[0] : entity;
        persistedUser = {
          id: user.id ?? 'user-id',
          email: user.email ?? 'user@example.com',
          name: user.name ?? 'User',
          role: user.role ?? 'user',
          reservations: [],
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        };

        return {} as InsertResult;
      },
    ),
    findOneByOrFail: jest.fn(async ({ id }: { id: string }) => {
      if (!persistedUser || persistedUser.id !== id) {
        throw new Error('User not found');
      }

      return persistedUser;
    }),
  };

  return new UsersService(repository as unknown as Repository<UserEntity>);
}

describe('AdminAuthGuard', () => {
  it('attaches the admin user to the request', async () => {
    const service = new AuthService(
      new GuardProvider('admin'),
      new SessionStore(),
      createUsersService(),
      createRuntimeConfig(),
    );
    const guard = new AdminAuthGuard(service);
    const session = await service.handover({
      headers: {},
    } as never);
    const request = {
      headers: {
        cookie: `demo02_ferms_session=${session.id}`,
      },
    };

    expect(
      guard.canActivate({
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as ExecutionContext),
    ).toBe(true);
    expect(request).toHaveProperty('currentUser.role', 'admin');
  });

  it('rejects a non-admin user', async () => {
    const service = new AuthService(
      new GuardProvider('user'),
      new SessionStore(),
      createUsersService(),
      createRuntimeConfig(),
    );
    const guard = new AdminAuthGuard(service);
    const session = await service.handover({
      headers: {},
    } as never);

    expect(() =>
      guard.canActivate({
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              cookie: `demo02_ferms_session=${session.id}`,
            },
          }),
        }),
      } as ExecutionContext),
    ).toThrow(ForbiddenException);
  });
});

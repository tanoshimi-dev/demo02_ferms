import type { Request } from 'express';
import type { InsertResult, Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { SessionStore } from './session.store';
import { UnauthenticatedError } from './auth.errors';
import type { AuthProvider, AuthUser } from './auth.types';
import type { RuntimeConfig } from '../config/runtime.config';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/user.entity';

class StubProvider implements AuthProvider {
  constructor(
    private readonly user: AuthUser | null,
    private readonly error?: Error,
  ) {}

  authenticate(request: Request): Promise<AuthUser> {
    void request;
    if (this.error) {
      return Promise.reject(this.error);
    }
    if (!this.user) {
      return Promise.reject(new UnauthenticatedError());
    }
    return Promise.resolve(this.user);
  }
}

function createRuntimeConfig(
  overrides?: Partial<RuntimeConfig>,
): RuntimeConfig {
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
      portalLoginUrl: 'https://tanoshimi.dev/login',
      portalSessionUrls: [],
      portalUserInfoUrls: [],
      sessionCookieName: 'demo02_ferms_session',
      sessionCookieDomain: '',
      sessionCookieSecure: false,
      sessionTtlMs: 43_200_000,
    },
    ...overrides,
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

describe('AuthService', () => {
  it('sanitizes returnTo to the frontend origin', () => {
    const service = new AuthService(
      new StubProvider(null),
      new SessionStore(),
      createUsersService(),
      createRuntimeConfig(),
    );

    expect(service.sanitizeReturnTo('https://example.com/evil')).toBe(
      'http://localhost:3000',
    );
    expect(service.sanitizeReturnTo('/dashboard')).toBe(
      'http://localhost:3000/dashboard',
    );
  });

  it('builds a portal login url with the sanitized returnTo', () => {
    const service = new AuthService(
      new StubProvider(null),
      new SessionStore(),
      createUsersService(),
      createRuntimeConfig({
        auth: {
          ...createRuntimeConfig().auth,
          mode: 'portal',
          portalLoginUrl: 'https://tanoshimi.dev/login',
        },
      }),
    );

    expect(service.buildPortalLoginUrl('/dashboard')).toBe(
      'https://tanoshimi.dev/login?returnTo=http%3A%2F%2Flocalhost%3A3000%2Fdashboard',
    );
    expect(service.buildPortalLogoutUrl('/dashboard')).toBe(
      'https://tanoshimi.dev/auth/logout?returnTo=http%3A%2F%2Flocalhost%3A3000%2Fdashboard',
    );
  });

  it('resolves the current user from a local session', async () => {
    const service = new AuthService(
      new StubProvider({
        id: 'portal-user-001',
        email: 'portal.user@tanoshimi.dev',
        name: 'Portal User',
        role: 'user',
      }),
      new SessionStore(),
      createUsersService(),
      createRuntimeConfig(),
    );

    const session = await service.handover({
      headers: {},
    } as Request);

    await expect(
      service.currentUser({
        headers: {
          cookie: `demo02_ferms_session=${session.id}`,
        },
      } as Request),
    ).resolves.toEqual({
      id: 'portal-user-001',
      email: 'portal.user@tanoshimi.dev',
      name: 'Portal User',
      role: 'user',
    });
  });

  it('falls back to portal authentication when portal mode is enabled', async () => {
    const service = new AuthService(
      new StubProvider({
        id: 'portal-user-001',
        email: 'portal.user@tanoshimi.dev',
        name: 'Portal User',
        role: 'admin',
      }),
      new SessionStore(),
      createUsersService(),
      createRuntimeConfig({
        auth: {
          ...createRuntimeConfig().auth,
          mode: 'portal',
        },
      }),
    );

    await expect(
      service.currentUser({
        headers: {},
      } as Request),
    ).resolves.toEqual({
      id: 'portal-user-001',
      email: 'portal.user@tanoshimi.dev',
      name: 'Portal User',
      role: 'admin',
    });
  });
});

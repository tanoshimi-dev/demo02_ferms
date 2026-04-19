import { createSign, generateKeyPairSync, type KeyObject } from 'crypto';
import { createServer, type IncomingMessage, type ServerResponse } from 'http';
import type { AddressInfo } from 'net';
import type { Request } from 'express';
import { PortalAuthProvider } from './portal-auth.provider';

function encodeSegment(payload: unknown): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function signToken(
  privateKey: KeyObject,
  keyId: string,
  claims: Record<string, unknown>,
): string {
  const header = encodeSegment({
    alg: 'RS256',
    kid: keyId,
    typ: 'JWT',
  });
  const payload = encodeSegment(claims);
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${payload}`);
  signer.end();
  const signature = signer.sign(privateKey).toString('base64url');
  return `${header}.${payload}.${signature}`;
}

function startJsonServer(
  handler: (request: IncomingMessage, response: ServerResponse) => void,
) {
  return new Promise<{ close: () => Promise<void>; url: string }>((resolve) => {
    const server = createServer(handler);
    server.listen(0, () => {
      const { port } = server.address() as AddressInfo;
      resolve({
        close: () =>
          new Promise<void>((closeResolve, closeReject) => {
            server.close((error) => {
              if (error) {
                closeReject(error);
                return;
              }
              closeResolve();
            });
          }),
        url: `http://127.0.0.1:${port}`,
      });
    });
  });
}

describe('PortalAuthProvider', () => {
  it('authenticates a valid portal token', async () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });
    const jwk = publicKey.export({ format: 'jwk' }) as JsonWebKey;
    const jwksServer = await startJsonServer((_request, response) => {
      response.setHeader('content-type', 'application/json');
      response.end(
        JSON.stringify({
          keys: [
            {
              ...jwk,
              kid: 'portal-key-001',
              use: 'sig',
              alg: 'RS256',
            },
          ],
        }),
      );
    });

    const provider = new PortalAuthProvider({
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
        mode: 'portal',
        mockUser: {
          id: 'mock-user',
          email: 'mock@local.test',
          name: 'Mock User',
          role: 'admin',
        },
        portalCookieNames: ['portal_token'],
        portalAllowedIssuers: ['https://tanoshimi.dev'],
        portalJwksUrl: jwksServer.url,
        portalLoginUrl: 'https://tanoshimi.dev/login',
        portalSessionUrls: [],
        portalUserInfoUrls: [],
        sessionCookieName: 'demo02_ferms_session',
        sessionCookieDomain: '',
        sessionCookieSecure: false,
        sessionTtlMs: 43_200_000,
      },
    });

    const token = signToken(privateKey, 'portal-key-001', {
      sub: 'portal-user-001',
      email: 'portal.user@tanoshimi.dev',
      name: 'Portal User',
      role: 'admin',
      iss: 'https://tanoshimi.dev',
      exp: Math.floor(Date.now() / 1000) + 600,
    });

    await expect(
      provider.authenticate({
        headers: {
          cookie: `portal_token=${token}`,
        },
      } as Request),
    ).resolves.toEqual({
      id: 'portal-user-001',
      email: 'portal.user@tanoshimi.dev',
      name: 'Portal User',
      role: 'admin',
    });

    await jwksServer.close();
  });

  it('rejects a token with an unexpected issuer', async () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });
    const jwk = publicKey.export({ format: 'jwk' }) as JsonWebKey;
    const jwksServer = await startJsonServer((_request, response) => {
      response.setHeader('content-type', 'application/json');
      response.end(
        JSON.stringify({
          keys: [
            {
              ...jwk,
              kid: 'portal-key-001',
              use: 'sig',
              alg: 'RS256',
            },
          ],
        }),
      );
    });

    const provider = new PortalAuthProvider({
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
        mode: 'portal',
        mockUser: {
          id: 'mock-user',
          email: 'mock@local.test',
          name: 'Mock User',
          role: 'admin',
        },
        portalCookieNames: ['portal_token'],
        portalAllowedIssuers: ['https://tanoshimi.dev'],
        portalJwksUrl: jwksServer.url,
        portalLoginUrl: 'https://tanoshimi.dev/login',
        portalSessionUrls: [],
        portalUserInfoUrls: [],
        sessionCookieName: 'demo02_ferms_session',
        sessionCookieDomain: '',
        sessionCookieSecure: false,
        sessionTtlMs: 43_200_000,
      },
    });

    const token = signToken(privateKey, 'portal-key-001', {
      sub: 'portal-user-001',
      email: 'portal.user@tanoshimi.dev',
      name: 'Portal User',
      role: 'admin',
      iss: 'https://other.example.test',
      exp: Math.floor(Date.now() / 1000) + 600,
    });

    await expect(
      provider.authenticate({
        headers: {
          cookie: `portal_token=${token}`,
        },
      } as Request),
    ).rejects.toThrow();

    await jwksServer.close();
  });

  it('falls back to a portal session endpoint when needed', async () => {
    const sessionServer = await startJsonServer((request, response) => {
      expect(request.headers.cookie).toContain(
        'authjs.session-token=opaque-token',
      );
      response.setHeader('content-type', 'application/json');
      response.end(
        JSON.stringify({
          user: {
            id: 'portal-user-002',
            email: 'session.user@tanoshimi.dev',
            name: 'Session User',
            role: 'user',
          },
        }),
      );
    });

    const provider = new PortalAuthProvider({
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
        mode: 'portal',
        mockUser: {
          id: 'mock-user',
          email: 'mock@local.test',
          name: 'Mock User',
          role: 'admin',
        },
        portalCookieNames: ['portal_token', 'authjs.session-token'],
        portalAllowedIssuers: ['https://tanoshimi.dev'],
        portalJwksUrl: 'http://127.0.0.1:9/jwks',
        portalLoginUrl: 'https://tanoshimi.dev/login',
        portalSessionUrls: [sessionServer.url],
        portalUserInfoUrls: [],
        sessionCookieName: 'demo02_ferms_session',
        sessionCookieDomain: '',
        sessionCookieSecure: false,
        sessionTtlMs: 43_200_000,
      },
    });

    await expect(
      provider.authenticate({
        headers: {
          cookie: 'authjs.session-token=opaque-token',
        },
      } as Request),
    ).resolves.toEqual({
      id: 'portal-user-002',
      email: 'session.user@tanoshimi.dev',
      name: 'Session User',
      role: 'user',
    });

    await sessionServer.close();
  });
});
